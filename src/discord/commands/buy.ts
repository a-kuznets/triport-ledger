import * as users from '../users.js';
import * as rules from '../rules.js';
import * as money from '../../utilities/money.js';
import * as market from '../../triport/services/market.js';
import * as bank from '../../triport/services/bank.js';
import scribe from '../../triport/scribe.json' assert {type: 'json'};
import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';

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

export async function execute(interaction: ChatInputCommandInteraction) {
    const tag = interaction.user.tag;
    const ticker = interaction.options.getString('ticker')!;
    const quantity = interaction.options.getInteger('quantity')!;
    rules.assertPositiveInteger(quantity);
    await rules.assertUserExists(tag);
    const sheetId = (await users.findUser(tag)).sheetId;
    const fin = await bank.finances(sheetId);
    await rules.assertAccountExists(fin, scribe.cash);
    const ex = await market.exchange(sheetId);
    const price = await market.stockPrice(ex, ticker);
    const cost = quantity * price;
    await rules.assertEnoughMoney(fin, scribe.cash, cost);
    const stockExists = await bank.stockExists(fin, ticker);
    if (stockExists) {
        await bank.updateStock(fin, sheetId, ticker, quantity);
    } else {
        await bank.newStock(fin, ex, sheetId, ticker, quantity);
    }
    const date = await market.date(ex);
    const event = `Buy ${quantity} ${ticker}`;
    await bank.transact(fin, sheetId, date, scribe.payee, event, 0 - cost, scribe.cash);
    return `Bought ${quantity} ${ticker} at ${money.format(price)} on ${date}.`;
}