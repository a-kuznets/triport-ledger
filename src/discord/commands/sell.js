import * as users from '../users.js';
import * as money from '../../utilities/money.js';
import * as market from '../../triport/market.js';
import * as bank from '../../triport/bank.js';
import constants from '../../triport/scribe.json' assert { type: 'json' };
import messages from '../messages.json' assert { type: 'json' };
import { SlashCommandBuilder } from '@discordjs/builders';
import TriportError from '../../triport/error.js';

export const data = new SlashCommandBuilder()
    .setName('sell')
    .setDescription('All stock sales are final.')
    .addIntegerOption(option => {
        return option
            .setName('quantity')
            .setDescription('How many shares are we looking at here?')
            .setRequired(true);
    })
    .addStringOption(option => {
        return option
            .setName('ticker')
            .setDescription('This stock is selling like rock cakes.')
            .setRequired(true);
    });

export async function execute(interaction) {
    const tag = interaction.user.tag;
    const ticker = interaction.options.getString('ticker').toUpperCase();
    const quantity = interaction.options.getInteger('quantity');
    const userExists = await users.doesUserExist(tag);
    if (!userExists) {
        throw new TriportError(messages.userNotConfigured);
    }
    const sheetId = (await users.findUser(tag)).sheetId;
    const fin = bank.finances(sheetId);
    const stockExists = await bank.stockExists(fin, ticker);
    if (!stockExists) {
        throw new TriportError(messages.notEnoughStock);
    }
    const owned = await bank.ownedStock(fin, ticker);
    if (quantity > owned) {
        throw new TriportError(messages.notEnoughStock);
    }
    const cashExists = await bank.accountExists(fin, constants.cash);
    if (!cashExists) {
        throw new TriportError(messages.accountDoesNotExist);
    }
    await bank.updateStock(fin, sheetId, ticker, 0 - quantity);
    const ex = await market.exchange(sheetId);
    const date = await market.date(ex, ticker);
    const price = await market.stockPrice(ex, ticker);
    const revenue = quantity * price;
    const event = `Sell ${quantity} ${ticker}`;
    const transaction = [
        fin, sheetId, date, 'Self', event, revenue, constants.cash
    ];
    await bank.transact(...transaction);
    return `Sold ${quantity} ${ticker} at ${money.format(price)} on ${date}`;
}