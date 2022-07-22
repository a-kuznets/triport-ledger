import sheets from '../google/sheets.js';
import cache from '../caching/cache.js';

export async function get(id, name) {
    const key = cacheKey(id, name);
    const isCached = await cache.exists(key);
    if (isCached) {
        const s = await cache.get(key)
        return JSON.parse(s);
    }
    const request = {
        spreadsheetId: id,
        range: `'${name}'`
    };
    const response = await sheets.spreadsheets.values.get(request);
    await cache.set(key, JSON.stringify(response.data.values), { EX: 2 });
    return response.data.values;
}

export async function update(id, sheet, range, payload) {
    const request = {
        spreadsheetId: id,
        range: `'${sheet}'!${range}`,
        valueInputOption: 'user_entered',
        resource: {
            "values": [payload]
        }
    };
    const response = await sheets.spreadsheets.values.update(request);
    await cache.del(cacheKey(id, sheet));
    return response.data.values;
}

function cacheKey(a, b) {
    return `${a}${b}`;
}