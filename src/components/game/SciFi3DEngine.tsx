'use client'

import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'

interface SciFi3DEngineProps {
  gorevBaslik: string
  gorevNo: string
  onBulmacaCozuldu: () => void
}

export default function SciFi3DEngine({
  gorevBaslik,
  gorevNo,
  onBulmacaCozuldu,
}: SciFi3DEngineProps) {
  // Hydration Mismatch Önleyici
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  
  // Player Position in 3D Space (X, Z)
  const [playerPos, setPlayerPos] = useState({ x: 0, z: 2 })
  const [aktifModal, setAktifModal] = useState<number | null>(null)
  const [kesfedilenler, setKesfedilenler] = useState<number[]>([])

  const playerPosRef = useRef(playerPos)
  playerPosRef.current = playerPos

  useEffect(() => {
    setMounted(true)
  }, [])

  // Klavye Yön Kontrolleri (WASD / Ok Tuşları)
  useEffect(() => {
    if (!mounted) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (aktifModal !== null) return

      let { x, z } = playerPosRef.current

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') z -= 0.8
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') z += 0.8
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') x -= 0.8
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') x += 0.8

      x = Math.max(-6, Math.min(6, x))
      z = Math.max(-6, Math.min(6, z))

      setPlayerPos({ x, z })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [aktifModal, mounted])

  // Etkileşim Kontrolü
  useEffect(() => {
    if (!mounted) return
    const { x, z } = playerPos

    if (Math.hypot(x - (-3), z - (-3)) < 1.3 && !kesfedilenler.includes(1)) {
      setAktifModal(1)
    } else if (Math.hypot(x - 3, z - (-3)) < 1.3 && !kesfedilenler.includes(2)) {
      setAktifModal(2)
    } else if (Math.hypot(x - 0, z - (-5)) < 1.3 && !kesfedilenler.includes(3)) {
      setAktifModal(3)
    }
  }, [playerPos, kesfedilenler, mounted])

  // THREE.JS VİBRANT CANLI RENKLİ 3D SCI-FI ENGINE
  useEffect(() => {
    if (!mounted) return
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth || 400
    const height = container.clientHeight || 320

    // 1. Scene, Camera, Renderer (Canlı Renk Paleti)
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0f24) // Canlı Gece Mavisi
    scene.fog = new THREE.FogExp2(0x0a0f24, 0.05)

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0, 11, 10)
    camera.lookAt(0, -1, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    container.appendChild(renderer.domElement)

    // 2. Canlı Renkli Işıklandırma (Neon Magenta, Cyan & Gold)
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 2.0)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xff007f, 3.0) // Canlı Pembe/Magenta Işık
    dirLight.position.set(6, 15, 8)
    dirLight.castShadow = true
    scene.add(dirLight)

    // Canlı Altın Işık (Checkpoint 1)
    const light1 = new THREE.PointLight(0xffb700, 6, 8)
    light1.position.set(-3, 2, -3)
    scene.add(light1)

    // Canlı Magenta/Mor Işık (Checkpoint 2)
    const light2 = new THREE.PointLight(0xff00ff, 6, 8)
    light2.position.set(3, 2, -3)
    scene.add(light2)

    // Canlı Parlak Turkuaz Işık (Checkpoint 3)
    const light3 = new THREE.PointLight(0x00ffcc, 8, 10)
    light3.position.set(0, 2.5, -5)
    scene.add(light3)

    // 3. Canlı Renkli Zemin & Neon Izgara
    const floorGeo = new THREE.PlaneGeometry(16, 16)
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b, // Canlı Çivit Mavi/Mor zemin
      roughness: 0.2,
      metalness: 0.6,
    })
    const floor = new THREE.Mesh(floorGeo, floorMat)
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)

    // Parlak Cyan Neon Grid
    const gridHelper = new THREE.GridHelper(16, 16, 0x00f0ff, 0xff00aa)
    gridHelper.position.y = 0.02
    scene.add(gridHelper)

    // 4. 3D Obje 1: Canlı Altın Veri Kapsülü (Checkpoint 1)
    const podGeo = new THREE.BoxGeometry(1, 1, 1)
    const podMat = new THREE.MeshStandardMaterial({
      color: 0xffb700,
      emissive: 0xff8800,
      emissiveIntensity: 0.8,
      metalness: 0.9,
      roughness: 0.1,
    })
    const podMesh = new THREE.Mesh(podGeo, podMat)
    podMesh.position.set(-3, 0.9, -3)
    podMesh.castShadow = true
    scene.add(podMesh)

    // 3D Obje 2: Canlı Magenta Hologram Çekirdeği (Checkpoint 2)
    const holoGeo = new THREE.IcosahedronGeometry(0.8, 0)
    const holoMat = new THREE.MeshStandardMaterial({
      color: 0xff00ff,
      emissive: 0xff00aa,
      emissiveIntensity: 1.0,
      wireframe: true,
    })
    const holoMesh = new THREE.Mesh(holoGeo, holoMat)
    holoMesh.position.set(3, 1.1, -3)
    scene.add(holoMesh)

    // 3D Obje 3: Canlı Parlak Turkuaz Cyber Portal Kapısı (Checkpoint 3)
    const ringGeo = new THREE.TorusGeometry(1.4, 0.2, 16, 32)
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x00ffcc,
      emissive: 0x00f0ff,
      emissiveIntensity: 1.2,
      metalness: 0.8,
    })
    const ringMesh = new THREE.Mesh(ringGeo, ringMat)
    ringMesh.position.set(0, 1.5, -5)
    scene.add(ringMesh)

    // 5. 3D Oyuncu Karakter (NEX Robot Mesh - Canlı Turkuaz & Turuncu)
    const playerGroup = new THREE.Group()

    // Body
    const bodyGeo = new THREE.CylinderGeometry(0.45, 0.55, 1, 16)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      emissiveIntensity: 0.4,
      metalness: 0.8,
    })
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat)
    bodyMesh.position.y = 0.5
    bodyMesh.castShadow = true
    playerGroup.add(bodyMesh)

    // Head
    const headGeo = new THREE.BoxGeometry(0.65, 0.55, 0.55)
    const headMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 })
    const headMesh = new THREE.Mesh(headGeo, headMat)
    headMesh.position.y = 1.15
    headMesh.castShadow = true
    playerGroup.add(headMesh)

    // Vibrant Cyan Visor
    const visorGeo = new THREE.BoxGeometry(0.55, 0.2, 0.12)
    const visorMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff })
    const visorMesh = new THREE.Mesh(visorGeo, visorMat)
    visorMesh.position.set(0, 1.18, 0.25)
    playerGroup.add(visorMesh)

    scene.add(playerGroup)

    // Render Loop (60 FPS)
    let clock = new THREE.Clock()

    const animate = () => {
      const time = clock.getElapsedTime()

      // Dönen Canlı Animasyonlar
      podMesh.rotation.y = time * 1.2
      podMesh.position.y = 0.9 + Math.sin(time * 2.5) * 0.2

      holoMesh.rotation.x = time * 1.5
      holoMesh.rotation.y = time * 2.0
      holoMesh.position.y = 1.1 + Math.sin(time * 3) * 0.25

      ringMesh.rotation.z = time * 0.8

      // Oyuncunun 3D Pozisyonunu Güncelle
      const { x, z } = playerPosRef.current
      playerGroup.position.set(x, 0, z)

      camera.position.x = x * 0.3
      camera.lookAt(x * 0.3, 0, z * 0.3 - 2)

      renderer.render(scene, camera)
      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [mounted])

  const modalKapat = (id: number) => {
    if (!kesfedilenler.includes(id)) {
      setKesfedilenler([...kesfedilenler, id])
    }
    setAktifModal(null)
    if (id === 3) {
      onBulmacaCozuldu()
    }
  }

  if (!mounted) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-arka text-cyan pixel-xs gap-3">
        <span className="text-3xl animate-bounce">🌌</span>
        <span>CANLI 3D UZAY EVRENİ YÜKLENİYOR...</span>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col bg-arka border-r border-sinir h-full overflow-hidden relative">
      
      {/* ── ÜST BAR ──────────────────────────────────────────────────────── */}
      <div className="px-4 py-2.5 bg-terminal border-b border-sinir flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="pixel-xs text-cyan">🌌 CANLI 3D UZAY EVRENİ</span>
          <span className="text-xs text-yazi-soluk">·</span>
          <span className="text-xs font-bold text-yazi">{gorevNo} — {gorevBaslik}</span>
        </div>
        <span className="pixel-xs text-altin">
          KEŞİF: {kesfedilenler.length} / 3 KAPSÜL
        </span>
      </div>

      {/* ── 3D CANLI RENKLİ WEBGL CANVASI ─────────────────────────────────── */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        
        {/* Yönlendirme Paneli */}
        <div className="absolute top-3 left-3 bg-terminal/95 border border-cyan/40 px-3 py-1.5 rounded-lg text-xs font-kod text-cyan z-10 shadow-glow-cyan">
          🚀 KONTROLLER: Klavye WASD / Ok Tuşları ile 3D Robotu Yürüt!
        </div>

        {/* THREE.JS WebGL Container */}
        <div ref={containerRef} className="w-full h-full min-h-[320px]" />

        {/* Mobil Yön Tuşları */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col items-center gap-1 bg-terminal/80 p-2 rounded-xl border border-sinir backdrop-blur-md">
          <button
            onClick={() => setPlayerPos((p) => ({ ...p, z: Math.max(-6, p.z - 0.8) }))}
            className="w-10 h-8 bg-kart border border-cyan/50 rounded-lg font-bold text-xs text-cyan active:scale-95 shadow-glow-cyan"
          >
            ▲
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setPlayerPos((p) => ({ ...p, x: Math.max(-6, p.x - 0.8) }))}
              className="w-10 h-8 bg-kart border border-cyan/50 rounded-lg font-bold text-xs text-cyan active:scale-95 shadow-glow-cyan"
            >
              ◀
            </button>
            <button
              onClick={() => setPlayerPos((p) => ({ ...p, z: Math.min(6, p.z + 0.8) }))}
              className="w-10 h-8 bg-kart border border-cyan/50 rounded-lg font-bold text-xs text-cyan active:scale-95 shadow-glow-cyan"
            >
              ▼
            </button>
            <button
              onClick={() => setPlayerPos((p) => ({ ...p, x: Math.min(6, p.x + 0.8) }))}
              className="w-10 h-8 bg-kart border border-cyan/50 rounded-lg font-bold text-xs text-cyan active:scale-95 shadow-glow-cyan"
            >
              ▶
            </button>
          </div>
        </div>

      </div>

      {/* ── İNTERAKTİF BULMACA MODALLARI ─────────────────────────────────── */}
      {aktifModal === 1 && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-scale-in">
          <div className="bg-terminal border-2 border-altin rounded-2xl p-5 max-w-sm w-full flex flex-col gap-3 shadow-glow-altin">
            <div className="flex items-center gap-2 text-altin font-bold text-sm">
              <span>📦 1. VERİ KAPSÜLÜNÜ BULDUN!</span>
            </div>
            <p className="text-xs text-yazi leading-relaxed font-ui">
              <strong>Yapay Zeka Uzay Verisi:</strong><br />
              Yapay zeka tek bir veriyle öğrenemez. Tıpkı gezegen keşfeder gibi milyonlarca örnek veriyi hafızasına yükler!
            </p>
            <button
              onClick={() => modalKapat(1)}
              className="btn-altin text-xs py-2 font-bold shadow-glow-altin"
            >
              💡 Kapsül Bilgisini Al, Devam Et!
            </button>
          </div>
        </div>
      )}

      {aktifModal === 2 && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-scale-in">
          <div className="bg-terminal border-2 border-mor rounded-2xl p-5 max-w-sm w-full flex flex-col gap-3 shadow-glow-mor">
            <div className="flex items-center gap-2 text-mor font-bold text-sm">
              <span>🔮 2. NÖRON KALIP HOLOGRAMI!</span>
            </div>
            <p className="text-xs text-yazi leading-relaxed font-ui">
              <strong>Kalıp Eşleme Hologramı:</strong><br />
              Yapay zeka verilerin içindeki kalıpları eşleştirerek yeni şeyler üretmeyi öğrenir!
            </p>
            <button
              onClick={() => modalKapat(2)}
              className="btn-mor text-xs py-2 font-bold shadow-glow-mor"
            >
              🧠 Hologramı Tamamla, İleri!
            </button>
          </div>
        </div>
      )}

      {aktifModal === 3 && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-scale-in">
          <div className="bg-terminal border-2 border-cyan rounded-2xl p-5 max-w-sm w-full flex flex-col gap-3 shadow-glow-cyan">
            <div className="flex items-center gap-2 text-cyan font-bold text-sm">
              <span>🌌 NEXUS CYBER PORTALINA ULAŞTIN!</span>
            </div>
            <p className="text-xs text-yazi leading-relaxed font-ui">
              Harika kaşif! 3D Uzay Evrenindeki tüm kapsülleri topladın. Şimdi sağ taraftaki yapboz alanında öğrendiğin promptu birleştir ve portalı aktifleştir!
            </p>
            <button
              onClick={() => modalKapat(3)}
              className="btn-yesil text-xs py-2 font-bold shadow-glow-yesil"
            >
              🔑 Portalı Açmak İçin Prompt Yaz!
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
