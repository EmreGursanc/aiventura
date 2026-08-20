'use client'

import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'

interface AstronautSpaceWorldProps {
  gorevBaslik: string
  gorevNo: string
  onBulmacaCozuldu: () => void
}

export default function AstronautSpaceWorld({
  gorevBaslik,
  gorevNo,
  onBulmacaCozuldu,
}: AstronautSpaceWorldProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  
  // Astronot Pozisyonu ve Yonu
  const [pos, setPos] = useState({ x: 0, z: 3 })
  const [rotationY, setRotationY] = useState(0)
  const [isMoving, setIsMoving] = useState(false)
  const [aktifModal, setAktifModal] = useState<number | null>(null)
  const [kesfedilenler, setKesfedilenler] = useState<number[]>([])

  const posRef = useRef(pos)
  posRef.current = pos

  // Klavye Yön Kontrolleri (WASD & Ok Tuşları ile Yumuşak Dönüş ve Yürüme)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (aktifModal !== null) return

      let { x, z } = posRef.current
      let targetRot = rotationY
      let moving = false

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        z -= 0.6
        targetRot = Math.PI // Arkaya bakış
        moving = true
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        z += 0.6
        targetRot = 0 // Öne bakış
        moving = true
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        x -= 0.6
        targetRot = -Math.PI / 2 // Sola bakış
        moving = true
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        x += 0.6
        targetRot = Math.PI / 2 // Sağa bakış
        moving = true
      }

      x = Math.max(-7, Math.min(7, x))
      z = Math.max(-7, Math.min(7, z))

      setPos({ x, z })
      setRotationY(targetRot)
      setIsMoving(moving)
    }

    const handleKeyUp = () => setIsMoving(false)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [aktifModal, rotationY])

  // Etkileşim Kontrolü
  useEffect(() => {
    const { x, z } = pos
    // 1. İpuç Kapsülü (-4, -2)
    if (Math.hypot(x - (-4), z - (-2)) < 1.4 && !kesfedilenler.includes(1)) {
      setAktifModal(1)
    }
    // 2. Nöron Laboratuvarı (4, -2)
    else if (Math.hypot(x - 4, z - (-2)) < 1.4 && !kesfedilenler.includes(2)) {
      setAktifModal(2)
    }
    // 3. NEXUS Kurtarma Portalı (0, -5)
    else if (Math.hypot(x - 0, z - (-5)) < 1.4 && !kesfedilenler.includes(3)) {
      setAktifModal(3)
    }
  }, [pos, kesfedilenler])

  // THREE.JS ASTRONOT UZAY EVRENİ SİNE-MOTORU (DYNAMIC 3D WEBGL)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth || 400
    const height = container.clientHeight || 320

    // 1. Scene & Uzay Nebula Atmosferi
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x040714)
    scene.fog = new THREE.FogExp2(0x040714, 0.04)

    // Don't Starve Açılarına Uygun 3D Kamera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0, 10, 11)
    camera.lookAt(0, -1, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    container.appendChild(renderer.domElement)

    // 2. Canlı Uzay Işıklandırması (Gezegen & Jetpack Parıltıları)
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 1.8)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 2.5)
    dirLight.position.set(6, 16, 8)
    dirLight.castShadow = true
    scene.add(dirLight)

    // Jetpack & İstasyon Işıkları
    const stLight1 = new THREE.PointLight(0xffb700, 6, 8)
    stLight1.position.set(-4, 2, -2)
    scene.add(stLight1)

    const stLight2 = new THREE.PointLight(0xa855f7, 6, 8)
    stLight2.position.set(4, 2, -2)
    scene.add(stLight2)

    const stLight3 = new THREE.PointLight(0x00f0ff, 8, 10)
    stLight3.position.set(0, 2.5, -5)
    scene.add(stLight3)

    // 3. Uzay İstasyonu Platform Zeminleri & Meteor Kayaları
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

    // 4. Yıldız Parçacıkları (Space Dust Particles)
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

    // 5. DETAYLI ASTRONOT HERO MODELLERİ (Jetpack + Kask Vizörü)
    const astronautGroup = new THREE.Group()

    // Kask (Beyaz Şeffaf Vizörlü)
    const helmetGeo = new THREE.SphereGeometry(0.45, 16, 16)
    const helmetMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.1 })
    const helmetMesh = new THREE.Mesh(helmetGeo, helmetMat)
    helmetMesh.position.y = 1.1
    helmetMesh.castShadow = true
    astronautGroup.add(helmetMesh)

    // Kask Mavi Cam Vizörü
    const visorGeo = new THREE.SphereGeometry(0.32, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5)
    const visorMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, metalness: 0.9, roughness: 0.1, emissive: 0x0284c7 })
    const visorMesh = new THREE.Mesh(visorGeo, visorMat)
    visorMesh.rotation.x = Math.PI / 2
    visorMesh.position.set(0, 1.1, 0.2)
    astronautGroup.add(visorMesh)

    // Astronot Gövdesi (Beyaz Uzay Elbisesi)
    const suitGeo = new THREE.CylinderGeometry(0.4, 0.45, 0.9, 16)
    const suitMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 })
    const suitMesh = new THREE.Mesh(suitGeo, suitMat)
    suitMesh.position.y = 0.45
    suitMesh.castShadow = true
    astronautGroup.add(suitMesh)

    // Jetpack (Sırt Roketi)
    const packGeo = new THREE.BoxGeometry(0.5, 0.6, 0.25)
    const packMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
    const packMesh = new THREE.Mesh(packGeo, packMat)
    packMesh.position.set(0, 0.55, -0.3)
    astronautGroup.add(packMesh)

    // Jetpack İtki Alevi (Moving Particle Light)
    const flameGeo = new THREE.ConeGeometry(0.15, 0.4, 8)
    const flameMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    const flameMesh = new THREE.Mesh(flameGeo, flameMat)
    flameMesh.rotation.x = Math.PI
    flameMesh.position.set(0, 0.15, -0.3)
    astronautGroup.add(flameMesh)

    scene.add(astronautGroup)

    // 6. İSTASYON OBJE 1: Altın Veri Kristali İstasyonu (-4, -2)
    const crysGeo = new THREE.OctahedronGeometry(0.8, 0)
    const crysMat = new THREE.MeshStandardMaterial({ color: 0xffb700, emissive: 0xff8800, emissiveIntensity: 0.8, metalness: 0.9 })
    const crysMesh = new THREE.Mesh(crysGeo, crysMat)
    crysMesh.position.set(-4, 1.2, -2)
    crysMesh.castShadow = true
    scene.add(crysMesh)

    // 7. İSTASYON OBJE 2: Nöron Hologram Laboratuvarı (4, -2)
    const holoGeo = new THREE.IcosahedronGeometry(0.8, 0)
    const holoMat = new THREE.MeshStandardMaterial({ color: 0xff00ff, emissive: 0xff00aa, emissiveIntensity: 1.0, wireframe: true })
    const holoMesh = new THREE.Mesh(holoGeo, holoMat)
    holoMesh.position.set(4, 1.2, -2)
    scene.add(holoMesh)

    // 8. İSTASYON OBJE 3: NEXUS Portal (0, -5)
    const portalGeo = new THREE.TorusGeometry(1.5, 0.2, 16, 32)
    const portalMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x0284c7, emissiveIntensity: 1.2 })
    const portalMesh = new THREE.Mesh(portalGeo, portalMat)
    portalMesh.position.set(0, 1.6, -5)
    scene.add(portalMesh)

    // 9. CANLI RENDER VE ASTRONOT UÇMA/YÜRÜME ANİMASYON DÖNGÜSÜ
    let clock = new THREE.Clock()

    const animate = () => {
      const time = clock.getElapsedTime()

      // Objelerin Havada Dönme & Süzülme Animasyonları
      crysMesh.rotation.y = time * 1.5
      crysMesh.position.y = 1.2 + Math.sin(time * 3) * 0.2

      holoMesh.rotation.x = time * 2
      holoMesh.rotation.y = time * 2
      holoMesh.position.y = 1.2 + Math.sin(time * 2.5) * 0.2

      portalMesh.rotation.z = time * 1.0

      // Yıldızların Yavaşça Süzülmesi
      starField.rotation.y = time * 0.05

      // Astronot Hareket & Jetpack Floating Animasyonu
      const { x, z } = posRef.current
      astronautGroup.position.set(x, 0, z)

      // Yürürken/Uçarken Havada Süzülme Salınımı
      const floatY = Math.sin(time * 6) * 0.08
      astronautGroup.position.y = floatY

      // Jetpack Alev Titremesi
      flameMesh.scale.setScalar(1 + Math.sin(time * 20) * 0.3)

      // Kamera Takibi
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
  }, [])

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
          <span className="pixel-xs text-cyan">👨‍🚀 ASTRONAUT SPACE EXPEDITION (DON'T STARVE 3D)</span>
          <span className="text-xs text-yazi-soluk">·</span>
          <span className="text-xs font-bold text-yazi">{gorevNo} — {gorevBaslik}</span>
        </div>
        <span className="pixel-xs text-altin">
          KEŞİF: {kesfedilenler.length} / 3 İSTASYON
        </span>
      </div>

      {/* ── 3D WEBGL ASTRONOT UZAY EVRENİ CANVAS ─────────────────────────── */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        
        {/* Yönlendirme Paneli */}
        <div className="absolute top-3 left-3 bg-terminal/95 border border-cyan/40 px-3 py-1.5 rounded-lg text-xs font-kod text-cyan z-10 shadow-glow-cyan">
          🚀 KONTROLLER: Ok Tuşları veya WASD ile Astronot Kaşifi Uçur!
        </div>

        {/* THREE.JS WebGL Container */}
        <div ref={containerRef} className="w-full h-full min-h-[320px]" />

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

      {/* ── İNTERAKTİF İSTASYON BULMACA MODALLARI ─────────────────────────── */}
      {aktifModal === 1 && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-scale-in">
          <div className="bg-terminal border-2 border-altin rounded-2xl p-5 max-w-sm w-full flex flex-col gap-3 shadow-glow-altin">
            <div className="flex items-center gap-2 text-altin font-bold text-sm">
              <span>📦 1. UZAY HAFIZA İSTASYONUNA ULAŞTIN!</span>
            </div>
            <p className="text-xs text-yazi leading-relaxed font-ui">
              <strong>Astronot Günlüğü #1:</strong><br />
              Robot NEXUS'u kurtarmak için yapay zekanın verilerle beslendiğini hatırlamalıyız! Yapay zekaya binlerce kedi verisi yüklenir.
            </p>
            <button
              onClick={() => modalKapat(1)}
              className="btn-altin text-xs py-2 font-bold shadow-glow-altin"
            >
              💡 İstasyon Verisini Al, İleri!
            </button>
          </div>
        </div>
      )}

      {aktifModal === 2 && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-scale-in">
          <div className="bg-terminal border-2 border-mor rounded-2xl p-5 max-w-sm w-full flex flex-col gap-3 shadow-glow-mor">
            <div className="flex items-center gap-2 text-mor font-bold text-sm">
              <span>🔮 2. NÖRON KALIP LABORATUVARINDASIN!</span>
            </div>
            <p className="text-xs text-yazi leading-relaxed font-ui">
              <strong>Astronot Günlüğü #2:</strong><br />
              Yapay zeka verilerin içindeki kalıpları eşleştirerek yeni nesneleri tanır.
            </p>
            <button
              onClick={() => modalKapat(2)}
              className="btn-mor text-xs py-2 font-bold shadow-glow-mor"
            >
              🧠 Kalıbı Çöz, NEXUS Portalına Uç!
            </button>
          </div>
        </div>
      )}

      {aktifModal === 3 && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-scale-in">
          <div className="bg-terminal border-2 border-cyan rounded-2xl p-5 max-w-sm w-full flex flex-col gap-3 shadow-glow-cyan">
            <div className="flex items-center gap-2 text-cyan font-bold text-sm">
              <span>🌌 NEXUS KURTARMA PORTALINA ULAŞTIN!</span>
            </div>
            <p className="text-xs text-yazi leading-relaxed font-ui">
              Tebrikler Astronot Kaşif! Şifre parçalarını topladın. Şimdi sağ taraftaki yapboz alanında promptunu oluştur ve NEXUS'u kurtar!
            </p>
            <button
              onClick={() => modalKapat(3)}
              className="btn-yesil text-xs py-2 font-bold shadow-glow-yesil"
            >
              🔑 Portalı Açıp NEXUS'u Kurtar!
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
