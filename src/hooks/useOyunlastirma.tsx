'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSes } from '@/hooks/useSes'
import { streakHesapla, bugunTarihString } from '@/lib/streakServisi'
import { kullaniciVerisiKaydet } from '@/lib/kullaniciServisi'
import { useAuth } from '@/hooks/useAuth'
import { yeniKazanilanRozetleriBul } from '@/lib/rozetKontrol'
import type { Rozet } from '@/data/rozetler'

export interface XPDurumu {
  xp: number
  seviye: number
  sonrakiSeviyeXp: number
  seriGunu: number
}

const SEVIYE_ESIKLERI = [0, 300, 700, 1200, 2000, 3000, 4500, 6000, 8000, 10000]

function seviyeHesapla(xp: number): number {
  for (let i = SEVIYE_ESIKLERI.length - 1; i >= 0; i--) {
    if (xp >= SEVIYE_ESIKLERI[i]) return i + 1
  }
  return 1
}

function sonrakiEsik(xp: number): number {
  const seviye = seviyeHesapla(xp)
  return SEVIYE_ESIKLERI[Math.min(seviye, SEVIYE_ESIKLERI.length - 1)] || 10000
}

export function useOyunlastirma() {
  const { user } = useAuth()
  const [durum, setDurum] = useState<XPDurumu>({
    xp: 0,
    seviye: 1,
    sonrakiSeviyeXp: 300,
    seriGunu: 1,
  })

  const [xpAnimasyon, setXpAnimasyon] = useState<number | null>(null)
  const [seviyeAtladi, setSeviyeAtladi] = useState(false)
  const [kazanilanRozetler, setKazanilanRozetler] = useState<string[]>([])
  const [aktifRozetToast, setAktifRozetToast] = useState<Rozet | null>(null)
  const { seviyeAtlama: seviyeAtlamaSesi, zaferFanfari } = useSes()

  // localStorage & Streak yükleme kontrolü
  useEffect(() => {
    try {
      const kayitli = localStorage.getItem('aidex-oyun-durumu')
      const sonTarih = localStorage.getItem('aidex-son-aktif-tarih')
      
      let mevcutXP = 0
      let mevcutSeri = 1

      if (kayitli) {
        const veri = JSON.parse(kayitli) as XPDurumu
        mevcutXP = veri.xp
        mevcutSeri = veri.seriGunu
      }

      const { yeniSeri } = streakHesapla(sonTarih, mevcutSeri)

      const yeniDurum: XPDurumu = {
        xp: mevcutXP,
        seviye: seviyeHesapla(mevcutXP),
        sonrakiSeviyeXp: sonrakiEsik(mevcutXP),
        seriGunu: yeniSeri,
      }

      setDurum(yeniDurum)
      localStorage.setItem('aidex-son-aktif-tarih', bugunTarihString())

      // Eğer kullanıcı giriş yapmışsa Firestore'a eşitle
      if (user?.uid) {
        kullaniciVerisiKaydet(user.uid, {
          xp: yeniDurum.xp,
          seviye: yeniDurum.seviye,
          seriGunu: yeniDurum.seriGunu,
        })
      }
    } catch {}
  }, [user])

  // localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('aidex-oyun-durumu', JSON.stringify(durum))
  }, [durum])

  const xpKazan = useCallback((miktar: number, tamamlananSayisi = 1) => {
    setDurum((onceki) => {
      const yeniXP = onceki.xp + miktar
      const eskiSeviye = seviyeHesapla(onceki.xp)
      const yeniSeviye = seviyeHesapla(yeniXP)

      if (yeniSeviye > eskiSeviye) {
        setSeviyeAtladi(true)
        setTimeout(() => setSeviyeAtladi(false), 4000)
        setTimeout(() => seviyeAtlamaSesi(), 100) // 🎵 Epik seviye atlama sesi!
      }

      // Rozet Kontrolü
      const yeniRozetler = yeniKazanilanRozetleriBul({
        xp: yeniXP,
        tamamlananSayisi,
        seriGunu: onceki.seriGunu,
        mevcutRozetIds: kazanilanRozetler,
      })

      if (yeniRozetler.length > 0) {
        setKazanilanRozetler((prev) => [...prev, ...yeniRozetler.map((r) => r.id)])
        setAktifRozetToast(yeniRozetler[0])
        setTimeout(() => setAktifRozetToast(null), 4500)
        zaferFanfari()
      }

      return {
        xp: yeniXP,
        seviye: yeniSeviye,
        sonrakiSeviyeXp: sonrakiEsik(yeniXP),
        seriGunu: onceki.seriGunu,
      }
    })

    // XP uçuş animasyonu
    setXpAnimasyon(miktar)
    setTimeout(() => setXpAnimasyon(null), 1200)
  }, [kazanilanRozetler, seviyeAtlamaSesi, zaferFanfari])

  return { durum, xpKazan, xpAnimasyon, seviyeAtladi, aktifRozetToast }
}

// ── Toast Bileşeni ─────────────────────────────────────────────────────────
interface ToastProps {
  ikon: string
  baslik: string
  aciklama: string
  tip?: 'basari' | 'rozet' | 'seviye'
}

export function Toast({ ikon, baslik, aciklama, tip = 'basari' }: ToastProps) {
  const renkler = {
    basari: { sinir: '#10B981', glow: 'rgba(16,185,129,0.35)' },
    rozet:  { sinir: '#F59E0B', glow: 'rgba(245,158,11,0.45)' },
    seviye: { sinir: '#8B5CF6', glow: 'rgba(139,92,246,0.45)' },
  }[tip]

  return (
    <div
      className="toast animate-toast"
      style={{
        borderColor: renkler.sinir,
        boxShadow: `0 0 24px ${renkler.glow}`,
      }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
        style={{
          background: `rgba(${tip === 'basari' ? '16,185,129' : tip === 'rozet' ? '245,158,11' : '139,92,246'}, 0.12)`,
          border: `1.5px solid ${renkler.sinir}`,
        }}
      >
        {ikon}
      </div>
      <div>
        <div className="text-sm font-bold text-yazi">{baslik}</div>
        <div className="text-xs text-yazi-iki mt-0.5">{aciklama}</div>
      </div>
    </div>
  )
}

// ── Seviye Atlama Modalı ───────────────────────────────────────────────────
interface SeviyeAtlamaModalProps {
  yeniSeviye: number
  onKapat: () => void
}

export function SeviyeAtlamaModali({ yeniSeviye, onKapat }: SeviyeAtlamaModalProps) {
  return (
    <div className="modal-arka" onClick={onKapat}>
      <div
        className="modal-kutu animate-scale-in"
        style={{ borderColor: '#8B5CF6', boxShadow: '0 0 50px rgba(139,92,246,0.3)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-6xl mb-5">⬆️</div>
        <h2 className="pixel-md mb-2" style={{ color: '#8B5CF6' }}>
          SEVİYE ATLADIN!
        </h2>
        <p className="text-yazi-iki text-base mb-1">
          Artık <strong className="text-yazi">Seviye {yeniSeviye}</strong> kaşifsin!
        </p>
        <p className="text-yazi-soluk text-sm mb-6">
          Yeni görevler açıldı. Devam et!
        </p>
        <button className="btn-altin" onClick={onKapat} id="btn-seviye-kapat">
          🚀 Devam Et!
        </button>
      </div>
    </div>
  )
}
