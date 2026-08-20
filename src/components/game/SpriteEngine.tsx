'use client'

import { useState, useEffect, useRef } from 'react'

interface SpriteEngineProps {
  gorevBaslik: string
  gorevNo: string
  onBulmacaCozuldu: () => void
  characterSpriteSrc?: string
  environmentBgSrc?: string
}

export default function SpriteEngine({
  gorevBaslik,
  gorevNo,
  onBulmacaCozuldu,
  characterSpriteSrc = '/nex_robot_hoodie.png',
  environmentBgSrc,
}: SpriteEngineProps) {
  const [mounted, setMounted] = useState(false)
  const [playerX, setPlayerX] = useState(160)
  const [playerY, setPlayerY] = useState(180)
  const [direction, setDirection] = useState<'down' | 'up' | 'left' | 'right'>('down')
  const [isWalking, setIsWalking] = useState(false)
  const [aktifModal, setAktifModal] = useState<number | null>(null)
  const [kesfedilenler, setKesfedilenler] = useState<number[]>([])

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animFrameRef = useRef<number | null>(null)

  // Resim objeleri (Pygame Image.load benzeri)
  const charImageRef = useRef<HTMLImageElement | null>(null)
  const bgImageRef = useRef<HTMLImageElement | null>(null)
  const [imagesLoaded, setImagesLoaded] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Resimleri Yükleme (Pygame Asset Loading)
    const charImg = new Image()
    charImg.src = characterSpriteSrc
    charImg.onload = () => {
      charImageRef.current = charImg
      setImagesLoaded(true)
    }

    if (environmentBgSrc) {
      const bgImg = new Image()
      bgImg.src = environmentBgSrc
      bgImg.onload = () => {
        bgImageRef.current = bgImg
      }
    }
  }, [characterSpriteSrc, environmentBgSrc])

  // Klavye Yön Kontrolleri (WASD & Ok Tuşları ile Yumuşak Sprite Yürütme)
  useEffect(() => {
    if (!mounted) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (aktifModal !== null) return

      let speed = 8
      let newX = playerX
      let newY = playerY
      let newDir = direction
      let moving = false

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        newY -= speed
        newDir = 'up'
        moving = true
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        newY += speed
        newDir = 'down'
        moving = true
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        newX -= speed
        newDir = 'left'
        moving = true
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        newX += speed
        newDir = 'right'
        moving = true
      }

      newX = Math.max(20, Math.min(340, newX))
      newY = Math.max(20, Math.min(260, newY))

      setPlayerX(newX)
      setPlayerY(newY)
      setDirection(newDir)
      setIsWalking(moving)
    }

    const handleKeyUp = () => setIsWalking(false)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [playerX, playerY, direction, aktifModal, mounted])

  // Etkileşim Noktaları Kontrolü
  useEffect(() => {
    if (!mounted) return
    // Checkpoint 1: Sandık (x:80, y:80)
    if (Math.hypot(playerX - 80, playerY - 80) < 35 && !kesfedilenler.includes(1)) {
      setAktifModal(1)
    }
    // Checkpoint 2: Rün Taşı (x:280, y:80)
    else if (Math.hypot(playerX - 280, playerY - 80) < 35 && !kesfedilenler.includes(2)) {
      setAktifModal(2)
    }
    // Checkpoint 3: Şato Kapısı (x:180, y:240)
    else if (Math.hypot(playerX - 180, playerY - 240) < 35 && !kesfedilenler.includes(3)) {
      setAktifModal(3)
    }
  }, [playerX, playerY, kesfedilenler, mounted])

  // PYGAME / UNITY SPRITE CANVAS RENDER ENGINE (60 FPS)
  useEffect(() => {
    if (!mounted) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let frameTick = 0

    const render = () => {
      frameTick += 0.1
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 1. Arka Plan Yüklenmişse Çiz, Yoksa Zümrüt Yeşili Çim Zemin Çiz
      if (bgImageRef.current) {
        ctx.drawImage(bgImageRef.current, 0, 0, canvas.width, canvas.height)
      } else {
        ctx.fillStyle = '#065f46'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Zemin Izgarası
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.15)'
        ctx.lineWidth = 1
        for (let x = 0; x < canvas.width; x += 32) {
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, canvas.height)
          ctx.stroke()
        }
        for (let y = 0; y < canvas.height; y += 32) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(canvas.width, y)
          ctx.stroke()
        }
      }

      // 2. Etkileşim Objeleri
      
      // Checkpoint 1: Hafıza Sandığı (x:80, y:80)
      const floatY1 = Math.sin(frameTick) * 3
      ctx.shadowColor = '#fbbf24'
      ctx.shadowBlur = 12
      ctx.fillStyle = kesfedilenler.includes(1) ? '#34d399' : '#fbbf24'
      ctx.beginPath()
      ctx.arc(80, 80 + floatY1, 14, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.font = '16px sans-serif'
      ctx.fillText('📦', 72, 85 + floatY1)
      ctx.shadowBlur = 0

      // Checkpoint 2: Rün Taşı (x:280, y:80)
      const floatY2 = Math.sin(frameTick + 1) * 3
      ctx.shadowColor = '#c084fc'
      ctx.shadowBlur = 12
      ctx.fillStyle = kesfedilenler.includes(2) ? '#34d399' : '#c084fc'
      ctx.beginPath()
      ctx.arc(280, 80 + floatY2, 14, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.font = '16px sans-serif'
      ctx.fillText('🗿', 272, 85 + floatY2)
      ctx.shadowBlur = 0

      // Checkpoint 3: Şato Kapısı (x:180, y:240)
      ctx.shadowColor = '#38bdf8'
      ctx.shadowBlur = 16
      ctx.fillStyle = kesfedilenler.includes(3) ? '#34d399' : '#38bdf8'
      ctx.beginPath()
      ctx.arc(180, 240, 18, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.font = '20px sans-serif'
      ctx.fillText('🏰', 169, 247)
      ctx.shadowBlur = 0

      // 3. GERÇEK GERÇEK PNG SPRITE IMAGE RENDER (PYGAME DRAW IMAGE BİREBİR)
      const walkBobbing = isWalking ? Math.sin(frameTick * 3) * 4 : 0

      // Taban Gölgesi
      ctx.beginPath()
      ctx.ellipse(playerX, playerY + 22, 16, 6, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'
      ctx.fill()

      if (charImageRef.current) {
        // Yüklenen Gerçek PNG Karakter Resmi Çizimi
        const spriteSize = 48
        ctx.drawImage(
          charImageRef.current,
          playerX - spriteSize / 2,
          playerY - spriteSize / 2 + walkBobbing,
          spriteSize,
          spriteSize
        )
      } else {
        // Yüklenene kadar sevimli robot ikonu
        ctx.fillStyle = '#ffffff'
        ctx.font = '28px sans-serif'
        ctx.fillText('🤖', playerX - 14, playerY + 10 + walkBobbing)
      }

      animFrameRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [playerX, playerY, isWalking, kesfedilenler, mounted])

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
          <span className="pixel-xs text-yesil">🖼️ PYGAME STYLE PNG SPRITE ENGINE</span>
          <span className="text-xs text-yazi-soluk">·</span>
          <span className="text-xs font-bold text-yazi">{gorevNo} — {gorevBaslik}</span>
        </div>
        <span className="pixel-xs text-altin">
          KEŞİF: {kesfedilenler.length} / 3 İPUCU
        </span>
      </div>

      {/* ── SPRITE CANVAS SAHNESİ ────────────────────────────────────────── */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#064e3b] via-[#047857] to-[#022c22]">
        
        <div className="absolute top-3 left-3 bg-terminal/95 border border-yesil/40 px-3 py-1.5 rounded-lg text-xs font-kod text-yesil z-10 shadow-glow-yesil flex items-center gap-2">
          <span>🤖 KONTROLLER:</span>
          <span className="text-yazi font-medium">Ok Tuşları veya WASD ile PNG Karakterini Yürüt!</span>
        </div>

        <canvas
          ref={canvasRef}
          width={400}
          height={300}
          className="rounded-2xl border-2 border-yesil/50 shadow-2xl bg-black/40"
        />

        {/* Mobil Yön Tuşları */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col items-center gap-1 bg-terminal/80 p-2 rounded-xl border border-sinir backdrop-blur-md">
          <button
            onClick={() => {
              setPlayerY((p) => Math.max(20, p - 12))
              setDirection('up')
            }}
            className="w-10 h-8 bg-kart border border-yesil/50 rounded-lg font-bold text-xs text-yesil active:scale-95 shadow-glow-yesil"
          >
            ▲
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setPlayerX((p) => Math.max(20, p - 12))
                setDirection('left')
              }}
              className="w-10 h-8 bg-kart border border-yesil/50 rounded-lg font-bold text-xs text-yesil active:scale-95 shadow-glow-yesil"
            >
              ◀
            </button>
            <button
              onClick={() => {
                setPlayerY((p) => Math.min(260, p + 12))
                setDirection('down')
              }}
              className="w-10 h-8 bg-kart border border-yesil/50 rounded-lg font-bold text-xs text-yesil active:scale-95 shadow-glow-yesil"
            >
              ▼
            </button>
            <button
              onClick={() => {
                setPlayerX((p) => Math.min(340, p + 12))
                setDirection('right')
              }}
              className="w-10 h-8 bg-kart border border-yesil/50 rounded-lg font-bold text-xs text-yesil active:scale-95 shadow-glow-yesil"
            >
              ▶
            </button>
          </div>
        </div>

      </div>

      {/* ── İNTERAKTİF İPUCU MODALLARI ───────────────────────────────────── */}
      {aktifModal === 1 && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-scale-in">
          <div className="bg-terminal border-2 border-altin rounded-2xl p-5 max-w-sm w-full flex flex-col gap-3 shadow-glow-altin">
            <div className="flex items-center gap-2 text-altin font-bold text-sm">
              <span>📦 1. SİHİRLİ HAFIZA SANDIĞI</span>
            </div>
            <p className="text-xs text-yazi leading-relaxed font-ui">
              Yapay zeka milyonlarca veriyi (kedi resimleri, uzay fotoğrafları) hafızasına alır!
            </p>
            <button
              onClick={() => modalKapat(1)}
              className="btn-altin text-xs py-2 font-bold shadow-glow-altin"
            >
              💡 Devam Et!
            </button>
          </div>
        </div>
      )}

      {aktifModal === 2 && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-scale-in">
          <div className="bg-terminal border-2 border-mor rounded-2xl p-5 max-w-sm w-full flex flex-col gap-3 shadow-glow-mor">
            <div className="flex items-center gap-2 text-mor font-bold text-sm">
              <span>🗿 2. KADİM RÜN TAŞI</span>
            </div>
            <p className="text-xs text-yazi leading-relaxed font-ui">
              Yapay zeka verilerin içindeki kalıpları eşleştirerek yeni nesneleri tanır!
            </p>
            <button
              onClick={() => modalKapat(2)}
              className="btn-mor text-xs py-2 font-bold shadow-glow-mor"
            >
              🧠 Şato Kapısına Git!
            </button>
          </div>
        </div>
      )}

      {aktifModal === 3 && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-scale-in">
          <div className="bg-terminal border-2 border-yesil rounded-2xl p-5 max-w-sm w-full flex flex-col gap-3 shadow-glow-yesil">
            <div className="flex items-center gap-2 text-yesil font-bold text-sm">
              <span>🏰 NEXUS ŞATO KAPISI</span>
            </div>
            <p className="text-xs text-yazi leading-relaxed font-ui">
              Öğrendiğin mantıkla sağ taraftaki editörde promptunu birleştir ve kapıyı aç!
            </p>
            <button
              onClick={() => modalKapat(3)}
              className="btn-yesil text-xs py-2 font-bold shadow-glow-yesil"
            >
              🔑 Prompt Yaz!
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
