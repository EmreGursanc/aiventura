'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Diyalog {
  konusmaci: string
  metin: string
  ifade: 'mutlu' | 'dusunuyor' | 'saskin' | 'uyari' | 'zafer'
}

interface CinematicRPGSceneProps {
  diyaloglar: Diyalog[]
  gorevBaslik: string
  onSoruyaGec: () => void
}

export default function CinematicRPGScene({
  diyaloglar,
  gorevBaslik,
  onSoruyaGec,
}: CinematicRPGSceneProps) {
  const [index, setIndex] = useState(0)

  const mevcutDiyalog = diyaloglar[index] || diyaloglar[0]

  const ifadeRenk = {
    mutlu: '#10B981',
    dusunuyor: '#06B6D4',
    saskin: '#F59E0B',
    uyari: '#EF4444',
    zafer: '#8B5CF6',
  }[mevcutDiyalog.ifade]

  const sonraki = () => {
    if (index < diyaloglar.length - 1) {
      setIndex(index + 1)
    } else {
      onSoruyaGec()
    }
  }

  return (
    <div className="w-full flex flex-col rounded-2xl overflow-hidden border-2 border-cyan/40 bg-arka shadow-2xl relative mb-6">
      
      {/* ── Üst Sinematik Bar ────────────────────────────────────────────── */}
      <div className="px-4 py-2 bg-terminal border-b border-sinir flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="pixel-xs text-cyan">CINEMATIC SCENE — {gorevBaslik}</span>
        </div>
        <span className="text-[10px] font-kod text-yazi-soluk">
          Sahne {index + 1} / {diyaloglar.length}
        </span>
      </div>

      {/* ── 16:9 CODÉDEX STİLİ SİNEMATİK OYUN DÜNYASI SAHNESİ ────────────── */}
      <div
        className="relative h-64 sm:h-80 w-full overflow-hidden flex flex-col justify-end p-6"
        style={{
          background: 'linear-gradient(180deg, #050811 0%, #1e1b4b 55%, #0f172a 100%)',
        }}
      >
        {/* CRT Tarama ve Işık Efektleri */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-transparent to-transparent pointer-events-none" />
        
        {/* Arka Plan Nöron Ağı Çizgileri */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-32 h-0.5 bg-cyan animate-pulse" />
          <div className="absolute top-20 right-1/4 w-40 h-0.5 bg-mor animate-pulse delay-500" />
        </div>

        {/* Sahnedeki Karakterler */}
        <div className="flex items-end justify-between relative z-10">
          
          {/* Sol: NEX Robot (Karşıdan Bakan Canlı Animasyonlu Avatar) */}
          <div className="flex flex-col items-center gap-3">
            
            {/* Canlı İfade Balonu */}
            <div
              className="px-3 py-1 rounded-full text-xs font-extrabold shadow-glow-cyan animate-bounce"
              style={{ background: ifadeRenk, color: '#000' }}
            >
              {mevcutDiyalog.ifade === 'mutlu' && '😊 BİP BOP!'}
              {mevcutDiyalog.ifade === 'dusunuyor' && '🧠 NÖRONLAR ÇALIŞIYOR...'}
              {mevcutDiyalog.ifade === 'saskin' && '😲 İNANILMAZ!'}
              {mevcutDiyalog.ifade === 'uyari' && '⚠️ DİKKAT KAŞİF!'}
              {mevcutDiyalog.ifade === 'zafer' && '🎉 ŞİFRE ÇÖZÜLDÜ!'}
            </div>

            <div
              className="w-28 h-28 sm:w-36 sm:h-36 relative rounded-2xl overflow-hidden border-4 shadow-2xl transition-transform hover:scale-105"
              style={{
                borderColor: ifadeRenk,
                boxShadow: `0 0 30px ${ifadeRenk}60`,
                background: 'linear-gradient(135deg, #1e293b, #0f172a)',
              }}
            >
              <Image
                src="/nex_robot_hoodie.png"
                alt="NEX Mascot"
                fill
                className="object-cover scale-110"
              />
            </div>

            <span className="pixel-xs text-yazi font-bold">{mevcutDiyalog.konusmaci}</span>
          </div>

          {/* Sağ: Yapay Zeka Nöron Çekirdeği (Visual AI Brain Core) */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-kart/90 border-2 border-cyan flex flex-col items-center justify-center relative shadow-glow-cyan overflow-hidden">
              <div className="text-4xl animate-pulse">🧠</div>
              <div className="text-[9px] font-kod text-cyan mt-1">AI NÖRON AĞI</div>
              
              {/* Nöron Parıltıları */}
              <span className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-yesil animate-ping" />
              <span className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-mor animate-ping delay-300" />
            </div>
            <span className="pixel-xs text-cyan">KALIP TANIMA ÇEKİRDEĞİ</span>
          </div>

        </div>
      </div>

      {/* ── CODÉDEX TARZI ALT DİYALOG KUTUSU ─────────────────────────────── */}
      <div className="p-5 bg-terminal border-t border-sinir flex flex-col gap-4">
        <div
          className="p-4 rounded-xl border bg-arka/90 relative"
          style={{ borderColor: ifadeRenk }}
        >
          <div className="text-xs font-bold font-kod mb-2 flex items-center justify-between" style={{ color: ifadeRenk }}>
            <span>📢 {mevcutDiyalog.konusmaci}</span>
            <span className="text-[10px] text-yazi-soluk">Tıklayarak Devam Et ▶</span>
          </div>
          <p className="text-sm sm:text-base text-yazi leading-relaxed font-ui font-medium">
            {mevcutDiyalog.metin}
          </p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-yazi-soluk font-kod">
            💡 Mantık: Yapay zekaya doğru komut (Prompt) vermeyi öğreniyorsun.
          </span>

          <button
            onClick={sonraki}
            className="btn-yesil text-xs px-5 py-2.5 shadow-glow-yesil hover:scale-105 transition-all font-bold flex items-center gap-2"
          >
            <span>{index < diyaloglar.length - 1 ? 'İleri ▶' : '🎮 Göreve Başla!'}</span>
          </button>
        </div>
      </div>

    </div>
  )
}
