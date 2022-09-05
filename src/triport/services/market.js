import * as ledger
    from './ledger.js';
import constants
    from './scribe.json' assert {
    type: 'json'
    };

export async function date(id) {
    const ex = await exchange(id);
    return ex[ex.length - 1][0];
}

export async function stockPrice(id, ticker) {
    const ex = await exchange(id);
    const headerRow = ex[0];
    const colIndex = headerRow.findIndex(header => {
        return header.toLowerCase().includes(`(${ticker.toLowerCase()})`)
    });
    if (colIndex === -1) {
        throw new Error('Stock could not be found');
    }
    const lastRow = ex[ex.length - 1];
    const price = parseFloat(lastRow[colIndex]);
    return price;
}

export async function tickerColumn(id, ticker) {
    const ex = await exchange(id);
    const i = ex[0].findIndex(header => {
        return header.toLowerCase().includes(`(${ticker.toLowerCase()})`);
    });

    // Supports up to 25 tickers (first column is the date).
    return alphabet()[i];
}

async function exchange(id) {
    return await ledger.get(id, constants.exchange);
}

function alphabet() {
    let a = [], i = 'A'.charCodeAt(0), j = 'Z'.charCodeAt(0);
    for (; i <= j; ++i) {
        a.push(String.fromCharCode(i));
    }
    return a;
}