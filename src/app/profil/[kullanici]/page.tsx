'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { kullaniciVerisiGetir, type KullaniciProfili } from '@/lib/kullaniciServisi'

// Rozet Listesi
const ROZETLER = [
  { id: 'ilk-kasif', ikon: '🌟', isim: 'İlk Kaşif', aciklama: 'İlk görevi tamamla', kilit: (xp: number) => xp >= 100 },
  { id: 'prompt-buyucu', ikon: '🎯', isim: 'Prompt Büyücüsü', aciklama: '3 görev tamamla', kilit: (xp: number) => xp >= 350 },
  { id: 'few-shot', ikon: '🧠', isim: 'Few-Shot Uzmanı', aciklama: '5 görev tamamla', kilit: (xp: number) => xp >= 625 },
  { id: 'gercek-det', ikon: '🛡️', isim: 'Gerçek Dedektifi', aciklama: 'Hallucination görevini geç', kilit: (xp: number) => xp >= 750 },
  { id: 'seri-3', ikon: '🔥', isim: '3 Günlük Seri', aciklama: '3 gün üst üste giriş yap', kilit: (xp: number) => xp >= 1 },
  { id: 'kulup', ikon: '👑', isim: 'Kulüp Üyesi', aciklama: 'Kulübe katıl', kilit: (_: number) => false },
]

export default function ProfilSayfasi() {
  const params = useParams()
  const kullaniciId = (params?.kullanici as string) || 'demo'
  const [profil, setProfil] = useState<KullaniciProfili | null>(null)
  const [yukleniyor, setYukleniyor] = useState(true)

  useEffect(() => {
    async function verileriGetir() {
      setYukleniyor(true)
      const veri = await kullaniciVerisiGetir(kullaniciId)
      if (veri) {
        setProfil(veri)
      } else {
        // Mock / Fallback Profil (Henüz DB'de veri yoksa gösterilecek harika görünüm)
        setProfil({
          uid: kullaniciId,
          kullaniciAdi: kullaniciId,
          displayName: kullaniciId.toUpperCase(),
          email: `${kullaniciId}@aidex.com`,
          xp: 450,
          seviye: 2,
          seriGunu: 4,
          tamamlananGorevler: ['c-g1-1', 'c-g1-2', 'c-g1-3'],
          olusturulmaTarihi: new Date().toISOString(),
        })
      }
      setYukleniyor(false)
    }
    verileriGetir()
  }, [kullaniciId])

  if (yukleniyor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-arka text-yazi">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <span className="text-4xl">👾</span>
          <span className="pixel-xs text-cyan">PROFİL YÜKLENİYOR...</span>
        </div>
      </div>
    )
  }

  if (!profil) return null

  const kazanilanRozetler = ROZETLER.filter((r) => r.kilit(profil.xp))

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-4 py-12">
      
      {/* ── 1. ÜST PROFİL HEADER ────────────────────────────────────────── */}
      <div className="kart p-8 mb-8 relative overflow-hidden shadow-glow-cyan">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left z-10 relative">
          
          {/* Avatar */}
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl flex-shrink-0 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1e293b, #0f172a)',
              border: '3px solid #06B6D4',
              boxShadow: '0 0 25px rgba(6,182,212,0.4)',
            }}
          >
            {profil.photoURL ? (
              <img src={profil.photoURL} alt={profil.displayName} className="w-full h-full object-cover" />
            ) : (
              '🤖'
            )}
          </div>

          {/* İsim & Unvan */}
          <div className="flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap mb-2">
              <h1 className="text-2xl font-extrabold text-yazi">{profil.displayName}</h1>
              <span
                className="pixel-xs px-2.5 py-1 rounded"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)', color: '#fff' }}
              >
                SEVİYE {profil.seviye}
              </span>
            </div>

            <p className="text-xs text-yazi-soluk mb-4 font-kod">@{profil.kullaniciAdi} · AI Kaşifi</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-bold">
              <div className="px-3 py-1.5 rounded bg-yesil-dim border border-yesil/40 text-yesil">
                ⚡ {profil.xp} XP Puanı
              </div>
              <div className="px-3 py-1.5 rounded bg-altin-dim border border-altin/40 text-altin">
                🔥 {profil.seriGunu} Günlük Seri
              </div>
              <div className="px-3 py-1.5 rounded bg-cyan-dim border border-cyan/40 text-cyan">
                🎯 {profil.tamamlananGorevler.length} Görev Tamamlandı
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── 2. ROZET VİTRİNİ ────────────────────────────────────────────── */}
      <div className="kart p-6 mb-8">
        <h2 className="pixel-xs text-altin mb-4">KAZANILAN BAŞARI ROZETLERİ</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {ROZETLER.map((rozet) => {
            const kazanildi = rozet.kilit(profil.xp)
            return (
              <div
                key={rozet.id}
                className="flex flex-col items-center p-3 rounded-lg border text-center transition-all"
                style={{
                  background: kazanildi ? 'rgba(245,158,11,0.08)' : 'rgba(30,41,59,0.3)',
                  borderColor: kazanildi ? 'rgba(245,158,11,0.4)' : '#2d3748',
                  opacity: kazanildi ? 1 : 0.4,
                }}
              >
                <div className="text-3xl mb-2">{rozet.ikon}</div>
                <div className="text-xs font-bold text-yazi mb-1">{rozet.isim}</div>
                <div className="text-[9px] text-yazi-soluk">{rozet.aciklama}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 3. TAMAMLANAN MACERALAR ────────────────────────────────────── */}
      <div className="kart p-6">
        <h2 className="pixel-xs text-yesil mb-4">TAMAMLANAN GÖREV GEÇMİŞİ</h2>
        <div className="flex flex-col gap-3">
          {profil.tamamlananGorevler.length === 0 ? (
            <div className="text-xs text-yazi-soluk py-4 text-center">
              Henüz tamamlanan bir görev yok. Macera bekliyor!
            </div>
          ) : (
            profil.tamamlananGorevler.map((gid) => (
              <div
                key={gid}
                className="flex items-center justify-between p-3.5 rounded-lg border border-sinir bg-input"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">✅</span>
                  <div>
                    <div className="text-xs font-bold text-yazi font-kod">Görev #{gid}</div>
                    <div className="text-[10px] text-yazi-soluk">Modül Başarıyla Geçildi</div>
                  </div>
                </div>
                <span className="pixel-xs text-yesil">+100 XP</span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  )
}
