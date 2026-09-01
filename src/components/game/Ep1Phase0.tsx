'use client'

import { useState, useEffect } from 'react'
import { playGameSound } from '@/lib/gameSound'

interface Ep1Phase0Props {
  missionTitle: string
  missionObjective: string
  chapterNumber: number
  onStart: () => void
}

const LINES = [
  '> NexusCorp Guvenli Kanal -- SIFRELENDI',
  '> ALARM SEVIYESI: KRITIK',
  '> 03:45 -- Yetkisiz giris tespit edildi.',
  '> Hedef sistem: srv-main (Production)',
  '> Gorev: Supheli personeli tespit et.',
  '> AI destekli adli analiz modulu aktif...',
]

export default function Ep1Phase0({ missionTitle, missionObjective, chapterNumber, onStart }: Ep1Phase0Props) {
  const [visibleLines, setVisibleLines] = useState<string[]>([])
  const [showButton, setShowButton] = useState(false)
  const [charIdx, setCharIdx] = useState(0)
  const [lineIdx, setLineIdx] = useState(0)
  const [currentLine, setCurrentLine] = useState('')

  // Alarm sesi
  useEffect(() => {
    playGameSound('alarm')
  }, [])

  // Typewriter efekti
  useEffect(() => {
    if (lineIdx >= LINES.length) {
      setTimeout(() => setShowButton(true), 500)
      return
    }
    const line = LINES[lineIdx]
    if (charIdx < line.length) {
      const t = setTimeout(() => {
        setCurrentLine(prev => prev + line[charIdx])
        setCharIdx(c => c + 1)
        if (charIdx % 3 === 0) playGameSound('typewriter')
      }, 30)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => {
        setVisibleLines(prev => [...prev, line])
        setCurrentLine('')
        setCharIdx(0)
        setLineIdx(l => l + 1)
      }, 200)
      return () => clearTimeout(t)
    }
  }, [charIdx, lineIdx])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(3,7,18,0.99)' }}>

      {/* Kirmizi alarm parlama */}
      <div className="absolute top-0 left-0 right-0 h-1 animate-pulse"
        style={{ background: 'linear-gradient(90deg, transparent, #ef4444, transparent)', boxShadow: '0 0 20px #ef4444' }} />

      <div className="max-w-lg w-full mx-4">
        {/* Terminal ekrani */}
        <div className="rounded-xl overflow-hidden mb-6"
          style={{ background: '#0a0c14', border: '1px solid rgba(239,68,68,0.4)', boxShadow: '0 0 40px rgba(239,68,68,0.15)' }}>
          {/* Terminal baslik */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-red-900/30"
            style={{ background: 'rgba(239,68,68,0.08)' }}>
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs text-red-400 font-mono font-bold">NEXUS-ALARM v2.0 -- KRITIK UYARI</span>
          </div>
          {/* Terminal icerik */}
          <div className="p-5 font-mono text-sm min-h-[180px]">
            {visibleLines.map((line, i) => (
              <div key={i} className="text-green-400 mb-1">{line}</div>
            ))}
            {lineIdx < LINES.length && (
              <div className="text-green-400 mb-1">
                {currentLine}<span className="animate-pulse">-</span>
              </div>
            )}
          </div>
        </div>

        {/* Gorev karti */}
        {showButton && (
          <div className="animate-fade-in">
            <div className="rounded-xl p-5 mb-4"
              style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(99,102,241,0.4)' }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl animate-bounce">???</span>
                <div>
                  <div className="text-white font-black text-lg">{missionTitle}</div>
                  <div className="text-xs text-indigo-400">Bolum {chapterNumber}/6 -- GIZLI GOREV</div>
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-3">{missionObjective}</p>
              <div className="rounded-lg p-3 flex items-center gap-3"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                <span className="text-xl">??</span>
                <div>
                  <div className="text-xs text-emerald-400 font-bold">Bu bolumde ogreneceklerin:</div>
                  <div className="text-xs text-white">AI yaa Rol + Kanit + Zaman Kriteri verme</div>
                </div>
              </div>
            </div>

            <button onClick={() => { playGameSound('connect'); onStart() }}
              className="w-full py-4 text-white font-black text-lg rounded-xl transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #dc2626, #7c3aed)', boxShadow: '0 0 30px rgba(220,38,38,0.4)' }}>
              GOREVE BASLA ??
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
