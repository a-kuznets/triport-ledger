import * as users from '../users.js';
import * as rules from '../rules.js';
import * as money from '../../utilities/money.js';
import * as bank from '../../triport/services/bank.js';
import scribe from '../../triport/scribe.json' assert { type: 'json' };
import { SlashCommandBuilder } from '@discordjs/builders';

export const data = new SlashCommandBuilder()
    .setName('cash')
    .setDescription('How much you got in there?');

export async function execute(interaction) {
    const tag = interaction.user.tag;
    await rules.assertUserExists(tag);
    const sheetId = (await users.findUser(tag)).sheetId;
    const fin = await bank.finances(sheetId);
    await rules.assertAccountExists(fin, scribe.cash);
    const cash = await bank.accountBalance(fin, scribe.cash);
    return `${money.format(cash)} in cash account.`;
}