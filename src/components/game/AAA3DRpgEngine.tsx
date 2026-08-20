'use client'

import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'

interface AAA3DRpgEngineProps {
  gorevBaslik: string
  gorevNo: string
  onBulmacaCozuldu: () => void
}

export default function AAA3DRpgEngine({
  gorevBaslik,
  gorevNo,
  onBulmacaCozuldu,
}: AAA3DRpgEngineProps) {
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  
  // Karakter Konumu ve Yönü
  const [pos, setPos] = useState({ x: 0, z: 4 })
  const [rotY, setRotY] = useState(0)
  const [aktifModal, setAktifModal] = useState<number | null>(null)
  const [kesfedilenler, setKesfedilenler] = useState<number[]>([])

  const posRef = useRef(pos)
  posRef.current = pos

  useEffect(() => {
    setMounted(true)
  }, [])

  // Klavye Yön Kontrolleri (WASD & Ok Tuşları ile Karakter Yönü ve Yürüme)
  useEffect(() => {
    if (!mounted) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (aktifModal !== null) return

      let { x, z } = posRef.current
      let targetRot = rotY
      const speed = 0.5

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        z -= speed
        targetRot = Math.PI // İleri
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        z += speed
        targetRot = 0 // Geri
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        x -= speed
        targetRot = -Math.PI / 2 // Sol
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        x += speed
        targetRot = Math.PI / 2 // Sağ
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
    // 1. Zümrüt Hafıza Sandığı (-6, -4)
    if (Math.hypot(x - (-6), z - (-4)) < 1.8 && !kesfedilenler.includes(1)) {
      setAktifModal(1)
    }
    // 2. Kadim Şato Kulesi (6, -4)
    else if (Math.hypot(x - 6, z - (-4)) < 1.8 && !kesfedilenler.includes(2)) {
      setAktifModal(2)
    }
    // 3. NEXUS Gökyüzü Portalı (0, -9)
    else if (Math.hypot(x - 0, z - (-9)) < 2.0 && !kesfedilenler.includes(3)) {
      setAktifModal(3)
    }
  }, [pos, kesfedilenler, mounted])

  // 🌟 GERÇEK UNITY RPG TARZI 3D DÜNYA MOTORU (STYLIZED RPG TERRAIN & SKYBOX)
  useEffect(() => {
    if (!mounted) return
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth || 700
    const height = container.clientHeight || 550

    // 1. Scene, Skybox & Atmosfer Sisleri
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x7dd3fc) // Açık Masalsı Gökyüzü Mavisi
    scene.fog = new THREE.FogExp2(0x7dd3fc, 0.015)

    // 3rd Person / Action RPG Kamera Acısı (Don't Starve & Unity RPG Kamera)
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200)
    camera.position.set(0, 14, 18)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    container.appendChild(renderer.domElement)

    // 2. Güneş & Doğal Işıklandırma (Vibrant Unity Lighting)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2)
    scene.add(ambientLight)

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 2.2)
    sunLight.position.set(15, 30, 20)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 2048
    sunLight.shadow.mapSize.height = 2048
    sunLight.shadow.camera.near = 0.5
    sunLight.shadow.camera.far = 100
    sunLight.shadow.camera.left = -20
    sunLight.shadow.camera.right = 20
    sunLight.shadow.camera.top = 20
    sunLight.shadow.camera.bottom = -20
    scene.add(sunLight)

    // 3. Unity Stylized Yeşil Çim Arazi (Rich Grass Terrain)
    const groundGeo = new THREE.PlaneGeometry(40, 40, 32, 32)
    // Arazi Yükseklik Dalgalanmaları (Stylized Hills)
    const posAttr = groundGeo.attributes.position
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i)
      const vy = posAttr.getY(i)
      const vz = Math.sin(vx * 0.3) * Math.cos(vy * 0.3) * 0.6
      posAttr.setZ(i, vz)
    }
    groundGeo.computeVertexNormals()

    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x4ade80, // Canlı Zümrüt Yeşili Çim
      roughness: 0.8,
      metalness: 0.1,
    })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    // 4. Toprak Taş Patika (Dirt Path)
    const pathGeo = new THREE.PlaneGeometry(6, 30)
    const pathMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 })
    const pathMesh = new THREE.Mesh(pathGeo, pathMat)
    pathMesh.rotation.x = -Math.PI / 2
    pathMesh.position.set(0, 0.05, -2)
    pathMesh.receiveShadow = true
    scene.add(pathMesh)

    // 5. Stylized 3D Çam ve Ağaçlar (Low-Poly 3D Trees)
    const createTree = (tx: number, tz: number) => {
      const treeGroup = new THREE.Group()

      // Gövde (Kahverengi Ahşap)
      const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 2, 8)
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 })
      const trunk = new THREE.Mesh(trunkGeo, trunkMat)
      trunk.position.y = 1
      trunk.castShadow = true
      treeGroup.add(trunk)

      // Katmanlı Yapraklar (Emerald Green Foliage)
      const foliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4 })
      
      const f1 = new THREE.Mesh(new THREE.ConeGeometry(1.8, 2.5, 8), foliageMat)
      f1.position.y = 2.5
      f1.castShadow = true
      treeGroup.add(f1)

      const f2 = new THREE.Mesh(new THREE.ConeGeometry(1.4, 2, 8), foliageMat)
      f2.position.y = 3.6
      f2.castShadow = true
      treeGroup.add(f2)

      treeGroup.position.set(tx, 0, tz)
      scene.add(treeGroup)
    }

    // Orman Ağaçları Dizisi
    const treePositions = [
      [-9, -8], [-11, -2], [-10, 4], [-8, 9],
      [9, -8], [11, -2], [10, 4], [8, 9],
      [-5, -11], [5, -11], [-12, -12], [12, -12]
    ]
    treePositions.forEach(([tx, tz]) => createTree(tx, tz))

    // 6. STYLIZED 3D BINA & CHECKPOINT OBJERI

    // Checkpoint 1: Zümrüt Hazine Sandığı (-6, -4)
    const chestGroup = new THREE.Group()
    const chestBase = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.8, 0.9),
      new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.3, metalness: 0.7 })
    )
    chestBase.position.y = 0.4
    chestBase.castShadow = true
    chestGroup.add(chestBase)

    const chestGlow = new THREE.PointLight(0xf59e0b, 5, 6)
    chestGlow.position.set(0, 1.2, 0)
    chestGroup.add(chestGlow)
    chestGroup.position.set(-6, 0, -4)
    scene.add(chestGroup)

    // Checkpoint 2: Kadim Şato Kulesi (6, -4)
    const towerGroup = new THREE.Group()
    const towerMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.4, 4, 12),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5 })
    )
    towerMesh.position.y = 2
    towerMesh.castShadow = true
    towerGroup.add(towerMesh)

    const roofMesh = new THREE.Mesh(
      new THREE.ConeGeometry(1.6, 2, 12),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3 })
    )
    roofMesh.position.y = 5
    roofMesh.castShadow = true
    towerGroup.add(roofMesh)

    towerGroup.position.set(6, 0, -4)
    scene.add(towerGroup)

    // Checkpoint 3: NEXUS Gökyüzü Portalı (0, -9)
    const portalGroup = new THREE.Group()
    const pMesh = new THREE.Mesh(
      new THREE.TorusGeometry(2, 0.25, 16, 32),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 1.5 })
    )
    pMesh.position.y = 2.2
    portalGroup.add(pMesh)
    portalGroup.position.set(0, 0, -9)
    scene.add(portalGroup)

    // 7. KAPÜŞONLU SEVİMLİ ROBOT NEX HERO 3D CHARACTER (FULL UNITY STYLE 3D HERO)
    const heroGroup = new THREE.Group()

    // Kapüşon (Cyan Hood)
    const hoodMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2 })
    )
    hoodMesh.position.y = 1.2
    hoodMesh.castShadow = true
    heroGroup.add(hoodMesh)

    // Vizör (Glowing Eye)
    const visorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.18, 0.1),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    )
    visorMesh.position.set(0, 1.22, 0.22)
    heroGroup.add(visorMesh)

    // Robot Gövde
    const bodyMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.48, 0.9, 16),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 })
    )
    bodyMesh.position.y = 0.5
    bodyMesh.castShadow = true
    heroGroup.add(bodyMesh)

    // Robot Pelerin/Kapüşon Arkası
    const capeMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.8, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x0369a1 })
    )
    capeMesh.position.set(0, 0.6, -0.25)
    heroGroup.add(capeMesh)

    scene.add(heroGroup)

    // 8. CANLI RENDER DÖNGÜSÜ & KAMERA TAKİBİ (60 FPS)
    let clock = new THREE.Clock()

    const animate = () => {
      const time = clock.getElapsedTime()

      // Portal Dönüşü
      pMesh.rotation.z = time * 1.2

      // Sandık Havada Süzülme
      chestGroup.position.y = Math.sin(time * 3) * 0.1

      // Karakter Konumu ve Dönüşü
      const { x, z } = posRef.current
      heroGroup.position.set(x, Math.sin(time * 6) * 0.06, z)
      heroGroup.rotation.y = rotY

      // Unity Style Smooth Follow Camera (Kamera Oyuncuyu Takip Etsin)
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
          <span className="pixel-xs text-yesil">🌿 UNITY STYLIZED 3D RPG ENGINE</span>
          <span className="text-xs text-yazi-soluk">·</span>
          <span className="text-xs font-bold text-yazi">{gorevNo} — {gorevBaslik}</span>
        </div>
        <span className="pixel-xs text-altin">
          KEŞİF: {kesfedilenler.length} / 3 İSTASYON
        </span>
      </div>

      {/* ── FULL-HEIGHT UNITY STYLIZED 3D RPG CANVAS ─────────────────────── */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        
        {/* Yönlendirme Barı */}
        <div className="absolute top-3 left-3 bg-terminal/95 border border-yesil/40 px-3 py-1.5 rounded-lg text-xs font-kod text-yesil z-10 shadow-glow-yesil flex items-center gap-2">
          <span>🤖 NEX'İ YÜRÜT:</span>
          <span className="text-yazi font-medium">WASD veya Ok Tuşlarıyla Yeşil 3D RPG Dünyasında Gezin!</span>
        </div>

        {/* THREE.JS WebGL Container */}
        <div className="w-full h-full" />

        {/* Mobil Yön Tuşları */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col items-center gap-1 bg-terminal/80 p-2 rounded-xl border border-sinir backdrop-blur-md">
          <button
            onClick={() => setPos((p) => ({ ...p, z: Math.max(-10, p.z - 0.8) }))}
            className="w-10 h-8 bg-kart border border-yesil/50 rounded-lg font-bold text-xs text-yesil active:scale-95 shadow-glow-yesil"
          >
            ▲
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setPos((p) => ({ ...p, x: Math.max(-10, p.x - 0.8) }))}
              className="w-10 h-8 bg-kart border border-yesil/50 rounded-lg font-bold text-xs text-yesil active:scale-95 shadow-glow-yesil"
            >
              ◀
            </button>
            <button
              onClick={() => setPos((p) => ({ ...p, z: Math.min(10, p.z + 0.8) }))}
              className="w-10 h-8 bg-kart border border-yesil/50 rounded-lg font-bold text-xs text-yesil active:scale-95 shadow-glow-yesil"
            >
              ▼
            </button>
            <button
              onClick={() => setPos((p) => ({ ...p, x: Math.min(10, p.x + 0.8) }))}
              className="w-10 h-8 bg-kart border border-yesil/50 rounded-lg font-bold text-xs text-yesil active:scale-95 shadow-glow-yesil"
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
              <span>📦 1. ZÜMRÜT HAFIZA SANDIĞINI BULDUN!</span>
            </div>
            <p className="text-xs text-yazi leading-relaxed font-ui">
              <strong>Kapüşonlu NEX Robot:</strong><br />
              "Bip bop! Hafıza verilerim burada saklanıyor! Yapay zeka tek bir resimle öğrenemez, milyonlarca kedi resmini veri bankasına depolar!"
            </p>
            <button
              onClick={() => modalKapat(1)}
              className="btn-altin text-xs py-2 font-bold shadow-glow-altin"
            >
              💡 Sandık Bilgisini Al, Devam Et!
            </button>
          </div>
        </div>
      )}

      {aktifModal === 2 && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-scale-in">
          <div className="bg-terminal border-2 border-mor rounded-2xl p-5 max-w-sm w-full flex flex-col gap-3 shadow-glow-mor">
            <div className="flex items-center gap-2 text-mor font-bold text-sm">
              <span>🏰 2. KADİM ŞATO KULESİNE ULAŞTIN!</span>
            </div>
            <p className="text-xs text-yazi leading-relaxed font-ui">
              <strong>Kapüşonlu NEX Robot:</strong><br />
              "Şato kulesindeki rünler aydınlandı! Yapay zeka verileri tarayıp ortak kalıpları (kedi bıyığı, kulak şekli) çıkarır!"
            </p>
            <button
              onClick={() => modalKapat(2)}
              className="btn-mor text-xs py-2 font-bold shadow-glow-mor"
            >
              🧠 Kalıbı Çöz, Gökyüzü Portalına Uç!
            </button>
          </div>
        </div>
      )}

      {aktifModal === 3 && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-scale-in">
          <div className="bg-terminal border-2 border-cyan rounded-2xl p-5 max-w-sm w-full flex flex-col gap-3 shadow-glow-cyan">
            <div className="flex items-center gap-2 text-cyan font-bold text-sm">
              <span>🔮 3. NEXUS GÖKYÜZÜ PORTALINA ULAŞTIN!</span>
            </div>
            <p className="text-xs text-yazi leading-relaxed font-ui">
              Tebrikler bilge kaşif! Unity 3D RPG Dünyasındaki tüm şifreleri çözdün. Şimdi sağ taraftaki yapboz editöründe promptunu birleştir ve portalı kurtar!
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
