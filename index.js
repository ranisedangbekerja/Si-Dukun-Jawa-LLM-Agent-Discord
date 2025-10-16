import { Client, GatewayIntentBits } from "discord.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const API_KEY = process.env.GEMINI_API_KEY;
const BOT_TOKEN = process.env.BOT_TOKEN;
const MODEL = "gemini-2.0-flash";

if (!API_KEY || !BOT_TOKEN) {
  throw new Error("❌ Pastikan GEMINI_API_KEY dan BOT_TOKEN sudah ditambahkan di file .env");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL });

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`🤖 ${client.user.tag} siap menjadi dukun Jawa modern! 🌙`);
});

client.on("messageCreate", async (message) => {
  try {
    if (message.author.bot) return;

    const content = message.content.trim();
    if (!content) return;

    console.log(`📩 Pesan diterima dari ${message.author.tag}: ${content}`);

    // 🔒 Filter: hanya tanggapi jika mengandung kata "primbon"
    if (!/primbon/i.test(content)) {
      await message.reply("Aku hanya memberikan wangsit seputar **Primbon Jawa** saja 🕯️");
      return;
    }

    await message.channel.sendTyping();

    console.log("🔮 Mengirim pesan ke Gemini:", content);

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: content }] }],
    });

    const text = result.response.text().trim();

    if (!text) {
      await message.reply("Aku belum mendapat wangsit dari alam gaib... 🌫️");
      return;
    }

    console.log("✨ Balasan dari Gemini:", text);


    const chunks = text.match(/[\s\S]{1,1900}/g);
    for (const chunk of chunks) {
      await message.reply(chunk);
    }

    console.log("✅ Pesan berhasil dibalas!");
  } catch (error) {
    console.error("❌ Error terjadi:", error);
    await message.reply("Dukun Jawa tersandung batu metafisik... coba lagi nanti. 🪬");
  }
});

client.login(BOT_TOKEN);
