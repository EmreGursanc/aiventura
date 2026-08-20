'use client'

import { useState, useEffect } from 'react'

interface AIBrainVisualizerProps {
  promptMetni: string
  onIslemTamam: () => void
}

export default function AIBrainVisualizer({
  promptMetni,
  onIslemTamam,
}: AIBrainVisualizerProps) {
  const [asama, setAsama] = useState<'input' | 'processing' | 'output'>('input')

  useEffect(() => {
    // 1. Asama: Input yukleniyor
    const t1 = setTimeout(() => setAsama('processing'), 800)
    // 2. Asama: Nöron aglari kalip eslestiriyor
    const t2 = setTimeout(() => {
      setAsama('output')
      onIslemTamam()
    }, 2200)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [onIslemTamam])

  return (
    <div className="w-full p-5 bg-terminal border-2 border-cyan/50 rounded-2xl flex flex-col gap-4 shadow-glow-cyan my-4 animate-scale-in">
      
      <div className="flex items-center justify-between text-xs font-kod pb-2 border-b border-sinir">
        <span className="text-cyan font-bold flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan animate-ping" />
          🧠 GÖRSEL AI İŞLEME SİMÜLATÖRÜ (NÖRON AĞI)
        </span>
        <span className="text-yazi-soluk">Girdi ➔ İşleme ➔ Çıktı</span>
      </div>

      {/* ── 3 AŞAMALI GÖRSEL AKIŞ ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* AŞAMA 1: INPUT (GİRDİ / PROMPT) */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col gap-2 transition-all ${
            asama === 'input'
              ? 'border-cyan bg-cyan-dim shadow-glow-cyan scale-102'
              : 'border-sinir bg-arka/60 opacity-70'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-cyan">
            <span>1️⃣ GİRDİ (INPUT)</span>
            <span>📥 SÖZCÜKLER</span>
          </div>
          <p className="text-xs text-yazi font-kod bg-arka p-2 rounded truncate border border-sinir">
            "{promptMetni || 'Yapay zeka...'}"
          </p>
          <span className="text-[10px] text-yazi-soluk">Senin yazdığın komut verisi</span>
        </div>

        {/* AŞAMA 2: PROCESSING (NÖRON HESAPLAMA) */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col gap-2 transition-all ${
            asama === 'processing'
              ? 'border-altin bg-altin-dim shadow-glow-altin scale-102'
              : 'border-sinir bg-arka/60 opacity-70'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-altin">
            <span>2️⃣ İŞLEME (PROCESSING)</span>
            <span className="animate-pulse">⚡ NÖRON AĞI</span>
          </div>
          <div className="flex items-center justify-center gap-2 py-1 text-2xl">
            <span className={asama === 'processing' ? 'animate-bounce' : ''}>🧠</span>
            <span className={asama === 'processing' ? 'animate-pulse text-altin text-xs' : 'text-xs'}>
              {asama === 'processing' ? 'Kalıplar Eşleşiyor...' : 'Bekliyor...'}
            </span>
          </div>
          <span className="text-[10px] text-yazi-soluk">Milyonlarca örnekle karşılaştırılıyor</span>
        </div>

        {/* AŞAMA 3: OUTPUT (ÇIKTI / ÜRÜN) */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col gap-2 transition-all ${
            asama === 'output'
              ? 'border-yesil bg-yesil-dim shadow-glow-yesil scale-102'
              : 'border-sinir bg-arka/60 opacity-70'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-yesil">
            <span>3️⃣ ÇIKTI (OUTPUT)</span>
            <span>🖼️ AI YANITI</span>
          </div>
          <div className="text-xs text-yesil font-kod bg-arka p-2 rounded border border-yesil/30 font-bold truncate">
            {asama === 'output' ? '✅ Sonuç Üretildi!' : 'Bekleniyor...'}
          </div>
          <span className="text-[10px] text-yazi-soluk">Yapay zekanın ürettiği eser</span>
        </div>

      </div>

    </div>
  )
}
