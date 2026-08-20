'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

interface EnchantedForestEngineProps {
  gorevBaslik: string
  gorevNo: string
  onBulmacaCozuldu: () => void
}

export default function EnchantedForestEngine({
  gorevBaslik,
  gorevNo,
  onBulmacaCozuldu,
}: EnchantedForestEngineProps) {
  const [mounted, setMounted] = useState(false)
  const [posX, setPosX] = useState(2)
  const [posY, setPosY] = useState(3)
  const [aktifModal, setAktifModal] = useState<number | null>(null)
  const [kesfedilenler, setKesfedilenler] = useState<number[]>([])

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animFrameRef = useRef<number | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Klavye Kontrolleri (Sakin, Rahat Hareket)
  useEffect(() => {
    if (!mounted) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (aktifModal !== null) return

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        setPosY((prev) => Math.max(0, prev - 1))
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        setPosY((prev) => Math.min(4, prev + 1))
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setPosX((prev) => Math.max(0, prev - 1))
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setPosX((prev) => Math.min(4, prev + 1))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [aktifModal, mounted])

  // Obje Etkileşim Kontrolü
  useEffect(() => {
    if (!mounted) return
    // Checkpoint 1: Sihirli Mantar (x:1, y:1)
    if (posX === 1 && posY === 1 && !kesfedilenler.includes(1)) {
      setAktifModal(1)
    }
    // Checkpoint 2: Kadim Rün Taşı (x:3, y:1)
    else if (posX === 3 && posY === 1 && !kesfedilenler.includes(2)) {
      setAktifModal(2)
    }
    // Checkpoint 3: NEXUS Kalesi Kapısı (x:2, y:4)
    else if (posX === 2 && posY === 4 && !kesfedilenler.includes(3)) {
      setAktifModal(3)
    }
  }, [posX, posY, kesfedilenler, mounted])

  // BÜYÜLÜ ORMAN CANLI CANVAS MOTORU (STABİL KAMERA, GÖZ YORMAYAN İLGi ÇEKİCİ GÖRSELLER)
  useEffect(() => {
    if (!mounted) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let tick = 0

    const render = () => {
      tick += 0.04
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 1. Sıcak Büyülü Orman Arka Planı (Sıcak Zümrüt Yeşil & Gün Batımı Işığı)
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height)
      bgGrad.addColorStop(0, '#064e3b') // Zümrüt Yeşili Orman
      bgGrad.addColorStop(0.5, '#047857')
      bgGrad.addColorStop(1, '#022c22')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const tileW = 68
      const tileH = 36
      const originX = canvas.width / 2
      const originY = 60

      // 2. 5x5 Izometrik Büyülü Çim Karoları
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          const isoX = originX + (c - r) * (tileW / 2)
          const isoY = originY + (c + r) * (tileH / 2)

          // Karo 3D Yüzey Derinliği
          ctx.beginPath()
          ctx.moveTo(isoX - tileW / 2, isoY + tileH / 2)
          ctx.lineTo(isoX, isoY + tileH)
          ctx.lineTo(isoX, isoY + tileH + 12)
          ctx.lineTo(isoX - tileW / 2, isoY + tileH / 2 + 12)
          ctx.closePath()
          ctx.fillStyle = '#064e3b'
          ctx.fill()

          ctx.beginPath()
          ctx.moveTo(isoX, isoY + tileH)
          ctx.lineTo(isoX + tileW / 2, isoY + tileH / 2)
          ctx.lineTo(isoX + tileW / 2, isoY + tileH / 2 + 12)
          ctx.lineTo(isoX, isoY + tileH + 12)
          ctx.closePath()
          ctx.fillStyle = '#022c22'
          ctx.fill()

          // Çim Üst Yüzeyi
          ctx.beginPath()
          ctx.moveTo(isoX, isoY)
          ctx.lineTo(isoX + tileW / 2, isoY + tileH / 2)
          ctx.lineTo(isoX, isoY + tileH)
          ctx.lineTo(isoX - tileW / 2, isoY + tileH / 2)
          ctx.closePath()

          const topGrad = ctx.createLinearGradient(isoX - tileW / 2, isoY, isoX + tileW / 2, isoY + tileH)
          if ((r + c) % 2 === 0) {
            topGrad.addColorStop(0, '#10b981')
            topGrad.addColorStop(1, '#059669')
          } else {
            topGrad.addColorStop(0, '#059669')
            topGrad.addColorStop(1, '#047857')
          }
          ctx.fillStyle = topGrad
          ctx.fill()

          ctx.strokeStyle = 'rgba(52, 211, 153, 0.4)'
          ctx.lineWidth = 1
          ctx.stroke()

          // 3. Etkileşim Objeleri
          
          // Checkpoint 1: Büyülü Işıltılı Mantar (x:1, y:1)
          if (c === 1 && r === 1) {
            const floatY = Math.sin(tick * 2) * 3
            ctx.shadowColor = '#f59e0b'
            ctx.shadowBlur = 15
            ctx.fillStyle = kesfedilenler.includes(1) ? '#34d399' : '#fbbf24'
            ctx.beginPath()
            ctx.arc(isoX, isoY + 4 + floatY, 12, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = '#ffffff'
            ctx.font = '14px sans-serif'
            ctx.fillText('🍄', isoX - 8, isoY + 9 + floatY)
            ctx.shadowBlur = 0
          }

          // Checkpoint 2: Kadim Rün Taşı (x:3, y:1)
          else if (c === 3 && r === 1) {
            const floatY = Math.sin(tick * 2.5) * 3
            ctx.shadowColor = '#a855f7'
            ctx.shadowBlur = 15
            ctx.fillStyle = kesfedilenler.includes(2) ? '#34d399' : '#c084fc'
            ctx.beginPath()
            ctx.arc(isoX, isoY + 4 + floatY, 12, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = '#ffffff'
            ctx.font = '14px sans-serif'
            ctx.fillText('🗿', isoX - 8, isoY + 9 + floatY)
            ctx.shadowBlur = 0
          }

          // Checkpoint 3: NEXUS Şato Kapısı (x:2, y:4)
          else if (c === 2 && r === 4) {
            const pulse = Math.sin(tick * 3) * 4
            ctx.shadowColor = '#38bdf8'
            ctx.shadowBlur = 20 + pulse
            ctx.fillStyle = kesfedilenler.includes(3) ? '#34d399' : '#38bdf8'
            ctx.beginPath()
            ctx.arc(isoX, isoY + 6, 16, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = '#ffffff'
            ctx.font = '16px sans-serif'
            ctx.fillText('🏰', isoX - 10, isoY + 12)
            ctx.shadowBlur = 0
          }
        }
      }

      // 4. Havada Süzülen Büyülü Orman Ateş Böcekleri (Fireflies)
      for (let i = 0; i < 8; i++) {
        const fx = (Math.sin(tick + i) * 0.4 + 0.5) * canvas.width
        const fy = (Math.cos(tick * 0.8 + i) * 0.4 + 0.5) * canvas.height
        ctx.fillStyle = '#fef08a'
        ctx.shadowColor = '#fef08a'
        ctx.shadowBlur = 8
        ctx.beginPath()
        ctx.arc(fx, fy, 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // 5. KAPÜŞONLU SEVİMLİ ROBOT NEX AVATARI
      const charIsoX = originX + (posX - posY) * (tileW / 2)
      const charIsoY = originY + (posX + posY) * (tileH / 2)

      // Zemin Taban Yumuşak Gölge
      ctx.beginPath()
      ctx.ellipse(charIsoX, charIsoY + 16, 15, 7, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
      ctx.fill()

      // Sevimli NEX Robot Halesi
      ctx.shadowColor = '#34d399'
      ctx.shadowBlur = 15
      ctx.fillStyle = 'rgba(52, 211, 153, 0.3)'
      ctx.beginPath()
      ctx.arc(charIsoX, charIsoY + 4, 15, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      // Kapüşonlu NEX Robot
      ctx.fillStyle = '#ffffff'
      ctx.font = '24px sans-serif'
      ctx.fillText('🤖', charIsoX - 12, charIsoY + 12)

      animFrameRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [posX, posY, kesfedilenler, mounted])

  const modalKapat = (id: number) => {
    if (!kesfedilenler.includes(id)) {
      setKesfedilenler([...kesfedilenler, id])
    }
    setAktifModal(null)
    if (id === 3) {
      onBulmacaCozuldu()
    }
  }

  if (!mounted) return null

  return (
    <div className="w-full flex flex-col bg-arka border-r border-sinir h-full overflow-hidden relative">
      
      {/* ── ÜST BAR ──────────────────────────────────────────────────────── */}
      <div className="px-4 py-2.5 bg-terminal border-b border-sinir flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="pixel-xs text-yesil">🌲 BÜYÜLÜ AI ORMANI DÜNYASI</span>
          <span className="text-xs text-yazi-soluk">·</span>
          <span className="text-xs font-bold text-yazi">{gorevNo} — {gorevBaslik}</span>
        </div>
        <span className="pixel-xs text-altin">
          KEŞİF: {kesfedilenler.length} / 3 İPUCU
        </span>
      </div>

      {/* ── BÜYÜLÜ ORMAN CANLI CANVAS SAHNESİ ───────────────────────────── */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#064e3b] via-[#047857] to-[#022c22]">
        
        {/* Yönlendirme Barı */}
        <div className="absolute top-3 left-3 bg-terminal/95 border border-yesil/40 px-3 py-1.5 rounded-lg text-xs font-kod text-yesil z-10 shadow-glow-yesil flex items-center gap-2">
          <span>🤖 NEXİ YÜRÜT:</span>
          <span className="text-yazi font-medium">Klavyedeki Ok Tuşları veya WASD ile Büyülü Mantara Yürü!</span>
        </div>

        <canvas
          ref={canvasRef}
          width={420}
          height={300}
          className="rounded-2xl border-2 border-yesil/50 shadow-2xl bg-black/40"
        />

        {/* Mobil Yön Tuşları */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col items-center gap-1 bg-terminal/80 p-2 rounded-xl border border-sinir backdrop-blur-md">
          <button
            onClick={() => setPosY((prev) => Math.max(0, prev - 1))}
            className="w-10 h-8 bg-kart border border-yesil/50 rounded-lg font-bold text-xs text-yesil active:scale-95 shadow-glow-yesil"
          >
            ▲
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setPosX((prev) => Math.max(0, prev - 1))}
              className="w-10 h-8 bg-kart border border-yesil/50 rounded-lg font-bold text-xs text-yesil active:scale-95 shadow-glow-yesil"
            >
              ◀
            </button>
            <button
              onClick={() => setPosY((prev) => Math.min(4, prev + 1))}
              className="w-10 h-8 bg-kart border border-yesil/50 rounded-lg font-bold text-xs text-yesil active:scale-95 shadow-glow-yesil"
            >
              ▼
            </button>
            <button
              onClick={() => setPosX((prev) => Math.min(4, prev + 1))}
              className="w-10 h-8 bg-kart border border-yesil/50 rounded-lg font-bold text-xs text-yesil active:scale-95 shadow-glow-yesil"
            >
              ▶
            </button>
          </div>
        </div>

      </div>

      {/* ── İNTERAKTİF BÜYÜLÜ İPUCU MODALLARI ─────────────────────────────── */}
      {aktifModal === 1 && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-scale-in">
          <div className="bg-terminal border-2 border-altin rounded-2xl p-5 max-w-sm w-full flex flex-col gap-3 shadow-glow-altin">
            <div className="flex items-center gap-2 text-altin font-bold text-sm">
              <span>🍄 1. SİHİRLİ HAFIZA MANTARINI BULDUN!</span>
            </div>
            <p className="text-xs text-yazi leading-relaxed font-ui">
              <strong>Sevimli NEX Robot:</strong><br />
              "Bip bop! Bu mantar bana hafızamı hatırlattı! Yapay zeka tek bir resimle öğrenmez. İnsanlar ona milyonlarca kedi ve doğa resmi gösterir!"
            </p>
            <button
              onClick={() => modalKapat(1)}
              className="btn-altin text-xs py-2 font-bold shadow-glow-altin"
            >
              💡 İpucunu Anladım, Devam Et!
            </button>
          </div>
        </div>
      )}

      {aktifModal === 2 && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-scale-in">
          <div className="bg-terminal border-2 border-mor rounded-2xl p-5 max-w-sm w-full flex flex-col gap-3 shadow-glow-mor">
            <div className="flex items-center gap-2 text-mor font-bold text-sm">
              <span>🗿 2. KADİM RÜN TAŞINI BULDUN!</span>
            </div>
            <p className="text-xs text-yazi leading-relaxed font-ui">
              <strong>Sevimli NEX Robot:</strong><br />
              "Rün taşındaki şifre çözüldü! Yapay zeka verileri inceleyip kulak ve bıyık kalıplarını bulur. Kalıp öğrenmek yapay zekanın en büyük gücüdür!"
            </p>
            <button
              onClick={() => modalKapat(2)}
              className="btn-mor text-xs py-2 font-bold shadow-glow-mor"
            >
              🧠 Şifreyi Kavradım, Şato Kapısına Git!
            </button>
          </div>
        </div>
      )}

      {aktifModal === 3 && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-scale-in">
          <div className="bg-terminal border-2 border-yesil rounded-2xl p-5 max-w-sm w-full flex flex-col gap-3 shadow-glow-yesil">
            <div className="flex items-center gap-2 text-yesil font-bold text-sm">
              <span>🏰 NEXUS ŞATO KAPISINA ULAŞTIN!</span>
            </div>
            <p className="text-xs text-yazi leading-relaxed font-ui">
              Harika bilge kaşif! Mantardaki ve Rün Taşındaki 2 ipucunu topladın! Şimdi sağ taraftaki yapboz alanında öğrendiğin promptu birleştir ve şatonun kapısını aç!
            </p>
            <button
              onClick={() => modalKapat(3)}
              className="btn-yesil text-xs py-2 font-bold shadow-glow-yesil"
            >
              🔑 Şatoyu Kurtarmak İçin Prompt Yaz!
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
