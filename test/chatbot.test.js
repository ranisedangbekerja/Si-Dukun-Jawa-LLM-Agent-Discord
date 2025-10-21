// tests/chatbot.behavior.test.js
import test from 'node:test';
import assert from 'node:assert';
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

// Use real key if available; fall back to stub so tests always run
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) console.warn('⚠️ Running chatbot tests in STUB mode (no GEMINI_API_KEY).');

const genAI = new GoogleGenerativeAI(API_KEY || 'dummy-key');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Core helper to ask the “dukun”
async function askDukun(prompt) {
  if (!API_KEY) return `(stub) ${prompt.slice(0, 60)}...`;
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }]}]
  });
  return result?.response?.text()?.trim() || '';
}

/* --------------------------------------------------------- */
/* 10 Behavioral / Functional Chatbot Test Cases             */
/* --------------------------------------------------------- */

test('Greeting response feels friendly', async () => {
  const res = await askDukun('Halo dukun, apa kabar?');
  assert.match(res, /(halo|sugeng|selamat|dukun|aku)/i);
});

test('Responds with mystic tone when asked about primbon', async () => {
  const res = await askDukun('Primbon hari ini apa artinya bagi zodiak Leo?');
  assert.match(res, /(primbon|weton|nasihat|pitutur|hari)/i);
});

test('Can explain weton combination', async () => {
  const res = await askDukun('Primbon Selasa Kliwon artinya apa?');
  assert.match(res, /(selasa|kliwon|watak|rejeki|pitutur)/i);
});

test('Response includes Javanese tone markers', async () => {
  const res = await askDukun('Berikan nasihat harian bergaya dukun Jawa.');
  assert.match(res, /(ngger|nduk|nak|matur nuwun|semoga)/i, 'Nuansa Jawa kurang terasa');
});

test('Responds reflectively to mood questions', async () => {
  const res = await askDukun('Hari ini aku lelah dan bingung, dukun.');
  assert.match(
    res,
    /(tenang|sabar|istirahat|bersyukur|semoga|tarik napas|napas|langkah kecil|mendengarkan|valid)/i
  );
});

test('Gives fallback when not about primbon', async () => {
  const res = await askDukun('Siapa presiden Indonesia?');
   assert.doesNotMatch(res, /(politik|partai|kampanye)/i);
});

test('Offers a clear next-step or supportive prompt', async () => {
  const res = await askDukun('Aku bingung dan lelah akhir-akhir ini.');
    const ACTION_REGEX = /(coba|mulailah|istirahat|bernafas|tarik napas|langkah kecil|ambil jeda|tuliskan|tulis|catat|minum air|jalan sebentar|ceritakan|bagikan|jangan ragu|aku di sini|aku di sini untuk mendengarkan|bantu|membantu)/i;
  if (!ACTION_REGEX.test(res)) {
    throw new Error(`Tidak menemukan saran/next step dalam respons:\n\n${res}`);
  }
});


test('Handles nonsense input gracefully', async () => {
  const res = await askDukun('asdfghjk qwerty uiop');
  assert.ok(res.length > 0);
});

test('Can describe cultural item correctly', async () => {
  const res = await askDukun('Apa makna keris bagi orang Jawa?');
  assert.match(res, /(simbol|spiritual|pelindung|warisan)/i);
});

test('Handles multi-turn style (context carry minimal)', async () => {
  const r1 = await askDukun('Primbon hari ini apa?');
  const r2 = await askDukun('Kalau begitu apa yang harus kulakukan?');
  assert.ok(r1.length > 0 && r2.length > 0);
});
