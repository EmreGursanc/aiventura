'use client'

import type { NpcDiyalog } from '@/types'
import { useSes } from '@/hooks/useSes'

interface HikayePaneliProps {
  hikaye: NpcDiyalog[]
  hedef: string
  ipucu: string
  ipucuGoster: boolean
  onIpucuGoster: () => void
  gorevBaslik: string
  bolumNo: number
  gorevNo: number
}

export default function HikayePaneli({
  hikaye,
  hedef,
  ipucu,
  ipucuGoster,
  onIpucuGoster,
  gorevBaslik,
  bolumNo,
  gorevNo,
}: HikayePaneliProps) {
  const { ipucuSesi } = useSes()

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ── Panel Başlığı ───────────────────────────────────────────────── */}
      <div
        className="px-5 py-3 border-b border-sinir flex items-center justify-between flex-shrink-0"
        style={{ background: 'rgba(10, 15, 26, 0.6)' }}
      >
        <div className="flex items-center gap-2">
          <span className="pixel-xs text-cyan">
            B{bolumNo}.G{gorevNo}
          </span>
          <span className="text-xs text-yazi-soluk">─</span>
          <span className="text-xs font-semibold text-yazi truncate max-w-[200px]">
            HİKÂYE & GÖREV
          </span>
        </div>
      </div>

      {/* ── Hikaye İçeriği (Scroll edilebilir) ─────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">

        {/* Görev Başlığı */}
        <div>
          <span className="pixel-xs text-yesil block mb-1">AKTİF GÖREV</span>
          <h1 className="text-lg font-bold text-yazi tracking-wide">
            {gorevBaslik}
          </h1>
        </div>

        {/* NPC Diyalogları & Hikaye Paragrafları */}
        <div className="flex flex-col gap-4">
          {hikaye.map((d, i) => (
            <DiyalogKutusu key={i} diyalog={d} index={i} />
          ))}
        </div>

        {/* Görev Hedefi Kutu */}
        <div
          className="rounded-lg p-4 flex flex-col gap-1.5"
          style={{
            background: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
          }}
        >
          <span className="pixel-xs text-yesil">🎯 GÖREV HEDEFi</span>
          <p className="text-xs text-yazi-iki leading-relaxed">{hedef}</p>
        </div>

        {/* İpucu Alanı */}
        <div>
          {!ipucuGoster ? (
            <button
              onClick={() => {
                ipucuSesi()
                onIpucuGoster()
              }}
              className="w-full py-2.5 px-4 rounded text-xs font-semibold transition-all duration-200 text-left"
              style={{
                background: 'rgba(245,158,11,0.05)',
                border: '1px dashed rgba(245,158,11,0.3)',
                color: '#F59E0B',
              }}
            >
              💡 İpucunu Göster (−10 XP)
            </button>
          ) : (
            <div
              className="rounded-lg p-4 flex flex-col gap-1.5 animate-yukari"
              style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
              }}
            >
              <span className="pixel-xs text-altin">💡 İPUCU</span>
              <p className="text-xs text-altin/90 leading-relaxed font-kod">
                {ipucu}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

function DiyalogKutusu({ diyalog, index }: { diyalog: NpcDiyalog; index: number }) {
  const metinIcerik = diyalog.metin || diyalog.icerik || ''
  const konusmaciAdi = diyalog.konusmaci || diyalog.isim || 'NEXUS'

  return (
    <div
      className="p-4 rounded-xl border flex items-start gap-3.5 animate-yukari"
      style={{
        background: 'rgba(30, 41, 59, 0.5)',
        borderColor: 'rgba(6, 182, 212, 0.25)',
        animationDelay: `${index * 0.1}s`,
      }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
        style={{
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          border: '1.5px solid #06B6D4',
        }}
      >
        🤖
      </div>

      <div className="flex-1">
        <div className="text-xs font-bold text-cyan mb-1 font-kod">
          {konusmaciAdi}
        </div>
        <div
          className="text-xs text-yazi-iki leading-relaxed"
          dangerouslySetInnerHTML={{ __html: metinIcerik }}
        />
      </div>
    </div>
  )
}
