'use client'

import { useState, useEffect, useRef } from 'react'

interface KenneySpaceKitEngineProps {
  gorevBaslik: string
  gorevNo: string
  onBulmacaCozuldu: () => void
}

const KENNEY_SPACE_MAP = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 2, 1, 1, 1, 1, 1, 3, 0, 0],
  [0, 1, 4, 1, 0, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 0, 1, 1, 1, 0, 1, 0, 0],
  [0, 1, 1, 1, 5, 1, 1, 1, 0, 0],
  [0, 2, 1, 1, 1, 1, 1, 3, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
]

export default function KenneySpaceKitEngine({
  gorevBaslik,
  gorevNo,
  onBulmacaCozuldu,
}: KenneySpaceKitEngineProps) {
  const [mounted, setMounted] = useState(false)
  const [playerX, setPlayerX] = useState(2)
  const [playerY, setPlayerY] = useState(2)
  const [aktifModal, setAktifModal] = useState<number | null>(null)
  const [kesfedilenler, setKesfedilenler] = useState<number[]>([])

  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animRef = useRef<number | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Klavye Yön Kontrolleri
  useEffect(() => {
    if (!mounted) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (aktifModal !== null) return

      let newX = playerX
      let newY = playerY

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') newY -= 1
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') newY += 1
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') newX -= 1
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') newX += 1

      if (
        KENNEY_SPACE_MAP[newY]?.[newX] !== undefined &&
        KENNEY_SPACE_MAP[newY][newX] !== 0
      ) {
        setPlayerX(newX)
        setPlayerY(newY)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [playerX, playerY, aktifModal, mounted])

  // Etkileşim Kontrolü
  useEffect(() => {
    if (!mounted) return
    if (playerX === 2 && playerY === 2 && !kesfedilenler.includes(1)) {
      setAktifModal(1)
    } else if (playerX === 7 && playerY === 1 && !kesfedilenler.includes(2)) {
      setAktifModal(2)
    } else if (playerX === 4 && playerY === 5 && !kesfedilenler.includes(3)) {
      setAktifModal(3)
    }
  }, [playerX, playerY, kesfedilenler, mounted])

  // DİNAMİK BÜYÜTÜLMÜŞ FULL-PANEL CANVAS ENGINE (60 FPS)
  useEffect(() => {
    if (!mounted) return
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Container Boyutlarını Dinamik Al
    canvas.width = container.clientWidth || 600
    canvas.height = container.clientHeight || 500

    let tick = 0

    const render = () => {
      tick += 0.05
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Büyütülmüş Karo Ölçüleri
      const tileW = 84
      const tileH = 42
      const originX = canvas.width / 2
      const originY = 80

      // Kamera Oyuncuyu Tam Merkezde Tutsun
      const cameraOffsetX = (playerX - playerY) * (tileW / 2)
      const cameraOffsetY = (playerX + playerY) * (tileH / 2)

      ctx.save()
      ctx.translate(-cameraOffsetX + originX, -cameraOffsetY + originY + 120)

      // 1. Kenney Space Kit Izometrik Platform Çizimi
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 10; c++) {
          const type = KENNEY_SPACE_MAP[r][c]
          if (type === 0) continue

          const isoX = (c - r) * (tileW / 2)
          const isoY = (c + r) * (tileH / 2)

          // 3D Yan Yüzeyler (Uzay Platform Derinliği)
          ctx.beginPath()
          ctx.moveTo(isoX - tileW / 2, isoY + tileH / 2)
          ctx.lineTo(isoX, isoY + tileH)
          ctx.lineTo(isoX, isoY + tileH + 16)
          ctx.lineTo(isoX - tileW / 2, isoY + tileH / 2 + 16)
          ctx.closePath()
          ctx.fillStyle = '#0f172a'
          ctx.fill()

          ctx.beginPath()
          ctx.moveTo(isoX, isoY + tileH)
          ctx.lineTo(isoX + tileW / 2, isoY + tileH / 2)
          ctx.lineTo(isoX + tileW / 2, isoY + tileH / 2 + 16)
          ctx.lineTo(isoX, isoY + tileH + 16)
          ctx.closePath()
          ctx.fillStyle = '#1e293b'
          ctx.fill()

          // Metalik Karolar Üst Yüzey
          ctx.beginPath()
          ctx.moveTo(isoX, isoY)
          ctx.lineTo(isoX + tileW / 2, isoY + tileH / 2)
          ctx.lineTo(isoX, isoY + tileH)
          ctx.lineTo(isoX - tileW / 2, isoY + tileH / 2)
          ctx.closePath()

          const grad = ctx.createLinearGradient(isoX - tileW / 2, isoY, isoX + tileW / 2, isoY + tileH)
          grad.addColorStop(0, '#334155')
          grad.addColorStop(1, '#1e293b')
          ctx.fillStyle = grad
          ctx.fill()

          ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)'
          ctx.lineWidth = 1.5
          ctx.stroke()

          // Obje Çizimleri
          if (type === 2) {
            // Güneş Paneli
            ctx.fillStyle = '#0284c7'
            ctx.fillRect(isoX - 16, isoY - 18, 32, 20)
            ctx.strokeStyle = '#38bdf8'
            ctx.strokeRect(isoX - 16, isoY - 18, 32, 20)
          } else if (type === 3) {
            // Uydu Anteni
            ctx.fillStyle = kesfedilenler.includes(2) ? '#10B981' : '#c084fc'
            ctx.beginPath()
            ctx.arc(isoX, isoY - 12, 14, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = '#ffffff'
            ctx.font = '18px sans-serif'
            ctx.fillText('📡', isoX - 9, isoY - 5)
          } else if (type === 4) {
            // Veri Kapsülü
            const floatY = Math.sin(tick * 3) * 4
            ctx.fillStyle = kesfedilenler.includes(1) ? '#10B981' : '#fbbf24'
            ctx.beginPath()
            ctx.arc(isoX, isoY - 14 + floatY, 16, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = '#ffffff'
            ctx.font = '18px sans-serif'
            ctx.fillText('💾', isoX - 9, isoY - 7 + floatY)
          } else if (type === 5) {
            // NEXUS Çekirdeği
            const pulse = Math.sin(tick * 4) * 6
            ctx.shadowColor = '#06b6d4'
            ctx.shadowBlur = 25 + pulse
            ctx.fillStyle = kesfedilenler.includes(3) ? '#10B981' : '#06b6d4'
            ctx.beginPath()
            ctx.arc(isoX, isoY - 14, 22, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = '#ffffff'
            ctx.font = '22px sans-serif'
            ctx.fillText('🔮', isoX - 11, isoY - 5)
            ctx.shadowBlur = 0
          }
        }
      }

      // 2. BÜYÜTÜLMÜŞ KAPÜŞONLU ROBOT NEX HERO
      const pIsoX = (playerX - playerY) * (tileW / 2)
      const pIsoY = (playerX + playerY) * (tileH / 2)

      // Gölge
      ctx.beginPath()
      ctx.ellipse(pIsoX, pIsoY + 16, 18, 8, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.fill()

      // Robot Halesi
      ctx.shadowColor = '#06b6d4'
      ctx.shadowBlur = 20
      ctx.fillStyle = 'rgba(6, 182, 212, 0.35)'
      ctx.beginPath()
      ctx.arc(pIsoX, pIsoY, 18, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      // Robot Avatar
      ctx.fillStyle = '#ffffff'
      ctx.font = '32px sans-serif'
      ctx.fillText('🤖', pIsoX - 16, pIsoY + 10)

      ctx.restore()

      animRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [playerX, playerY, kesfedilenler, mounted])

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
    <div ref={containerRef} className="w-full flex flex-col bg-arka border-r border-sinir h-full overflow-hidden relative">
      
      {/* ── ÜST BAR ──────────────────────────────────────────────────────── */}
      <div className="px-4 py-2.5 bg-terminal border-b border-sinir flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="pixel-xs text-cyan">🚀 KENNEY SPACE KIT HARİTASI</span>
          <span className="text-xs text-yazi-soluk">·</span>
          <span className="text-xs font-bold text-yazi">{gorevNo} — {gorevBaslik}</span>
        </div>
        <span className="pixel-xs text-altin">
          İSTASYON: {kesfedilenler.length} / 3 KEŞFEDİLDİ
        </span>
      </div>

      {/* ── FULL-HEIGHT BÜYÜTÜLMÜŞ OYUN ALANI ───────────────────────────── */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex flex-col items-center justify-center bg-gradient-to-b from-[#090d16] via-[#0f172a] to-[#1e1b4b]">
        
        {/* Yönlendirme Barı */}
        <div className="absolute top-3 left-3 bg-terminal/95 border border-cyan/40 px-3 py-1.5 rounded-lg text-xs font-kod text-cyan z-10 shadow-glow-cyan flex items-center gap-2">
          <span>🤖 NEX'İ YÜRÜT:</span>
          <span className="text-yazi font-medium">WASD veya Ok Tuşlarıyla Geniş Uzay İstasyonunda Gezin!</span>
        </div>

        <canvas
          ref={canvasRef}
          className="w-full h-full block"
        />

        {/* Mobil Yön Tuşları */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col items-center gap-1 bg-terminal/80 p-2 rounded-xl border border-sinir backdrop-blur-md">
          <button
            onClick={() => setPlayerY((prev) => Math.max(1, prev - 1))}
            className="w-10 h-8 bg-kart border border-cyan/50 rounded-lg font-bold text-xs text-cyan active:scale-95 shadow-glow-cyan"
          >
            ▲
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setPlayerX((prev) => Math.max(1, prev - 1))}
              className="w-10 h-8 bg-kart border border-cyan/50 rounded-lg font-bold text-xs text-cyan active:scale-95 shadow-glow-cyan"
            >
              ◀
            </button>
            <button
              onClick={() => setPlayerY((prev) => Math.min(6, prev + 1))}
              className="w-10 h-8 bg-kart border border-cyan/50 rounded-lg font-bold text-xs text-cyan active:scale-95 shadow-glow-cyan"
            >
              ▼
            </button>
            <button
              onClick={() => setPlayerX((prev) => Math.min(8, prev + 1))}
              className="w-10 h-8 bg-kart border border-cyan/50 rounded-lg font-bold text-xs text-cyan active:scale-95 shadow-glow-cyan"
            >
              ▶
            </button>
          </div>
        </div>

      </div>

      {/* ── İNTERAKTİF İSTASYON MODALLARI ─────────────────────────────────── */}
      {aktifModal === 1 && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-scale-in">
          <div className="bg-terminal border-2 border-altin rounded-2xl p-5 max-w-sm w-full flex flex-col gap-3 shadow-glow-altin">
            <div className="flex items-center gap-2 text-altin font-bold text-sm">
              <span>💾 1. UZAY VERİ BANKASINI BULDUN!</span>
            </div>
            <p className="text-xs text-yazi leading-relaxed font-ui">
              <strong>Kapüşonlu NEX Robot:</strong><br />
              "Bip bop! Hafıza verilerim burada saklanıyor! Yapay zeka tek bir resimle öğrenemez, milyonlarca veriyi veri bankasına depolar!"
            </p>
            <button
              onClick={() => modalKapat(1)}
              className="btn-altin text-xs py-2 font-bold shadow-glow-altin"
            >
              💡 Veri Bilgisini Al, Devam Et!
            </button>
          </div>
        </div>
      )}

      {aktifModal === 2 && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-scale-in">
          <div className="bg-terminal border-2 border-mor rounded-2xl p-5 max-w-sm w-full flex flex-col gap-3 shadow-glow-mor">
            <div className="flex items-center gap-2 text-mor font-bold text-sm">
              <span>📡 2. UYDU ANTEN DİZİSİNE ULAŞTIN!</span>
            </div>
            <p className="text-xs text-yazi leading-relaxed font-ui">
              <strong>Kapüşonlu NEX Robot:</strong><br />
              "Uydu sinyali geldi! Yapay zeka verileri tarayıp ortak kalıpları (kedi bıyığı, göz şekli) çıkarır!"
            </p>
            <button
              onClick={() => modalKapat(2)}
              className="btn-mor text-xs py-2 font-bold shadow-glow-mor"
            >
              🧠 Kalıbı Çöz, Ana Çekirdeğe Uç!
            </button>
          </div>
        </div>
      )}

      {aktifModal === 3 && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-scale-in">
          <div className="bg-terminal border-2 border-cyan rounded-2xl p-5 max-w-sm w-full flex flex-col gap-3 shadow-glow-cyan">
            <div className="flex items-center gap-2 text-cyan font-bold text-sm">
              <span>🔮 3. NEXUS ANA ÇEKİRDEĞİNE ULAŞTIN!</span>
            </div>
            <p className="text-xs text-yazi leading-relaxed font-ui">
              Tebrikler bilge kaşif! Kenney uzay istasyonundaki tüm şifreleri çözdün. Şimdi sağ taraftaki yapboz editöründe promptunu birleştir ve NEXUS çekirdeğini kurtar!
            </p>
            <button
              onClick={() => modalKapat(3)}
              className="btn-yesil text-xs py-2 font-bold shadow-glow-yesil"
            >
              🔑 NEXUS Çekirdeğini Açmak İçin Prompt Yaz!
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
