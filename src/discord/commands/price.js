import * as users from '../../users/users.js';
import * as money from '../../utilities/money.js';
import * as market from '../../triport/market.js';
import messages from '../messages.json' assert { type: 'json' };
import { SlashCommandBuilder } from '@discordjs/builders';
import TriportError from '../../triport/error.js';

export const data = new SlashCommandBuilder()
    .setName('price')
    .setDescription('It costs what it costs, and not a copper less.')
    .addStringOption(option => {
        return option
            .setName('ticker')
            .setDescription('Which fine company caught your eye?')
            .setRequired(true);
    });

export async function execute(interaction) {
    const tag = interaction.user.tag;
    const ticker = interaction.options.getString('ticker').toUpperCase();
    const userExists = await users.doesUserExist(tag);
    if (!userExists) {
        throw new TriportError(messages.userNotConfigured);
    }
    const sheetId = (await users.findUser(tag)).sheetId;
    const price = await market.stockPrice(sheetId, ticker);
    const date = await market.date(sheetId);
    return `${ticker} is worth ${money.format(price)} on ${date}`;
}