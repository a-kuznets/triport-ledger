import { readdirSync } from 'fs';
import path from 'path';
import { Client, Collection, Intents } from 'discord.js';
import config from '../../config/discord.json' assert { type: 'json' };
import { Command } from './command.js';
import TriportError from '../triport/error.js';

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const commandsPath = path.resolve('src/discord/commands');
const commands = new Collection<string, Command>();
const commandFiles = readdirSync(commandsPath).filter(file => {
	return file.endsWith('.js')
});

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = await import(filePath);
	commands.set(command.data.name, command);
}

client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	const command = commands.get(interaction.commandName);
	if (!command) return;

	try {
		const response = await command.execute(interaction);
		await interaction.reply({ content: response });
	} catch (error) {
		if (error instanceof TriportError) {
			await interaction.reply({ content: error.message });
		  } else {
			console.error(error);
		}
	}
});

client.login(config.token);