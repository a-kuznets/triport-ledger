import { readFile, writeFile } from 'fs/promises';
import path from 'path';

export async function doesUserExist(tag) {
    const u = await users();
    return u.some(u => {
        return u.tag === tag;
    });
}

export async function findUser(tag) {
    const u = await users();
    return u.find(u => {
        return u.tag === tag;
    });
}

export async function newUser(tag, sheetId) {
    const u = await users();
    u.push({
        tag: tag,
        sheetId: sheetId
    });
    await writeFile(USER_STORE, JSON.stringify(u));
}

export async function updateUser(tag, sheetId) {
    const u = await users();
    const updatedUser = {
        tag: tag, sheetId: sheetId
    };
    const newUsers = u.map(user => {
        return user.tag === tag ? updatedUser : user;
    });
    await writeFile(USER_STORE, JSON.stringify(newUsers));
}

async function users() {
    const contents = await readFile(USER_STORE, { encoding: 'utf8' });
    return JSON.parse(contents);
}

const USER_STORE = path.resolve('src/users/users.json');