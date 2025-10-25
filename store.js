// store.js — JSON storage (tanpa native deps)
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.resolve('./data');
const USERS = path.join(DATA_DIR, 'users.json');   // { [userId]: {id,handle,first_seen,last_seen} }
const EVENTS = path.join(DATA_DIR, 'events.json'); // [ {user_id,ts,channel_id,type,text,answer,topic,sentiment,entities} ]
const MOODS = path.join(DATA_DIR, 'moods.json');   // [ {user_id,ts,mood,note} ]

await fs.mkdir(DATA_DIR, { recursive: true });

async function readJSON(file, fallback) {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); }
  catch { return fallback; }
}
async function writeJSON(file, data) {
  const tmp = file + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(tmp, file);
}

export async function upsertUser({ id, handle }) {
  const users = await readJSON(USERS, {});
  const now = new Date().toISOString();
  if (!users[id]) users[id] = { id, handle, first_seen: now, last_seen: now };
  else {
    users[id].handle = handle;
    users[id].last_seen = now;
  }
  await writeJSON(USERS, users);
}

export async function insertEvent(row) {
  const list = await readJSON(EVENTS, []);
  list.push(row);
  await writeJSON(EVENTS, list);
}

export async function insertMood({ user_id, mood, note }) {
  const list = await readJSON(MOODS, []);
  list.push({ user_id, ts: new Date().toISOString(), mood, note: note || '' });
  await writeJSON(MOODS, list);
}

export async function getRecentEvents(user_id, limit = 5) {
  const list = await readJSON(EVENTS, []);
  return list.filter(x => x.user_id === user_id).sort((a,b)=>a.ts<b.ts?1:-1).slice(0, limit);
}

export async function getWeekData(user_id, startISO, endISO) {
  const ev = await readJSON(EVENTS, []);
  const md = await readJSON(MOODS, []);
  const inRange = (ts) => ts >= startISO && ts <= endISO;
  return {
    events: ev.filter(x => x.user_id === user_id && inRange(x.ts)).sort((a,b)=>a.ts<b.ts?-1:1),
    moods : md.filter(x => x.user_id === user_id && inRange(x.ts)).sort((a,b)=>a.ts<b.ts?-1:1)
  };
}

export async function forgetUser(user_id) {
  const ev = await readJSON(EVENTS, []);
  const md = await readJSON(MOODS, []);
  const keptEv = ev.filter(x => x.user_id !== user_id);
  const keptMd = md.filter(x => x.user_id !== user_id);
  await writeJSON(EVENTS, keptEv);
  await writeJSON(MOODS, keptMd);
  return (ev.length - keptEv.length) + (md.length - keptMd.length);
}

export async function exportUser(user_id) {
  const users = await readJSON(USERS, {});
  const ev = await readJSON(EVENTS, []);
  const md = await readJSON(MOODS, []);
  return {
    user: users[user_id] || null,
    events: ev.filter(x => x.user_id === user_id),
    moods : md.filter(x => x.user_id === user_id)
  };
}
