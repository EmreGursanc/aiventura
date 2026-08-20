'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface KorumaliRotaProps {
  children: React.ReactNode
}

export default function KorumaliRota({ children }: KorumaliRotaProps) {
  const { user, loading, authChecked } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // SADECE Firebase kesin olarak "kullanıcı yok" dediyse (authChecked=true) ve user null ise at
    if (authChecked && !user) {
      router.push('/giris')
    }
  }, [user, authChecked, router])

  // Firebase henüz yanıt vermediyse bekle
  if (!authChecked) {
    return null // Zaten üst katmanda Navbar var, burada spinner'a gerek yok, sayfa içeriği beklesin
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-arka p-4">
        <div className="kart p-8 max-w-md w-full text-center border-2 border-altin shadow-glow-altin animate-scale-in">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="pixel-sm text-altin mb-3">Korumalı Bölge</h1>
          <p className="text-xs text-yazi-iki mb-6">
            Bu bölgeye ve görevlerine erişmek için oturum açman gerekiyor.
          </p>
          <a href="/giris" className="btn-altin w-full justify-center text-xs py-3">
            🚀 Giriş Sayfasına Git
          </a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
