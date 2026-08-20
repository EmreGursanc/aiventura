'use client'

import { useState } from 'react'
import type { YapbozBlok } from '@/types'

const VARSAYILAN_BLOKLAR: YapbozBlok[] = [
  { id: 'b1', kategori: 'konu', metin: 'Yapay Zeka', renk: '#06B6D4' },
  { id: 'b2', kategori: 'eylem', metin: 'binlerce kedi fotoğrafına bakarak', renk: '#10B981' },
  { id: 'b3', kategori: 'eylem', metin: 'kalıpları ve özellikleri öğrenir', renk: '#10B981' },
  { id: 'b4', kategori: 'stil', metin: 've kedileri tanımayı başarır', renk: '#8B5CF6' },
]

interface DragDropPromptPuzzleProps {
  bloklar?: YapbozBlok[]
  onPromptOlustur: (tamPrompt: string) => void
  disabled?: boolean
}

export default function DragDropPromptPuzzle({
  bloklar = VARSAYILAN_BLOKLAR,
  onPromptOlustur,
  disabled = false,
}: DragDropPromptPuzzleProps) {
  const [seciliBloklar, setSeciliBloklar] = useState<YapbozBlok[]>([])

  const blokEkle = (blok: YapbozBlok) => {
    if (disabled) return
    if (!seciliBloklar.some((b) => b.id === blok.id)) {
      const yeni = [...seciliBloklar, blok]
      setSeciliBloklar(yeni)
      guncellePrompt(yeni)
    }
  }

  const blokCikar = (id: string) => {
    if (disabled) return
    const yeni = seciliBloklar.filter((b) => b.id !== id)
    setSeciliBloklar(yeni)
    guncellePrompt(yeni)
  }

  const guncellePrompt = (yeniBloklar: YapbozBlok[]) => {
    const metin = yeniBloklar.map((b) => b.metin).join(' ')
    onPromptOlustur(metin)
  }

  const olusturulanPrompt = seciliBloklar.map((b) => b.metin).join(' ')

  return (
    <div className="flex flex-col gap-4 p-4 bg-terminal/90 border border-sinir rounded-xl">
      
      {/* Velilere Yönelik Teknik Bilgi Rozeti */}
      <div className="flex items-center justify-between text-[11px] font-kod text-yazi-soluk pb-2 border-b border-sinir">
        <span className="text-cyan font-bold">🧩 DİNAMİK GÖREV YAPBOZ EDİTÖRÜ</span>
        <span className="px-2 py-0.5 rounded bg-cyan-dim border border-cyan/30 text-cyan text-[10px]">
          Göreve Özel Yapboz Blokları
        </span>
      </div>

      {/* ── 1. Oluşturulan Cümle / Yapboz Yuvası ─────────────────────────── */}
      <div className="p-3.5 min-h-[80px] bg-input border-2 border-dashed border-cyan/40 rounded-xl flex flex-wrap items-center gap-2">
        {seciliBloklar.length === 0 ? (
          <span className="text-xs text-yazi-soluk italic">
            👉 Aşağıdaki göreve özel renkli bloklara tıklayarak sihirli cümleni oluştur...
          </span>
        ) : (
          seciliBloklar.map((blok) => (
            <button
              key={blok.id}
              onClick={() => blokCikar(blok.id)}
              disabled={disabled}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-2 transition-all hover:scale-105 shadow-md"
              style={{ background: blok.renk }}
              title="Çıkarmak için tıkla"
            >
              <span>{blok.metin}</span>
              <span className="text-[10px] bg-black/30 px-1 rounded">✕</span>
            </button>
          ))
        )}
      </div>

      {/* ── 2. Canlı Prompt Çıktı Önizleme ─────────────────────────────── */}
      <div className="p-3 bg-arka/90 rounded-lg border border-sinir font-kod text-xs text-yesil flex items-center justify-between shadow-inner">
        <span className="truncate font-semibold">"{olusturulanPrompt || '...'}"</span>
        <span className="text-[10px] text-yazi-soluk flex-shrink-0 ml-2 font-ui">
          {seciliBloklar.length} Blok Birlestirildi
        </span>
      </div>

      {/* ── 3. Göreve Özel Blok Kütüphanesi ───────────────────────────────── */}
      <div className="flex flex-col gap-2 pt-1">
        <div className="text-[10px] font-bold text-yazi-soluk uppercase tracking-wider">
          Bu Görev İçin Sihirli Bloklar (Ekmek İçin Tıkla):
        </div>
        <div className="flex flex-wrap gap-2">
          {bloklar.map((blok) => {
            const secili = seciliBloklar.some((b) => b.id === blok.id)
            return (
              <button
                key={blok.id}
                onClick={() => blokEkle(blok)}
                disabled={disabled || secili}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all shadow-sm"
                style={{
                  background: secili ? 'rgba(30,41,59,0.5)' : `${blok.renk}20`,
                  borderColor: secili ? '#334155' : `${blok.renk}80`,
                  color: secili ? '#64748b' : '#f8fafc',
                  opacity: secili ? 0.4 : 1,
                  cursor: secili ? 'not-allowed' : 'pointer',
                  transform: secili ? 'none' : 'scale(1)',
                }}
              >
                + {blok.metin}
              </button>
            )
          })}
        </div>
      </div>

    </div>
  )
}
