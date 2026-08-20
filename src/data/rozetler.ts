export interface Rozet {
  id: string
  isim: string
  aciklama: string
  ikon: string
  kategori: 'xp' | 'gorev' | 'streak' | 'ozel'
  kriter: (veri: { xp: number; tamamlananSayisi: number; seriGunu: number }) => boolean
}

export const ROZET_LISTESI: Rozet[] = [
  // ── Görev Rozetleri ──────────────────────────────────────────────────────
  {
    id: 'ilk-kasif',
    isim: 'İlk Kaşif',
    aciklama: 'AIVentura dünyasındaki ilk görevini tamamla.',
    ikon: '🌟',
    kategori: 'gorev',
    kriter: ({ tamamlananSayisi }) => tamamlananSayisi >= 1,
  },
  {
    id: 'veri-isletmeni',
    isim: 'Veri İşletmeni',
    aciklama: '3 görevi başarıyla çöz.',
    ikon: '📊',
    kategori: 'gorev',
    kriter: ({ tamamlananSayisi }) => tamamlananSayisi >= 3,
  },
  {
    id: 'prompt-buyucu',
    isim: 'Prompt Büyücüsü',
    aciklama: '5 görevi başarıyla çöz.',
    ikon: '🎯',
    kategori: 'gorev',
    kriter: ({ tamamlananSayisi }) => tamamlananSayisi >= 5,
  },
  {
    id: 'few-shot-uzmani',
    isim: 'Few-Shot Uzmanı',
    aciklama: '8 görevi tamamlayarak yapay zekaya örnek göstermeyi öğren.',
    ikon: '🧠',
    kategori: 'gorev',
    kriter: ({ tamamlananSayisi }) => tamamlananSayisi >= 8,
  },
  {
    id: 'orta-kahraman',
    isim: 'Orta Kahraman',
    aciklama: '12 görevi tamamlayan güçlü bir AI mühendisi.',
    ikon: '⚔️',
    kategori: 'gorev',
    kriter: ({ tamamlananSayisi }) => tamamlananSayisi >= 12,
  },
  {
    id: 'bolum-bitis',
    isim: 'Bölüm Bitirici',
    aciklama: '16 görevi tamamlayan efsane mühendis.',
    ikon: '🏆',
    kategori: 'gorev',
    kriter: ({ tamamlananSayisi }) => tamamlananSayisi >= 16,
  },
  {
    id: 'usta-mimar',
    isim: 'Usta Mimar',
    aciklama: 'Tüm 24 görevi tamamla ve GLITCH\'i yen!',
    ikon: '🤖',
    kategori: 'gorev',
    kriter: ({ tamamlananSayisi }) => tamamlananSayisi >= 24,
  },

  // ── XP Rozetleri ──────────────────────────────────────────────────────────
  {
    id: 'xp-girisimci',
    isim: 'XP Girişimci',
    aciklama: '300 XP barajını aş.',
    ikon: '⚡',
    kategori: 'xp',
    kriter: ({ xp }) => xp >= 300,
  },
  {
    id: 'xp-ustasi',
    isim: 'XP Ustası',
    aciklama: '1000 XP barajını aş.',
    ikon: '💫',
    kategori: 'xp',
    kriter: ({ xp }) => xp >= 1000,
  },
  {
    id: 'bilge-muhendis',
    isim: 'Bilge Mühendis',
    aciklama: '3000 XP\'e ulaşarak ustalık seviyesine adım at.',
    ikon: '👑',
    kategori: 'xp',
    kriter: ({ xp }) => xp >= 3000,
  },
  {
    id: 'xp-efsane',
    isim: 'XP Efsanesi',
    aciklama: '6000 XP barajına ulaş.',
    ikon: '🔥',
    kategori: 'xp',
    kriter: ({ xp }) => xp >= 6000,
  },
  {
    id: 'nexus-kurtarici',
    isim: 'NEXUS Kurtarıcısı',
    aciklama: '10000 XP — GLITCH\'e karşı galip gelen kahraman!',
    ikon: '🛡️',
    kategori: 'xp',
    kriter: ({ xp }) => xp >= 10000,
  },

  // ── Streak Rozetleri ──────────────────────────────────────────────────────
  {
    id: 'atesli-kasif',
    isim: 'Ateşli Kaşif',
    aciklama: '3 gün üst üste kesintisiz giriş yap.',
    ikon: '🔥',
    kategori: 'streak',
    kriter: ({ seriGunu }) => seriGunu >= 3,
  },
  {
    id: 'haftalik-savasci',
    isim: 'Haftalık Savaşçı',
    aciklama: '7 gün üst üste çalış.',
    ikon: '⚡',
    kategori: 'streak',
    kriter: ({ seriGunu }) => seriGunu >= 7,
  },
  {
    id: 'ay-kahraman',
    isim: 'Ay Kahramanı',
    aciklama: '30 gün kesintisiz AI eğitimi.',
    ikon: '🌙',
    kategori: 'streak',
    kriter: ({ seriGunu }) => seriGunu >= 30,
  },
]
