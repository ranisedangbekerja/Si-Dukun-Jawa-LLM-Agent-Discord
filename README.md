<div align="center">

# 🧙‍♂️ Si Dukun Jawa  
### _LLM Agent Primbon Jawa & Mood Reflection (Discord + CLI)_

<img width="340" alt="pakdukun" src="https://github.com/user-attachments/assets/b4c9fc13-7fa9-454a-8488-34e53d108d3d" />

</div>

---

## 🪶 Deskripsi  
**Si Dukun Jawa** adalah proyek chatbot berbasis **Large Language Model (LLM)** yang memadukan teknologi modern dengan kearifan lokal Jawa.  
Bot ini berperilaku seperti **dukun digital modern** — memberikan pitutur, membaca primbon dan weton, serta menanggapi pertanyaan dengan gaya khas orang Jawa: lembut, bijak, kadang lucu juga.

Proyek ini dibuat untuk memenuhi tugas akhir mata kuliah **Natural Language Processing (NLP)**, dengan fokus pada penerapan LLM Agent di platform **Discord** dan juga **Command Line Interface (CLI)**.

> Tujuannya bukan untuk meramal, tapi membantu pengguna melakukan refleksi diri dan memahami makna keseharian lewat nilai-nilai budaya.

---

## ⚙️ Tech Stack
- **Node.js 20+**
- **Discord.js v14**
- **Gemini API (Google Generative AI)**
- **dotenv** untuk manajemen environment variables  
- **nodemon** untuk mode pengembangan  
- **fs logger** untuk menyimpan percakapan  
- **Node Test Runner (`node:test`)** untuk pengujian unit & integrasi  

---

## 📂 Struktur Proyek
```
si-dukun-jawa/
├─ index.js # Main bot untuk Discord
├─ cli.js # Mode Command Line Interface
├─ logger.js # Sistem logging sederhana
├─ primbon.js # (opsional) fungsi tambahan tafsir primbon
├─ tests/
│ ├─ chatbot.behavior.test.js # 10 pengujian perilaku LLM
│ ├─ cli.integration.test.js # 3 pengujian integrasi CLI
│ └─ logger.test.js # (opsional) validasi sistem log
├─ logs/
│ └─ app.log 
├─ .env.example
├─ package.json
└─ README.md
```
---

## 🚀 Cara Menjalankan

### 1️⃣ Instalasi
```bash
git clone https://github.com/<user>/si-dukun-jawa.git
cd si-dukun-jawa
npm install
```
2️⃣ Konfigurasi .env

Buat file .env dari contoh .env.example, lalu isi dengan:
```
GEMINI_API_KEY=your-gemini-api-key
BOT_TOKEN=your-discord-bot-token
BOT_NAME=Si Dukun Jawa
```

3️⃣ Menjalankan versi CLI
Untuk mencoba langsung di terminal:
```
npm run dev:cli
```
Contoh interaksi:
🪶 Dukun> Primbon Jumat Legi
Watakmu tenang, sabar, tapi jangan terlalu dipendam. 
Coba tersenyum hari ini — energi baikmu menular ke sekitar.

4️⃣ Menjalankan versi Discord
Untuk mengaktifkan bot di server Discord:
```
npm run dev:discord
```
Kirim pesan di server Discord:
primbon Selasa Kliwon
Si Dukun akan menjawab dengan tafsir weton dan pitutur khas Jawa 🌙

---

🧪 Testing
Proyek ini memiliki 14 pengujian otomatis yang mencakup:
1. Respons chatbot terhadap sapaan dan pertanyaan primbon
2. Nuansa bahasa dan gaya khas Jawa
3. Integrasi CLI
4. Validasi sistem logging
Jalankan semua test:
```
npm test
```

Contoh hasil:
```
✔ Greeting response feels friendly
✔ Responds with mystic tone
✔ CLI starts and displays greeting text
✔ CLI logs file is created after interaction
...
All 14 tests passed 
```
---

🗃️ Logging
Semua percakapan yang terjadi (baik di CLI maupun Discord) dicatat otomatis di folder logs/app.log.
Contoh isi log:
```
2025-10-21T17:42:03.124Z [CLI] Primbon Jumat Legi -> Watak energik, tapi perlu sabar.
2025-10-21T17:43:12.827Z [CLI] Aku lelah -> Saran: tarik napas dan tulis hal baik yang terjadi hari ini.
```

---

💬 Contoh Output
> Hi Mbah Dukun, apa primbon untuk gadis kelahiran 23 April 2005?
```
Ealah, Nduk. Lintangmu Banteng, watak keras tapi penyayang. Rejeki lumayan, jodoh pilih-pilih. Sing penting, eling Gusti, ojo lali ngaji. Mbah saran, sesuk pagi, sedekah subuh, ya?
```

---

## 👥 Tim Developer
| Nama | NIM | Peran | Fokus |
|------|------|-------|--------|
| **Rani Nirmala P.** | 22/493982/TK/54153 | Core Agent & Integrasi LLM | Integrasi Gemini API, Discord Bot, dan logika |
| **Barbara Neanake A.** | 22/494495/TK/54238 | Logic, Data, & Testing Engineer | Finalize logic, CLI system, logging, unit testing, dokumentasi |

---

<div align="center">

## _"Sura dira jayaningrat lebur dening pangastuti."_
Kemarahan dan kekuatan akan luluh oleh kelembutan. 🌿

<div>

---
