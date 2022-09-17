# Install dependencies.
npm install

# Create config files.
mkdir -p config
touch config/discord.json
touch config/service-account.json
touch config/users.json
echo "[]" >> config/users.json

# Make bot executable.
chmod +x run-discord-bot.sh