import * as users from '../users.js';
import * as rules from '../rules.js';
import messages from '../messages.json' assert {type: 'json'};
import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('register')
    .setDescription('New in town?')
    .addStringOption(option => {
        return option
            .setName('url')
            .setDescription('Link to your logistics sheet.')
            .setRequired(true);
    });

export async function execute(interaction: ChatInputCommandInteraction) {
    const tag = interaction.user.tag;
    const sheetUrl = interaction.options.getString('url')!;
    const start = sheetUrl.indexOf('/d/') + '/d/'.length;
    const end = sheetUrl.indexOf('/', start);
    const id = sheetUrl.slice(start, end);
    rules.assertValidArgument(id);
    const userExists = await users.doesUserExist(tag);
    if (!userExists) {
        await users.newUser(tag, id);
        return messages.registered;
    }
    await rules.assertNotRegistered(tag, id);
    await users.updateUser(tag, id);
    return messages.registered;
}