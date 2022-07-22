import * as users from '../../users/users.js';
import messages from '../messages.json' assert { type: 'json' };
import { SlashCommandBuilder } from '@discordjs/builders';
import TriportError from '../../triport/error.js';

export const data = new SlashCommandBuilder()
    .setName('register')
    .setDescription('New here, huh?')
    .addStringOption(option => {
        return option
            .setName('url')
            .setDescription('Link to your logistics sheet.')
            .setRequired(true);
    });

export async function execute(interaction) {
    const tag = interaction.user.tag;
    const sheetUrl = interaction.options.getString('url');
    const start = sheetUrl.indexOf('/d/') + '/d/'.length;
    const end = sheetUrl.indexOf('/', start);
    const id = sheetUrl.slice(start, end);
    if (!id) {
        throw new TriportError(messages.tryAgainTypo);
    }
    const userExists = await users.doesUserExist(tag);
    if (!userExists) {
        await users.newUser(tag, id);
        return messages.registered;;
    }
    const currId = (await users.findUser(tag)).sheetId;
    if (currId === id) {
        throw new TriportError(messages.alreadyRegistered);
    }
    await users.updateUser(tag, id);
    return messages.registered;
}