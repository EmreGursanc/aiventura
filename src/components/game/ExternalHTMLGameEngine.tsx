'use client'

import { useState } from 'react'

interface ExternalHTMLGameEngineProps {
  gorevBaslik: string
  gorevNo: string
  onBulmacaCozuldu?: () => void
}

export default function ExternalHTMLGameEngine({
  gorevBaslik,
  gorevNo,
}: ExternalHTMLGameEngineProps) {
  const [yukleniyor, setYukleniyor] = useState(true)

  return (
    <div className="relative w-full h-full bg-[#0a0f1c] flex flex-col overflow-hidden">
      {/* 🎮 Üst Oyun Header */}
      <div className="px-4 py-2 bg-slate-900/90 border-b border-cyan-900/50 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl">🦊</span>
          <div>
            <h3 className="text-xs font-bold text-cyan-400 font-mono uppercase tracking-wider">
              3D RPG OYUN MODU
            </h3>
            <p className="text-[11px] text-slate-300 font-medium truncate max-w-[240px]">
              {gorevBaslik} ({gorevNo})
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
            ● Canlı Entegrasyon
          </span>
        </div>
      </div>

      {/* 🚀 Oyun Yükleniyor Göstergesi */}
      {yukleniyor && (
        <div className="absolute inset-0 z-20 bg-slate-950 flex flex-col items-center justify-center text-cyan-400 gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
          <span className="text-xs font-mono tracking-wider animate-pulse">
            3D RPG EVRENİ YÜKLENİYOR...
          </span>
        </div>
      )}

      {/* 🖼️ HTML5 / WebGL Iframe Köprüsü */}
      <iframe
        src="/game/index-offline-v2.html"
        title="AIVentura 3D RPG Game"
        className="w-full h-full border-none flex-1"
        onLoad={() => setYukleniyor(false)}
        allow="autoplay; fullscreen; keyboard"
      />
    </div>
  )
}
