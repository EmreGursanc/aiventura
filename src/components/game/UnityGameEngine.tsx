'use client'

import { useState, useEffect } from 'react'
import { Unity, useUnityContext } from 'react-unity-webgl'

interface UnityGameEngineProps {
  gorevBaslik: string
  gorevNo: string
  onBulmacaCozuldu: () => void
}

export default function UnityGameEngine({
  gorevBaslik,
  gorevNo,
  onBulmacaCozuldu,
}: UnityGameEngineProps) {
  const [mounted, setMounted] = useState(false)
  const [buildVarMi, setBuildVarMi] = useState(false)

  // React-Unity WebGL Köprü Yapısı
  const { unityProvider, isLoaded, loadingProgression, sendMessage } = useUnityContext({
    loaderUrl: '/unity/Build/unity.loader.js',
    dataUrl: '/unity/Build/unity.data',
    frameworkUrl: '/unity/Build/unity.framework.js',
    codeUrl: '/unity/Build/unity.wasm',
  })

  useEffect(() => {
    setMounted(true)

    // Unity WebGL Build dosyasının varlığını kontrol et
    fetch('/unity/Build/unity.loader.js', { method: 'HEAD' })
      .then((res) => {
        if (res.ok) setBuildVarMi(true)
      })
      .catch(() => setBuildVarMi(false))
  }, [])

  if (!mounted) return null

  return (
    <div className="w-full flex flex-col bg-arka border-r border-sinir h-full overflow-hidden relative">
      
      {/* ── ÜST BAR ──────────────────────────────────────────────────────── */}
      <div className="px-4 py-2.5 bg-terminal border-b border-sinir flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="pixel-xs text-cyan">🎮 UNITY WEBGL 3D GAME ENGINE</span>
          <span className="text-xs text-yazi-soluk">·</span>
          <span className="text-xs font-bold text-yazi">{gorevNo} — {gorevBaslik}</span>
        </div>
        <span className="pixel-xs text-yesil font-bold">
          {buildVarMi ? '⚡ UNITY CANLI' : '⚙️ UNITY PROJESİ HAZIRLANIYOR'}
        </span>
      </div>

      {/* ── UNITY CANLI RENDER ALANI ─────────────────────────────────────── */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex flex-col items-center justify-center bg-gradient-to-b from-[#090d16] via-[#0f172a] to-[#1e1b4b]">
        
        {buildVarMi ? (
          <>
            {!isLoaded && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-arka text-cyan gap-3">
                <span className="text-4xl animate-bounce">🎮</span>
                <span className="pixel-xs font-bold">UNITY 3D DÜNYASI YÜKLENİYOR... (%{Math.round(loadingProgression * 100)})</span>
                <div className="w-48 bg-terminal rounded-full h-2 overflow-hidden border border-cyan/40">
                  <div
                    className="bg-cyan h-full transition-all duration-300"
                    style={{ width: `${loadingProgression * 100}%` }}
                  />
                </div>
              </div>
            )}
            
            <Unity
              unityProvider={unityProvider}
              className="w-full h-full block rounded-2xl border-2 border-cyan/50 shadow-2xl"
            />
          </>
        ) : (
          /* Unity Build Klasörü Henüz Export Alınmadığında Gösterilecek Profesyonel Unity Talimat Ekranı */
          <div className="p-6 max-w-md w-full bg-terminal/90 border-2 border-cyan/50 rounded-2xl flex flex-col gap-4 text-center shadow-2xl">
            <div className="text-5xl animate-bounce">🎮</div>
            <h3 className="pixel-sm text-cyan font-bold">UNITY 3D DÜNYA MOTORU</h3>
            <p className="text-xs text-yazi-iki leading-relaxed">
              Unity C# scriptlerimiz ve köprümüz (%100 hazır)! Unity'de hazırladığımız 3D uzay dünyası build alındığında bu alanda <strong>canlı 60fps Unity 3D oyunu</strong> çalışacak.
            </p>
            <div className="p-3 bg-arka rounded-xl border border-sinir text-left text-[11px] font-kod text-yazi-soluk flex flex-col gap-1">
              <span className="text-cyan font-bold">📂 Unity WebGL Build Yolu:</span>
              <span>public/unity/Build/unity.loader.js</span>
              <span>public/unity/Build/unity.wasm</span>
            </div>
          </div>
        )}

      </div>

    </div>
  )
}
