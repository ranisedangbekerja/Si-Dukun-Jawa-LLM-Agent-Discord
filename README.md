<div align="center">

# 🧙‍♂️ Si Dukun Jawa  
### _AI Primbon & Mood Reflection Bot for Discord_

<img width="350" height="384" alt="pakdukun" src="https://github.com/user-attachments/assets/b4c9fc13-7fa9-454a-8488-34e53d108d3d" />

</div>

---

## 🪶 Deskripsi
**Si Dukun Jawa** adalah chatbot AI berbasis Discord yang memadukan _kearifan lokal Jawa_ dengan teknologi **Large Language Model (LLM)**.  
Bot ini bertindak sebagai “dukun digital” yang memberikan **pitutur Jawa**, membaca **primbon/weton**, menanyakan **mood harian**, dan memberikan **refleksi mingguan** berbasis data pengguna.

> Tujuannya bukan meramal masa depan, tetapi membantu pengguna melakukan _refleksi diri_ dengan cara yang lucu, bijak, dan berbudaya.

---

## ⚙️ Tech Stack
- **Node.js 20+**
- **Discord.js v14**
- **OpenAI API (GPT-4o-mini)** atau **Gemini API**
- **JSON File Storage**
- **node-cron** (scheduler recap)
- **pino** (logging)
- **vitest** (unit test)

---

## 📂 Struktur Proyek
```
src/
 ├─ index.js         # Main bot & event handler
 ├─ agent.js         # LLM persona Si Dukun Jawa
 ├─ primbon.js       # Logika primbon & pitutur
 ├─ store.js         # Penyimpanan user & mood
 ├─ scheduler.js     # Recap mingguan otomatis
 ├─ logger.js        # Logging sistem
 └─ commands/        # Command Discord (!primbon, !mood, !recap)
data/
 ├─ primbon_data.json
 └─ users.json
logs/
 └─ app.log
tests/
.env.example
README.md
package.json
```

---

## 🚀 Instalasi & Menjalankan
1. Clone repository:
   ```bash
   git clone https://github.com/<user>/si-dukun-jawa.git
   cd si-dukun-jawa
   npm install
   ```
2. Salin `.env.example` → `.env` dan isi token:
   ```
   DISCORD_BOT_TOKEN=your-token
   OPENAI_API_KEY=your-key
   BOT_NAME=Si Dukun Jawa
   ```
3. Jalankan bot:
   ```bash
   npm run dev
   ```
4. Invite bot ke server Discord kamu dan coba command!

---

## 💬 Command Utama
| Command | Fungsi |
|----------|---------|
| `!help` | Menampilkan daftar perintah |
| `!primbon <Hari> <Pasaran>` | Menampilkan weton dan makna reflektif |
| `!harian` | Memberi pitutur dan tanya mood |
| `!mood <senang/stres/bingung/lelah/semangat>` | Simpan mood harian |
| `!recap` | Menampilkan insight mingguan pengguna |

---

## 🧠 Contoh Output
```
> !primbon Selasa Kliwon
🧙‍♂️ Wetonmu Selasa Kliwon — watak tenang tapi sensitif.
Pitutur dina iki: "Urip iku urup — hidup itu menyala memberi manfaat."
Saran: istirahat secukupnya, besok energi akan kembali. ✨
```

---

## 🧪 Testing
Jalankan semua unit test:
```bash
npm test
```
Minimal 6 kasus mencakup:
- Perhitungan neptu & weton  
- Penyimpanan log & mood  
- Validasi command  
- Recap mingguan  

---

## 🗃️ Logs
Semua aktivitas disimpan di `/logs/app.log` untuk audit & debugging.

Contoh:
```
[INFO] User @Annisa menggunakan !primbon Selasa Kliwon
[INFO] Response: Pitutur - Urip iku urup.
```

---

## 👥 Tim NLP
| Anggota | NIM | Peran | Fokus |
|----------|-------|-------|--------|
| **Rani Nirmala P.** | 22/493982/TK/54153 | Core Agent & Integrasi LLM | Integrasi Discord, LLM (Gemini/OpenAI), primbon logic |
| **Barbara Neanake A.** | 22/494495/TK/54238 | Data & Testing Engineer | Primbon logic, Logging, store, scheduler, test, dokumentasi |

---

> _"Sura dira jayaningrat lebur dening pangastuti — kemarahan kalah oleh kelembutan."_
