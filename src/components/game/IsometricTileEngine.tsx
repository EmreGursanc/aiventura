'use client'

import { useState, useEffect, useRef } from 'react'

interface IsometricTileEngineProps {
  gorevBaslik: string
  gorevNo: string
  onBulmacaCozuldu: () => void
}

export default function IsometricTileEngine({
  gorevBaslik,
  gorevNo,
  onBulmacaCozuldu,
}: IsometricTileEngineProps) {
  const [posX, setPosX] = useState(2)
  const [posY, setPosY] = useState(2)
  const [aktifBulmaca, setAktifBulmaca] = useState<number | null>(null)
  const [kesfedilenler, setKesfedilenler] = useState<number[]>([])

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animFrameRef = useRef<number | null>(null)

  // Klavye Kontrolleri
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (aktifBulmaca !== null) return

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
  }, [aktifBulmaca])

  // Etkileşim Kontrolü
  useEffect(() => {
    if (posX === 1 && posY === 1 && !kesfedilenler.includes(1)) {
      setAktifBulmaca(1)
    } else if (posX === 3 && posY === 1 && !kesfedilenler.includes(2)) {
      setAktifBulmaca(2)
    } else if (posX === 2 && posY === 4 && !kesfedilenler.includes(3)) {
      setAktifBulmaca(3)
    }
  }, [posX, posY, kesfedilenler])

  // HIGH-END 2.5D ISOMETRIC GRAPHICS & ANIMATION ENGINE (60 FPS)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let tick = 0

    const render = () => {
      tick += 0.05
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Arka plan derin uzay gradyanı
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height)
      bgGrad.addColorStop(0, '#050814')
      bgGrad.addColorStop(0.5, '#0f172a')
      bgGrad.addColorStop(1, '#1e1b4b')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const tileW = 64
      const tileH = 32
      const blockDepth = 14
      const originX = canvas.width / 2
      const originY = 50

      // 5x5 Yüksek Kaliteli 3D Derinlikli Izometrik Karolar
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          const isoX = originX + (c - r) * (tileW / 2)
          const isoY = originY + (c + r) * (tileH / 2)

          // 1. Karoların 3D Yan Yüzeyi (Derinlik Efekti)
          ctx.beginPath()
          ctx.moveTo(isoX - tileW / 2, isoY + tileH / 2)
          ctx.lineTo(isoX, isoY + tileH)
          ctx.lineTo(isoX, isoY + tileH + blockDepth)
          ctx.lineTo(isoX - tileW / 2, isoY + tileH / 2 + blockDepth)
          ctx.closePath()
          ctx.fillStyle = '#090d16'
          ctx.fill()

          ctx.beginPath()
          ctx.moveTo(isoX, isoY + tileH)
          ctx.lineTo(isoX + tileW / 2, isoY + tileH / 2)
          ctx.lineTo(isoX + tileW / 2, isoY + tileH / 2 + blockDepth)
          ctx.lineTo(isoX, isoY + tileH + blockDepth)
          ctx.closePath()
          ctx.fillStyle = '#1e293b'
          ctx.fill()

          // 2. Karoların Üst Yüzeyi (Gradyanlı Taş Doku)
          ctx.beginPath()
          ctx.moveTo(isoX, isoY)
          ctx.lineTo(isoX + tileW / 2, isoY + tileH / 2)
          ctx.lineTo(isoX, isoY + tileH)
          ctx.lineTo(isoX - tileW / 2, isoY + tileH / 2)
          ctx.closePath()

          const topGrad = ctx.createLinearGradient(
            isoX - tileW / 2,
            isoY,
            isoX + tileW / 2,
            isoY + tileH
          )
          if ((r + c) % 2 === 0) {
            topGrad.addColorStop(0, '#334155')
            topGrad.addColorStop(1, '#1e293b')
          } else {
            topGrad.addColorStop(0, '#1e293b')
            topGrad.addColorStop(1, '#0f172a')
          }
          ctx.fillStyle = topGrad
          ctx.fill()

          ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)'
          ctx.lineWidth = 1
          ctx.stroke()

          // 3. Özel Etkileşim Objeleri & Işık Animasyonları
          
          // Checkpoint 1: Hafıza Sandığı (x:1, y:1)
          if (c === 1 && r === 1) {
            const hoverY = Math.sin(tick * 2) * 3
            ctx.shadowColor = '#F59E0B'
            ctx.shadowBlur = 15
            ctx.fillStyle = kesfedilenler.includes(1) ? '#10B981' : '#F59E0B'
            ctx.fillRect(isoX - 10, isoY + 2 + hoverY, 20, 14)
            ctx.fillStyle = '#FFD700'
            ctx.fillRect(isoX - 3, isoY + 6 + hoverY, 6, 6)
            ctx.shadowBlur = 0
          }

          // Checkpoint 2: Kalıp Aynası / Kristal (x:3, y:1)
          else if (c === 3 && r === 1) {
            const floatY = Math.sin(tick * 3) * 4
            ctx.shadowColor = '#8B5CF6'
            ctx.shadowBlur = 20
            ctx.beginPath()
            ctx.moveTo(isoX, isoY - 10 + floatY)
            ctx.lineTo(isoX + 10, isoY + 5 + floatY)
            ctx.lineTo(isoX, isoY + 18 + floatY)
            ctx.lineTo(isoX - 10, isoY + 5 + floatY)
            ctx.closePath()
            ctx.fillStyle = kesfedilenler.includes(2) ? '#10B981' : '#A78BFA'
            ctx.fill()
            ctx.shadowBlur = 0
          }

          // Checkpoint 3: Nexus Kalesi Kapısı & Büyülü Portal (x:2, y:4)
          else if (c === 2 && r === 4) {
            const pulse = Math.sin(tick * 4) * 5
            ctx.shadowColor = '#06B6D4'
            ctx.shadowBlur = 25 + pulse
            ctx.beginPath()
            ctx.arc(isoX, isoY + 5, 16, 0, Math.PI * 2)
            ctx.fillStyle = kesfedilenler.includes(3) ? '#10B981' : '#06B6D4'
            ctx.fill()
            ctx.shadowBlur = 0
          }
        }
      }

      // 4. Karakter (NEX Robot) 3D Işıltılı Yansıma ve Gölge
      const charIsoX = originX + (posX - posY) * (tileW / 2)
      const charIsoY = originY + (posX + posY) * (tileH / 2)

      // Zemin Tabanda Yumuşak Gölge
      ctx.beginPath()
      ctx.ellipse(charIsoX, charIsoY + 14, 14, 7, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
      ctx.fill()

      // Neon Halesi
      ctx.shadowColor = '#06B6D4'
      ctx.shadowBlur = 20
      ctx.beginPath()
      ctx.arc(charIsoX, charIsoY + 4, 14, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(6, 182, 212, 0.25)'
      ctx.fill()
      ctx.shadowBlur = 0

      // Karakter Robot İkonu
      ctx.fillStyle = '#ffffff'
      ctx.font = '22px sans-serif'
      ctx.fillText('🤖', charIsoX - 11, charIsoY + 11)

      // Sinematik Vignette (Köşe Karartması)
      const vigGrad = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        100,
        canvas.width / 2,
        canvas.height / 2,
        240
      )
      vigGrad.addColorStop(0, 'transparent')
      vigGrad.addColorStop(1, 'rgba(5, 8, 20, 0.8)')
      ctx.fillStyle = vigGrad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      animFrameRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [posX, posY, kesfedilenler])

  const bulmacaTamamla = (id: number) => {
    if (!kesfedilenler.includes(id)) {
      setKesfedilenler([...kesfedilenler, id])
    }
    setAktifBulmaca(null)
    if (id === 3) {
      onBulmacaCozuldu()
    }
  }

  return (
    <div className="w-full flex flex-col bg-arka border-r border-sinir h-full overflow-hidden relative">
      
      {/* ── ÜST BAR ──────────────────────────────────────────────────────── */}
      <div className="px-4 py-2.5 bg-terminal border-b border-sinir flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="pixel-xs text-cyan">🎮 2.5D RUMBLE HEROES ENGINE</span>
          <span className="text-xs text-yazi-soluk">·</span>
          <span className="text-xs font-bold text-yazi">{gorevNo} — {gorevBaslik}</span>
        </div>
        <span className="pixel-xs text-altin">
          İPUÇLARI: {kesfedilenler.length} / 3 BULDUN
        </span>
      </div>

      {/* ── HIGH-END 2.5D CANLI ISOMETRIC CANVAS ─────────────────────────── */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#050814] via-[#0f172a] to-[#1e1b4b] overflow-hidden">
        
        {/* Yönlendirme İpucu Barı */}
        <div className="absolute top-3 left-3 bg-terminal/95 border border-cyan/40 px-3 py-1.5 rounded-lg text-xs font-kod text-cyan z-10 shadow-glow-cyan flex items-center gap-2">
          <span>🎮 YÖNLER:</span>
          <span className="text-yazi font-medium">Klavyedeki Ok Tuşları veya WASD ile Yürüt!</span>
        </div>

        <canvas
          ref={canvasRef}
          width={420}
          height={280}
          className="rounded-2xl border-2 border-cyan/50 shadow-2xl bg-black/60"
        />

        {/* Mobil Yön Tuşları */}
        <div className="flex flex-col items-center gap-1 mt-3">
          <button
            onClick={() => setPosY((prev) => Math.max(0, prev - 1))}
            className="w-10 h-8 bg-kart border border-cyan/50 rounded-lg font-bold text-xs text-cyan active:scale-95 shadow-glow-cyan"
          >
            ▲
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setPosX((prev) => Math.max(0, prev - 1))}
              className="w-10 h-8 bg-kart border border-cyan/50 rounded-lg font-bold text-xs text-cyan active:scale-95 shadow-glow-cyan"
            >
              ◀
            </button>
            <button
              onClick={() => setPosY((prev) => Math.min(4, prev + 1))}
              className="w-10 h-8 bg-kart border border-cyan/50 rounded-lg font-bold text-xs text-cyan active:scale-95 shadow-glow-cyan"
            >
              ▼
            </button>
            <button
              onClick={() => setPosX((prev) => Math.min(4, prev + 1))}
              className="w-10 h-8 bg-kart border border-cyan/50 rounded-lg font-bold text-xs text-cyan active:scale-95 shadow-glow-cyan"
            >
              ▶
            </button>
          </div>
        </div>

      </div>

      {/* ── İNTERAKTİF BULMACA MODALLARI ─────────────────────────────────── */}
      {aktifBulmaca === 1 && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-scale-in">
          <div className="bg-terminal border-2 border-altin rounded-2xl p-5 max-w-sm w-full flex flex-col gap-3 shadow-glow-altin">
            <div className="flex items-center gap-2 text-altin font-bold text-sm">
              <span>📦 1. İPUCU SANDIĞINI BULDUN!</span>
            </div>
            <p className="text-xs text-yazi leading-relaxed font-ui">
              <strong>Yapay Zeka Nasıl Öğrenir?</strong><br />
              Tıpkı senin bebekken kedileri öğrenmen gibi! Yapay zekaya 1 tane değil, binlerce kedi resmi gösterilir. Yapay zeka bu resimlerdeki bıyık, kulak ve göz kalıplarını ezberler!
            </p>
            <button
              onClick={() => bulmacaTamamla(1)}
              className="btn-altin text-xs py-2 font-bold shadow-glow-altin"
            >
              💡 İpucunu Anladım, Devam Et!
            </button>
          </div>
        </div>
      )}

      {aktifBulmaca === 2 && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-scale-in">
          <div className="bg-terminal border-2 border-mor rounded-2xl p-5 max-w-sm w-full flex flex-col gap-3 shadow-glow-mor">
            <div className="flex items-center gap-2 text-mor font-bold text-sm">
              <span>🪞 2. KALIP AYNASINI BULDUN!</span>
            </div>
            <p className="text-xs text-yazi leading-relaxed font-ui">
              <strong>Kalıp Tanıma Nedir?</strong><br />
              Yapay zeka resimdeki tüyleri ve kulakları gördüğünde "Aha! Bu bir kedi kalıbı!" der. Yani zeka demek, örnek verilerden kalıp çıkarmak demektir!
            </p>
            <button
              onClick={() => bulmacaTamamla(2)}
              className="btn-mor text-xs py-2 font-bold shadow-glow-mor"
            >
              🧠 Mantığı Kavradım, İleri!
            </button>
          </div>
        </div>
      )}

      {aktifBulmaca === 3 && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-scale-in">
          <div className="bg-terminal border-2 border-cyan rounded-2xl p-5 max-w-sm w-full flex flex-col gap-3 shadow-glow-cyan">
            <div className="flex items-center gap-2 text-cyan font-bold text-sm">
              <span>🏰 NEXUS KALESİ KAPISINA ULAŞTIN!</span>
            </div>
            <p className="text-xs text-yazi leading-relaxed font-ui">
              Harika kaşif! Sandıktaki ve aynadaki 2 ipucunu da öğrendin! Şimdi bu öğrendiğin mantığı sağ taraftaki yapboz editöründe birleştirip kapıyı açabilirsin!
            </p>
            <button
              onClick={() => bulmacaTamamla(3)}
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
