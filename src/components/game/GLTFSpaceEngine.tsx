'use client'

import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'

interface GLTFSpaceEngineProps {
  gorevBaslik: string
  gorevNo: string
  onBulmacaCozuldu: () => void
}

export default function GLTFSpaceEngine({
  gorevBaslik,
  gorevNo,
  onBulmacaCozuldu,
}: GLTFSpaceEngineProps) {
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  
  const [pos, setPos] = useState({ x: 0, z: 2 })
  const [aktifModal, setAktifModal] = useState<number | null>(null)
  const [kesfedilenler, setKesfedilenler] = useState<number[]>([])

  const posRef = useRef(pos)
  posRef.current = pos

  useEffect(() => {
    setMounted(true)
  }, [])

  // Klavye Yön Kontrolleri (WASD & Ok Tuşları)
  useEffect(() => {
    if (!mounted) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (aktifModal !== null) return

      let { x, z } = posRef.current

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') z -= 0.6
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') z += 0.6
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') x -= 0.6
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') x += 0.6

      x = Math.max(-6, Math.min(6, x))
      z = Math.max(-6, Math.min(6, z))

      setPos({ x, z })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [aktifModal, mounted])

  // Etkileşim Kontrolü
  useEffect(() => {
    if (!mounted) return
    const { x, z } = pos
    if (Math.hypot(x - (-3), z - (-3)) < 1.3 && !kesfedilenler.includes(1)) {
      setAktifModal(1)
    } else if (Math.hypot(x - 3, z - (-3)) < 1.3 && !kesfedilenler.includes(2)) {
      setAktifModal(2)
    } else if (Math.hypot(x - 0, z - (-5)) < 1.3 && !kesfedilenler.includes(3)) {
      setAktifModal(3)
    }
  }, [pos, kesfedilenler, mounted])

  // THREE.JS 3D GLTF PRO STYLE ENGINE (SIFIR KULLANICI EFORU)
  useEffect(() => {
    if (!mounted) return
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth || 600
    const height = container.clientHeight || 500

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x070b19)
    scene.fog = new THREE.FogExp2(0x070b19, 0.04)

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0, 10, 11)
    camera.lookAt(0, -1, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    container.appendChild(renderer.domElement)

    // 2. Canlı Renkli Işıklandırma
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 2.0)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 3.0)
    dirLight.position.set(6, 16, 8)
    dirLight.castShadow = true
    scene.add(dirLight)

    // Checkpoint Point Lights
    const light1 = new THREE.PointLight(0xffb700, 6, 8)
    light1.position.set(-3, 2, -3)
    scene.add(light1)

    const light2 = new THREE.PointLight(0xff00ff, 6, 8)
    light2.position.set(3, 2, -3)
    scene.add(light2)

    const light3 = new THREE.PointLight(0x00ffcc, 8, 10)
    light3.position.set(0, 2.5, -5)
    scene.add(light3)

    // 3. Uzay İstasyonu Platform Zeminleri
    const platformGeo = new THREE.CylinderGeometry(8, 8.5, 0.6, 32)
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.8,
    })
    const platform = new THREE.Mesh(platformGeo, platformMat)
    platform.position.y = -0.3
    platform.receiveShadow = true
    scene.add(platform)

    // Parlak Çember Enerji Şeritleri
    const ringGeo = new THREE.RingGeometry(7.5, 7.8, 32)
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide })
    const ringMesh = new THREE.Mesh(ringGeo, ringMat)
    ringMesh.rotation.x = Math.PI / 2
    ringMesh.position.y = 0.02
    scene.add(ringMesh)

    // 4. Yıldız Parçacıkları
    const starsGeo = new THREE.BufferGeometry()
    const count = 300
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 40
      positions[i + 1] = Math.random() * 20
      positions[i + 2] = (Math.random() - 0.5) * 40
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const starsMat = new THREE.PointsMaterial({ color: 0x00f0ff, size: 0.15, transparent: true, opacity: 0.8 })
    const starField = new THREE.Points(starsGeo, starsMat)
    scene.add(starField)

    // 5. KAPÜŞONLU ROBOT NEX 3D MODELİ (KASK + MAVİ VİZÖR + SIFIR KULLANICI EFORU)
    const nexRobotGroup = new THREE.Group()

    // Kapüşon (Dark Cyan Hooded Mesh)
    const hoodGeo = new THREE.SphereGeometry(0.55, 16, 16)
    const hoodMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.2 })
    const hoodMesh = new THREE.Mesh(hoodGeo, hoodMat)
    hoodMesh.position.y = 1.15
    hoodMesh.castShadow = true
    nexRobotGroup.add(hoodMesh)

    // Kafa & Mavi Göz Vizörü
    const visorGeo = new THREE.BoxGeometry(0.55, 0.2, 0.12)
    const visorMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff })
    const visorMesh = new THREE.Mesh(visorGeo, visorMat)
    visorMesh.position.set(0, 1.18, 0.25)
    nexRobotGroup.add(visorMesh)

    // Robot Body (Dark Metallic)
    const bodyGeo = new THREE.CylinderGeometry(0.45, 0.55, 1, 16)
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 })
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat)
    bodyMesh.position.y = 0.5
    bodyMesh.castShadow = true
    nexRobotGroup.add(bodyMesh)

    scene.add(nexRobotGroup)

    // 6. İSTASYON OBJELERİ
    // Altın Veri Kapsülü
    const podGeo = new THREE.BoxGeometry(1, 1, 1)
    const podMat = new THREE.MeshStandardMaterial({ color: 0xffb700, emissive: 0xff8800, emissiveIntensity: 0.8, metalness: 0.9 })
    const podMesh = new THREE.Mesh(podGeo, podMat)
    podMesh.position.set(-3, 0.9, -3)
    podMesh.castShadow = true
    scene.add(podMesh)

    // Mor Nöron Hologramı
    const holoGeo = new THREE.IcosahedronGeometry(0.8, 0)
    const holoMat = new THREE.MeshStandardMaterial({ color: 0xff00ff, emissive: 0xff00aa, emissiveIntensity: 1.0, wireframe: true })
    const holoMesh = new THREE.Mesh(holoGeo, holoMat)
    holoMesh.position.set(3, 1.1, -3)
    scene.add(holoMesh)

    // Turkuaz Portal Kapısı
    const portalGeo = new THREE.TorusGeometry(1.4, 0.2, 16, 32)
    const portalMat = new THREE.MeshStandardMaterial({ color: 0x00ffcc, emissive: 0x00f0ff, emissiveIntensity: 1.2 })
    const portalMesh = new THREE.Mesh(portalGeo, portalMat)
    portalMesh.position.set(0, 1.5, -5)
    scene.add(portalMesh)

    // Render Loop (60 FPS)
    let clock = new THREE.Clock()

    const animate = () => {
      const time = clock.getElapsedTime()

      podMesh.rotation.y = time * 1.2
      podMesh.position.y = 0.9 + Math.sin(time * 2.5) * 0.2

      holoMesh.rotation.x = time * 1.5
      holoMesh.rotation.y = time * 2.0
      holoMesh.position.y = 1.1 + Math.sin(time * 3) * 0.25

      portalMesh.rotation.z = time * 0.8
      starField.rotation.y = time * 0.05

      // NEX Robot Pozisyonu ve Floating Süzülme Animasyonu
      const { x, z } = posRef.current
      nexRobotGroup.position.set(x, Math.sin(time * 5) * 0.08, z)

      camera.position.x = x * 0.25
      camera.lookAt(x * 0.25, 0, z * 0.25 - 2)

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
          <span className="pixel-xs text-cyan">🤖 3D HOODED NEX ROBOT ENGINE</span>
          <span className="text-xs text-yazi-soluk">·</span>
          <span className="text-xs font-bold text-yazi">{gorevNo} — {gorevBaslik}</span>
        </div>
        <span className="pixel-xs text-altin">
          KEŞİF: {kesfedilenler.length} / 3 İSTASYON
        </span>
      </div>

      {/* ── 3D FULL-HEIGHT UZAY CANVASI ─────────────────────────────────── */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        
        {/* Yönlendirme Barı */}
        <div className="absolute top-3 left-3 bg-terminal/95 border border-cyan/40 px-3 py-1.5 rounded-lg text-xs font-kod text-cyan z-10 shadow-glow-cyan">
          🚀 KONTROLLER: WASD veya Ok Tuşlarıyla Kapüşonlu NEX Robotunu Yürüt!
        </div>

        {/* THREE.JS WebGL Container */}
        <div className="w-full h-full" />

        {/* Mobil Yön Tuşları */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col items-center gap-1 bg-terminal/80 p-2 rounded-xl border border-sinir backdrop-blur-md">
          <button
            onClick={() => setPos((p) => ({ ...p, z: Math.max(-6, p.z - 0.8) }))}
            className="w-10 h-8 bg-kart border border-cyan/50 rounded-lg font-bold text-xs text-cyan active:scale-95 shadow-glow-cyan"
          >
            ▲
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setPos((p) => ({ ...p, x: Math.max(-6, p.x - 0.8) }))}
              className="w-10 h-8 bg-kart border border-cyan/50 rounded-lg font-bold text-xs text-cyan active:scale-95 shadow-glow-cyan"
            >
              ◀
            </button>
            <button
              onClick={() => setPos((p) => ({ ...p, z: Math.min(6, p.z + 0.8) }))}
              className="w-10 h-8 bg-kart border border-cyan/50 rounded-lg font-bold text-xs text-cyan active:scale-95 shadow-glow-cyan"
            >
              ▼
            </button>
            <button
              onClick={() => setPos((p) => ({ ...p, x: Math.min(6, p.x + 0.8) }))}
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
              <span>📡 2. NÖRON KALIP HOLOGRAMINA ULAŞTIN!</span>
            </div>
            <p className="text-xs text-yazi leading-relaxed font-ui">
              <strong>Kapüşonlu NEX Robot:</strong><br />
              "Uydu sinyali geldi! Yapay zeka verileri tarayıp ortak kalıpları (kedi bıyığı, göz şekli) çıkarır!"
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
              <span>🔮 3. NEXUS CYBER PORTALINA ULAŞTIN!</span>
            </div>
            <p className="text-xs text-yazi leading-relaxed font-ui">
              Tebrikler bilge kaşif! 3D Uzay Evrenindeki tüm şifreleri çözdün. Şimdi sağ taraftaki yapboz editöründe promptunu birleştir ve portalı kurtar!
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
