'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { KURSLAR } from '@/data/mufredat'
import type { Gorev, BossBattle } from '@/types'
import KorumaliRota from '@/components/auth/KorumaliRota'

// Sadece istemci tarafında render et — hydration hatası önlenir
function useMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted
}

// ── Yardımcılar ────────────────────────────────────────────────────────────
function isGorev(g: Gorev | BossBattle): g is Gorev {
  return 'hikaye' in g
}

const SEVIYE_ESIKLERI = [0, 300, 700, 1200, 2000, 3000, 4500, 6000, 8000, 10000]

const TÜM_GÖREVLER = Object.values(KURSLAR).flatMap((k) =>
  k.bolumler.flatMap((b) => b.gorevler.filter(isGorev))
)

// Rozet tanımları
const ROZETLER = [
  { id: 'ilk-kasif',     ikon: '🌟', isim: 'İlk Kaşif',       aciklama: 'İlk görevi tamamla',      kilit: (xp: number) => xp >= 100 },
  { id: 'prompt-buyucu', ikon: '🎯', isim: 'Prompt Büyücüsü',  aciklama: '3 görev tamamla',          kilit: (xp: number) => xp >= 350 },
  { id: 'few-shot',      ikon: '🧠', isim: 'Few-Shot Uzmanı',   aciklama: '5 görev tamamla',          kilit: (xp: number) => xp >= 625 },
  { id: 'gercek-det',    ikon: '🛡️', isim: 'Gerçek Dedektifi', aciklama: 'Hallucination görevini geç', kilit: (xp: number) => xp >= 750 },
  { id: 'seri-3',        ikon: '🔥', isim: '3 Günlük Seri',     aciklama: '3 gün üst üste giriş yap', kilit: (xp: number) => xp >= 1 },
  { id: 'kulup',         ikon: '👑', isim: 'Kulüp Üyesi',       aciklama: 'Kulübe katıl',              kilit: (_: number) => false },
]

// ══════════════════════════════════════════════════════════════════════════
// DASHBOARD SAYFASI
// ══════════════════════════════════════════════════════════════════════════
export default function DashboardSayfasi() {
  const mounted = useMounted()
  const { user, userData } = useAuth()
  const [tamamlananIds] = useState<string[]>([]) // Firebase'den gelecek

  const oyunDurumu = {
    xp: userData?.xp ?? 0,
    seviye: userData?.seviye ?? 1,
    sonrakiSeviyeXp: userData?.sonrakiSeviyeXp ?? 300,
    seriGunu: userData?.seriGunu ?? 0,
  }

  const xpYuzde = Math.min(100, (oyunDurumu.xp / oyunDurumu.sonrakiSeviyeXp) * 100)
  const tamamlananSayisi = tamamlananIds.length
  const toplamGorev = TÜM_GÖREVLER.length
  const kazanilanRozetler = ROZETLER.filter((r) => r.kilit(oyunDurumu.xp))

  // Kullanıcı adı: Firebase yoksa varsayılan
  const kullaniciAdi = userData?.isim || user?.displayName || user?.email?.split('@')[0] || 'Kaşif'
  const avatarUrl = user?.photoURL || null

  // İstemci mount edilmeden render etme
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="text-4xl animate-pulse">👾</div>
          <div className="pixel-xs text-cyan">YÜKLENİYOR...</div>
        </div>
      </div>
    )
  }

  return (
    <KorumaliRota>
      <div className="min-h-screen max-w-5xl mx-auto px-4 py-10">

      {/* ── Profil Kartı ───────────────────────────────────────────────── */}
      <div
        className="kart p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-6"
        style={{ borderColor: '#06B6D4', boxShadow: '0 0 30px rgba(6,182,212,0.1)' }}
      >
        {/* Avatar */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
            border: '3px solid #06B6D4',
            boxShadow: '0 0 20px rgba(6,182,212,0.3)',
          }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            '👾'
          )}
        </div>

        {/* Bilgiler */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h1 className="text-xl font-extrabold text-yazi">{kullaniciAdi}</h1>
            <span
              className="pixel-xs px-2 py-1 rounded"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
                color: '#fff',
              }}
            >
              SVY {oyunDurumu.seviye}
            </span>
            {oyunDurumu.seriGunu > 0 && (
              <span
                className="text-xs font-bold px-2 py-1 rounded"
                style={{ background: 'rgba(249,115,22,0.12)', color: '#F97316', border: '1px solid rgba(249,115,22,0.3)' }}
              >
                🔥 {oyunDurumu.seriGunu} günlük seri
              </span>
            )}
          </div>

          {/* XP Bar */}
          <div className="flex items-center gap-3 mt-3">
            <div className="xp-bar flex-1 max-w-xs h-3">
              <div
                className="xp-dolu h-full"
                style={{ width: `${xpYuzde}%`, boxShadow: '0 0 10px rgba(16,185,129,0.7)' }}
              />
            </div>
            <span className="text-xs text-yazi-iki">
              <span className="text-yesil font-bold">{oyunDurumu.xp}</span>
              {' / '}
              <span>{oyunDurumu.sonrakiSeviyeXp} XP</span>
            </span>
          </div>

          <p className="text-xs text-yazi-soluk mt-2">
            Sonraki seviyeye {oyunDurumu.sonrakiSeviyeXp - oyunDurumu.xp} XP kaldı
          </p>
        </div>

        {/* Derslere git */}
        <a href="/dersler" className="btn-yesil text-xs flex-shrink-0">
          🗺️ Göreve Devam
        </a>
      </div>

      {/* ── İstatistik Kartları ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <IstatKart ikon="⭐" deger={`${oyunDurumu.xp}`} etiket="Toplam XP" renk="#F59E0B" />
        <IstatKart ikon="✅" deger={`${tamamlananSayisi}`} etiket="Tamamlanan" renk="#10B981" />
        <IstatKart ikon="🎯" deger={`${toplamGorev}`} etiket="Toplam Görev" renk="#06B6D4" />
        <IstatKart ikon="🏅" deger={`${kazanilanRozetler.length}`} etiket="Kazanılan Rozet" renk="#8B5CF6" />
      </div>

      {/* ── Profesyoneller İzi ───────────────────────────────────────────── */}
      <div className="mb-6 p-6 rounded-2xl overflow-hidden relative group cursor-pointer transition-all hover:scale-[1.01]"
        onClick={() => window.location.href = '/profesyoneller/video-ai'}
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.08))',
          border: '1.5px solid rgba(99,102,241,0.35)',
          boxShadow: '0 0 24px rgba(99,102,241,0.1)',
        }}>
        <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl pointer-events-none group-hover:scale-110 transition-transform duration-700">
          🎨
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}>
              💼 YETİŞKİNLER / PROFESYONELLER İÇİN
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}>
              🟢 YENİ
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white mb-2">NexusCorp: Midjourney AI Görsel Simülasyonu</h2>
          <p className="text-slate-400 text-sm max-w-2xl mb-4">
            Gerçek iş hayatında kullanılan yapay zeka görsel teknolojilerini öğren. Üst düzey parametreleri kullanarak halüsinasyonları temizle, karakter tutarlılığını sağla ve usta bir Prompt Engineer ol.
          </p>
          <div className="flex items-center gap-4">
            <button className="bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-bold px-6 py-2 rounded-xl transition-colors">
              Görsel Simülasyonuna Başla →
            </button>
            <div className="flex gap-2">
              <span className="text-[10px] px-2 py-1 rounded font-bold" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
                950 XP ÖDÜL
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Video Üretim Simülasyonu ───────────────────────────────────────────── */}
      <div className="mb-8 p-6 rounded-2xl overflow-hidden relative group cursor-pointer transition-all hover:scale-[1.01]"
        style={{
          background: 'linear-gradient(135deg, rgba(236,72,153,0.1), rgba(168,85,247,0.08))',
          border: '1.5px solid rgba(236,72,153,0.35)',
          boxShadow: '0 0 24px rgba(236,72,153,0.1)',
        }}>
        <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl pointer-events-none group-hover:scale-110 transition-transform duration-700">
          🎬
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(236,72,153,0.2)', color: '#f472b6', border: '1px solid rgba(236,72,153,0.3)' }}>
              🎥 VİDEO AI MASTERCLASS
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}>
              YAKINDA EKLENECEK
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white mb-2">NexusCorp: Sora & Runway Video Üretim Simülasyonu</h2>
          <p className="text-slate-400 text-sm max-w-2xl mb-4">
            Metinden video üretmeyi (Text-to-Video) öğren. Kamera hareketleri, sahne tutarlılığı ve akıcı animasyonlar oluşturmak için gerekli olan doğru prompt mühendisliği tekniklerini uygulamalı keşfet.
          </p>
          <div className="flex items-center gap-4">
            <button className="bg-pink-600 hover:bg-pink-500 text-white text-sm font-bold px-6 py-2 rounded-xl transition-colors opacity-80 cursor-not-allowed">
              Çok Yakında
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Sol: İlerleme & Son Aktivite ─────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Bölüm İlerleme Barları */}
          <div className="kart p-6">
            <h2 className="text-sm font-bold text-yazi mb-5 flex items-center gap-2">
              <span className="pixel-xs text-cyan">📊</span> Bölüm İlerlemesi
            </h2>
            <div className="flex flex-col gap-4">
              {Object.values(KURSLAR).flatMap((k) =>
                k.bolumler.map((b) => {
                  const bolumGorevler = b.gorevler.filter(isGorev)
                  const tamam = bolumGorevler.filter((g) => tamamlananIds.includes(g.id)).length
                  const yuzde = bolumGorevler.length > 0 ? (tamam / bolumGorevler.length) * 100 : 0
                  return (
                    <div key={b.id}>
                      <div className="flex items-center justify-between mb-1.5 text-xs">
                        <span className="text-yazi">{b.baslik}</span>
                        <span className="text-yazi-soluk">{tamam}/{bolumGorevler.length}</span>
                      </div>
                      <div className="xp-bar h-2.5">
                        <div
                          className="xp-dolu h-full"
                          style={{ width: `${yuzde}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Mevcut Görevler */}
          <div className="kart p-6">
            <h2 className="text-sm font-bold text-yazi mb-5 flex items-center gap-2">
              <span className="pixel-xs text-yesil">🎮</span> Devam Et
            </h2>
            <div className="flex flex-col gap-3">
              {TÜM_GÖREVLER.slice(0, 4).map((g) => {
                const tamam = tamamlananIds.includes(g.id)
                return (
                  <a
                    key={g.id}
                    href={`/ders/${g.id}`}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all group
                      ${tamam
                        ? 'border-yesil/30 bg-yesil-dim opacity-60 cursor-default pointer-events-none'
                        : 'border-sinir hover:border-cyan hover:-translate-y-0.5'
                      }`}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                      style={{
                        background: tamam ? 'rgba(16,185,129,0.15)' : 'rgba(30,41,59,0.8)',
                        border: `1.5px solid ${tamam ? '#10B981' : '#2d3748'}`,
                      }}
                    >
                      {tamam ? '✅' : g.ikon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-yazi truncate">{g.baslik}</div>
                      <div className="text-xs text-yazi-soluk truncate">{g.ozet}</div>
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0"
                      style={{
                        color: tamam ? '#10B981' : '#F59E0B',
                        background: tamam ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                        border: `1px solid ${tamam ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                      }}
                    >
                      {tamam ? 'TAMAM' : `+${g.xpOdul} XP`}
                    </span>
                  </a>
                )
              })}
              <a
                href="/dersler"
                className="text-center text-xs text-cyan hover:underline py-2"
              >
                Tüm görevleri gör →
              </a>
            </div>
          </div>

        </div>

        {/* ── Sağ: Rozet Koleksiyonu ────────────────────────────────────── */}
        <div className="flex flex-col gap-6">
          <div className="kart p-6">
            <h2 className="text-sm font-bold text-yazi mb-5 flex items-center gap-2">
              <span className="pixel-xs text-altin">🏅</span> Rozet Koleksiyonu
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {ROZETLER.map((rozet) => {
                const kazanildi = rozet.kilit(oyunDurumu.xp)
                return (
                  <div
                    key={rozet.id}
                    className="flex flex-col items-center gap-1.5 group cursor-default"
                    title={`${rozet.isim}: ${rozet.aciklama}`}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all"
                      style={{
                        background: kazanildi
                          ? 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(249,115,22,0.15))'
                          : 'rgba(30,41,59,0.5)',
                        border: `2px solid ${kazanildi ? 'rgba(245,158,11,0.5)' : '#2d3748'}`,
                        boxShadow: kazanildi ? '0 0 16px rgba(245,158,11,0.3)' : 'none',
                        filter: kazanildi ? 'none' : 'grayscale(1) opacity(0.35)',
                      }}
                    >
                      {rozet.ikon}
                    </div>
                    <span
                      className="text-[9px] text-center leading-tight"
                      style={{ color: kazanildi ? '#F59E0B' : '#4b5563' }}
                    >
                      {rozet.isim}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 text-center text-xs text-yazi-soluk">
              {kazanilanRozetler.length}/{ROZETLER.length} rozet kazanıldı
            </div>
          </div>

          {/* Seviye Haritası */}
          <div className="kart p-6">
            <h2 className="text-sm font-bold text-yazi mb-4 flex items-center gap-2">
              <span className="pixel-xs text-mor">⚡</span> Seviye Haritası
            </h2>
            <div className="flex flex-col gap-2">
              {SEVIYE_ESIKLERI.slice(0, 6).map((esik, i) => {
                const seviye = i + 1
                const aktif = oyunDurumu.seviye === seviye
                const gecildi = oyunDurumu.seviye > seviye
                return (
                  <div
                    key={seviye}
                    className="flex items-center gap-3"
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={{
                        background: aktif
                          ? 'linear-gradient(135deg, #8B5CF6, #06B6D4)'
                          : gecildi
                          ? 'rgba(16,185,129,0.15)'
                          : 'rgba(30,41,59,0.5)',
                        border: `1.5px solid ${aktif ? '#8B5CF6' : gecildi ? '#10B981' : '#2d3748'}`,
                        color: aktif || gecildi ? '#fff' : '#4b5563',
                      }}
                    >
                      {seviye}
                    </div>
                    <div className="flex-1">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          background: gecildi
                            ? '#10B981'
                            : aktif
                            ? `linear-gradient(90deg, #8B5CF6 ${xpYuzde}%, #2d3748 ${xpYuzde}%)`
                            : '#1e293b',
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-yazi-soluk w-14 text-right">
                      {esik} XP
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
    </KorumaliRota>
  )
}

// ── İstatistik Kartı Alt Bileşeni ──────────────────────────────────────────
function IstatKart({
  ikon, deger, etiket, renk,
}: {
  ikon: string
  deger: string
  etiket: string
  renk: string
}) {
  return (
    <div
      className="kart p-4 flex flex-col items-center gap-2 text-center"
      style={{ borderColor: `${renk}33` }}
    >
      <div className="text-2xl">{ikon}</div>
      <div className="text-xl font-extrabold font-kod" style={{ color: renk }}>
        {deger}
      </div>
      <div className="text-[10px] text-yazi-soluk uppercase tracking-wider">{etiket}</div>
    </div>
  )
}
