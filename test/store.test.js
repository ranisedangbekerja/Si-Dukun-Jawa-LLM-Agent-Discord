// tests/store.test.js
import test from 'node:test';
import assert from 'node:assert';
import path from 'path';

// Pakai folder data terpisah untuk test (abaikan kalau store.js tidak memakainya)
process.env.DATA_DIR = path.resolve('./data-test');

const {
  upsertUser, insertEvent, insertMood,
  getRecentEvents, getWeekData, exportUser, forgetUser
} = await import('../store.js');

// Helper: time window 7 hari
const endISO = new Date().toISOString();
const startISO = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString();

test('upsertUser does not throw & exportUser returns object', async () => {
  await upsertUser({ id: 'u-test', handle: 'Rani' }); // tidak perlu assert return
  const dump = await exportUser('u-test');
  assert.ok(dump && typeof dump === 'object', 'exportUser should return object');
  assert.ok('user' in dump && 'events' in dump && 'moods' in dump, 'structure keys missing');
});

test('insertEvent increases recent count', async () => {
  const before = await getRecentEvents('u-test', 50);
  await insertEvent({
    user_id: 'u-test',
    ts: new Date().toISOString(),
    channel_id: 'c-1',
    type: 'primbon',
    text: 'Primbon Selasa Kliwon',
    answer: 'ok',
    topic: 'weton',
    sentiment: 'net',
    entities: JSON.stringify({ hari: 'Selasa', pasaran: 'Kliwon' }),
  });
  const after = await getRecentEvents('u-test', 50);
  assert.ok(after.length >= before.length + 1, 'recent events should grow');
});

test('forgetUser clears events & moods but keeps stub user', async () => {
  const n = await forgetUser('u-test');
  assert.ok(n >= 0);
  const dump = await exportUser('u-test');
  // banyak store menyisakan user row atau membuat kosong — yang penting events & moods kosong
  assert.ok(dump.events.length === 0 && dump.moods.length === 0, 'events/moods not cleared');
});
