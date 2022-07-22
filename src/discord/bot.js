import { readdirSync } from 'fs';
import path from 'path';
import { Client, Collection, Intents } from 'discord.js';
import config from '../../config/discord.json' assert { type: 'json' };

const commandsPath = path.resolve('src/discord/commands');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.commands = new Collection();
const commandFiles = readdirSync(commandsPath).filter(file => {
	return file.endsWith('.js')
});

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = await import(filePath);
	client.commands.set(command.data.name, command);
}

client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	console.log('running command');
	const command = client.commands.get(interaction.commandName);
	console.log(command);
	if (!command) return;

	try {
		const response = await command.execute(interaction);
		await interaction.reply({ content: response });
	} catch (error) {
		if (error.name === 'TriportError') {
			await interaction.reply({ content: error.message });
		} else {
			console.error(error);
		}
	}
});

client.login(config.token);