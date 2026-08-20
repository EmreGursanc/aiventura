'use client'

import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

interface KenneyGLTFEngineProps {
  gorevBaslik: string
  gorevNo: string
  onBulmacaCozuldu: () => void
}

export default function KenneyGLTFEngine({
  gorevBaslik,
  gorevNo,
  onBulmacaCozuldu,
}: KenneyGLTFEngineProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [loadingStats, setLoadingStats] = useState({ loaded: 0, total: 6, error: null as string | null })
  const [gameReady, setGameReady] = useState(false)

  // Oynanış Durumu
  const keys = useRef<{ [key: string]: boolean }>({})
  const playerRef = useRef<THREE.Group | null>(null)
  const playerVelocity = 0.15
  const clock = useRef(new THREE.Clock())

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // 1. SAHNE VE KAMERA AYARLARI
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#0a0f1c') // Derin uzay
    scene.fog = new THREE.FogExp2('#0a0f1c', 0.02) // Uzay sisi

    // Kamera
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000)
    camera.position.set(0, 12, 18) // Kuş bakışı 3D açı (Don't Starve tarzı)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)

    // 2. IŞIKLANDIRMA (Sinematik)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
    dirLight.position.set(20, 30, 10)
    dirLight.castShadow = true
    dirLight.shadow.mapSize.width = 2048
    dirLight.shadow.mapSize.height = 2048
    dirLight.shadow.camera.near = 0.5
    dirLight.shadow.camera.far = 100
    dirLight.shadow.camera.left = -30
    dirLight.shadow.camera.right = 30
    dirLight.shadow.camera.top = 30
    dirLight.shadow.camera.bottom = -30
    scene.add(dirLight)

    const pointLight = new THREE.PointLight(0x06b6d4, 2, 20)
    pointLight.position.set(-5, 5, -5)
    scene.add(pointLight)

    // 3. MODEL YÜKLEYİCİ (GLTF)
    const loader = new GLTFLoader()
    const modelsToLoad = [
      { name: 'Player', path: '/assets/kenney/astronautA.glb', type: 'character' },
      { name: 'Ground', path: '/assets/kenney/platform_large.glb', type: 'environment' },
      { name: 'Rover', path: '/assets/kenney/rover.glb', type: 'prop' },
      { name: 'Hangar', path: '/assets/kenney/hangar_largeA.glb', type: 'prop' },
      { name: 'Dish', path: '/assets/kenney/satelliteDish_large.glb', type: 'prop' },
      { name: 'Crystals', path: '/assets/kenney/rock_crystalsLargeA.glb', type: 'prop' }
    ]

    let loadedCount = 0
    const loadedModels: { [key: string]: THREE.Group } = {}

    const loadAllModels = () => {
      modelsToLoad.forEach((item) => {
        loader.load(
          item.path,
          (gltf) => {
            const model = gltf.scene
            
            // Tüm nesneler gölge atsın
            model.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
              }
            })

            loadedModels[item.name] = model
            loadedCount++
            setLoadingStats(prev => ({ ...prev, loaded: loadedCount }))

            if (loadedCount === modelsToLoad.length) {
              buildWorld()
            }
          },
          undefined,
          (error) => {
            console.error(`HATA: ${item.path} yüklenemedi.`, error)
            setLoadingStats(prev => ({ ...prev, error: `${item.path} dosyası bulunamadı!` }))
          }
        )
      })
    }

    // 4. DÜNYAYI İNŞA ET
    const buildWorld = () => {
      // Zemin (Platformları çoğaltıp dev bir alan yapıyoruz)
      const groundBase = loadedModels['Ground']
      for (let x = -3; x <= 3; x++) {
        for (let z = -3; z <= 3; z++) {
          const clone = groundBase.clone()
          // Kenney'in model boyutu genelde 2x2 veya 4x4 olur. Ayarlayalım:
          clone.position.set(x * 4, 0, z * 4) 
          scene.add(clone)
        }
      }

      // Hangar
      const hangar = loadedModels['Hangar']
      hangar.position.set(0, 0, -8)
      hangar.rotation.y = Math.PI // Kapı bize dönsün
      scene.add(hangar)

      // Rover (Araç)
      const rover = loadedModels['Rover']
      rover.position.set(-6, 0.5, 2)
      rover.rotation.y = Math.PI / 4
      scene.add(rover)

      // Uydu Anteni
      const dish = loadedModels['Dish']
      dish.position.set(8, 0, -6)
      dish.rotation.y = -Math.PI / 3
      scene.add(dish)

      // Kristaller
      const crystals1 = loadedModels['Crystals'].clone()
      crystals1.position.set(-8, 0, -5)
      scene.add(crystals1)

      const crystals2 = loadedModels['Crystals'].clone()
      crystals2.position.set(6, 0, 6)
      crystals2.rotation.y = Math.PI / 2
      scene.add(crystals2)

      // Ana Karakter (Astronot)
      const playerGroup = new THREE.Group()
      const astronaut = loadedModels['Player']
      astronaut.position.set(0, 0, 0) // Group merkezinde
      playerGroup.add(astronaut)
      playerGroup.position.set(0, 0, 4) // Başlangıç noktası
      scene.add(playerGroup)
      playerRef.current = playerGroup

      // Işık kaynağı karakteri takip etsin
      const charLight = new THREE.PointLight(0xffaa00, 1, 5)
      charLight.position.set(0, 2, 0)
      playerGroup.add(charLight)

      setGameReady(true)
    }

    loadAllModels()

    // 5. KONTROLLER
    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = true }
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    // 6. RENDER DÖNGÜSÜ (Hareket & Kamera Takibi)
    let animationFrameId: number
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      if (gameReady && playerRef.current) {
        const player = playerRef.current
        let moveX = 0
        let moveZ = 0

        if (keys.current['w'] || keys.current['arrowup']) moveZ -= 1
        if (keys.current['s'] || keys.current['arrowdown']) moveZ += 1
        if (keys.current['a'] || keys.current['arrowleft']) moveX -= 1
        if (keys.current['d'] || keys.current['arrowright']) moveX += 1

        // Hareketi normalleştir (Çapraz giderken hızlanmasın)
        if (moveX !== 0 || moveZ !== 0) {
          const length = Math.sqrt(moveX * moveX + moveZ * moveZ)
          moveX /= length
          moveZ /= length

          player.position.x += moveX * playerVelocity
          player.position.z += moveZ * playerVelocity

          // Dönüş (Karakterin yürüdüğü yöne bakması)
          const targetAngle = Math.atan2(moveX, moveZ)
          
          // Yumuşak dönüş (Slerp benzeri)
          const currentRotation = player.rotation.y
          // Açı farkını bulup en kısa yoldan dönmesini sağla
          let diff = targetAngle - currentRotation
          while (diff < -Math.PI) diff += Math.PI * 2
          while (diff > Math.PI) diff -= Math.PI * 2
          player.rotation.y += diff * 0.15
        }

        // Kamera Takibi (Yumuşak)
        const targetCamX = player.position.x
        const targetCamZ = player.position.z + 12
        camera.position.x += (targetCamX - camera.position.x) * 0.05
        camera.position.z += (targetCamZ - camera.position.z) * 0.05
        
        // Kamera her zaman karaktere baksın
        const targetLook = new THREE.Vector3(player.position.x, 2, player.position.z)
        // Kameranın lookAt'ini manuel hesaplayıp yumuşatabiliriz, ama direkt bakmak yeterli
        camera.lookAt(targetLook)
      }

      renderer.render(scene, camera)
    }
    animate()

    // 7. YENİDEN BOYUTLANDIRMA
    const handleResize = () => {
      if (container) {
        camera.aspect = container.clientWidth / container.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(container.clientWidth, container.clientHeight)
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  return (
    <div className="relative w-full h-full bg-[#0a0f1c] overflow-hidden flex flex-col">
      {/* 3D Canvas */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Arayüz Panelleri */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
        
        {/* Görev Bilgisi */}
        <div className="bg-slate-900/90 backdrop-blur border border-cyan-800 p-4 rounded-xl shadow-2xl max-w-md pointer-events-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">👨‍🚀</span>
            <div>
              <h3 className="text-cyan-400 font-bold text-sm tracking-widest uppercase">Gerçek Asset Motoru Aktif</h3>
              <p className="text-emerald-400 text-xs font-mono">{gorevBaslik}</p>
            </div>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            Bilgisayarından yüklediğin gerçek Kenney GLB modelleriyle inşa edilmiş 3D evren.
            <br/><br/>
            Karakterini yönlendirmek için <strong className="text-white">W, A, S, D</strong> veya ok tuşlarını kullan.
          </p>
        </div>

        {/* Yükleme Ekranı / Hata */}
        {!gameReady && (
          <div className="bg-slate-800/90 border border-slate-600 p-4 rounded-xl shadow-2xl pointer-events-auto">
            {loadingStats.error ? (
              <div className="text-red-400 font-mono text-sm max-w-xs text-right">
                ⚠️ HATA: <br/> {loadingStats.error}
              </div>
            ) : (
              <div className="text-cyan-400 font-mono text-sm flex items-center gap-2">
                <span className="animate-spin text-xl">⚙️</span>
                Modeller Yükleniyor... ({loadingStats.loaded} / {loadingStats.total})
              </div>
            )}
          </div>
        )}
      </div>

      {/* Kontrol İpuçları (Mobilde veya altta gösterebiliriz) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur px-6 py-3 rounded-full border border-slate-700 shadow-xl flex gap-4">
          {['W', 'A', 'S', 'D'].map(key => (
            <div key={key} className="w-8 h-8 rounded bg-slate-800 border-b-2 border-slate-950 flex items-center justify-center font-bold text-slate-300">
              {key}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
