'use client'

import { useEffect, useState } from 'react'

interface VoxelAIBuilderProps {
  gorevBaslik: string
  gorevNo: string
  gorevId?: string
  onBolumTamamlandi?: (xp: number) => void
}

// ── Bölüm ID → HTML Oyun Dosyası Eşlemesi ──────────────────────
// Her bölüm kendi özelleştirilmiş oyun motoruna sahip
const BOLUM_DOSYALARI: Record<string, string> = {
  'c-g1-1': '/game/voxel-ai-builder.html',
  'c-g1-2': '/game/voxel-ai-builder.html',
  'c-g1-3': '/game/voxel-ai-builder.html',
  'c-g2-1': '/game/chapter2.html',
  'c-g2-2': '/game/chapter2.html',
  'c-g2-3': '/game/chapter2.html',
  'c-g3-1': '/game/chapter3.html',
  'c-g3-2': '/game/chapter3.html',
  'c-g3-3': '/game/chapter3.html',
  'c-g4-1': '/game/chapter4.html',
  'c-g4-2': '/game/chapter4.html',
  'c-g4-3': '/game/chapter4.html',
  'c-g5-1': '/game/chapter5.html',
  'c-g5-2': '/game/chapter5.html',
  'c-g5-3': '/game/chapter5.html',
  'c-g6-1': '/game/chapter6.html',
  'c-g6-2': '/game/chapter6.html',
  'c-g6-3': '/game/chapter6.html',
  'c-g7-1': '/game/chapter7.html',
  'c-g7-2': '/game/chapter7.html',
  'c-g7-3': '/game/chapter7.html',
  'c-g8-1': '/game/chapter8.html',
  'c-g8-2': '/game/chapter8.html',
  'c-g8-boss': '/game/chapter8.html',
}

function getGameSrc(gorevId?: string): string {
  if (!gorevId) return '/game/voxel-ai-builder.html?mission=c-g1-1'
  const base = BOLUM_DOSYALARI[gorevId] ?? '/game/voxel-ai-builder.html'
  return `${base}?mission=${gorevId}`
}

// ── Bölüm Rengi & Başlık ────────────────────────────────────────
function getBolumMeta(gorevId?: string): { renk: string; emoji: string; bolumNo: number } {
  const bolumNo = gorevId ? parseInt(gorevId.replace('c-g', '').split('-')[0]) : 1
  const metaMap: Record<number, { renk: string; emoji: string }> = {
    1: { renk: '#10B981', emoji: '🔴' },
    2: { renk: '#8B5CF6', emoji: '🧠' },
    3: { renk: '#06B6D4', emoji: '👁️' },
    4: { renk: '#F59E0B', emoji: '🔀' },
    5: { renk: '#EF4444', emoji: '🦠' },
    6: { renk: '#F97316', emoji: '🎯' },
    7: { renk: '#EC4899', emoji: '📈' },
    8: { renk: '#FBBF24', emoji: '💥' },
  }
  return { ...( metaMap[bolumNo] ?? metaMap[1]), bolumNo }
}

export default function VoxelAIBuilder({
  gorevBaslik,
  gorevNo,
  gorevId,
  onBolumTamamlandi,
}: VoxelAIBuilderProps) {
  const [loading, setLoading] = useState(true)
  const gameSrc = getGameSrc(gorevId)
  const { renk, emoji, bolumNo } = getBolumMeta(gorevId)

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'UNDERTALE_SECTION_CLEARED') {
        onBolumTamamlandi?.(e.data.xp || 150)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onBolumTamamlandi])

  return (
    <div className="relative w-full h-full bg-[#030712] flex flex-col overflow-hidden">
      {/* Üst Başlık Barı */}
      <div
        className="px-4 py-2 flex items-center justify-between flex-shrink-0 z-10 font-mono text-xs"
        style={{
          background: 'rgba(3,7,18,0.98)',
          borderBottom: `2px solid ${renk}`,
        }}
      >
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wider" style={{ color: renk }}>
            {emoji} NEX-CORE: BÖLÜM {bolumNo}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-white truncate max-w-[220px]">
            {gorevBaslik}
          </span>
          <span className="text-slate-600 hidden sm:inline">({gorevNo})</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-0.5 rounded font-bold text-[10px] animate-pulse"
            style={{
              color: renk,
              background: `${renk}22`,
              border: `1px solid ${renk}55`,
            }}
          >
            ● CANLI
          </span>
          <a
            href="/dersler"
            className="text-slate-500 hover:text-slate-300 transition-colors text-[10px] px-2 py-0.5 rounded border border-slate-800 hover:border-slate-600"
          >
            ← Harita
          </a>
        </div>
      </div>

      {/* Yükleniyor Ekranı */}
      {loading && (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4"
          style={{ background: '#030712' }}
        >
          <div className="text-5xl animate-bounce">{emoji}</div>
          <div
            className="text-xs tracking-widest font-bold animate-pulse font-mono"
            style={{ color: renk }}
          >
            BÖLÜM {bolumNo} YÜKLENİYOR...
          </div>
          {/* Loading Bar */}
          <div className="w-48 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div
              className="h-full rounded-full animate-pulse"
              style={{ width: '60%', background: `linear-gradient(90deg, ${renk}66, ${renk})` }}
            />
          </div>
        </div>
      )}

      {/* Oyun İframe */}
      <iframe
        key={gameSrc}
        src={gameSrc}
        title={`AIVentura — Bölüm ${bolumNo}: ${gorevBaslik}`}
        className="w-full flex-1 border-none"
        onLoad={() => setLoading(false)}
        allow="autoplay"
        style={{ display: loading ? 'none' : 'block' }}
      />
    </div>
  )
}
