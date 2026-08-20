import type { Kurs } from '@/types'

// ══════════════════════════════════════════════════════════════════════════
// AIVentura MÜFREDAT VERİTABANI (SÜRÜM 3.0 - 3D VOXEL AĞIRLIKLI)
// 8-12 Yaş Çocuklar İçin 8 Bölümlük (Chapter) Yapay Zeka Oyunu
// ══════════════════════════════════════════════════════════════════════════

export const KURSLAR: Record<string, Kurs> = {
  // ── 1. ÇOCUKLAR İZİ (NEXUS KALESİ) ────────────────────────────────────────
  cocuklar: {
    id: 'cocuklar',
    baslik: '🏰 NEXUS Kalesi — 3D Yapay Zeka Oyunu',
    aciklama: 'Kuleyi inşa et, nöronları bağla ve GLITCH virüslerine karşı yapay zekanı eğit!',
    dunyaBaslik: 'NEXUS Savunma Ağı',
    bolumler: [
      {
        id: 'c-b1',
        baslik: 'Bölüm 1: Uyanış (Veri ve Öğrenme)',
        aciklama: 'Kuleye sadece düşmanları ve dostları öğret. Eksik veri verirsen neler olabileceğini keşfet!',
        sira: 1,
        gorevler: [
          {
            id: 'c-g1-1',
            baslik: 'Görev 1.1 — Düşmanı Tanı',
            ozet: 'Kırmızı blokları kullanarak gözetimli öğrenmeyi başlat.',
            ikon: '🔴',
            xpOdul: 100,
            rozetOdul: { id: 'veri-isletmeni', isim: 'Veri İşletmeni', ikon: '📊', aciklama: 'İlk veriyi sisteme girdin.' }
          },
          {
            id: 'c-g1-2',
            baslik: 'Görev 1.2 — Dostları Koru (Ön Yargı)',
            ozet: 'Mavi gemileri eklemeyi unutursan yapay zeka hata yapar (Bias).',
            ikon: '🔵',
            xpOdul: 120
          },
          {
            id: 'c-g1-3',
            baslik: 'Görev 1.3 — Karmaşık Dalga',
            ozet: 'Çoklu veri akışında kuleyi hayatta tut.',
            ikon: '🌊',
            xpOdul: 150
          }
        ]
      },
      {
        id: 'c-b2',
        baslik: 'Bölüm 2: Kalıp Avcısı (Nöronlar)',
        aciklama: 'Düşmanlar kılık değiştiriyor! Kulenin sadece renge değil, şekil ve boyuta da bakmasını sağla.',
        sira: 2,
        gorevler: [
          {
            id: 'c-g2-1',
            baslik: 'Görev 2.1 — Boyut Filtresi',
            ozet: 'Büyük boyutlu dost görünümlü düşmanları ayır.',
            ikon: '📐',
            xpOdul: 200
          },
          {
            id: 'c-g2-2',
            baslik: 'Görev 2.2 — Şekil Filtresi',
            ozet: 'Farklı geometrik şekilleri tanıyan nöron ağları kur.',
            ikon: '💠',
            xpOdul: 200
          },
          {
            id: 'c-g2-3',
            baslik: 'Görev 2.3 — Mini Boss: Kamuflaj',
            ozet: 'Hem boyut hem şekil değiştiren düşmanlara karşı katmanlı nöron ağı kur.',
            ikon: '🧠',
            xpOdul: 250
          }
        ]
      },
      {
        id: 'c-b3',
        baslik: 'Bölüm 3: Kör Nokta (Bilgisayarlı Görü)',
        aciklama: 'Sisli havada kuleye sensörler takarak etrafı piksellerle görmesini sağla.',
        sira: 3,
        gorevler: [
          { id: 'c-g3-1', baslik: 'Görev 3.1 — Görüş Izgarası', ozet: 'Pikseller nasıl çalışır?', ikon: '👁️', xpOdul: 300, isPremium: false },
          { id: 'c-g3-2', baslik: 'Görev 3.2 — Lidar Sensörü', ozet: 'Derinlik algısı.', ikon: '📡', xpOdul: 300, isPremium: false },
          { id: 'c-g3-3', baslik: 'Görev 3.3 — Zifiri Karanlık', ozet: 'Sadece sensörlerle savun.', ikon: '🌑', xpOdul: 400, isPremium: false }
        ]
      },
      {
        id: 'c-b4',
        baslik: 'Bölüm 4: Çatallanan Yollar (Karar Ağaçları)',
        aciklama: 'Birden fazla kuleyi if/else mantığı ile yönet.',
        sira: 4,
        gorevler: [
          { id: 'c-g4-1', baslik: 'Görev 4.1 — Eğer/Değilse Kapısı', ozet: 'Uçanları ayır.', ikon: '🔀', xpOdul: 400, isPremium: false },
          { id: 'c-g4-2', baslik: 'Görev 4.2 — Çoklu Savunma', ozet: 'İki kule, iki karar.', ikon: '⚔️', xpOdul: 400, isPremium: false },
          { id: 'c-g4-3', baslik: 'Görev 4.3 — Karar Ormanı', ozet: 'Karmaşık mantık zincirleri kur.', ikon: '🌳', xpOdul: 500, isPremium: false }
        ]
      },
      {
        id: 'c-b5',
        baslik: 'Bölüm 5: Virüs İstilası (Veri Zehirlenmesi)',
        aciklama: 'Veri setine karışan sahte düşman bloklarını tespit et ve temizle.',
        sira: 5,
        gorevler: [
          { id: 'c-g5-1', baslik: 'Görev 5.1 — Kötü Örnekler', ozet: 'Sistemi bozan verileri bul.', ikon: '🦠', xpOdul: 500, isPremium: false },
          { id: 'c-g5-2', baslik: 'Görev 5.2 — Çöp Kutusu', ozet: 'Veri temizleme (Data Cleaning).', ikon: '🗑️', xpOdul: 500, isPremium: false },
          { id: 'c-g5-3', baslik: 'Görev 5.3 — Sürü Psikolojisi', ozet: 'Kirli veriler arasında hayatta kal.', ikon: '🛡️', xpOdul: 600, isPremium: false }
        ]
      },
      {
        id: 'c-b6',
        baslik: 'Bölüm 6: Eğitmenin Yolu (Pekiştirmeli Öğrenme)',
        aciklama: 'Kuleye veri bloğu vermeden, rastgele denemelerine ödül veya ceza vererek öğret.',
        sira: 6,
        gorevler: [
          { id: 'c-g6-1', baslik: 'Görev 6.1 — Ödül Mekanizması', ozet: 'Doğru vuruşları onayla.', ikon: '👍', xpOdul: 600, isPremium: false },
          { id: 'c-g6-2', baslik: 'Görev 6.2 — Ceza Mekanizması', ozet: 'Yanlış hedefleri uyar.', ikon: '👎', xpOdul: 600, isPremium: false },
          { id: 'c-g6-3', baslik: 'Görev 6.3 — Deneme Yanılma', ozet: 'Sıfırdan mükemmel kuleye.', ikon: '🎯', xpOdul: 700, isPremium: false }
        ]
      },
      {
        id: 'c-b7',
        baslik: 'Bölüm 7: Geleceği Görmek (Tahmin)',
        aciklama: 'Düşman hareketlerini analiz edip nerede olacaklarını tahmin et.',
        sira: 7,
        gorevler: [
          { id: 'c-g7-1', baslik: 'Görev 7.1 — Yörünge Analizi', ozet: 'Geçmişe bakarak geleceği gör.', ikon: '📈', xpOdul: 700, isPremium: false },
          { id: 'c-g7-2', baslik: 'Görev 7.2 — Hız Kesiciler', ozet: 'Hızlanan düşmanlara nişan al.', ikon: '⚡', xpOdul: 700, isPremium: false },
          { id: 'c-g7-3', baslik: 'Görev 7.3 — Tahmin Nöronu', ozet: 'Gideceği yere ateş et.', ikon: '🎯', xpOdul: 800, isPremium: false }
        ]
      },
      {
        id: 'c-b8',
        baslik: 'Bölüm 8: Büyük Final (AI Mimarı)',
        aciklama: 'Öğrendiğin tüm AI tekniklerini kullanarak devasa GLITCH ana gemisini yok et!',
        sira: 8,
        gorevler: [
          { id: 'c-g8-1', baslik: 'Görev 8.1 — Sensör Ağı', ozet: 'Tüm sistemleri entegre et.', ikon: '🌐', xpOdul: 1000, isPremium: false },
          { id: 'c-g8-2', baslik: 'Görev 8.2 — Veri Savunması', ozet: 'Son zehirli verileri temizle.', ikon: '🛡️', xpOdul: 1000, isPremium: false },
          {
            id: 'c-g8-boss',
            baslik: 'GLITCH ANA GEMİSİ — Büyük Final',
            ozet: 'Tüm öğrendiklerini kullanarak GLITCH çekirdeğini imha et!',
            ikon: '💥',
            xpOdul: 2000,
            isPremium: false
          }
        ]
      }
    ]
  },

  // ── 2. PROFESYONELLER İZİ (NEXUSCORP ŞEHRİ) - YAKINDA ─────────────
  profesyoneller: {
    id: 'profesyoneller',
    baslik: '💼 NexusCorp Şehri — Yetişkinler İçin Profesyonel AI',
    aciklama: 'Yapay zekayı iş hayatınıza entegre edin, verimliliğinizi artırın.',
    dunyaBaslik: 'NexusCorp Merkezi',
    bolumler: []
  }
}
