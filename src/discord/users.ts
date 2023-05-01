import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const USER_STORE = path.join(process.cwd(), 'user-store.json');

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

/**
 * Read a JSON file containing user data to an array of objects.
 * If the file doesn't exist, create it.
 */
async function users() {
  try {
    const contents = await readFile(USER_STORE, { encoding: 'utf8' });
    return JSON.parse(contents);
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        await writeFile(USER_STORE, '[]');
      return [];
    } else {
      throw err;
    }
  }
}