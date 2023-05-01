import * as users from '../users.js';
import * as rules from '../rules.js';
import * as money from '../../utilities/money.js';
import * as market from '../../triport/services/market.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('price')
    .setDescription('View the price of a share.')
    .addStringOption(option => {
        return option
            .setName('ticker')
            .setDescription('In which company?')
            .setRequired(true);
    });

export async function execute(interaction: ChatInputCommandInteraction) {
    const tag = interaction.user.tag;
    const ticker = interaction.options.getString('ticker')?.toUpperCase();
    await rules.assertUserExists(tag);
    const sheetId = (await users.findUser(tag)).sheetId;
    const ex = await market.exchange(sheetId);
    const price = await market.stockPrice(ex, ticker);
    const date = await market.date(ex);
    return `${ticker} is worth ${money.format(price)} on ${date}.`;
}