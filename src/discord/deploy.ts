import { readdirSync } from 'fs';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import config from '../../config/discord.json' assert { type: 'json' };

const commands = await loadCommands();
await pushCommands(commands);
process.exit(0);

async function pushCommands(commands: object[]) {
	console.log('Started refreshing application (/) commands.');
	const rest = new REST({ version: '9' }).setToken(config.token);
	console.log(commands);
	await rest.put(
		Routes.applicationCommands(config.clientId),
		{ body: commands },
	);
	console.log('Successfully reloaded application (/) commands.');
}

async function loadCommands(): Promise<object[]> {
	const commands = [];
	const commandFiles = readdirSync('./dist/src/discord/commands').filter(file => {
		return file.endsWith('.js')
	});
	for (const file of commandFiles) {
		const command = await import(`./commands/${file}`);
		commands.push(command.data.toJSON());
	}
	return commands;
}