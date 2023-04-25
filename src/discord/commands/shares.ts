import * as users from '../users.js';
import * as rules from '../rules.js';
import * as bank from '../../triport/services/bank.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export const data = new SlashCommandBuilder()
    .setName('shares')
    .setDescription('View how many shares you own.')
    .addStringOption(option => {
        return option
            .setName('ticker')
            .setDescription('In which company?')
            .setRequired(true);
    });

export async function execute(interaction) {
    const tag = interaction.user.tag;
    const ticker = interaction.options.getString('ticker').toUpperCase();
    await rules.assertUserExists(tag);
    const sheetId = (await users.findUser(tag)).sheetId;
    const fin = await bank.finances(sheetId);
    const stockExists = await bank.stockExists(fin, ticker);
    if (stockExists) {
        const ownedStock = await bank.ownedStock(fin, ticker);
        const noun = ownedStock === 1 ? "share" : "shares";
        return `${ownedStock} ${noun} owned in ${ticker}.`;
    }
    return `0 shares owned in ${ticker}.`;
}