'use client'

import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import { AuthProvider } from '@/hooks/useAuth'
import type { TrackId } from '@/types'

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [aktifIz, setAktifIz] = useState<TrackId>('cocuklar')

  return (
    <AuthProvider>
      <div className="crt-overlay" aria-hidden="true" />
      <Navbar aktifIz={aktifIz} onIzDegistir={setAktifIz} />
      <main id="icerik" className="min-h-[calc(100vh-64px)]">
        {children}
      </main>
    </AuthProvider>
  )
}
