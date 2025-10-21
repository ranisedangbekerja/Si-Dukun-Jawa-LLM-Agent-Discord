import 'dotenv/config';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logLine } from './logger.js';

// ====== ENV & CONSTANTS ======
const API_KEY   = process.env.GEMINI_API_KEY;
const BOT_TOKEN = process.env.BOT_TOKEN;
const MODEL     = 'gemini-2.0-flash';
const BOT_NAME  = process.env.BOT_NAME || 'Si Dukun Jawa';

// Discord hard limit 2000 chars; keep headroom for mentions/formatting
const MAX_DISCORD_MSG_LEN = 1900;

// Validate env early
if (!API_KEY || !BOT_TOKEN) {
  throw new Error('❌ Pastikan GEMINI_API_KEY dan BOT_TOKEN sudah ditambahkan di file .env');
}

// ====== LLM CLIENT ======
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL });

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

// ====== SMALL UTILITIES ======
/** Safe split for long LLM outputs */
function chunk(text, n = MAX_DISCORD_MSG_LEN) {
  if (!text) return [];
  const out = [];
  let s = text.trim();
  while (s.length > n) {
    // try split on newline near boundary
    let idx = s.lastIndexOf('\n', n);
    if (idx < n * 0.7) idx = s.lastIndexOf(' ', n); // fallback split on space
    if (idx <= 0) idx = n; // worst case hard cut
    out.push(s.slice(0, idx));
    s = s.slice(idx).trim();
  }
  if (s) out.push(s);
  return out;
}

/** Call Gemini with a plain user message */
async function askGemini(userText) {
  const res = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: userText }]}]
  });
  return (res?.response?.text() || '').trim();
}

// ====== BOOT EVENTS ======
client.once('ready', () => {
  const tag = client.user?.tag || 'BOT';
  console.log(`🤖 ${tag} siap menjadi dukun Jawa modern! 🌙`);
  logLine(`[READY] ${tag} using ${MODEL} as ${BOT_NAME}`);
});

// ====== MESSAGE HANDLER ======
client.on('messageCreate', async (message) => {
  try {
    // ignore self & other bots
    if (message.author?.bot) return;

    const content = (message.content || '').trim();
    if (!content) return;

    console.log(`📩 ${message.author.tag}: ${content}`);
    logLine(`[IN] ${message.author.id}/${message.author.tag} :: ${content}`);

    // 🔒 Filter: hanya tanggapi jika mengandung kata "primbon"
    if (!/primbon/i.test(content)) {
      await message.reply('Aku hanya memberikan wangsit seputar **Primbon Jawa** saja 🕯️');
      logLine(`[OUT] hint-primbon -> sent`);
      return;
    }

    await message.channel.sendTyping();
    console.log('🔮 Mengirim pesan ke Gemini:', content);
    logLine(`[LLM>REQ] ${content}`);

    const llmText = await askGemini(content);

    if (!llmText) {
      const fallback = 'Aku belum mendapat wangsit dari alam gaib... 🌫️';
      await message.reply(fallback);
      logLine(`[OUT] empty-llm -> ${fallback}`);
      return;
    }

    console.log('✨ Balasan dari Gemini:', llmText);
    logLine(`[LLM>RES] ${llmText.slice(0, 200)}${llmText.length > 200 ? '…' : ''}`);

    const parts = chunk(llmText, MAX_DISCORD_MSG_LEN);
    for (const p of parts) {
      await message.reply(p);
    }

    console.log('✅ Pesan berhasil dibalas!');
    logLine(`[OUT] replied ${parts.length} chunk(s)`);
  } catch (error) {
    // classify some common transient errors for nicer logging
    const code = error?.code || error?.name || 'ERR';
    console.error('❌ Error terjadi:', error);
    logLine(`[ERR] ${code} :: ${error?.message || error}`);

    try {
      await message.reply('Dukun Jawa tersandung batu metafisik... coba lagi nanti. 🪬');
      logLine('[OUT] error-reply sent');
    } catch (_e) {
      // swallow
    }
  }
});

// ====== LOGIN (graceful) ======
client.login(BOT_TOKEN).catch((e) => {
  console.error('❌ Gagal login ke Discord:', e);
  logLine(`[LOGIN-ERR] ${e?.message || e}`);
  process.exit(1);
});

// Graceful shutdown (optional nice-to-have)
process.on('SIGINT',  () => { logLine('[SHUTDOWN] SIGINT');  client.destroy(); process.exit(0); });
process.on('SIGTERM', () => { logLine('[SHUTDOWN] SIGTERM'); client.destroy(); process.exit(0); });
