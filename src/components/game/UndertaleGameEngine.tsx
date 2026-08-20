'use client'

import { useState, useEffect } from 'react'

interface UndertaleGameEngineProps {
  gorevBaslik: string
  gorevNo: string
  onBulmacaCozuldu?: (xp: number) => void
}

export default function UndertaleGameEngine({
  gorevBaslik,
  gorevNo,
  onBulmacaCozuldu,
}: UndertaleGameEngineProps) {
  const [loading, setLoading] = useState(true)

  // Undertale Bölüm Tamamlama Event Dinleyicisi
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'UNDERTALE_SECTION_CLEARED') {
        if (onBulmacaCozuldu) {
          onBulmacaCozuldu(e.data.xp || 100)
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onBulmacaCozuldu])

  return (
    <div className="relative w-full h-full bg-black flex flex-col overflow-hidden">
      {/* Undertale Modu Üst Başlık */}
      <div className="px-4 py-2 bg-black border-b-2 border-yellow-500 flex items-center justify-between flex-shrink-0 z-10 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 font-bold tracking-wider">💛 UNDERTALE AI RPG</span>
          <span className="text-slate-500">|</span>
          <span className="text-white truncate max-w-[200px]">{gorevBaslik} ({gorevNo})</span>
        </div>

        <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 font-bold text-[10px]">
          ● AKTİF
        </span>
      </div>

      {/* Yükleniyor Animasyonu */}
      {loading && (
        <div className="absolute inset-0 z-20 bg-black flex flex-col items-center justify-center text-yellow-400 font-mono gap-3">
          <span className="text-2xl animate-bounce">💛</span>
          <span className="text-xs tracking-widest animate-pulse">UNDERTALE DÜNYASI YÜKLENİYOR...</span>
        </div>
      )}

      {/* Undertale HTML Overworld RPG Motoru Iframe */}
      <iframe
        src="/game/undertale-overworld.html"
        title="AIVentura Undertale Mode"
        className="w-full h-full border-none flex-1"
        onLoad={() => setLoading(false)}
        allow="autoplay; keyboard"
      />
    </div>
  )
}
