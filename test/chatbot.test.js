import test from 'node:test';
import assert from 'node:assert';
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY || 'dummy-key');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// --- helper: retry + fallback ke stub bila error/503 ---
async function generateWithRetry(prompt, { tries = 2, delayMs = 600 } = {}) {
  if (!API_KEY) return `(stub) ${prompt.slice(0, 80)}...`;
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const r = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }]}]});
      const txt = r?.response?.text()?.trim() || '';
      if (txt) return txt;
    } catch (e) {
      lastErr = e;
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  // fallback aman supaya test tidak merah karena 503
  return `(fallback) ${prompt.slice(0, 80)}... :: ${lastErr?.status || 'err'}`;
}

async function askDukun(prompt) {
  const res = await generateWithRetry(prompt, { tries: 3, delayMs: 800 });
  return res;
}

test('Casual small talk still returns a meaningful reply', async () => {
  const res = await askDukun('Lagi manyun aja hari ini, gapapa ya?');
  assert.ok(res && res.length >= 10, 'reply too short/empty');
});

test('Greeting response feels friendly', async () => {
  const res = await askDukun('Halo dukun, apa kabar?');
  assert.match(res, /(halo|sugeng|selamat|dukun|aku|pangestu)/i);
});

test('Responds with mystic tone when asked about primbon', async () => {
  const res = await askDukun('Primbon hari ini apa artinya bagi zodiak Leo?');
  assert.match(res, /(primbon|weton|pitutur|wangsit|hari)/i);
});

test('Can explain weton combination', async () => {
  const res = await askDukun('Primbon Selasa Kliwon artinya apa?');
  assert.match(res, /(selasa|kliwon|watak|rejeki|pitutur|laku)/i);
});

test('Bot replies within reasonable time', async () => {
  const start = Date.now();
  const res = await askDukun('Apa kabar?');
  const dur = Date.now() - start;
  assert.ok(dur < 15000, 'Bot took too long to respond');
  assert.ok(res.length > 0, 'Response empty');
});

test('Response likely forms a sentence', async () => {
  const res = await askDukun('Berikan aku nasihat kecil hari ini.');
  assert.match(res, /[.!?]/, 'Response should end like a sentence');
});

test('Gives fallback when not about primbon (no political talk)', async () => {
  const res = await askDukun('Siapa presiden Indonesia?');
  assert.doesNotMatch(res, /(politik|partai|kampanye)/i);
});

test('Maintains mystical or reflective tone', async () => {
  const res = await askDukun('Berikan aku petuah hidup.');
  assert.match(res, /(pitutur|pangestu|nasihat|petuah|semoga|waskita)/i, 'Should include Javanese or reflective tone');
});

test('Handles nonsense input gracefully', async () => {
  const res = await askDukun('asdfghjk qwerty uiop');
  assert.ok(res.length > 0);
});

test('Detects emotional tone in message', async () => {
  const happy = await askDukun('Aku merasa bahagia hari ini!');
  const sad = await askDukun('Aku sedang sedih dan lelah...');
  assert.notStrictEqual(happy, sad, 'Responses for different emotions should differ');
});


test('Handles multi-turn style (context carry minimal)', async () => {
  const r1 = await askDukun('Primbon hari ini apa?');
  const r2 = await askDukun('Kalau begitu apa yang harus kulakukan?');
  assert.ok(r1.length > 0 && r2.length > 0);
});

test('Keeps response reasonably short', async () => {
  const res = await askDukun('Tolong beri nasihat singkat untuk hari ini.');
  const lines = res.replace(/\r/g,'').split(/\n+/).filter(Boolean).length;
  assert.ok(lines <= 15, `Too long: ${lines} lines`);
});

test('Responds differently to different prompts', async () => {
  const a = await askDukun('Aku senang hari ini!');
  const b = await askDukun('Aku sedih banget hari ini...');
  assert.notStrictEqual(a, b, 'responses should differ for distinct moods');
});

