![The Triport City rivers inlaid into a golden gear.](./assets/triport-services-small.png)

Trade on the stock exchange of Triport City, the financial capital of the Free Cities, from the comfort of your Discord client.

# Getting started
Execute `setup.sh` to install dependencies, create configuration files, and make the Discord bot executable.
Fill in `config/discord.json` with your bot `token` and `clientId`. 
Fill in `config/service-account.json` with your Google Cloud service account key.

# Running the bot
Add the bot to your Discord server using the OAuth2 invite link.
Execute `run-discord-bot.sh` to run the bot.

# Roadmap
- [ ] Add ability for DM to open/close market.
- [ ] Move to cloud hosting.
- [ ] Add summary commands to view current sheet state.
- [ ] Add ability to generate time series graphs.
- [ ] Add commands for XP sheet.
- [ ] Add commands for Inventory sheet.
- [ ] Add commands for Downtime sheet.
- [ ] Switch to TypeScript.