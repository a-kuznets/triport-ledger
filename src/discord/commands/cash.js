import * as users from '../users.js';
import * as money from '../../utilities/money.js';
import * as bank from '../../triport/bank.js';
import constants from '../../triport/scribe.json' assert { type: 'json' };
import messages from '../messages.json' assert { type: 'json' };
import { SlashCommandBuilder } from '@discordjs/builders';
import TriportError from '../../triport/error.js';

export const data = new SlashCommandBuilder()
    .setName('cash')
    .setDescription('How much you got in there?');

export async function execute(interaction) {
    const tag = interaction.user.tag;
    const userExists = await users.doesUserExist(tag);
    if (!userExists) {
        throw new TriportError(messages.userNotConfigured);
    }
    const sheetId = (await users.findUser(tag)).sheetId;
    const fin = await bank.finances(sheetId);
    const cashExists = await bank.accountExists(fin, constants.cash);
    if (!cashExists) {
        throw new TriportError(messages.accountDoesNotExist);
    }
    const cash = await bank.accountBalance(fin, constants.cash);
    return `${money.format(cash)} in cash account.`;
}