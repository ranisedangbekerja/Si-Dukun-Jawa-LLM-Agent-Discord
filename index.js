// index.js — Si Dukun Jawa (Discord) • JSON memory + auto mood + natural recap + robust retry
import 'dotenv/config';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logLine } from './logger.js';

import {
  upsertUser, insertEvent, insertMood,
  getRecentEvents, getWeekData, forgetUser, exportUser
} from './store.js';
import { buildWeeklyInsight, renderInsightEmbed } from './insight.js';

// ====== ENV & CONSTANTS ======
const API_KEY   = process.env.GEMINI_API_KEY;
const BOT_TOKEN = process.env.BOT_TOKEN;
const BOT_NAME  = process.env.BOT_NAME || 'Si Dukun Jawa';
const MAX_DISCORD_MSG_LEN = 1900;
const MAX_LINES = 10;

// Daftar model untuk fallback. Bisa di-override via .env: GEMINI_MODELS="gemini-2.0-flash,gemini-1.5-flash,gemini-1.5-pro"
const MODEL_POOL = (process.env.GEMINI_MODELS ||
  'gemini-2.0-flash,gemini-1.5-flash').split(',').map(s => s.trim()).filter(Boolean);

if (!API_KEY || !BOT_TOKEN) {
  throw new Error('❌ Pastikan GEMINI_API_KEY dan BOT_TOKEN sudah ditambahkan di file .env');
}

// ====== LLM ======
const genAI = new GoogleGenerativeAI(API_KEY);
function getModel(name) {
  return genAI.getGenerativeModel({
    model: name,
    generationConfig: { maxOutputTokens: 320 }
  });
}

// Core retry: rotate model on 503/429, exponential backoff
async function generateWithRetry({ text, preferModelIndex = 0, maxAttempts = 5 }) {
  let lastErr;
  let idx = preferModelIndex % MODEL_POOL.length;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const modelName = MODEL_POOL[idx];
    try {
      logLine(`[LLM>REQ] model=${modelName} attempt=${attempt} :: ${text.slice(0,160)}`);
      const model = getModel(modelName);

      const res = await model.generateContent(text);
      const raw = (res?.response?.text() || '').trim();
      if (raw) {
        logLine(`[LLM>RES] model=${modelName} len=${raw.length}`);
        return raw;
      }
      throw new Error('Empty response from model');
    } catch (e) {
      const status = e?.status || e?.statusCode || '';
      const name   = e?.name || '';
      const msg    = e?.message || String(e);
      logLine(`[LLM>ERR] model=${modelName} status=${status} name=${name} :: ${msg}`);

      lastErr = e;

      // Untuk 503/429 (overloaded / rate-limited): ganti model + tunggu backoff
      const shouldRotate = status === 503 || status === 429;
      const backoffMs = Math.min(2000 * Math.pow(1.6, attempt - 1), 7000); // 2s -> max ~7s
      if (shouldRotate) {
        idx = (idx + 1) % MODEL_POOL.length;
      }

      // Tunggu backoff sebelum coba lagi
      await new Promise(r => setTimeout(r, backoffMs));
    }
  }

  // Semua percobaan gagal: lempar error terakhir
  throw lastErr || new Error('LLM failed after retries');
}

// ====== DISCORD ======
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
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

function capLines(text, n = MAX_LINES) {
  const lines = (text || '')
    .replace(/\r/g, '')
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return lines.slice(0, n).join('\n');
}

// GANTI fungsi panggilanJawa lama kamu dengan ini
function panggilanJawa(nameRaw = '') {
  const name = (nameRaw || '').trim();
  if (!name) return 'Ngger'; // default kalau nama kosong

  const n = name.toLowerCase();

  // Nama yang wajib dianggap perempuan
  const FORCE_FEMALE = new Set(['rani', 'barbara']);

  // Heuristik sederhana (boleh kamu tambah sesuai kebutuhan)
  const femaleHints = /(rani|barbara|nea|sri|ayu|putri|sari|dwi|lisa|nina|dina|ani\b|tia\b|ika\b|mega\b|wati\b|ningrum|astuti)/i;
  const maleHints   = /(agus|budi|wawan|rio\b|andi|fajar|bayu|eko\b|yuda|andika|prasetyo|putra\b|permana|adi\b|yanto\b|anto\b|wahyu)/i;

  let gender = 'u'; // u=unknown, f=female, m=male
  if (FORCE_FEMALE.has(n)) {
    gender = 'f';
  } else if (femaleHints.test(n)) {
    gender = 'f';
  } else if (maleHints.test(n)) {
    gender = 'm';
  }

  if (gender === 'f') {
    // sapaan manis untuk perempuan
    return `Ndhuk ${name}, cah ayu`;
  }
  if (gender === 'm') {
    // sapaan untuk laki
    return `Le ${name}`;
  }
  // fallback netral kalau tak terklasifikasi
  return `Ngger ${name}`;
}

function isPrimbonQuery(text = '') {
  const t = text.toLowerCase();
  return (
    /(primbon|weton|legi|pahing|pon|wage|kliwon|senin|selasa|rabu|kamis|jumat|sabtu|minggu)/i.test(t) ||
    /\b(\d{1,2}\s+(jan|feb|mar|apr|mei|jun|jul|ags|agu|sep|okt|nov|des|january|february|march|april|may|june|july|aug|september|october|november|december)\s+\d{4})\b/i.test(t)
  );
}

// Natural recap triggers (tanpa '!')
function isRecapQuery(text = '') {
  const t = text.toLowerCase();
  return /((rekap|recap|laporan|report).*(minggu|week|weekly)|^(rekap|recap)$)/i.test(t);
}

function quickSentiment(text = '') {
  const tx = text.toLowerCase();
  const pos = /(lega|senang|bahagia|tenang|semangat|syukur|bersyukur|berhasil)/.test(tx);
  const neg = /(lelah|capek|stres|stress|bingung|sedih|cemas|gelisah|marah|tertekan)/.test(tx);
  if (pos && !neg) return 'pos';
  if (neg && !pos) return 'neg';
  return 'net';
}

// Auto-detect mood
function detectMoodFromText(text = '') {
  const t = text.toLowerCase();

  const map = [
    { mood: 'senang',    re: /(senang|bahagia|happy|gembira|lega|plong|puas|seneng)/ },
    { mood: 'semangat',  re: /(semangat|on fire|termotivasi|berenergi|gas|ayo)/ },
    { mood: 'lelah',     re: /(lelah|capek|letih|tepar|teler|kecapekan|badan remuk)/ },
    { mood: 'stres',     re: /(stres|stress|tertekan|pusing|overwhelmed|burn ?out|kalut)/ },
    { mood: 'bingung',   re: /(bingung|bimbang|galau|ragu|plin-?plan|lost)/ },
  ];

  for (const { mood, re } of map) {
    if (re.test(t)) {
      const note = (t.split(re)[2] || '').trim();
      return { mood, note: note.slice(0, 120) };
    }
  }
  return null;
}

function parsePrimbonEntities(text = '') {
  const hari = (text.match(/senin|selasa|rabu|kamis|jumat|sabtu|minggu/i) || [])[0] || null;
  const pasaran = (text.match(/legi|pahing|pon|wage|kliwon/i) || [])[0] || null;
  const date =
    (text.match(
      /\b(\d{1,2}\s+(jan|feb|mar|apr|mei|jun|jul|ags|agu|sep|okt|nov|des|january|february|march|april|may|june|july|aug|september|october|november|december)\s+\d{4})\b/i
    ) || [])[0] || null;
  return { hari, pasaran, date };
}

// ====== LLM WRAPPERS (pakai retry) ======
async function askPrimbon(userText, displayName) {
  const sapaan = panggilanJawa(displayName);
  const system = `Kamu adalah "${BOT_NAME}", dukun Jawa modern yang lembut dan magis.
Gunakan kosakata Jawa sewajarnya (pangestu, jamu, gamelan, pitutur, wuku, pasaran), dan mix lembut dengan bahasa indonesia.
Tafsirkan PRIMBON/WETON secara ringkas, tidak absolut.
Format 3 bagianm tapi Sampaikan dengan natural seolah-olah menasihati orang. Jangan in points tapi benar-benar memberikan mengenai :
- **Tafsiran**: watak singkat, rejeki/jodoh/energi hari ini (1–3 kalimat).
- **Pitutur**: satu kalimat petuah Jawa yang hangat.
- **Tindakan kecil**: 1 hal sederhana untuk hari ini.
Maksimal ${MAX_LINES} baris, sapa user dengan "${sapaan}".`;
  const prompt = `${system}\n\nUser (${sapaan}): ${userText}`;

  try {
    const raw = await generateWithRetry({ text: prompt, preferModelIndex: 0 });
    return capLines(raw, MAX_LINES);
  } catch (e) {
    // fallback balasan ramah
    logLine(`[PRIMBON-FALLBACK] ${e?.message || e}`);
    return capLines(
      `${sapaan}, dukunmu lagi nderek antri ngakses wangsit. 
Sakderengipun, tak titip pitutur cekak:
- **Tafsiran**: Tetep waskita, eling lan ngati-ati dina iki.
- **Pitutur**: "Sabar iku luhur, syukur iku makmur."
- **Tindakan kecil**: Ngombe banyu anget lan atur syukur 3 bab.
`, MAX_LINES);
  }
}

async function askGeneral(userText, displayName) {
  const sapaan = panggilanJawa(displayName);
  const system = `Kamu adalah "${BOT_NAME}", dukun Jawa modern: halus, empatik, humor tipis.
Sisipi kosakata Jawa ringan (ngger/nduk/pangestu/waskita). Jawab konkret.
Akhiri dengan 1 "tindakan kecil". Maksimal ${MAX_LINES} baris.`;
  const prompt = `${system}\n\nUser (${sapaan}): ${userText}`;

  try {
    const raw = await generateWithRetry({ text: prompt, preferModelIndex: 0 });
    return capLines(raw, MAX_LINES);
  } catch (e) {
    // fallback balasan ramah
    logLine(`[GENERAL-FALLBACK] ${e?.message || e}`);
    return capLines(
      `${sapaan}, dukunmu nembe rame antri. Nanging menawi kersa:
- **Saran cekak**: Ambegan alon 4×4×4, tulis siji perkara sing iso kok syukuri.
- **Pitutur**: "Urip iku urup—madangi awake dhewe lan saklirane."
- **Tindakan kecil**: Tindakake 10 menit wae, mengko dicoba maneh yo.`, MAX_LINES);
  }
}

// ====== BOOT ======
client.once('ready', () => {
  const tag = client.user?.tag || 'BOT';
  console.log(`🤖 ${tag} siap menjadi dukun Jawa modern! 🌙`);
  logLine(`[READY] ${tag} using POOL=[${MODEL_POOL.join(', ')}] as ${BOT_NAME}`);
});

// ====== MESSAGE HANDLER ======
client.on('messageCreate', async (message) => {
  try {
    if (message.author?.bot) return;

    const content = (message.content || '').trim();
    if (!content) return;

    const displayName =
      message.member?.displayName ||
      message.author?.globalName ||
      message.author?.username ||
      'le/nduk';

    await upsertUser({ id: message.author.id, handle: displayName });
    logLine(`[IN] ${message.author.id}/${message.author.tag} :: ${content}`);

    // Natural recap (tanpa !)
    if (isRecapQuery(content)) {
      const end = new Date();
      const start = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
      const { events, moods } = await getWeekData(
        message.author.id,
        start.toISOString(),
        end.toISOString()
      );
      if (!events.length && !moods.length) {
        return message.reply(`Durung ana sing bisa diceritakake minggu iki, ${sapaan}.`);
      }
      const i = buildWeeklyInsight({ events, moods }, displayName);
      const embed = renderInsightEmbed(i, start.toISOString(), end.toISOString());
      return message.reply({ embeds: [embed] });
    }

    // Commands (opsional)
    if (content.startsWith('!')) {
      const [cmd, ...rest] = content.slice(1).split(/\s+/);
      const args = rest.join(' ').trim();

      if (cmd === 'help') {
        return message.reply(
          [
            '**Si Dukun Jawa – Pitulung**',
            'Bisa pakai bahasa natural: "rekap mingguan", "weekly report", dst.',
            '`!mood <senang|stres|lelah|semangat|bingung> [catatan]` (opsional, sekarang auto-detect juga)',
            '`!riwayat`  → 5 interaksi terakhir',
            '`!recap`    → rekap mingguan (7 hari), weekly report',
            '`!forget`   → hapus semua dataku',
            '`!export`   → kirim file JSON dataku'
          ].join('\n')
        );
      }

      if (cmd === 'mood') {
        const [label, ...noteArr] = args.split(/\s+/);
        const note = noteArr.join(' ');
        if (!label)
          return message.reply(
            'Format: `!mood <senang|stres|lelah|semangat|bingung> [catatan]`'
          );
        await insertMood({
          user_id: message.author.id,
          mood: label.toLowerCase(),
          note,
        });
        return message.reply(`Pangestu, ${displayName}. Mood "${label}" wis tak catet.`);
      }

      if (cmd === 'riwayat') {
        const rows = await getRecentEvents(message.author.id, 5);
        if (!rows.length) return message.reply(`Durung ana jejak wangsit minggu iki, ${sapaan}.`);
        const lines = rows.map(
          (r) => `• ${new Date(r.ts).toLocaleString('id-ID')}: ${r.type} – ${r.text.slice(0, 60)}…`
        );
        return message.reply(['Jejak 5 interaksi pungkasan:', ...lines].join('\n'));
      }

      if (cmd === 'recap') {
        const end = new Date();
        const start = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
        const { events, moods } = await getWeekData(
          message.author.id,
          start.toISOString(),
          end.toISOString()
        );
        if (!events.length && !moods.length) {
          return message.reply(`Durung ana sing bisa diceritakake minggu iki, ${sapaan}.`);
        }
        const i = buildWeeklyInsight({ events, moods }, displayName);
        const embed = renderInsightEmbed(i, start.toISOString(), end.toISOString());
        return message.reply({ embeds: [embed] });
      }

      if (cmd === 'forget') {
        const n = await forgetUser(message.author.id);
        return message.reply(`Wis tak resiki jejakmu (${n} cathetan). Mugi ati luwih legan, ${displayName}.`);
      }

      if (cmd === 'export') {
        const data = await exportUser(message.author.id);
        const json = Buffer.from(JSON.stringify(data, null, 2), 'utf8');
        return message.reply({
          content: 'Iki berkas rekam jejakmu, simpen sing rapet yo.',
          files: [{ attachment: json, name: 'si-dukun-jawa-export.json' }],
        });
      }

      return message.reply('Perintah ora kawruh. Coba `!help` yo.');
    }

    // Normal chat
    await message.channel.sendTyping();

    const usePrimbon = isPrimbonQuery(content);
    const answer = usePrimbon
      ? await askPrimbon(content, displayName)
      : await askGeneral(content, displayName);

    // Auto-detect mood dari chat biasa (simpan jika ketemu)
    const autoMood = detectMoodFromText(content);
    if (autoMood) {
      await insertMood({
        user_id: message.author.id,
        mood: autoMood.mood,
        note: autoMood.note || '',
      });
    }

    // Simpan event
    await insertEvent({
      user_id: message.author.id,
      ts: new Date().toISOString(),
      channel_id: message.channelId,
      type: usePrimbon ? 'primbon' : 'general',
      text: content,
      answer,
      topic: usePrimbon ? 'weton' : 'refleksi',
      sentiment: quickSentiment(content),
      entities: JSON.stringify(parsePrimbonEntities(content)),
    });

    if (!answer) return message.reply('Aku durung nampa wangsit saka alam gaib… 🌫️');
    for (const p of chunk(answer, MAX_DISCORD_MSG_LEN)) await message.reply(p);
  } catch (error) {
    console.error('❌ Error terjadi:', error);
    logLine(`[HANDLER-ERR] ${error?.message || error}`);
    try {
      await message.reply('Dukun Jawa kesrimpet batu metafisik… mengko dicoba maneh yo. 🪬');
    } catch {}
  }
});

// ====== LOGIN ======
client.login(BOT_TOKEN).catch((e) => {
  console.error('❌ Gagal login ke Discord:', e);
  logLine(`[LOGIN-ERR] ${e?.message || e}`);
  process.exit(1);
});
process.on('SIGINT', () => { client.destroy(); process.exit(0); });
process.on('SIGTERM', () => { client.destroy(); process.exit(0); });
