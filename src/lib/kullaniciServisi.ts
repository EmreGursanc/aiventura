import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'

export interface KullaniciProfili {
  uid: string
  kullaniciAdi: string
  displayName: string
  email: string
  photoURL?: string
  xp: number
  seviye: number
  seriGunu: number
  tamamlananGorevler: string[]
  olusturulmaTarihi: string
}

// ── Kullanıcı Verisini Firestore'a Kaydet veya Güncelle ────────────────────
export async function kullaniciVerisiKaydet(
  uid: string,
  veri: Partial<KullaniciProfili>
) {
  try {
    const ref = doc(db, 'kullanicilar', uid)
    const snap = await getDoc(ref)

    if (!snap.exists()) {
      // Yeni Kullanıcı Oluştur
      await setDoc(ref, {
        uid,
        kullaniciAdi: veri.email ? veri.email.split('@')[0] : 'kasif',
        displayName: veri.displayName || 'Kaşif',
        email: veri.email || '',
        photoURL: veri.photoURL || '',
        xp: veri.xp || 0,
        seviye: veri.seviye || 1,
        seriGunu: veri.seriGunu || 1,
        tamamlananGorevler: veri.tamamlananGorevler || [],
        olusturulmaTarihi: new Date().toISOString(),
      })
    } else {
      // Mevcut Kullanıcıyı Güncelle
      await updateDoc(ref, {
        ...veri,
      })
    }
  } catch (error) {
    console.error('Firestore kaydetme hatası:', error)
  }
}

// ── Kullanıcı Verisini Firestore'dan Çek ────────────────────────────────────
export async function kullaniciVerisiGetir(uid: string): Promise<KullaniciProfili | null> {
  try {
    const ref = doc(db, 'kullanicilar', uid)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      return snap.data() as KullaniciProfili
    }
  } catch (error) {
    console.error('Firestore veri çekme hatası:', error)
  }
  return null
}
