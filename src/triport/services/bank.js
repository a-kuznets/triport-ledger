import * as ledger
    from './ledger.js';
import { tickerColumn }
    from './market.js';
import constants
    from './scribe.json' assert {
    type: 'json'
    };

export async function accountExists(id, acct) {
    const fin = await finances(id);
    const i = fin[0].indexOf(constants.accounts);
    return fin.some(x => {
        return x[i].toLowerCase() === acct.toLowerCase()
    });
}

export async function accountBalance(id, acct) {
    const fin = await finances(id);
    const i = fin[0].indexOf(constants.accounts);
    const j = fin.find(x => {
        return x[i].toLowerCase() === acct.toLowerCase()
    });
    return parseFloat(j[i + 1].trim().replace(/[^0-9.-]+/g, ''));
}

export async function transact(id, date, payee, event, delta, acct) {
    const fin = await finances(id);
    const nextRow = 1 + fin.findIndex(row => {
        return row.length === 0;
    });
    const range = `A${nextRow}:E${nextRow}`;
    const payload = [date, payee, event, delta, acct];
    const data = await ledger.update(id, constants.finances, range, payload);
    return data;
}

export async function stockExists(id, ticker) {
    const fin = await finances(id);
    const row = findAssetRow(fin, stockText(ticker));
    return !!row;
}

export async function ownedStock(id, ticker) {
    const fin = await finances(id);
    const row = findAssetRow(fin, stockText(ticker));
    const quantity = assetQuantity(fin, row);
    return Number(quantity);
}

export async function newStock(id, ticker, quantity) {
    const fin = await finances(id);
    const row = nextAssetRow(fin);
    const range = `G${(row + 1)}:J${(row + 1)}`;
    const tickerCol = await tickerColumn(id, ticker);
    const payload = [
        stockText(ticker),
        parseInt(quantity),
        `=LASTROW('${constants.exchange}'!$${tickerCol}:$${tickerCol})`,
        `=H${(row + 1)}*I${(row + 1)}`
    ];
    await ledger.update(id, constants.finances, range, payload);
}

export async function updateStock(id, ticker, delta) {
    const fin = await finances(id);
    const row = findAssetRow(fin, stockText(ticker));
    const range = `H${row + 1}`;
    const curr = assetQuantity(fin, row);
    const payload = [parseInt(curr) + parseInt(delta)];
    await ledger.update(id, constants.finances, range, payload);
}

async function finances(id) {
    return await ledger.get(id, constants.finances);
}

function findAssetRow(finances, name) {
    for (let i = 0; i < finances.length; i++) {
        const asset = finances[i][constants.assetNameCol];
        if (asset && asset.trim().toLowerCase() === name.toLowerCase()) {
            return i;
        }
    }
}

function nextAssetRow(finances) {
    for (let i = 0; i < finances.length; i++) {
        const asset = finances[i][constants.assetNameCol];
        if (i > 1 && !asset) {
            return i;
        }
    }
}

function assetQuantity(finances, row) {
    return finances[row][constants.assetValCol]
}

function stockText(ticker) {
    return `${ticker} Stock`;
}