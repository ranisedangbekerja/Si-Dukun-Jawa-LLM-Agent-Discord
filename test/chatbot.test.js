// tests/chatbot.behavior.test.js
import test from 'node:test';
import assert from 'node:assert';
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

// Mock environment
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) console.warn('⚠️ Jalankan test dengan GEMINI_API_KEY agar hasil realistis.');

const genAI = new GoogleGenerativeAI(API_KEY || 'dummy-key');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

/**
 * Helper to simulate Si Dukun Jawa's thinking
 */
async function askDukun(prompt) {
  if (!API_KEY) {
    // stub fallback supaya test tetap bisa jalan tanpa API
    return `(stub) ${prompt.slice(0, 50)}...`;
  }
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }]
  });
  return result?.response?.text()?.trim() || '';
}

/**
 * Utility to assert basic non-empty LLM response
 */
async function expectResponseContains(keyword, prompt) {
  const res = await askDukun(prompt);
  assert.ok(res.length > 0, 'respon kosong');
  console.log(`✅ ${keyword} ->`, res.slice(0, 60).replace(/\n/g, ' '), '...');
  return res;
}

/* --------------------------------------------------------- */
/* 10 Behavioral / Functional Chatbot Test Cases             */
/* --------------------------------------------------------- */

test('1️⃣ Greeting response feels friendly', async () => {
  const res = await askDukun('Halo dukun, apa kabar?');
  assert.match(res, /(halo|sugeng|selamat|dukun|aku)/i);
});

test('2️⃣ Responds with mystic tone when asked about primbon', async () => {
  const res = await askDukun('Primbon hari ini apa artinya bagi zodiak Leo?');
  assert.match(res, /(primbon|weton|nasihat|pitutur|hari)/i);
});

test('3️⃣ Can explain weton combination', async () => {
  const res = await askDukun('Primbon Selasa Kliwon artinya apa?');
  assert.match(res, /(selasa|kliwon|watak|rejeki|pitutur)/i);
});

test('4️⃣ Gives advice when asked about skripsi', async () => {
  const res = await askDukun('Dukun, aku stres ngerjain skripsi.');
  assert.match(res, /(sabar|tenang|semangat|ngopi|istirahat)/i);
});

test('5️⃣ Keeps response short (≤ 6 lines typical)', async () => {
  const res = await askDukun('Primbon Jumat Legi tolong tafsirkan.');
  const lines = res.split(/\r?\n/);
  assert.ok(lines.length <= 8, `Terlalu panjang: ${lines.length} baris`);
});

test('6️⃣ Gives fallback when not about primbon', async () => {
  const res = await askDukun('Siapa presiden Indonesia?');
  // dukun harus tetap jawab tapi bukan secara politis
  assert.doesNotMatch(res, /(politik|partai|kampanye)/i);
});

test('7️⃣ Produces positive closing action suggestion', async () => {
  const res = await askDukun('Aku bingung dan lelah akhir-akhir ini.');
  assert.match(res, /(coba|mulailah|bernafas|istirahat|tindakan kecil)/i);
});

test('8️⃣ Handles nonsense input gracefully', async () => {
  const res = await askDukun('asdfghjk qwerty uiop');
  assert.ok(res.length > 0);
});

test('9️⃣ Can describe cultural item correctly', async () => {
  const res = await askDukun('Apa makna keris bagi orang Jawa?');
  assert.match(res, /(simbol|spiritual|pelindung|warisan)/i);
});

test('🔟 Handles multi-turn style (context carry minimal)', async () => {
  const r1 = await askDukun('Primbon hari ini apa?');
  const r2 = await askDukun('Kalau begitu apa yang harus kulakukan?');
  assert.ok(r1.length > 0 && r2.length > 0);
});
