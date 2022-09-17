import sheets from '../../google/sheets.js';

export async function get(id, name) {
    const request = {
        spreadsheetId: id,
        range: `'${name}'`
    };
    const response = await sheets.spreadsheets.values.get(request);
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
    return response.data.values;
}