import { doc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'

export interface StreakBilgisi {
  seriGunu: number
  sonAktifTarih: string // YYYY-MM-DD
}

// Bugünü YYYY-MM-DD formatında al
export function bugunTarihString(): string {
  const simdi = new Date()
  return simdi.toISOString().split('T')[0]
}

// ── Streak Kontrolü Ve Güncelleme ──────────────────────────────────────────
export function streakHesapla(sonAktifTarih: string | null, mevcutSeri: number): {
  yeniSeri: number
  arttiMi: boolean
  sifirlandiMi: boolean
} {
  const bugunStr = bugunTarihString()
  if (!sonAktifTarih) {
    return { yeniSeri: 1, arttiMi: true, sifirlandiMi: false }
  }

  if (sonAktifTarih === bugunStr) {
    // Bugün zaten giriş yapılmış, seriyi koru
    return { yeniSeri: mevcutSeri, arttiMi: false, sifirlandiMi: false }
  }

  const bugun = new Date(bugunStr)
  const sonAktif = new Date(sonAktifTarih)
  const farkMilisaniye = bugun.getTime() - sonAktif.getTime()
  const farkGun = Math.floor(farkMilisaniye / (1000 * 60 * 60 * 24))

  if (farkGun === 1) {
    // Dün aktifmiş! Seri devam ediyor! 🔥 +1
    return { yeniSeri: mevcutSeri + 1, arttiMi: true, sifirlandiMi: false }
  } else {
    // 1 günden fazla ara vermiş, seri sıfırlandı 😔
    return { yeniSeri: 1, arttiMi: false, sifirlandiMi: true }
  }
}

// ── Firestore'a Streak Güncellemesi Kaydet ────────────────────────────────
export async function streakFirestoreGuncelle(uid: string, yeniSeri: number) {
  try {
    const ref = doc(db, 'kullanicilar', uid)
    await updateDoc(ref, {
      seriGunu: yeniSeri,
      sonAktifTarih: bugunTarihString(),
    })
  } catch (error) {
    console.error('Streak Firestore güncelleme hatası:', error)
  }
}
