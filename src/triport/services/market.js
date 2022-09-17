import * as ledger from './ledger.js';
import scribe from './scribe.json' assert { type: 'json' };

export async function date(ex) {
    return ex[ex.length - 1][0];
}

export async function stockPrice(ex, ticker) {
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

export async function tickerColumn(ex, ticker) {
    const i = ex[0].findIndex(header => {
        return header.toLowerCase().includes(`(${ticker.toLowerCase()})`);
    });

    // Supports up to 25 tickers (first column is the date).
    return alphabet()[i];
}

export async function exchange(id) {
    return await ledger.get(id, scribe.exchange);
}

function alphabet() {
    let a = [], i = 'A'.charCodeAt(0), j = 'Z'.charCodeAt(0);
    for (; i <= j; ++i) {
        a.push(String.fromCharCode(i));
    }
    return a;
}