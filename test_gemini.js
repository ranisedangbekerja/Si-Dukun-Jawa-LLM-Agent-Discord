import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config"; 

const MODEL_NAME = "gemini-2.0-flash";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function runTest() {
  try {
    console.log(`🚀 Mengirim permintaan ke model: ${MODEL_NAME}...`);

    const prompt = "Jelaskan secara singkat apa itu keris dalam budaya Jawa.";

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(prompt);

    const text = result.response.text();

    console.log("\n✅ Permintaan berhasil! Berikut balasannya:\n---");
    console.log(text);
    console.log("---\n");
  } catch (error) {
    console.error("❌ Terjadi error saat memanggil Gemini API:");
    console.error(error);
  }
}

runTest();
