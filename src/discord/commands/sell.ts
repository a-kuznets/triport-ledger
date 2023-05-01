import * as users from '../users.js';
import * as rules from '../rules.js';
import * as money from '../../utilities/money.js';
import * as market from '../../triport/services/market.js';
import * as bank from '../../triport/services/bank.js';
import scribe from '../../triport/scribe.json' assert {type: 'json'};
import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('sell')
    .setDescription('All stock sales are final.')
    .addIntegerOption(option => {
        return option
            .setName('quantity')
            .setDescription('How many shares would you like to sell?')
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
    const ticker = interaction.options.getString('ticker')!.toUpperCase();
    const quantity = interaction.options.getInteger('quantity')!;
    rules.assertPositiveInteger(quantity);
    await rules.assertUserExists(tag);
    const sheetId = (await users.findUser(tag)).sheetId;
    const fin = await bank.finances(sheetId);
    await rules.assertStockExists(fin, ticker);
    await rules.assertEnoughStock(fin, ticker, quantity);
    await rules.assertAccountExists(fin, scribe.cash);
    await bank.updateStock(fin, sheetId, ticker, 0 - quantity);
    const ex = await market.exchange(sheetId);
    const date = await market.date(ex);
    const price = await market.stockPrice(ex, ticker);
    const revenue = quantity * price;
    const event = `Sell ${quantity} ${ticker}`;
    await bank.transact(fin, sheetId, date, 'Self', event, revenue, scribe.cash);
    return `Sold ${quantity} ${ticker} at ${money.format(price)} on ${date}.`;
}