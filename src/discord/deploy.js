import { readdirSync } from 'fs';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import config from '../../config/discord.json' assert { type: 'json' };

const commands = [];
const commandFiles = readdirSync('./commands').filter(file => {
	return file.endsWith('.js')
});

for (const file of commandFiles) {
	const command = await import(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(config.token);

await (async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
			Routes.applicationCommands(config.clientId),
			{ body: commands },
		);

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();

process.exit(0);