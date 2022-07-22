import * as users from '../../users/users.js';
import * as money from '../../utilities/money.js';
import * as market from '../../triport/market.js';
import * as bank from '../../triport/bank.js';
import messages from '../messages.json' assert { type: 'json' };
import constants from '../../triport/scribe.json' assert { type: 'json' };
import { SlashCommandBuilder } from '@discordjs/builders';
import TriportError from '../../triport/error.js';

export const data = new SlashCommandBuilder()
    .setName('buy')
    .setDescription('All stock purchases are final.')
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
    const cashExists = await bank.accountExists(sheetId, constants.cash);
    if (!cashExists) {
        throw new TriportError(messages.accountDoesNotExist);
    }
    const price = await market.stockPrice(sheetId, ticker);
    const cost = quantity * price;
    const cash = await bank.accountBalance(sheetId, constants.cash);
    if (cost > cash) {
        throw new TriportError(messages.notEnoughCash);
    }
    const stockExists = await bank.stockExists(sheetId, ticker);
    if (stockExists) {
        await bank.updateStock(sheetId, ticker, quantity);
    } else {
        await bank.newStock(sheetId, ticker, quantity);
    }
    const date = await market.date(sheetId, ticker);
    const event = `Buy ${quantity} ${ticker}`;
    const transaction = [
        sheetId, date, constants.payee, event, 0 - cost, constants.cash
    ];
    await bank.transact(...transaction);
    return `Bought ${quantity} ${ticker} at ${money.format(price)} on ${date}`;
}