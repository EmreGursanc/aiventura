'use client'

import { useState } from 'react'
import { KURSLAR } from '@/data/mufredat'
import type { Gorev, BossBattle } from '@/types'

// ── Tip Guard ───────────────────────────────────────────────────
function isBoss(g: Gorev | BossBattle): g is BossBattle {
  return !('ikon' in g)
}

// ── Bölüm Meta Bilgileri (Renk, AI Konusu, Süre) ───────────────
const BOLUM_META: Record<string, {
  aiKonu: string
  aciklama2: string
  renk: string
  parlak: string
  altRenk: string
  icon: string
  sure: string
}> = {
  'c-b1': {
    aiKonu: 'Gözetimli Öğrenme & Ön Yargı',
    aciklama2: "Yapay zeka modelleri örnek verilerle eğitilir. NEXUS'a doğru verileri göstererek dostu düşmandan ayırmasını sağla!",
    renk: '#10B981', parlak: 'rgba(16,185,129,0.15)', altRenk: '#064e3b',
    icon: '🔴', sure: '~2 dk'
  },
  'c-b2': {
    aiKonu: 'Özellik Çıkarımı & Nöronlar',
    aciklama2: 'GLITCH kılık değiştiriyor! Kuleye renge değil boyuta ve şekle bakmasını öğret.',
    renk: '#8B5CF6', parlak: 'rgba(139,92,246,0.15)', altRenk: '#2e1065',
    icon: '🧠', sure: '~2 dk'
  },
  'c-b3': {
    aiKonu: 'Bilgisayarlı Görü (Computer Vision)',
    aciklama2: 'Sis savaş alanını kapladı! Sensör ızgaraları döşe ve kuleye görmeyi öğret.',
    renk: '#06B6D4', parlak: 'rgba(6,182,212,0.15)', altRenk: '#0c4a6e',
    icon: '👁️', sure: '~2 dk'
  },
  'c-b4': {
    aiKonu: 'Karar Ağaçları (Decision Trees)',
    aciklama2: 'İki kule, iki karar! Düşman türüne göre EĞER/YOKSA yolları çiz.',
    renk: '#F59E0B', parlak: 'rgba(245,158,11,0.15)', altRenk: '#451a03',
    icon: '🔀', sure: '~2 dk'
  },
  'c-b5': {
    aiKonu: 'Veri Zehirlenmesi (Data Poisoning)',
    aciklama2: 'GLITCH eğitim verilerini bozuyor! Virüslü blokları süpürge ile temizle.',
    renk: '#EF4444', parlak: 'rgba(239,68,68,0.15)', altRenk: '#450a0a',
    icon: '🦠', sure: '~2 dk'
  },
  'c-b6': {
    aiKonu: 'Pekiştirmeli Öğrenme (RL)',
    aciklama2: 'Veri bloğu yok! Kule rastgele ateş ediyor. Ödül/Ceza butonlarıyla canlı eğit!',
    renk: '#F97316', parlak: 'rgba(249,115,22,0.15)', altRenk: '#431407',
    icon: '🎯', sure: '~2 dk'
  },
  'c-b7': {
    aiKonu: 'Tahmin & Regresyon',
    aciklama2: 'Zikzak çizen hızlı botlar! Tahmin nöronu bağla ve geleceğe ateş et!',
    renk: '#EC4899', parlak: 'rgba(236,72,153,0.15)', altRenk: '#500724',
    icon: '📈', sure: '~2 dk'
  },
  'c-b8': {
    aiKonu: 'Sistem Entegrasyonu (Boss)',
    aciklama2: 'Tüm yetenekler bir arada! Dev GLITCH ana gemisine karşı son savaş!',
    renk: '#FBBF24', parlak: 'rgba(251,191,36,0.15)', altRenk: '#451a03',
    icon: '💥', sure: '~3 dk'
  },
}

// ══════════════════════════════════════════════════════════════════════════════
//  ANA SAYFA
// ══════════════════════════════════════════════════════════════════════════════
export default function DerslerSayfasi() {
  const [seciliBolum, setSeciliBolum] = useState<string | null>(null)
  const kurs = KURSLAR['cocuklar']
  const toplamGorev = kurs.bolumler.reduce((t, b) => t + b.gorevler.length, 0)

  return (
    <div className="min-h-screen" style={{ background: '#060d1a' }}>

      {/* ── HERO BAŞLIK ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden pt-16 pb-12 px-4 text-center">
        {/* Animasyonlu arka plan grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} />

        {/* Glow blob */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.08) 0%, transparent 70%)' }} />

        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981' }}>
            🏰 NEXUS SAVUNMA AĞINA HOŞGELDİN
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight"
            style={{ background: 'linear-gradient(120deg, #10B981, #06B6D4, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            NEXUS'u Kurtar!
          </h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed mb-8">
            8 bölümlük yapay zeka serüvenin seni bekliyor. Kuleyi eğit, nöronları bağla ve GLITCH'i yen!
          </p>

          {/* İstatistik Çipleri */}
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {[
              { ikon: '🎮', deger: '8', etiket: 'Bölüm' },
              { ikon: '⚡', deger: String(toplamGorev), etiket: 'Dalga' },
              { ikon: '🟢', deger: '2', etiket: 'Ücretsiz Bölüm' },
              { ikon: '🏆', deger: '1', etiket: 'Boss Fight' },
            ].map((c) => (
              <div key={c.etiket} className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-lg font-extrabold text-white">{c.ikon} {c.deger}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{c.etiket}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BÖLÜM HARİTASI ──────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 pb-20">

        {/* Bölüm Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {kurs.bolumler.map((bolum, idx) => {
            const meta = BOLUM_META[bolum.id] || { renk: '#10B981', parlak: 'rgba(16,185,129,0.1)', icon: '🎮', aiKonu: '', aciklama2: '', altRenk: '#000', sure: '~2 dk' }
            const isPremium = false
            const isOpen = seciliBolum === bolum.id

            return (
              <div key={bolum.id}
                onClick={() => setSeciliBolum(isOpen ? null : bolum.id)}
                className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${meta.parlak}, rgba(15,23,42,0.95))`,
                  border: `1.5px solid ${isOpen ? meta.renk : 'rgba(255,255,255,0.07)'}`,
                  boxShadow: isOpen ? `0 0 28px ${meta.renk}44` : 'none',
                  transform: isOpen ? 'scale(1.01)' : 'scale(1)',
                }}>

                {/* Bölüm Başlık Satırı */}
                <div className="flex items-center gap-4 p-5">
                  {/* Numara + İkon */}
                  <div className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl font-black relative"
                    style={{ background: meta.altRenk, border: `2px solid ${meta.renk}55`, boxShadow: `0 0 16px ${meta.renk}33` }}>
                    {isPremium ? '🔒' : meta.icon}
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-black"
                      style={{ background: meta.renk }}>
                      {idx + 1}
                    </div>
                  </div>

                  {/* Başlık + Badges */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: isPremium ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)', color: isPremium ? '#F59E0B' : '#10B981', border: `1px solid ${isPremium ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'}` }}>
                        {isPremium ? '✨ KULÜP' : '🟢 ÜCRETSİZ'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{meta.sure}</span>
                    </div>
                    <h2 className="text-sm font-bold text-white leading-tight truncate">{bolum.baslik}</h2>
                    <div className="text-[11px] mt-0.5 font-semibold" style={{ color: meta.renk }}>🧠 {meta.aiKonu}</div>
                  </div>

                  {/* Chevron */}
                  <div className="text-slate-600 text-lg transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                    ▾
                  </div>
                </div>

                {/* Açılır Detay Paneli */}
                {isOpen && (
                  <div className="px-5 pb-5 border-t" style={{ borderColor: `${meta.renk}33` }}>
                    <p className="text-slate-400 text-sm leading-relaxed mt-4 mb-4">{meta.aciklama2}</p>

                    {/* Görev Listesi */}
                    <div className="flex flex-col gap-2 mb-4">
                      {bolum.gorevler.map((g, gi) => {
                        if (isBoss(g)) return (
                          <div key={g.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
                            <span className="text-lg">💥</span>
                            <div>
                              <div className="text-xs font-bold text-amber-400">PATRON SAVAŞI</div>
                              <div className="text-[11px] text-slate-400">{g.baslik}</div>
                            </div>
                          </div>
                        )
                        return (
                          <div key={g.id}
                            onClick={(e) => { e.stopPropagation(); if (!isPremium) window.location.href = `/ders/${g.id}` }}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group"
                            style={{
                              background: isPremium ? 'rgba(15,23,42,0.6)' : 'rgba(15,23,42,0.8)',
                              border: `1px solid ${meta.renk}22`,
                              cursor: isPremium ? 'not-allowed' : 'pointer',
                            }}>
                            <div className="w-7 h-7 rounded-md flex items-center justify-center text-base flex-shrink-0"
                              style={{ background: isPremium ? 'rgba(30,41,59,0.8)' : meta.parlak, border: `1px solid ${meta.renk}44` }}>
                              {isPremium ? '🔒' : g.ikon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-white truncate">{g.baslik}</div>
                              <div className="text-[10px] text-slate-500">{g.ozet}</div>
                            </div>
                            {!isPremium && (
                              <div className="text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ background: meta.renk, color: '#000' }}>
                                OYNA →
                              </div>
                            )}
                            <div className="text-[10px] font-bold" style={{ color: '#F59E0B' }}>+{(g as Gorev).xpOdul} XP</div>
                          </div>
                        )
                      })}
                    </div>

                    {/* CTA Butonu */}
                    {isPremium ? (
                      <button className="w-full py-3 rounded-xl text-sm font-bold transition-all"
                        style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(249,115,22,0.1))', border: '1px solid rgba(245,158,11,0.4)', color: '#F59E0B' }}
                        onClick={(e) => { e.stopPropagation(); alert('Kulüp üyeliği sayfası yakında! ✨') }}>
                        ✨ Kulübe Katıl ve Kilidi Aç — ₺299/ay
                      </button>
                    ) : (
                      <a href={`/ders/${bolum.gorevler[0]?.id || 'c-g1-1'}`}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                        style={{ background: `linear-gradient(135deg, ${meta.renk}, ${meta.renk}cc)`, color: '#000' }}>
                        🎮 Bölüme Gir →
                      </a>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ── Premium Banner ───────────────────────────────────────────── */}
        <div className="mt-10 rounded-2xl p-8 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(249,115,22,0.04))', border: '1.5px dashed rgba(245,158,11,0.35)' }}>
          <div className="text-5xl mb-4">👑</div>
          <h3 className="text-xl font-bold text-white mb-2">8 Efsanevi Bölüm (Dev Boss Savaşı Dahil) Seni Bekliyor</h3>
          <p className="text-slate-400 text-sm max-w-lg mx-auto mb-6 leading-relaxed">
            Bilgisayarlı Görü, Karar Ağaçları, Veri Zehirlenmesi, Pekiştirmeli Öğrenme, Tahmin Nöronu ve devasa GLITCH Boss Savaşını oynamak için Kulübe katıl!
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {['👁️ Kör Nokta', '🔀 Çatallanan Yollar', '🦠 Virüs İstilası', '🎯 Eğitmenin Yolu', '📈 Geleceği Görmek', '💥 Titan Savaşı'].map((b) => (
              <span key={b} className="text-xs px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid #2d3748', color: '#94a3b8' }}>
                🔒 {b}
              </span>
            ))}
          </div>
          <button className="px-8 py-3.5 rounded-xl font-bold text-sm text-black transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', boxShadow: '0 0 24px rgba(245,158,11,0.4)' }}
            onClick={() => alert('Kulüp üyeliği sayfası yakında! ✨')}>
            ✨ Kulübe Katıl — ₺399/ay
          </button>
        </div>

        {/* ── Yakında Banner (Prompt Mühendisliği) ────────────────────── */}
        <div className="mt-6 rounded-2xl p-6 text-center border overflow-hidden relative"
          style={{ background: 'rgba(99, 102, 241, 0.05)', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
          <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, #4f46e5, #818cf8)' }}></div>
          <div className="flex flex-col items-center gap-3">
            <span className="text-3xl animate-bounce">🚀</span>
            <h3 className="text-lg font-bold text-indigo-400">YAKINDA GELİYOR: PROMPT BÜYÜCÜSÜ!</h3>
            <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
              Çocuğunuz ChatGPT ve yapay zeka araçlarıyla nasıl doğru konuşacağını öğrensin. 
              <strong> Komut (Prompt) Mühendisliği</strong> macerası çok yakında AIVentura Kulübü'nde!
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

