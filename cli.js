// cli.js — Si Dukun Jawa (CLI, stable build)
// Tidak pakai top-level await; semua dalam IIFE main().
// Selalu menulis pesan boot supaya kelihatan hidup.

import 'dotenv/config';
import readline from 'node:readline';
import fs from 'fs';

function log(line) {
  try {
    fs.mkdirSync('logs', { recursive: true });
    fs.appendFileSync('logs/app.log', `${new Date().toISOString()} ${line}\n`, 'utf8');
  } catch {}
}

async function main() {
  console.log('🔧 Booting CLI...');

  const API_KEY = process.env.GEMINI_API_KEY;
  const NAME = process.env.BOT_NAME || 'Si Dukun Jawa';
  if (!API_KEY) {
    console.error('❌ GEMINI_API_KEY belum diisi di .env');
    process.exit(1);
  }

  // dynamic import di dalam fungsi (bukan top-level)
  let GoogleGenerativeAI;
  try {
    ({ GoogleGenerativeAI } = await import('@google/generative-ai'));
    console.log('✅ @google/generative-ai loaded');
  } catch (e) {
    console.error('❌ Gagal import @google/generative-ai:', e?.message || e);
    process.exit(1);
  }

  let model;
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    console.log('✅ Gemini model initialized');
  } catch (e) {
    console.error('❌ Gagal init Gemini:', e?.message || e);
    process.exit(1);
  }

  async function askGemini(userText) {
    const system = `Kamu adalah "${NAME}", dukun Jawa modern: halus, empatik, humor tipis, maksimal 6 baris. Akhiri dengan 1 tindakan kecil.`;
    const prompt = system + '\n\nUser: ' + userText;
    try {
      const res = await model.generateContent(prompt);
      return (res?.response?.text() || '').trim();
    } catch (e) {
      console.error('❌ Error panggil Gemini:', e?.message || e);
      return '';
    }
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.setPrompt('🪶 Dukun> ');
  console.log('🪶 CLI "Si Dukun Jawa" siap. Ketik pertanyaan. Tulis /quit untuk keluar.\n');
  rl.prompt();

  rl.on('line', async (line) => {
    const q = line.trim();
    if (!q) { rl.prompt(); return; }
    if (q.toLowerCase() === '/quit') {
      console.log('👋 Matur nuwun. Sampai jumpa.');
      rl.close();
      return;
    }
    const ans = await askGemini(q);
    if (!ans) {
      console.log('🌫️ Aku belum mendapat wangsit hari ini (mungkin API error).');
      log(`[CLI-EMPTY] ${q}`);
    } else {
      console.log('\n' + ans + '\n');
      log(`[CLI] ${q} -> ${ans.replace(/\s+/g, ' ').slice(0, 200)}${ans.length > 200 ? '…' : ''}`);
    }
    rl.prompt();
  });

  rl.on('close', () => {
    console.log('🧹 Menutup sesi CLI.');
    process.exit(0);
  });

  process.on('SIGINT', () => { console.log('\n^C'); rl.close(); });
}

main().catch((e) => {
  console.error('💥 Fatal:', e?.message || e);
  process.exit(1);
});
