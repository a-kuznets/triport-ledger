import * as users from '../users.js';
import * as rules from '../rules.js';
import * as money from '../../utilities/money.js';
import * as market from '../../triport/services/market.js';
import * as bank from '../../triport/services/bank.js';
import constants from '../../triport/scribe.json' assert { type: 'json' };
import { SlashCommandBuilder } from '@discordjs/builders';

export const data = new SlashCommandBuilder()
    .setName('buy')
    .setDescription('All stock purchases are final.')
    .addIntegerOption(option => {
        return option
            .setName('quantity')
            .setDescription('How many shares would you like to buy?')
            .setRequired(true);
    })
    .addStringOption(option => {
        return option
            .setName('ticker')
            .setDescription('In which company?')
            .setRequired(true);
    });

export async function execute(interaction) {
    const tag = interaction.user.tag;
    const ticker = interaction.options.getString('ticker').toUpperCase();
    const quantity = interaction.options.getInteger('quantity');
    rules.assertPositiveInteger(quantity);
    await rules.assertUserExists(tag);
    const sheetId = (await users.findUser(tag)).sheetId;
    const fin = await bank.finances(sheetId);
    await rules.assertAccountExists(fin, constants.cash);
    const ex = await market.exchange(sheetId);
    const price = await market.stockPrice(ex, ticker);
    const cost = quantity * price;
    await rules.assertEnoughMoney(fin, constants.cash, cost);
    const stockExists = await bank.stockExists(fin, ticker);
    if (stockExists) {
        await bank.updateStock(fin, sheetId, ticker, quantity);
    } else {
        await bank.newStock(fin, sheetId, ticker, quantity);
    }
    const date = await market.date(ex, ticker);
    const event = `Buy ${quantity} ${ticker}`;
    const transaction = [
        fin, sheetId, date, constants.payee, event, 0 - cost, constants.cash
    ];
    await bank.transact(...transaction);
    return `Bought ${quantity} ${ticker} at ${money.format(price)} on ${date}`;
}