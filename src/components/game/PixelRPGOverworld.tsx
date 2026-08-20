'use client'

import { useState, useEffect, useRef } from 'react'

interface PixelRPGOverworldProps {
  gorevBaslik: string
  gorevNo: string
  onBulmacaCozuldu: () => void
}

// 8x8 Klasik RPG Maker / Top-Down Harita Düzeni (0: Çim, 1: Taş Yol, 2: Duvar/Kule, 3: Sandık, 4: Büyücü NPC, 5: Şato Kapısı)
const HARITA = [
  [2, 2, 2, 2, 2, 2, 2, 2],
  [2, 0, 0, 1, 1, 0, 0, 2],
  [2, 0, 3, 1, 0, 4, 0, 2],
  [2, 1, 1, 1, 1, 1, 0, 2],
  [2, 0, 0, 1, 0, 0, 0, 2],
  [2, 0, 0, 1, 1, 5, 0, 2],
  [2, 0, 0, 0, 0, 0, 0, 2],
  [2, 2, 2, 2, 2, 2, 2, 2],
]

export default function PixelRPGOverworld({
  gorevBaslik,
  gorevNo,
  onBulmacaCozuldu,
}: PixelRPGOverworldProps) {
  const [playerX, setPlayerX] = useState(3)
  const [playerY, setPlayerY] = useState(3)
  const [aktifModal, setAktifModal] = useState<number | null>(null)
  const [kesfedilenler, setKesfedilenler] = useState<number[]>([])

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animRef = useRef<number | null>(null)

  // Klavye Yön Kontrolleri (WASD & Ok Tuşları)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (aktifModal !== null) return

      let newX = playerX
      let newY = playerY

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') newY -= 1
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') newY += 1
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') newX -= 1
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') newX += 1

      // Engel Kontrolü (Duvarlar engeller)
      if (HARITA[newY]?.[newX] !== undefined && HARITA[newY][newX] !== 2) {
        setPlayerX(newX)
        setPlayerY(newY)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [playerX, playerY, aktifModal])

  // Obje Etkileşim Kontrolü
  useEffect(() => {
    // 3: Sandık (x:2, y:2)
    if (playerX === 2 && playerY === 2 && !kesfedilenler.includes(1)) {
      setAktifModal(1)
    }
    // 4: Büyücü NPC (x:5, y:2)
    else if (playerX === 5 && playerY === 2 && !kesfedilenler.includes(2)) {
      setAktifModal(2)
    }
    // 5: Şato Kapısı (x:5, y:5)
    else if (playerX === 5 && playerY === 5 && !kesfedilenler.includes(3)) {
      setAktifModal(3)
    }
  }, [playerX, playerY, kesfedilenler])

  // KLASİK RPG MAKER TOP-DOWN CANVAS ÇİZİM MOTORU
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let tick = 0

    const render = () => {
      tick += 0.05
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const tileSize = 44

      // Harita Karolarının Çizimi (Top-Down 2D Pixel RPG)
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const x = c * tileSize
          const y = r * tileSize
          const tileType = HARITA[r][c]

          // 0 & 1 & 2: Zemin ve Duvar Çizimleri
          if (tileType === 0) {
            // Canlı Çim Zemin (Pokemon / RPG Maker Yeşil Zemin)
            ctx.fillStyle = (r + c) % 2 === 0 ? '#22c55e' : '#16a34a'
            ctx.fillRect(x, y, tileSize, tileSize)
            // Çim Pikselleri
            ctx.fillStyle = '#15803d'
            ctx.fillRect(x + 8, y + 8, 3, 3)
            ctx.fillRect(x + 24, y + 20, 3, 3)
          } else if (tileType === 1) {
            // Taş Yol (RPG Maker Patika Yol)
            ctx.fillStyle = '#64748b'
            ctx.fillRect(x, y, tileSize, tileSize)
            ctx.strokeStyle = '#475569'
            ctx.strokeRect(x, y, tileSize, tileSize)
          } else if (tileType === 2) {
            // Şato Surları / Taş Kule
            ctx.fillStyle = '#1e293b'
            ctx.fillRect(x, y, tileSize, tileSize)
            ctx.fillStyle = '#334155'
            ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4)
            ctx.fillStyle = '#475569'
            ctx.fillRect(x + 6, y + 6, 12, 10)
            ctx.fillRect(x + 24, y + 22, 12, 10)
          } else {
            // Nesne altındaki zemin (çim veya yol)
            ctx.fillStyle = '#22c55e'
            ctx.fillRect(x, y, tileSize, tileSize)
          }

          // İnteraktif Objeler
          if (tileType === 3) {
            // Sandık (Hafıza Sandığı)
            ctx.fillStyle = kesfedilenler.includes(1) ? '#10B981' : '#f59e0b'
            ctx.fillRect(x + 10, y + 12, 24, 20)
            ctx.fillStyle = '#fef08a'
            ctx.fillRect(x + 19, y + 20, 6, 6)
          } else if (tileType === 4) {
            // Büyücü NPC (Pixel Chibi Wizard)
            ctx.fillStyle = '#8b5cf6'
            ctx.beginPath()
            ctx.arc(x + 22, y + 24, 12, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = '#ffffff'
            ctx.font = '16px sans-serif'
            ctx.fillText('🧙‍♂️', x + 13, y + 30)
          } else if (tileType === 5) {
            // Şato Kule Kapısı (Nexus Kapısı)
            ctx.fillStyle = kesfedilenler.includes(3) ? '#10B981' : '#06b6d4'
            ctx.fillRect(x + 8, y + 6, 28, 32)
            ctx.fillStyle = '#ffffff'
            ctx.font = '18px sans-serif'
            ctx.fillText('🏰', x + 12, y + 30)
          }
        }
      }

      // Oyuncu Karakter (Pixel Chibi NEX Hero Avatar)
      const playerPxX = playerX * tileSize
      const playerPxY = playerY * tileSize

      // Karakter Gölgesi
      ctx.beginPath()
      ctx.ellipse(playerPxX + 22, playerPxY + 38, 12, 5, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
      ctx.fill()

      // NEX Robot Karakter Görseli
      ctx.fillStyle = '#ffffff'
      ctx.font = '24px sans-serif'
      ctx.fillText('🤖', playerPxX + 10, playerPxY + 32)

      animRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [playerX, playerY, kesfedilenler])

  const modalKapat = (id: number) => {
    if (!kesfedilenler.includes(id)) {
      setKesfedilenler([...kesfedilenler, id])
    }
    setAktifModal(null)
    if (id === 3) {
      onBulmacaCozuldu()
    }
  }

  return (
    <div className="w-full flex flex-col bg-arka border-r border-sinir h-full overflow-hidden relative">
      
      {/* ── ÜST BAR ──────────────────────────────────────────────────────── */}
      <div className="px-4 py-2.5 bg-terminal border-b border-sinir flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="pixel-xs text-cyan">🎮 TOP-DOWN PIXEL RPG WORLD</span>
          <span className="text-xs text-yazi-soluk">·</span>
          <span className="text-xs font-bold text-yazi">{gorevNo} — {gorevBaslik}</span>
        </div>
        <span className="pixel-xs text-altin">
          KEŞİF: {kesfedilenler.length} / 3 BULDUN
        </span>
      </div>

      {/* ── TOP-DOWN PIXEL RPG MAKER HARİTASI (CANLI CANVAS) ─────────────── */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-3 bg-gradient-to-b from-[#050814] via-[#0f172a] to-[#1e1b4b] overflow-hidden">
        
        {/* Yönlendirme İpucu */}
        <div className="absolute top-2 left-2 bg-terminal/95 border border-cyan/40 px-3 py-1.5 rounded-lg text-xs font-kod text-cyan z-10 shadow-glow-cyan">
          🎮 YÖNLER: Ok Tuşları veya WASD ile Haritada Gezin!
        </div>

        <canvas
          ref={canvasRef}
          width={352}
          height={352}
          className="rounded-2xl border-4 border-cyan/60 shadow-2xl bg-black"
        />

        {/* Mobil Yön Tuşları */}
        <div className="flex flex-col items-center gap-1 mt-2">
          <button
            onClick={() => setPlayerY((prev) => Math.max(1, prev - 1))}
            className="w-10 h-7 bg-kart border border-cyan/50 rounded-lg font-bold text-xs text-cyan active:scale-95"
          >
            ▲
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setPlayerX((prev) => Math.max(1, prev - 1))}
              className="w-10 h-7 bg-kart border border-cyan/50 rounded-lg font-bold text-xs text-cyan active:scale-95"
            >
              ◀
            </button>
            <button
              onClick={() => setPlayerY((prev) => Math.min(6, prev + 1))}
              className="w-10 h-7 bg-kart border border-cyan/50 rounded-lg font-bold text-xs text-cyan active:scale-95"
            >
              ▼
            </button>
            <button
              onClick={() => setPlayerX((prev) => Math.min(6, prev + 1))}
              className="w-10 h-7 bg-kart border border-cyan/50 rounded-lg font-bold text-xs text-cyan active:scale-95"
            >
              ▶
            </button>
          </div>
        </div>

      </div>

      {/* ── İNTERAKTİF DIŞ DÜNYA MODALLARI ───────────────────────────────── */}
      {aktifModal === 1 && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-scale-in">
          <div className="bg-terminal border-2 border-altin rounded-2xl p-5 max-w-sm w-full flex flex-col gap-3 shadow-glow-altin">
            <div className="flex items-center gap-2 text-altin font-bold text-sm">
              <span>📦 HAFIZA SANDIĞINI BULDUN!</span>
            </div>
            <p className="text-xs text-yazi leading-relaxed font-ui">
              <strong>Yapay Zeka Nasıl Öğrenir?</strong><br />
              İnsanlar yapay zekaya milyonlarca kedi fotoğrafı göstererek öğretti. Yapay zeka resimdeki tüyleri ve kulakları gördüğünde "Aha! Bu bir kedi!" der.
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
              <span>🧙‍♂️ BÜYÜCÜ PROMPT İLE KONUŞTUN!</span>
            </div>
            <p className="text-xs text-yazi leading-relaxed font-ui">
              <strong>Büyücü Prompt:</strong><br />
              "Selam genç kaşif! Yapay zeka tek tek ezber yapmaz, kalıpları ve ortak özellikleri öğrenir. Şimdi şato kapısına git ve öğrendiğin sihri uygula!"
            </p>
            <button
              onClick={() => modalKapat(2)}
              className="btn-mor text-xs py-2 font-bold shadow-glow-mor"
            >
              🧠 Harika, Şato Kapısına Git!
            </button>
          </div>
        </div>
      )}

      {aktifModal === 3 && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-scale-in">
          <div className="bg-terminal border-2 border-cyan rounded-2xl p-5 max-w-sm w-full flex flex-col gap-3 shadow-glow-cyan">
            <div className="flex items-center gap-2 text-cyan font-bold text-sm">
              <span>🏰 NEXUS ŞATO KAPISINA ULAŞTIN!</span>
            </div>
            <p className="text-xs text-yazi leading-relaxed font-ui">
              Harika kaşif! Şato kapısı kilitli. Sağ taraftaki yapboz editöründen doğru kelime bloklarını birleştirerek kapının kilidini aç!
            </p>
            <button
              onClick={() => modalKapat(3)}
              className="btn-yesil text-xs py-2 font-bold shadow-glow-yesil"
            >
              🔑 Kapıyı Açmak İçin Prompt Yaz!
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
