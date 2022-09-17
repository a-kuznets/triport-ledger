import * as ledger from './ledger.js';
import { tickerColumn } from './market.js';
import scribe from '../scribe.json' assert { type: 'json' };

export async function accountExists(fin, acct) {
    const i = fin[0].indexOf(scribe.accounts);
    return fin.some(x => {
        return x[i].toLowerCase() === acct.toLowerCase()
    });
}

export async function accountBalance(fin, acct) {
    const i = fin[0].indexOf(scribe.accounts);
    const j = fin.find(x => {
        return x[i].toLowerCase() === acct.toLowerCase()
    });
    return parseFloat(j[i + 1].trim().replace(/[^0-9.-]+/g, ''));
}

export async function transact(fin, id, date, payee, event, delta, acct) {
    const nextRow = 1 + fin.findIndex(row => {
        return row.length === 0;
    });
    const range = `A${nextRow}:E${nextRow}`;
    const payload = [date, payee, event, delta, acct];
    const data = await ledger.update(id, scribe.finances, range, payload);
    return data;
}

export async function stockExists(fin, ticker) {
    const row = findAssetRow(fin, stockText(ticker));
    return !!row;
}

export async function ownedStock(fin, ticker) {
    const row = findAssetRow(fin, stockText(ticker));
    const quantity = assetQuantity(fin, row);
    return Number(quantity);
}

export async function newStock(fin, id, ticker, quantity) {
    const row = nextAssetRow(fin);
    const range = `G${(row + 1)}:J${(row + 1)}`;
    const tickerCol = await tickerColumn(id, ticker);
    const payload = [
        stockText(ticker),
        parseInt(quantity),
        `=LASTROW('${scribe.exchange}'!$${tickerCol}:$${tickerCol})`,
        `=H${(row + 1)}*I${(row + 1)}`
    ];
    await ledger.update(id, scribe.finances, range, payload);
}

export async function updateStock(fin, id, ticker, delta) {
    const row = findAssetRow(fin, stockText(ticker));
    const range = `H${row + 1}`;
    const curr = assetQuantity(fin, row);
    const payload = [parseInt(curr) + parseInt(delta)];
    await ledger.update(id, scribe.finances, range, payload);
}

export async function finances(id) {
    return await ledger.get(id, scribe.finances);
}

function findAssetRow(finances, name) {
    for (let i = 0; i < finances.length; i++) {
        const asset = finances[i][scribe.assetNameCol];
        if (asset && asset.trim().toLowerCase() === name.toLowerCase()) {
            return i;
        }
    }
}

function nextAssetRow(finances) {
    for (let i = 0; i < finances.length; i++) {
        const asset = finances[i][scribe.assetNameCol];
        if (i > 1 && !asset) {
            return i;
        }
    }
}

function assetQuantity(finances, row) {
    return finances[row][scribe.assetValCol]
}

function stockText(ticker) {
    return `${ticker} Stock`;
}