'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function KayitSayfasi() {
  const [email, setEmail] = useState('')
  const [sifre, setSifre] = useState('')
  const [isim, setIsim] = useState('')
  const [hata, setHata] = useState<string | null>(null)
  const [islemde, setIslemde] = useState(false)
  
  const router = useRouter()
  const { googleIleGiris, emailIleKayit, user, loading, authChecked } = useAuth()

  // Kullanıcı zaten giriş yapmışsa yönlendir
  useEffect(() => {
    if (authChecked && user) {
      router.push('/anasayfa')
    }
  }, [user, authChecked, router])

  const handleGoogleGiris = async () => {
    try {
      setIslemde(true)
      setHata(null)
      await googleIleGiris()
    } catch (err: any) {
      setHata('Google ile kayıt yapılırken bir hata oluştu veya pencere kapatıldı.')
      setIslemde(false)
    }
  }

  const handleEmailKayit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !sifre || !isim) return
    
    try {
      setIslemde(true)
      setHata(null)
      await emailIleKayit(email, sifre, isim)
    } catch (err: any) {
      console.error(err)
      let mesaj = 'Kayıt olurken bir hata oluştu.'
      if (err.code === 'auth/email-already-in-use') {
        mesaj = 'Bu e-posta adresi zaten kullanılıyor. Lütfen "Giriş Yap" sayfasına giderek giriş yapın!'
      } else if (err.code === 'auth/weak-password') {
        mesaj = 'Şifre çok zayıf. Lütfen en az 6 karakterli daha güçlü bir şifre seçin.'
      } else if (err.code === 'auth/invalid-email') {
        mesaj = 'Geçersiz e-posta adresi.'
      } else {
        mesaj = err.message || mesaj
      }
      setHata(mesaj)
      setIslemde(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="kart p-8 w-full max-w-md border-2 border-cyan shadow-glow-cyan animate-scale-in">
        
        {/* Başlık */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🎮</div>
          <h1 className="pixel-sm metin-yesil mb-2">AIVentura'e Kaydol</h1>
          <p className="text-xs text-yazi-iki">Ajanını kodlamak ve gizli görevlere erişmek için ücretsiz hesabını oluştur!</p>
        </div>

        {/* Hata Mesajı */}
        {hata && (
          <div className="p-3 mb-6 bg-pembe-dim border border-pembe rounded text-xs text-pembe leading-relaxed">
            {hata}
          </div>
        )}

        {/* Google Kayıt Butonu */}
        <button
          onClick={handleGoogleGiris}
          disabled={islemde}
          className="btn-hayalet w-full py-3 justify-center mb-6 border-cyan text-yazi hover:bg-cyan-dim font-bold text-xs"
        >
          <span>🌐</span> Google ile Tek Tıkla Kayıt Ol
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-sinir" />
          <span className="text-[10px] text-yazi-soluk uppercase">veya e-posta ile</span>
          <div className="flex-1 h-px bg-sinir" />
        </div>

        {/* E-Posta Formu */}
        <form onSubmit={handleEmailKayit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-yazi-iki mb-1.5 font-kod">Ajan Adı (Kullanıcı Adı)</label>
            <input
              type="text"
              value={isim}
              onChange={(e) => setIsim(e.target.value)}
              placeholder="Ajan Neo"
              className="w-full p-3 bg-input border border-sinir rounded text-xs font-kod text-yazi outline-none focus:border-cyan"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-yazi-iki mb-1.5 font-kod">E-posta Adresi</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@gmail.com"
              className="w-full p-3 bg-input border border-sinir rounded text-xs font-kod text-yazi outline-none focus:border-cyan"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-yazi-iki mb-1.5 font-kod">Şifre (En az 6 karakter)</label>
            <input
              type="password"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 bg-input border border-sinir rounded text-xs font-kod text-yazi outline-none focus:border-cyan"
              required
            />
          </div>

          <button type="submit" disabled={islemde} className="btn-yesil w-full py-3 justify-center text-xs mt-2 disabled:opacity-50">
            🚀 Ücretsiz Kaydol
          </button>
        </form>

        {/* Giriş Linki */}
        <div className="mt-8 text-center text-xs text-yazi-soluk">
          Zaten hesabın var mı?{' '}
          <a href="/giris" className="text-cyan font-bold hover:underline">
            Giriş Yap
          </a>
        </div>

      </div>
    </div>
  )
}
