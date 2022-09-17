/**
 * Format a number as a currency. 
 * Optionally provide a currency symbol.
 */
export function format(price, symbol = '$') {
    return symbol + new Intl.NumberFormat().format(decRound(price, 2));
}

function decRound(num, n) {
    const p = Math.pow(10, n);
    return Math.round(num * p) / p;
}