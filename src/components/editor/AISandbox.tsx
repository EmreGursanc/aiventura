'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { Gorev } from '@/types'
import { promptDegerlendir, yanitSimule } from '@/lib/degerlendirici'
import { useSes } from '@/hooks/useSes'
import DragDropPromptPuzzle from '@/components/game/DragDropPromptPuzzle'
import AIBrainVisualizer from '@/components/game/AIBrainVisualizer'

interface SandboxProps {
  gorev: Gorev
  onBasari: (kazanilanXP: number) => void
}

type KonsolDurumu = 'bosta' | 'isleniyor' | 'basarili' | 'hata'

interface KonsolCiktisi {
  tip: 'system' | 'ai' | 'hata'
  metin: string
}

export default function AISandbox({ gorev, onBasari }: SandboxProps) {
  const [prompt, setPrompt] = useState('')
  const [konsolDurumu, setKonsolDurumu] = useState<KonsolDurumu>('bosta')
  const [konsolCiktisi, setKonsolCiktisi] = useState<KonsolCiktisi | null>(null)
  const [tamamlandi, setTamamlandi] = useState(false)
  const [tokenSayisi, setTokenSayisi] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const konsolRef = useRef<HTMLDivElement>(null)
  const { tiklamaClick, zaferFanfari, hataSesi } = useSes()

  // Token sayacı (yaklaşık: 1 token ≈ 4 karakter)
  useEffect(() => {
    setTokenSayisi(Math.ceil(prompt.length / 4))
  }, [prompt])

  // Konsol en alta kayar
  useEffect(() => {
    if (konsolRef.current) {
      konsolRef.current.scrollTop = konsolRef.current.scrollHeight
    }
  }, [konsolCiktisi])

  const promptGonder = useCallback(async () => {
    if (!prompt.trim() || konsolDurumu === 'isleniyor' || tamamlandi) return

    setKonsolDurumu('isleniyor')
    setKonsolCiktisi({ tip: 'system', metin: '⚡ Akıllı AI Motoru promptu değerlendiriyor...' })

    try {
      const res = await fetch('/api/degerlendir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          gorevBaslik: gorev.baslik,
          gorevHedef: gorev.hedef,
          gorevId: gorev.id,
          zorunluKelimeler: gorev.dogrulama?.zorunluKelimeler || [],
        }),
      })

      const data = await res.json()

      if (!data.basarili) {
        setKonsolDurumu('hata')
        setKonsolCiktisi({ tip: 'hata', metin: data.mesaj || 'Prompt kriterleri karşılamadı.' })
        hataSesi() // 🔊 Hata sesi
        return
      }

      // ✅ Başarılı — AI yanıtını typewriter ile yaz
      setKonsolDurumu('isleniyor')
      setKonsolCiktisi({ tip: 'system', metin: '' })

      const hedefMetin = data.simuleYanit || gorev.yanitSimulasyonu
      let tumMetin = ''
      for await (const parcaMetin of yanitSimule(hedefMetin)) {
        tumMetin = parcaMetin
        setKonsolCiktisi({ tip: 'ai', metin: tumMetin })
      }

      // Tamamlandı!
      setKonsolDurumu('basarili')
      setTamamlandi(true)
      zaferFanfari() // 🎵 Zafer fanfarı!
      onBasari(gorev.xpOdul)
    } catch (error) {
      setKonsolDurumu('hata')
      setKonsolCiktisi({ tip: 'hata', metin: 'Değerlendirme servisine ulaşılamadı.' })
      hataSesi()
    }
  }, [prompt, konsolDurumu, tamamlandi, gorev, onBasari, hataSesi, zaferFanfari])

  // Ctrl+Enter ile gönder
  useEffect(() => {
    function keyHandler(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        promptGonder()
      }
    }
    window.addEventListener('keydown', keyHandler)
    return () => window.removeEventListener('keydown', keyHandler)
  }, [promptGonder])

  const tekrarDene = () => {
    setKonsolDurumu('bosta')
    setKonsolCiktisi(null)
    setPrompt('')
    textareaRef.current?.focus()
  }

  const [puzzleModu, setPuzzleModu] = useState(false)

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* ── Editör Başlık Barı ──────────────────────────────────────────── */}
      <div className="terminal-baslik flex-shrink-0 flex items-center justify-between px-4 py-2 bg-terminal border-b border-sinir">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="terminal-nokta bg-[#ff5f56]" />
            <span className="terminal-nokta bg-[#ffbd2e]" />
            <span className="terminal-nokta bg-[#27c93f]" />
          </div>
          <span className="pixel-xs text-cyan ml-2">🚀 PROMPT EDİTÖRÜ</span>
        </div>

        {/* Çocuklar İçin Yapboz Editörü Aç/Kapat Butonu */}
        {gorev.id.startsWith('c-') && (
          <button
            onClick={() => setPuzzleModu(!puzzleModu)}
            className="px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5"
            style={{
              background: puzzleModu ? 'rgba(16,185,129,0.2)' : 'rgba(6,182,212,0.15)',
              border: `1px solid ${puzzleModu ? '#10B981' : '#06B6D4'}`,
              color: puzzleModu ? '#10B981' : '#06B6D4',
            }}
          >
            <span>{puzzleModu ? '⌨️ Klavyeye Geç' : '🧩 Yapboz Blokları Modu'}</span>
          </button>
        )}
      </div>

      {/* 🗺️ ÇOCUKLAR İÇİN ADIM 2 REHBER BARI */}
      <div className="px-4 py-2 bg-cyan-dim border-b border-cyan/30 text-cyan text-xs font-bold flex items-center gap-2">
        <span>👉 ADIM 2:</span>
        <span className="text-yazi font-medium">
          {puzzleModu
            ? 'Aşağıdaki renkli yapboz bloklarına tıklayarak sihirli komutunu oluştur!'
            : 'Sol taraftaki soruya verdiğin yanıtı aşağıdaki kutuya kendi cümlelerinle yaz!'}
        </span>
      </div>

      {/* ── Prompt Editörü ───────────────────────────────────────────────── */}
      {puzzleModu ? (
        <div className="p-4 bg-arka/90 overflow-y-auto">
          <DragDropPromptPuzzle
            bloklar={gorev.yapbozBloklari}
            onPromptOlustur={(tamPrompt) => setPrompt(tamPrompt)}
            disabled={tamamlandi || konsolDurumu === 'isleniyor'}
          />
        </div>
      ) : (
        <div
          className="flex-1 relative overflow-hidden"
          style={{ minHeight: '220px', maxHeight: '45%' }}
        >
        {/* Satır numaraları */}
        <div
          className="absolute left-0 top-0 bottom-0 w-10 flex flex-col pt-4 pb-2 gap-0 select-none"
          style={{
            background: 'rgba(5, 8, 15, 0.6)',
            borderRight: '1px solid #1e293b',
          }}
        >
          {Array.from({ length: Math.max(8, prompt.split('\n').length + 2) }).map(
            (_, i) => (
              <div
                key={i}
                className="text-right pr-2.5 text-[11px] font-kod leading-6"
                style={{ color: '#4b5563', lineHeight: '24px' }}
              >
                {i + 1}
              </div>
            )
          )}
        </div>

        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => !tamamlandi && setPrompt(e.target.value)}
          disabled={tamamlandi || konsolDurumu === 'isleniyor'}
          placeholder={
            tamamlandi
              ? '✅ Görev başarıyla tamamlandı!'
              : '✍️ Yanıtını buraya kendi cümlelerinle yaz...\n\nÖrnek: "Yapay zeka binlerce kedi fotoğrafına bakarak kedileri tanımayı öğrenir."'
          }
          className="absolute inset-0 resize-none font-kod text-sm text-yazi leading-6 outline-none"
          style={{
            background: 'rgba(5, 8, 15, 0.85)',
            paddingLeft: '48px',
            paddingTop: '16px',
            paddingRight: '16px',
            paddingBottom: '16px',
            caretColor: '#10B981',
            color: tamamlandi ? '#4b5563' : '#f1f5f9',
          }}
          spellCheck={false}
          autoComplete="off"
          id="prompt-input"
          aria-label="Prompt giriş alanı"
        />
        </div>
      )}

      {/* ── Gönder Butonu Alanı ─────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0 gap-3"
        style={{
          background: 'rgba(10, 15, 26, 0.95)',
          borderTop: '1px solid #1e293b',
          borderBottom: '1px solid #1e293b',
        }}
      >
        <div className="flex items-center gap-2 text-[11px] text-yazi-soluk">
          <kbd className="px-1.5 py-0.5 rounded text-[10px] bg-kart border border-sinir font-kod">
            Ctrl
          </kbd>
          <span>+</span>
          <kbd className="px-1.5 py-0.5 rounded text-[10px] bg-kart border border-sinir font-kod">
            Enter
          </kbd>
          <span className="hidden sm:inline">ile gönder</span>
        </div>

        <div className="flex items-center gap-2">
          {tamamlandi && (
            <button
              onClick={tekrarDene}
              className="btn-hayalet text-xs px-3 py-1.5"
              id="btn-tekrar"
            >
              🔄 Tekrar
            </button>
          )}
          <button
            id="btn-gonder"
            onClick={() => { tiklamaClick(); promptGonder() }}
            disabled={!prompt.trim() || konsolDurumu === 'isleniyor' || tamamlandi}
            className="btn-yesil text-xs px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            style={tamamlandi ? { background: '#065f46', boxShadow: 'none' } : {}}
          >
            {konsolDurumu === 'isleniyor' ? (
              <span className="flex items-center gap-2">
                <LoadingSpinner />
                İşleniyor...
              </span>
            ) : tamamlandi ? (
              '✅ Tamamlandı'
            ) : (
              '🚀 Promptu Gönder'
            )}
          </button>
        </div>
      </div>

      {/* ── Çıktı Konsolu ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ minHeight: '180px' }}>
        
        {/* 🧠 GÖRSEL AI NÖRON AĞI İŞLEME SİMÜLATÖRÜ */}
        {konsolDurumu === 'isleniyor' && gorev.id.startsWith('c-') && (
          <div className="p-3">
            <AIBrainVisualizer
              promptMetni={prompt}
              onIslemTamam={() => {}}
            />
          </div>
        )}

        <div
          className="px-3 py-2 text-[10px] font-kod flex items-center gap-2 flex-shrink-0"
          style={{
            background: 'rgba(5, 8, 15, 0.9)',
            borderBottom: '1px solid #1e293b',
            color: '#4b5563',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background:
                konsolDurumu === 'basarili'
                  ? '#10B981'
                  : konsolDurumu === 'hata'
                  ? '#F43F5E'
                  : konsolDurumu === 'isleniyor'
                  ? '#F59E0B'
                  : '#4b5563',
              boxShadow:
                konsolDurumu === 'isleniyor'
                  ? '0 0 6px #F59E0B'
                  : 'none',
            }}
          />
          {konsolDurumu === 'bosta' && 'KONSOL — hazır'}
          {konsolDurumu === 'isleniyor' && 'KONSOL — işleniyor...'}
          {konsolDurumu === 'basarili' && 'KONSOL — başarılı ✓'}
          {konsolDurumu === 'hata' && 'KONSOL — hata'}
        </div>

        <div
          ref={konsolRef}
          className="flex-1 overflow-y-auto p-4 font-kod text-sm leading-relaxed"
          style={{ background: 'rgba(5, 8, 15, 0.7)' }}
        >
          {!konsolCiktisi && (
            <div className="text-yazi-soluk text-xs">
              <span style={{ color: '#10B981' }}>{'>'}</span>{' '}
              Promptunu yazıp gönder. Yanıt burada görünecek.
            </div>
          )}

          {konsolCiktisi && konsolCiktisi.tip === 'system' && (
            <div className="text-yazi-soluk text-xs flex items-center gap-2">
              <LoadingSpinner />
              {konsolCiktisi.metin || 'İşleniyor...'}
            </div>
          )}

          {konsolCiktisi && konsolCiktisi.tip === 'hata' && (
            <div
              className="rounded-lg p-4"
              style={{
                background: 'rgba(244,63,94,0.06)',
                border: '1px solid rgba(244,63,94,0.25)',
              }}
            >
              <div
                className="text-xs font-bold mb-2 uppercase tracking-wider"
                style={{ color: '#F43F5E' }}
              >
                ✗ PROMPT HATASI
              </div>
              <div
                className="text-sm text-yazi-iki leading-relaxed"
                dangerouslySetInnerHTML={{ __html: konsolCiktisi.metin }}
              />
            </div>
          )}

          {konsolCiktisi && konsolCiktisi.tip === 'ai' && (
            <div
              className="rounded-lg p-4"
              style={{
                background: 'rgba(16,185,129,0.04)',
                border: '1px solid rgba(16,185,129,0.2)',
              }}
            >
              <div
                className="text-xs font-bold mb-2 uppercase tracking-wider flex items-center gap-2"
                style={{ color: '#10B981' }}
              >
                <span>👾</span>
                <span>NEX YANITI</span>
              </div>
              <p className="text-sm text-yazi leading-relaxed">
                {konsolCiktisi.metin}
                {konsolDurumu === 'isleniyor' && (
                  <span
                    className="inline-block w-0.5 h-4 ml-0.5 align-middle animate-parlama"
                    style={{ background: '#10B981' }}
                  />
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Küçük Loading Spinner ──────────────────────────────────────────────────
function LoadingSpinner() {
  return (
    <svg
      className="animate-spin"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      style={{ color: '#F59E0B' }}
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  )
}
