import * as users from '../users.js';
import * as rules from '../rules.js';
import * as money from '../../utilities/money.js';
import * as bank from '../../triport/services/bank.js';
import scribe from '../../triport/scribe.json' assert {type: 'json'};
import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('worth')
    .setDescription('View your net worth.');

export async function execute(interaction: ChatInputCommandInteraction) {
    const tag = interaction.user.tag;
    await rules.assertUserExists(tag);
    const sheetId = (await users.findUser(tag)).sheetId;
    const fin = await bank.finances(sheetId);
    await rules.assertAccountExists(fin, scribe.netWorth);
    const netWorth = await bank.accountBalance(fin, scribe.netWorth);
    return `Your net worth is ${money.format(netWorth)}.`;
}