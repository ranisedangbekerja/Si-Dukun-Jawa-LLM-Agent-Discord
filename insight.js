import { EmbedBuilder } from 'discord.js';

function fmtDate(d) {
  return new Date(d).toLocaleDateString('id-ID', { day:'2-digit', month:'short' });
}
function dayKey(ts) { return new Date(ts).toISOString().slice(0,10); }
function safeJSON(s) { try { return JSON.parse(s||'{}'); } catch { return null; } }

export function buildWeeklyInsight({ events, moods }, displayName) {
  const total = events.length;

  // hari aktif
  const daysMap = new Map();
  events.forEach(e => daysMap.set(dayKey(e.ts), (daysMap.get(dayKey(e.ts))||0)+1));
  const activeDays = daysMap.size;

  // jam aktif
  const hours = { pagi:0, siang:0, malam:0 };
  events.forEach(e => {
    const h = new Date(e.ts).getHours();
    if (h < 12) hours.pagi++; else if (h < 18) hours.siang++; else hours.malam++;
  });
  const peak = Object.entries(hours).sort((a,b)=>b[1]-a[1])[0]?.[0] || '-';

  // primbon favorit (berdasarkan entitas hari/pasaran)
  const primCount = {};
  events.filter(e => e.type === 'primbon').forEach(e => {
    const ent = safeJSON(e.entities);
    const key = [ent?.hari, ent?.pasaran].filter(Boolean).join(' ') || 'primbon';
    primCount[key] = (primCount[key]||0) + 1;
  });
  const primTop = Object.entries(primCount)
    .sort((a,b)=>b[1]-a[1]).slice(0,3)
    .map(([k,v])=> `${k} (${v}×)`).join(', ') || '-';

  // mood ringkas
  const moodCount = { senang:0, stres:0, lelah:0, semangat:0, bingung:0 };
  moods.forEach(m => { if (moodCount[m.mood] != null) moodCount[m.mood]++; });
  const moodStr = Object.entries(moodCount).filter(([,v])=>v>0).map(([k,v])=>`${k}(${v})`).join(' | ') || '—';

  // pitutur keyword sederhana
  const kw = ['urip','alon','sabar','syukur','ngemong','pangestu'];
  const kwMap = Object.fromEntries(kw.map(k=>[k,0]));
  events.forEach(e=>{
    (e.answer||'').toLowerCase().split(/\W+/).forEach(w=>{
      if (kwMap[w]!=null) kwMap[w] += 1;
    });
  });
  const topPitutur = Object.entries(kwMap)
    .sort((a,b)=>b[1]-a[1]).slice(0,3).filter(([,v])=>v>0)
    .map(([k,v])=>`• ${k} (${v}×)`).join('\n') || '• (belum konsisten)';

  return {
    total, activeDays, peak, primTop, moodStr, topPitutur,
    note: `Ngger ${displayName}, iki wangsit ringkes saking dukunmu. Pangestu.`
  };
}

export function renderInsightEmbed(i, startISO, endISO) {
  return new EmbedBuilder()
    .setTitle(`Rekap Mingguan Si Dukun Jawa (${fmtDate(startISO)}–${fmtDate(endISO)})`)
    .setColor(0x8b5cf6)
    .setDescription(i.note)
    .addFields(
      { name:'Aktivitas', value:`${i.total} pesan • ${i.activeDays} hari aktif • Paling aktif: **${i.peak}**` },
      { name:'Primbon Favorit', value:i.primTop || '-', inline:false },
      { name:'Nada Perasaan', value:i.moodStr || '-', inline:false },
      { name:'Pitutur Minggu Iki', value:i.topPitutur || '-', inline:false },
      { name:'Tindakan Cilik Minggu Ngarep', value:'- Tulis 3 syukur saben wengi\n- Ngombe banyu anget esuk\n- Sedekah panganan manis cilik', inline:false }
    )
    .setFooter({ text:'Dibuat otomatis • Si Dukun Jawa' });
}
