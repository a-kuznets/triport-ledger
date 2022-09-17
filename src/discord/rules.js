import * as users from './users.js';
import * as bank from '../triport/services/bank.js';
import TriportError from '../triport/error.js';
import messages from './messages.json' assert { type: 'json' };

export async function assertUserExists(tag) {
    const userExists = await users.doesUserExist(tag);
    if (!userExists) {
        throw new TriportError(messages.userNotConfigured);
    }
}

export async function assertAccountExists(fin, acct) {
    const cashExists = await bank.accountExists(fin, acct);
    if (!cashExists) {
        throw new TriportError(messages.accountDoesNotExist);
    }
}

export async function assertStockExists(fin, ticker) {
    const stockExists = await bank.stockExists(fin, ticker);
    if (!stockExists) {
        throw new TriportError(messages.notEnoughStock);
    }
}

export async function assertEnoughMoney(fin, acct, cost) {
    const cash = await bank.accountBalance(fin, acct);
    if (cost > cash) {
        throw new TriportError(messages.notEnoughCash);
    }
}

export async function assertEnoughStock(fin, ticker, quantity) {
    const owned = await bank.ownedStock(fin, ticker);
    if (quantity > owned) {
        throw new TriportError(messages.notEnoughStock);
    }
}

export function assertValidArgument(arg) {
    if (!arg) {
        throw new TriportError(messages.tryAgainTypo);
    }
}

export async function assertNotRegistered(tag, id) {
    const currId = (await users.findUser(tag)).sheetId;
    if (currId === id) {
        throw new TriportError(messages.alreadyRegistered);
    }
}

export function assertPositiveInteger(int) {
    if (int < 1) {
        throw new TriportError(messages.tryAgainTypo);
    }
}