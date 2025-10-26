<div align="center">

# 🧙‍♂️ **Si Dukun Jawa Chatbot**
### _LLM Agent Primbon Jawa & Mood Reflection (Discord + CLI)_

<img width="340" alt="pakdukun" src="https://github.com/user-attachments/assets/b4c9fc13-7fa9-454a-8488-34e53d108d3d" />

<br/>
<br/>

<a href="https://drive.google.com/drive/folders/1-U2INGy8JMjosdgoF95Q0wwIOdx7cBrM?usp=sharing" target="_blank">
  <img src="https://img.shields.io/badge/Demo_&_Presentasi-Google_Drive-4285F4?style=for-the-badge&logo=google-drive&logoColor=white" alt="Lihat Demo & Presentasi">
</a>

<a href="https://www.canva.com/design/DAG13bS00-4/RjCbYANYV359kIdlcLcOsA/view?utm_content=DAG13bS00-4&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h77f3c362eb" target="_blank">
  <img src="https://img.shields.io/badge/PPT_Presentasi-Canva-8A2BE2?style=for-the-badge&logo=slideshare&logoColor=white" alt="PPT Presentasi">
</a>

<a href="https://island-stool-b9d.notion.site/296c183ce92d801fa4f7fb2fbc78c165?v=296c183ce92d8003a1af000caca1ae26&pvs=143" target="_blank">
  <img src="https://img.shields.io/badge/Laporan-Notion-9C27B0?style=for-the-badge&logo=notion&logoColor=white" alt="Link Laporan di Notion">
</a>
<br/>

<a href="https://discord.gg/Vbc8DHqx" target="_blank">
  <img src="https://img.shields.io/badge/💫_COBA_SI_DUKUN_DI_DISCORD_-purple?style=for-the-badge&logo=discord&logoColor=white&colorA=2C1F6D&colorB=8A2BE2" alt="Join Discord" width="350">
</a>

<br/>
<br/>
</div>

---

## 🪶 Latar Belakang & Deskripsi  
Di tengah modernisasi, minat dan pemahaman generasi muda terhadap warisan budaya seperti Primbon Jawa semakin menurun karena format penyampaiannya yang dianggap kuno.

**Si Dukun Jawa** hadir sebagai solusi untuk menjembatani kesenjangan ini. Proyek ini bukan sekadar chatbot, melainkan sebuah **LLM Agent** yang dirancang untuk:
1.  **Menyajikan Primbon:** Menginterpretasi Primbon dan Weton dengan bahasa yang relevan.
2.  **Memberi Pitutur:** Menyampaikan pitutur (nasihat) Jawa yang bijak dan reflektif.
3.  **Melakukan Refleksi Emosi:** Menjadi teman curhat yang mampu melacak *mood* pengguna.

Agent ini hidup di **Discord** (dan CLI juga), platform yang dekat dengan generasi muda, dan dibungkus dalam persona **"Dukun Jawa"** yang modern: bijak, halus, namun juga humoris.

> Tujuannya bukan untuk meramal, tapi membantu pengguna melakukan refleksi diri dan memahami makna keseharian lewat nilai-nilai budaya.

---
## 🌟 Fitur Utama

Agent ini memiliki arsitektur yang melampaui *request-response* sederhana, dilengkapi dengan memori dan kemampuan analitis:

* **Interpretasi Primbon & Weton:** Mampu menafsirkan tanggal lahir atau *weton* untuk memberikan gambaran watak, rezeki, dan jodoh secara ringkas.
* **Persona Khas Dukun Jawa:** Setiap respons dirancang untuk memiliki *tone* yang khas, menggunakan sapaan dinamis (`Ndhuk`, `Le`, `Ngger`) dan kosakata Jawa yang natural.
* **Mood Tracking:** Agent mendengarkan dan mencatat curhatan atau keluhan pengguna, lalu mengklasifikasikan nada perasaan (`stres`, `sedih`, dll.) ke dalam memori.
* **Memory & Insight Engine:** Fitur paling kompleks. Agent mencatat riwayat percakapan (`events.json`), `moods.json`, dan data pengguna (`users.json`).
* **Rekap Mingguan Dinamis:** Berdasarkan data yang tersimpan, agent dapat secara otomatis membuat "Rekap Mingguan" yang personal untuk setiap pengguna, berisi analisis aktivitas, *mood* yang dominan, dan "Tindakan Cilik" (saran aktivitas) untuk minggu depan.

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
Struktur ini didasarkan pada *screenshot* aktual proyek Anda, memisahkan *data* (memori), *log*, *test*, dan *core logic* di *root*.
```
SI-DUKUN-JAWA-LLM-AGENT/
├─ data/                 # Memori agent (database JSON)
│  ├─ .gitkeep
│  ├─ events.json        # Log semua interaksi chat
│  ├─ moods.json         # Log mood/emosi pengguna
│  └─ users.json         # Data profil pengguna
├─ logs/                 # Log sistem mentah
│  ├─ app.example.log    # Contoh log
│  └─ app.log            # File log utama
├─ test/                 # Kumpulan test case
│  ├─ chatbot.test.js    # Test persona & perilaku
│  ├─ cli.integration.test.js # Test integrasi CLI
│  ├─ logger.test.js     # Test sistem logger
│  └─ store.test.js      # Test CRUD ke data/ (store)
├─ .env.example          # Contoh file environment
├─ .gitattributes
├─ .gitignore
├─ cli.js                # Entry point untuk mode Command Line
├─ index.js              # Entry point utama untuk Discord Bot
├─ insight.js            # Logika untuk generate "Rekap Mingguan"
├─ logger.js             # Utilitas logging
├─ package-lock.json
├─ package.json
├─ primbon.js            # (Logika/helper tambahan)
├─ README.md
├─ store.js              # Fungsi helper untuk baca/tulis ke data/
└─ test_gemini.js        # (File untuk testing koneksi Gemini)
```
---

## 🚀 Cara Menjalankan

### 1️⃣ Instalasi
```bash
git clone https://github.com/ranisedangbekerja/Si-Dukun-Jawa-LLM-Agent-Discord.git
cd si-dukun-jawa
npm install
```
### 2️⃣ Konfigurasi .env

Buat file .env dari contoh .env.example, lalu isi dengan:
```
GEMINI_API_KEY=your-gemini-api-key
BOT_TOKEN=your-discord-bot-token
BOT_NAME=Si Dukun Jawa
```

### 3️⃣ Menjalankan versi CLI
Untuk mencoba langsung di terminal:
```
npm run dev:cli
```
Contoh interaksi:
🪶 Dukun> Primbon Jumat Legi
Watakmu tenang, sabar, tapi jangan terlalu dipendam. 
Coba tersenyum hari ini — energi baikmu menular ke sekitar.

### 4️⃣ Menjalankan versi Discord
Untuk mengaktifkan bot di server Discord:
```
npm run dev:discord
```
Kirim pesan di server Discord:
primbon Selasa Kliwon
Si Dukun akan menjawab dengan tafsir weton dan pitutur khas Jawa 🌙

---

## 🧪 Testing

<table>
<tr>
<td valign="top" width="60%">
Kualitas dan keandalan agent diuji secara fungsional dan unit menggunakan <strong>Node Test Runner</strong>. 
<br><br>
Proyek ini memiliki <strong>Total 22 <i>test case</i></strong> yang mencakup:
<ul>
  <li><b>Chatbot Behavior</b> (10 Tes)</li>
  <li><b>CLI Integration</b> (4 Tes)</li>
  <li><b>Database & Logger</b> (5 Tes)</li>
  <li><b>Misc. Validation</b> (3 Tes)</li>
</ul>

Jalankan semua test:
```bash
npm test
```
</td> <td valign="top" width="40%" align="center"> <b>Hasil Test (100% Pass)</b>

<img width="310" height="370" alt="Hasil Test Runner 100% Pass" src="https://github.com/user-attachments/assets/52294144-88d1-4ca1-bec1-b5c6514aba07" /> </td> </tr> </table>

---

## 🗃️ Logging

Semua percakapan yang terjadi (baik di CLI maupun Discord) dicatat otomatis di folder `logs/app.log`. File log ini mencatat *timestamp*, *platform* (CLI/Discord), *user*, dan *pesan* untuk memudahkan *debugging*.

Contoh isi log:
```plaintext
[2025-10-25T14:45:51.340Z] [DISCORD] @nea: primbon 23 april 2005
[2025-10-25T14:45:55.352Z] [DISCORD] @Si Dukun Jawa: Ealah, Nduk. Lintangmu Banteng, watak keras tapi penyayang. Rejeki lumayan...
[2025-10-25T14:46:12.711Z] [CLI] User: aku lagi sedih mbah
[2025-10-25T14:46:15.914Z] [CLI] Si Dukun Jawa: Oalah, opo sing nggawe atimu susah, Ngger? Urip kuwi mung mampir ngombe...
```
---

## 💬 Contoh Output
> Hi Mbah Dukun, apa primbon untuk gadis kelahiran 23 April 2005?
```
Ndhuk Nea, cah ayu, pangestu kagem Ndhuk. Mari kita tilik primbon kelahiranmu.
Tafsiran: Lair ing tanggal 23 April 2005, Ndhuk Nea diparingi watak Sumur Sinaba. Artinya, kamu memiliki kemampuan menampung ilmu dan nasehat, serta berpotensi menjadi tempat bertanya bagi orang lain. Rejekimu insyaallah lumintu, asal tekun lan ngati-ati. Dina iki, coba rasakno energi alam, mungkin ono ilham sing teko.
Pitutur: "Alon-alon waton kelakon." Segala sesuatu butuh proses, Ndhuk. Jangan terburu-buru, nikmati setiap langkahmu.
Tindakan kecil: Hari ini, coba dengarkan gamelan atau tembang Jawa. Biarkan alunan musiknya menenangkan pikiranmu. Sopo ngerti, iso nambah inspirasi.
```

---
## Dokumentasi Chatbot

## 💬 Contoh Interaksi & Dokumentasi

<div align="center">

### Contoh 1: Tafsir Primbon & Weton
Pengguna menanyakan primbon berdasarkan tanggal lahir. Si Dukun merespons dengan interpretasi watak, rezeki, dan nasihat khas Jawa yang mendalam.

<img width="700" alt="Contoh Interaksi Primbon Weton" src="https://github.com/user-attachments/assets/c6041557-3e8e-4483-a02d-d077c04bcc9a" />

<br/>

### Contoh 2: Refleksi Emosi (Mood Reflection)
Pengguna curhat tentang masalah personal. Agent mendeteksi emosi (`sedih`), memberikan empati, dan "Tindakan Cilik" yang konkret untuk membantu.

<img width="700" alt="Contoh Interaksi Rekap Mingguan" src="https://github.com/user-attachments/assets/45eaadf8-6e37-4b39-90e8-43c0d269e506" />

<br/>

### Contoh 3: Rekap Mingguan (Memory & Insight)
Berdasarkan *history* percakapan, agent mampu membuat "Rekap Mingguan" yang personal, berisi analisis *mood*, aktivitas, dan pitutur yang paling sering muncul.

<img width="650" alt="Contoh Interaksi Mood Reflection" src="https://github.com/user-attachments/assets/d70ad2c7-88a9-4a5b-bfa4-c7f2fa67ec96" />

</div>

---

## 👥 Tim Developer
| Nama | NIM | Peran | Fokus |
|------|------|-------|--------|
| **Rani Nirmala P.** | 22/493982/TK/54153 | Core Agent & Integrasi LLM | Integrasi Gemini API, Discord Bot, dokumentasi |
| **Barbara Neanake A.** | 22/494495/TK/54238 | Logic, Data, & Testing Engineer | Logika, CLI system, logging, unit testing, database |

---

<div align="center">

## _"Sura dira jayaningrat lebur dening pangastuti."_
Kemarahan dan kekuatan akan luluh oleh kelembutan. 🌿

<div>

---
