'use client'

import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'

interface KenneySpace3DEngineProps {
  gorevBaslik: string
  gorevNo: string
  onBulmacaCozuldu: () => void
}

export default function KenneySpace3DEngine({
  gorevBaslik,
  gorevNo,
  onBulmacaCozuldu,
}: KenneySpace3DEngineProps) {
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  
  const [pos, setPos] = useState({ x: 0, z: 4 })
  const [rotY, setRotY] = useState(0)
  const [aktifModal, setAktifModal] = useState<number | null>(null)
  const [kesfedilenler, setKesfedilenler] = useState<number[]>([])

  const posRef = useRef(pos)
  posRef.current = pos

  useEffect(() => {
    setMounted(true)
  }, [])

  // WASD Yön Tuşları
  useEffect(() => {
    if (!mounted) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (aktifModal !== null) return

      let { x, z } = posRef.current
      let targetRot = rotY
      const speed = 0.55

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        z -= speed
        targetRot = Math.PI
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        z += speed
        targetRot = 0
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        x -= speed
        targetRot = -Math.PI / 2
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        x += speed
        targetRot = Math.PI / 2
      }

      x = Math.max(-12, Math.min(12, x))
      z = Math.max(-12, Math.min(12, z))

      setPos({ x, z })
      setRotY(targetRot)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [aktifModal, rotY, mounted])

  // Etkileşim Kontrolü
  useEffect(() => {
    if (!mounted) return
    const { x, z } = pos
    if (Math.hypot(x - (-6), z - (-4)) < 1.8 && !kesfedilenler.includes(1)) {
      setAktifModal(1)
    } else if (Math.hypot(x - 6, z - (-4)) < 1.8 && !kesfedilenler.includes(2)) {
      setAktifModal(2)
    } else if (Math.hypot(x - 0, z - (-9)) < 2.0 && !kesfedilenler.includes(3)) {
      setAktifModal(3)
    }
  }, [pos, kesfedilenler, mounted])

  // KENNEY SPACE KIT 3D RENDER MOTORU (STYLIZED SPACE TREES & STATIONS)
  useEffect(() => {
    if (!mounted) return
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth || 700
    const height = container.clientHeight || 550

    // 1. Scene, Skybox & Dark Cyan Fog
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0c1322)
    scene.fog = new THREE.FogExp2(0x0c1322, 0.02)

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200)
    camera.position.set(0, 14, 18)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    container.appendChild(renderer.domElement)

    // 2. Kenney Cyber Lighting
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 1.8)
    scene.add(ambientLight)

    const sunLight = new THREE.DirectionalLight(0x00f0ff, 2.5)
    sunLight.position.set(15, 30, 20)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 2048
    sunLight.shadow.mapSize.height = 2048
    scene.add(sunLight)

    // 3. Kenney Uzay Zemin Kaplaması (Dark Cyan Space Terrain)
    const groundGeo = new THREE.PlaneGeometry(40, 40, 32, 32)
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.4,
      metalness: 0.6,
    })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    // Kenney Metalik Uzay Yolu (Space Grid Runway)
    const pathGeo = new THREE.PlaneGeometry(6, 30)
    const pathMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 })
    const pathMesh = new THREE.Mesh(pathGeo, pathMat)
    pathMesh.rotation.x = -Math.PI / 2
    pathMesh.position.set(0, 0.05, -2)
    pathMesh.receiveShadow = true
    scene.add(pathMesh)

    // 4. KENNEY SPACE KIT BİYOLÜMİNESAN BÜYÜLÜ UZAY AĞAÇLARI (Alien Space Trees)
    const createKenneySpaceTree = (tx: number, tz: number) => {
      const treeGroup = new THREE.Group()

      // Metalik/Karanlık Gövde
      const trunkGeo = new THREE.CylinderGeometry(0.35, 0.55, 2.2, 8)
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
      const trunk = new THREE.Mesh(trunkGeo, trunkMat)
      trunk.position.y = 1.1
      trunk.castShadow = true
      treeGroup.add(trunk)

      // Işıldayan Mor/Turkuaz Uzay Kapsül Yaprakları (Kenney Canopy)
      const foliageMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x0284c7,
        emissiveIntensity: 0.6,
        roughness: 0.2,
      })

      const f1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4), foliageMat)
      f1.position.y = 2.6
      f1.castShadow = true
      treeGroup.add(f1)

      const f2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.0), foliageMat)
      f2.position.y = 3.8
      f2.castShadow = true
      treeGroup.add(f2)

      treeGroup.position.set(tx, 0, tz)
      scene.add(treeGroup)
    }

    const treePositions = [
      [-9, -8], [-11, -2], [-10, 4], [-8, 9],
      [9, -8], [11, -2], [10, 4], [8, 9],
      [-5, -11], [5, -11], [-12, -12], [12, -12]
    ]
    treePositions.forEach(([tx, tz]) => createKenneySpaceTree(tx, tz))

    // 5. KENNEY SPACE KIT İSTASYON NESNELERİ (Space Pod, Solar Arrays, Satellite Dish)

    // Checkpoint 1: Kenney Güneş Panelli Veri Kapsülü (-6, -4)
    const podGroup = new THREE.Group()
    const podMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.4, 1.8, 12),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.8 })
    )
    podMesh.position.y = 0.9
    podMesh.castShadow = true
    podGroup.add(podMesh)

    // Güneş Panelleri (Kenney Solar Panels)
    const panelGeo = new THREE.BoxGeometry(2.4, 0.1, 0.8)
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9 })
    const panelMesh = new THREE.Mesh(panelGeo, panelMat)
    panelMesh.position.set(0, 1.4, 0)
    podGroup.add(panelMesh)

    podGroup.position.set(-6, 0, -4)
    scene.add(podGroup)

    // Checkpoint 2: Kenney Uydu Anten Kulesi (6, -4)
    const satGroup = new THREE.Group()
    const poleMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.4, 4, 8),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 })
    )
    poleMesh.position.y = 2
    satGroup.add(poleMesh)

    const dishMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.4, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.4),
      new THREE.MeshStandardMaterial({ color: 0xc084fc, emissive: 0xa855f7, emissiveIntensity: 0.8, side: THREE.DoubleSide })
    )
    dishMesh.rotation.x = Math.PI / 3
    dishMesh.position.set(0, 4, 0)
    satGroup.add(dishMesh)

    satGroup.position.set(6, 0, -4)
    scene.add(satGroup)

    // Checkpoint 3: NEXUS Uzay Portalı (0, -9)
    const portalGroup = new THREE.Group()
    const pMesh = new THREE.Mesh(
      new THREE.TorusGeometry(2, 0.25, 16, 32),
      new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x0284c7, emissiveIntensity: 1.5 })
    )
    pMesh.position.y = 2.2
    portalGroup.add(pMesh)
    portalGroup.position.set(0, 0, -9)
    scene.add(portalGroup)

    // 6. KAPÜŞONLU SEVİMLİ ROBOT NEX HERO 3D CHARACTER
    const heroGroup = new THREE.Group()

    // Turkuaz Kapüşon
    const hoodMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.2 })
    )
    hoodMesh.position.y = 1.2
    hoodMesh.castShadow = true
    heroGroup.add(hoodMesh)

    // Vizör
    const visorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.18, 0.1),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff })
    )
    visorMesh.position.set(0, 1.22, 0.22)
    heroGroup.add(visorMesh)

    // Body
    const bodyMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.48, 0.9, 16),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 })
    )
    bodyMesh.position.y = 0.5
    bodyMesh.castShadow = true
    heroGroup.add(bodyMesh)

    scene.add(heroGroup)

    // Render Loop (60 FPS)
    let clock = new THREE.Clock()

    const animate = () => {
      const time = clock.getElapsedTime()

      pMesh.rotation.z = time * 1.2
      podGroup.position.y = Math.sin(time * 3) * 0.08
      dishMesh.rotation.y = time * 0.8

      const { x, z } = posRef.current
      heroGroup.position.set(x, Math.sin(time * 6) * 0.06, z)
      heroGroup.rotation.y = rotY

      // Smooth Camera Follow
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, x * 0.4, 0.05)
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, z + 12, 0.05)
      camera.lookAt(x * 0.4, 1, z - 2)

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

  if (!mounted) return null

  return (
    <div ref={containerRef} className="w-full flex flex-col bg-arka border-r border-sinir h-full overflow-hidden relative">
      
      {/* ── ÜST BAR ──────────────────────────────────────────────────────── */}
      <div className="px-4 py-2.5 bg-terminal border-b border-sinir flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="pixel-xs text-cyan">🚀 KENNEY SPACE KIT 3D ENGINE</span>
          <span className="text-xs text-yazi-soluk">·</span>
          <span className="text-xs font-bold text-yazi">{gorevNo} — {gorevBaslik}</span>
        </div>
        <span className="pixel-xs text-altin">
          KEŞİF: {kesfedilenler.length} / 3 İSTASYON
        </span>
      </div>

      {/* ── FULL-HEIGHT KENNEY SPACE 3D CANVAS ─────────────────────────── */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        
        {/* Yönlendirme Barı */}
        <div className="absolute top-3 left-3 bg-terminal/95 border border-cyan/40 px-3 py-1.5 rounded-lg text-xs font-kod text-cyan z-10 shadow-glow-cyan flex items-center gap-2">
          <span>🤖 NEX'İ YÜRÜT:</span>
          <span className="text-yazi font-medium">WASD veya Ok Tuşlarıyla Kenney Uzay Dünyasında Gezin!</span>
        </div>

        {/* THREE.JS WebGL Container */}
        <div className="w-full h-full" />

        {/* Mobil Yön Tuşları */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col items-center gap-1 bg-terminal/80 p-2 rounded-xl border border-sinir backdrop-blur-md">
          <button
            onClick={() => setPos((p) => ({ ...p, z: Math.max(-10, p.z - 0.8) }))}
            className="w-10 h-8 bg-kart border border-cyan/50 rounded-lg font-bold text-xs text-cyan active:scale-95 shadow-glow-cyan"
          >
            ▲
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setPos((p) => ({ ...p, x: Math.max(-10, p.x - 0.8) }))}
              className="w-10 h-8 bg-kart border border-cyan/50 rounded-lg font-bold text-xs text-cyan active:scale-95 shadow-glow-cyan"
            >
              ◀
            </button>
            <button
              onClick={() => setPos((p) => ({ ...p, z: Math.min(10, p.z + 0.8) }))}
              className="w-10 h-8 bg-kart border border-cyan/50 rounded-lg font-bold text-xs text-cyan active:scale-95 shadow-glow-cyan"
            >
              ▼
            </button>
            <button
              onClick={() => setPos((p) => ({ ...p, x: Math.min(10, p.x + 0.8) }))}
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
              <span>💾 1. KENNEY GÜNEŞ PANELLİ KAPSÜL</span>
            </div>
            <p className="text-xs text-yazi leading-relaxed font-ui">
              <strong>Kapüşonlu NEX Robot:</strong><br />
              "Bip bop! Hafıza verilerim Güneş Panelli Kapsülde saklanıyor! Yapay zeka binlerce kedi verisiyle eğitilir!"
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
              <span>📡 2. KENNEY UYDU ANTEN KULESI</span>
            </div>
            <p className="text-xs text-yazi leading-relaxed font-ui">
              <strong>Kapüşonlu NEX Robot:</strong><br />
              "Uydu sinyali geldi! Yapay zeka verileri tarayıp ortak kalıpları (bıyık, göz) çıkarır!"
            </p>
            <button
              onClick={() => modalKapat(2)}
              className="btn-mor text-xs py-2 font-bold shadow-glow-mor"
            >
              🧠 Kalıbı Çöz, Portala Uç!
            </button>
          </div>
        </div>
      )}

      {aktifModal === 3 && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-scale-in">
          <div className="bg-terminal border-2 border-cyan rounded-2xl p-5 max-w-sm w-full flex flex-col gap-3 shadow-glow-cyan">
            <div className="flex items-center gap-2 text-cyan font-bold text-sm">
              <span>🔮 3. NEXUS UZAY PORTALI</span>
            </div>
            <p className="text-xs text-yazi leading-relaxed font-ui">
              Tebrikler bilge kaşif! Kenney Space Kit 3D Evrenindeki tüm şifreleri çözdün. Şimdi sağ taraftaki editörde promptunu yaz ve portalı kurtar!
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
