export const neptuHari = { Minggu:5, Senin:4, Selasa:3, Rabu:7, Kamis:8, Jumat:6, Sabtu:9 };
export const neptuPasaran = { Kliwon:8, Legi:5, Pahing:9, Pon:7, Wage:4 };

const cap = (s='') => s.toLowerCase().replace(/^\w/, c => c.toUpperCase());

export function hitungNeptu(hari, pasaran) {
  return (neptuHari[cap(hari)] || 0) + (neptuPasaran[cap(pasaran)] || 0);
}

export function ringkasWeton(hari, pasaran) {
  const n = hitungNeptu(hari, pasaran);
  if (!n) return 'Data weton kurang tepat.';
  if (n <= 10) return 'Watak sabar, perlu ketekunan dan ritme kecil yang konsisten.';
  if (n <= 15) return 'Watak adaptif & peka; fokus perlu dijaga agar tidak buyar.';
  return 'Watak energik & visioner; tantangan utamamu: sabar & rapi eksekusi.';
}
