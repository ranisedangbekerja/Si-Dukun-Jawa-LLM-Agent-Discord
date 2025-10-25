// index.js — Si Dukun Jawa (Discord) • versi selaras dengan CLI
import 'dotenv/config';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logLine } from './logger.js';

// ====== ENV & CONSTANTS ======
const API_KEY   = process.env.GEMINI_API_KEY;
const BOT_TOKEN = process.env.BOT_TOKEN;
const MODEL     = 'gemini-2.0-flash';
const BOT_NAME  = process.env.BOT_NAME || 'Si Dukun Jawa';

const MAX_DISCORD_MSG_LEN = 1900;

if (!API_KEY || !BOT_TOKEN) {
  throw new Error('❌ Pastikan GEMINI_API_KEY dan BOT_TOKEN sudah ditambahkan di file .env');
}

// ====== LLM CLIENT ======
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: MODEL,
  generationConfig: { maxOutputTokens: 250 } // ringkas, selaras CLI
});

// ====== DISCORD CLIENT ======
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel] // allow DMs
});

// ====== UTIL ======
function chunk(text, n = MAX_DISCORD_MSG_LEN) {
  if (!text) return [];
  const out = [];
  let s = text.trim();
  while (s.length > n) {
    let idx = s.lastIndexOf('\n', n);
    if (idx < n * 0.7) idx = s.lastIndexOf(' ', n);
    if (idx <= 0) idx = n;
    out.push(s.slice(0, idx));
    s = s.slice(idx).trim();
  }
  if (s) out.push(s);
  return out;
}

function capLines(text, n = 6) {
  const lines = (text || '')
    .replace(/\r/g, '')
    .split(/\n+/)
    .map(s => s.trim())
    .filter(Boolean);
  return lines.slice(0, n).join('\n');
}

async function askGeminiLikeCLI(userText) {
  const MAX_LINES = 10;
  const system = 
    `Kamu adalah "${BOT_NAME}", dukun Jawa modern: halus, empatik, humor tipis. ` +
    `Jawab ringkas dan rapi dalam maksimal ${MAX_LINES} baris. ` +
    `Akhiri dengan 1 tindakan kecil yang bisa dilakukan hari ini, dengan kata-kata yang seperti menyarankan kepada teman.`;
  const prompt = `${system}\n\nUser: ${userText}`;
  const res = await model.generateContent(prompt);
  const raw = (res?.response?.text() || '').trim();
  return capLines(raw, 6);
}

// ====== BOOT ======
client.once('ready', () => {
  const tag = client.user?.tag || 'BOT';
  console.log(`🤖 ${tag} siap menjadi dukun Jawa modern! 🌙`);
  logLine(`[READY] ${tag} using ${MODEL} as ${BOT_NAME}`);
});

// ====== MESSAGE HANDLER (selaras CLI: tanpa filter "primbon only") ======
client.on('messageCreate', async (message) => {
  try {
    if (message.author?.bot) return;

    const content = (message.content || '').trim();
    if (!content) return;

    console.log(`📩 ${message.author.tag}: ${content}`);
    logLine(`[IN] ${message.author.id}/${message.author.tag} :: ${content}`);

    await message.channel.sendTyping();

    logLine(`[LLM>REQ] ${content}`);
    const answer = await askGeminiLikeCLI(content);

    if (!answer) {
      const fallback = 'Aku belum mendapat wangsit dari alam gaib... 🌫️';
      await message.reply(fallback);
      logLine(`[OUT] empty-llm -> ${fallback}`);
      return;
    }

    console.log('✨ Balasan:', answer);
    logLine(`[LLM>RES] ${answer.slice(0, 200)}${answer.length > 200 ? '…' : ''}`);

    const parts = chunk(answer, MAX_DISCORD_MSG_LEN);
    for (const p of parts) await message.reply(p);

    logLine(`[OUT] replied ${parts.length} chunk(s)`);
  } catch (error) {
    const code = error?.code || error?.name || 'ERR';
    console.error('❌ Error terjadi:', error);
    logLine(`[ERR] ${code} :: ${error?.message || error}`);
    try {
      await message.reply('Dukun Jawa tersandung batu metafisik... coba lagi nanti. 🪬');
      logLine('[OUT] error-reply sent');
    } catch { /* noop */ }
  }
});

// ====== LOGIN ======
client.login(BOT_TOKEN).catch((e) => {
  console.error('❌ Gagal login ke Discord:', e);
  logLine(`[LOGIN-ERR] ${e?.message || e}`);
  process.exit(1);
});

process.on('SIGINT',  () => { logLine('[SHUTDOWN] SIGINT');  client.destroy(); process.exit(0); });
process.on('SIGTERM', () => { logLine('[SHUTDOWN] SIGTERM'); client.destroy(); process.exit(0); });
