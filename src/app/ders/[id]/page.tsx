'use client'

import { useState, useCallback, useEffect } from 'react'
import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Toast, SeviyeAtlamaModali, useOyunlastirma } from '@/hooks/useOyunlastirma'
import { KURSLAR } from '@/data/mufredat'
import type { Gorev } from '@/types'

// 🧱 3D Voxel AI Builder Oyun Motoru Entegrasyonu (SSR: FALSE)
const VoxelAIBuilder = dynamic(
  () => import('@/components/game/VoxelAIBuilder'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#050811] text-emerald-400 font-mono gap-3">
        <span className="text-4xl animate-bounce">🧱</span>
        <span>3D VOXEL DÜNYASI YÜKLENİYOR...</span>
      </div>
    ),
  }
)


interface DersSayfasiProps {
  params: { id: string }
}

export default function DersSayfasi({ params }: DersSayfasiProps) {
  const { id } = params
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  let gorev: Gorev | null = null
  let bolumNo = 1
  let gorevNo = 1

  for (const kurs of Object.values(KURSLAR)) {
    for (const bolum of kurs.bolumler) {
      const gIndex = bolum.gorevler.findIndex((g) => g.id === id)
      if (gIndex !== -1) {
        const item = bolum.gorevler[gIndex]
        if ('ikon' in item) {
          gorev = item as Gorev
          bolumNo = bolum.sira || bolum.numara || 1
          gorevNo = gIndex + 1
        }
        break
      }
    }
  }

  const { durum, xpKazan, seviyeAtladi } = useOyunlastirma()
  const [toastBilgi, setToastBilgi] = useState<{ baslik: string; aciklama: string; ikon: string } | null>(null)

  const gorevTamamlaHandler = useCallback(
    (kazanilanXp: number) => {
      if (!gorev) return
      xpKazan(kazanilanXp, 1)
      setToastBilgi({
        baslik: '🎉 GÖREV TAMAMLANDI!',
        aciklama: `+${kazanilanXp} XP Kazandın!`,
        ikon: '🌟',
      })
    },
    [gorev, xpKazan]
  )

  if (!gorev) {
    notFound()
  }

  const xpYuzde = Math.min(
    100,
    (durum.xp / durum.sonrakiSeviyeXp) * 100
  )

  return (
    <div
      className="flex flex-col"
      style={{ height: 'calc(100vh - 64px)' }}
    >
      {/* ── Üst Durum Barı ────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-2.5 flex-shrink-0 gap-4"
        style={{
          background: 'rgba(10, 15, 26, 0.97)',
          borderBottom: '1px solid #2d3748',
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <a
            href="/dersler"
            className="text-yazi-iki hover:text-cyan transition-colors text-sm flex-shrink-0"
            aria-label="Haritaya dön"
          >
            ← Harita
          </a>
          <span className="text-yazi-soluk text-sm">|</span>
          <span className="pixel-xs text-cyan flex-shrink-0">
            B{bolumNo}.G{gorevNo}
          </span>
          <span className="text-xs font-semibold text-yazi truncate hidden sm:inline">
            {gorev.baslik}
          </span>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden md:flex items-center gap-2">
            <div className="w-32 bg-terminal rounded-full h-2 overflow-hidden border border-sinir">
              <div
                className="bg-cyan h-full transition-all duration-300"
                style={{ width: `${xpYuzde}%` }}
              />
            </div>
            <span className="pixel-xs text-yazi-soluk">
              {durum.xp} XP
            </span>
          </div>

          <a
            href="/dersler"
            className="btn-yesil text-xs px-3 py-1.5 flex items-center gap-1"
          >
            <span>Sonraki</span>
            <span>→</span>
          </a>
        </div>
      </div>

      {/* ── ANA OYUN (SADECE VOXEL) ───────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative w-full h-full">
        {mounted && (
          <VoxelAIBuilder
            gorevBaslik={gorev.baslik}
            gorevNo={`B${bolumNo}.G${gorevNo}`}
            gorevId={id}
            onBolumTamamlandi={(kazanilanXp) => gorevTamamlaHandler(kazanilanXp)}
          />
        )}
      </div>

      {/* Toast Bilgilendirme */}
      {toastBilgi && (
        <Toast
          ikon={toastBilgi.ikon}
          baslik={toastBilgi.baslik}
          aciklama={toastBilgi.aciklama}
          tip="basari"
        />
      )}

      {/* Seviye Atlama Modalı */}
      {seviyeAtladi && (
        <SeviyeAtlamaModali
          yeniSeviye={durum.seviye}
          onKapat={() => {}}
        />
      )}
    </div>
  )
}
