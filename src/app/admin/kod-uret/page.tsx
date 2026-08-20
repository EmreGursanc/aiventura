'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'

export default function KodUretici() {
  const { userData } = useAuth()
  const router = useRouter()
  const [codes, setCodes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [prefix, setPrefix] = useState('NEXUS')

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const handleGenerate = async (count: number) => {
    if (loading) return
    setLoading(true)
    const newCodes: string[] = []

    try {
      for (let i = 0; i < count; i++) {
        const code = `${prefix}-${generateRandomCode()}`
        await setDoc(doc(db, 'activation_codes', code), {
          isUsed: false,
          createdAt: new Date().toISOString(),
          tier: 'premium'
        })
        newCodes.push(code)
      }
      setCodes(prev => [...newCodes, ...prev])
    } catch (error) {
      alert('Kod üretilirken hata oluştu. Firebase kurallarını kontrol edin.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-altin mb-6">🔑 AIVentura Kod Üretici (Admin)</h1>
        
        <div className="bg-[#0f172a] p-6 rounded-xl border border-slate-800 mb-8">
          <p className="text-slate-400 mb-4 text-sm">
            Bu panelden üretilen kodlar veritabanına <strong className="text-white">tek kullanımlık</strong> olarak kaydedilir. 
            Bu kodları Patreon veya Buy Me A Coffee üzerinden destek olan üyelere verebilirsiniz.
          </p>

          <div className="flex gap-4 mb-6">
            <input 
              type="text" 
              value={prefix} 
              onChange={e => setPrefix(e.target.value.toUpperCase())}
              placeholder="Önek (Örn: NEXUS)"
              className="bg-slate-900 border border-slate-700 text-white px-4 py-2 rounded outline-none w-32"
            />
            <button 
              onClick={() => handleGenerate(1)}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded font-bold disabled:opacity-50"
            >
              1 Kod Üret
            </button>
            <button 
              onClick={() => handleGenerate(5)}
              disabled={loading}
              className="bg-altin/80 text-black hover:bg-altin px-4 py-2 rounded font-bold disabled:opacity-50"
            >
              5 Kod Üret
            </button>
          </div>
        </div>

        {codes.length > 0 && (
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
            <h2 className="text-lg font-bold mb-4">Üretilen Kodlar (Kopyalamak için tıklayın)</h2>
            <div className="flex flex-col gap-2">
              {codes.map(c => (
                <div 
                  key={c}
                  onClick={() => { navigator.clipboard.writeText(c); alert('Kopyalandı: ' + c) }}
                  className="bg-black border border-slate-800 p-3 rounded font-bold text-green-400 cursor-pointer hover:border-green-500 flex justify-between"
                >
                  <span>{c}</span>
                  <span className="text-xs text-slate-500 font-normal">Tıkla Kopyala</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <button onClick={() => router.push('/')} className="mt-8 text-slate-500 hover:text-slate-300">
          ← Ana Sayfaya Dön
        </button>
      </div>
    </div>
  )
}
