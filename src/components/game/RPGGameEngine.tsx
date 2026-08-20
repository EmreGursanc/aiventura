'use client'

import { useState } from 'react'
import Image from 'next/image'

interface DiyalogAdimi {
  konusmaci: string
  metin: string
  ifade: 'mutlu' | 'dusunuyor' | 'saskin' | 'uyari' | 'zafer'
}

interface RPGGameEngineProps {
  diyaloglar: DiyalogAdimi[]
  bolumBaslik: string
  gorevNo: string
}

export default function RPGGameEngine({
  diyaloglar,
  bolumBaslik,
  gorevNo,
}: RPGGameEngineProps) {
  const [aktifIndex, setAktifIndex] = useState(0)

  const mevcutDiyalog = diyaloglar[aktifIndex] || diyaloglar[0] || {
    konusmaci: 'NEXUS',
    metin: 'Bip bop! Maceraya hoş geldin kaşif!',
    ifade: 'mutlu',
  }

  const ifadeRenk = {
    mutlu: '#10B981',
    dusunuyor: '#06B6D4',
    saskin: '#F59E0B',
    uyari: '#EF4444',
    zafer: '#8B5CF6',
  }[mevcutDiyalog.ifade]

  const sonrakiDiyalog = () => {
    if (aktifIndex < diyaloglar.length - 1) {
      setAktifIndex(aktifIndex + 1)
    }
  }

  const oncekiDiyalog = () => {
    if (aktifIndex > 0) {
      setAktifIndex(aktifIndex - 1)
    }
  }

  return (
    <div className="flex flex-col h-full bg-arka border-r border-sinir overflow-hidden relative">
      
      {/* ── 1. ÜST RPG BAR & CAN/ENERJİ PANOLARI ─────────────────────────── */}
      <div
        className="px-4 py-2.5 border-b border-sinir flex items-center justify-between flex-shrink-0"
        style={{ background: 'rgba(10, 15, 26, 0.95)' }}
      >
        <div className="flex items-center gap-2">
          <span className="pixel-xs text-cyan">{gorevNo}</span>
          <span className="text-xs text-yazi-soluk">·</span>
          <span className="text-xs font-bold text-yazi">{bolumBaslik}</span>
        </div>
        
        {/* Karakter Can & Enerji Barı (RPG Hissi) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] font-kod">
            <span>❤️ CAN:</span>
            <div className="w-16 h-2 rounded-full bg-arka border border-sinir overflow-hidden">
              <div className="h-full bg-pembe w-full shadow-glow-pembe animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-kod">
            <span>⚡ ENERJİ:</span>
            <div className="w-16 h-2 rounded-full bg-arka border border-sinir overflow-hidden">
              <div className="h-full bg-cyan w-3/4 shadow-glow-cyan" />
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. BUYUTULMUŞ 2D PIXEL OYUN SAHNESİ ───────────────────────────── */}
      <div
        className="relative h-72 sm:h-80 w-full overflow-hidden flex flex-col justify-end p-5 flex-shrink-0"
        style={{
          background: 'linear-gradient(180deg, #090d16 0%, #1e1b4b 50%, #0f172a 100%)',
          borderBottom: '2px solid #2d3748',
        }}
      >
        {/* Arka Plan Piksel Parıltılar */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute top-6 left-12 text-base animate-pulse">✨</div>
          <div className="absolute top-16 right-24 text-base animate-pulse delay-300">🌟</div>
          <div className="absolute top-10 left-1/2 text-base animate-pulse delay-700">✨</div>
        </div>

        {/* 2D Karakter Sahnesi */}
        <div className="flex items-end justify-between relative z-10">
          
          {/* Sol: NEX Robot Avatarı & Canlı Reaksiyon */}
          <div className="flex flex-col items-center gap-2 group">
            
            <div
              className="px-3 py-1 rounded-full text-xs font-extrabold animate-bounce shadow-glow-cyan"
              style={{
                background: ifadeRenk,
                color: '#000',
              }}
            >
              {mevcutDiyalog.ifade === 'mutlu' && '😊 BİP BOP!'}
              {mevcutDiyalog.ifade === 'dusunuyor' && '🤔 DÜŞÜNÜYORUM...'}
              {mevcutDiyalog.ifade === 'saskin' && '😲 NELER OLUYOR?'}
              {mevcutDiyalog.ifade === 'uyari' && '⚠️ DİKKAT!'}
              {mevcutDiyalog.ifade === 'zafer' && '🎉 BİLGE KAŞİF!'}
            </div>

            <div
              className="w-32 h-32 sm:w-36 sm:h-36 relative rounded-2xl overflow-hidden transition-transform group-hover:scale-105 shadow-glow-cyan"
              style={{
                background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                border: `3px solid ${ifadeRenk}`,
              }}
            >
              <Image
                src="/nex_robot_hoodie.png"
                alt="NEX Mascot"
                fill
                className="object-cover scale-110"
              />
            </div>

            <span className="pixel-sm text-yazi font-bold">{mevcutDiyalog.konusmaci}</span>
          </div>

          {/* Sağ: Şato / Hedef Görseli */}
          <div className="flex flex-col items-end gap-2">
            <div className="w-24 h-24 rounded-2xl bg-kart/90 border-2 border-cyan/50 flex items-center justify-center text-5xl shadow-glow-cyan">
              🏰
            </div>
            <span className="pixel-xs text-cyan">NEXUS KALESİ</span>
          </div>

        </div>
      </div>

      {/* ── 3. POKEMON / ZELDA TARZI ÇOKLU DİYALOG KUTUSU ────────────────── */}
      <div className="flex-1 p-5 overflow-y-auto bg-kart/60 flex flex-col justify-between gap-4">
        
        {/* Diyalog İçeriği */}
        <div
          className="p-5 rounded-2xl border relative shadow-xl min-h-[110px]"
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            borderColor: ifadeRenk,
            boxShadow: `0 0 20px ${ifadeRenk}30`,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full animate-ping" style={{ background: ifadeRenk }} />
              <span className="text-xs font-bold font-kod tracking-wider uppercase" style={{ color: ifadeRenk }}>
                📢 {mevcutDiyalog.konusmaci} SANA DİYOR Kİ:
              </span>
            </div>

            {/* Diyalog Sayacı (Örn: 1/3) */}
            <span className="pixel-xs text-yazi-soluk">
              {aktifIndex + 1} / {diyaloglar.length}
            </span>
          </div>

          <p className="text-sm sm:text-base text-yazi leading-relaxed font-ui font-medium">
            {mevcutDiyalog.metin}
          </p>
        </div>

        {/* ── Diyalog İlerleme Butonları (Pokemon/Zelda Tarzı) ───────────── */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={oncekiDiyalog}
            disabled={aktifIndex === 0}
            className="px-3 py-1.5 rounded text-xs font-bold transition-all border border-sinir text-yazi-soluk hover:text-yazi disabled:opacity-30"
          >
            ◀ Geri
          </button>

          {aktifIndex < diyaloglar.length - 1 ? (
            <button
              onClick={sonrakiDiyalog}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-cyan text-arka shadow-glow-cyan hover:scale-105 transition-all flex items-center gap-2"
            >
              <span>Konuşmaya Devam Et</span>
              <span>▶</span>
            </button>
          ) : (
            <div className="px-3 py-1.5 rounded text-xs font-bold text-yesil bg-yesil-dim border border-yesil/30">
              ✅ Konuşma Tamamlandı! Sağ taraftan yanıtını yaz →
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
