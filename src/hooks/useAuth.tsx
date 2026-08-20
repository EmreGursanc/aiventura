'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, runTransaction } from 'firebase/firestore'
import { auth, googleProvider, db } from '@/lib/firebase'

export interface UserData {
  seviye: number
  xp: number
  sonrakiSeviyeXp: number
  seriGunu: number
  isim: string
  email?: string
  kayitTarihi?: string
  sonGirisTarihi?: string
  toplamSureDk?: number
  isAdmin?: boolean
  isPremium?: boolean
}

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  authChecked: boolean
  googleIleGiris: () => Promise<void>
  emailIleKayit: (email: string, sifre: string, isim: string) => Promise<void>
  emailIleGiris: (email: string, sifre: string) => Promise<void>
  cikisYap: () => Promise<void>
  addXp: (amount: number) => Promise<void>
  redeemCode: (code: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  authChecked: false,
  googleIleGiris: async () => {},
  emailIleKayit: async () => {},
  emailIleGiris: async () => {},
  cikisYap: async () => {},
  addXp: async () => {},
  redeemCode: async () => false,
})

const DEFAULT_USER_DATA: Partial<UserData> = {
  seviye: 1, xp: 0, sonrakiSeviyeXp: 300,
  seriGunu: 1, isim: 'Kaşif', toplamSureDk: 0, isAdmin: false,
}

// ─── localStorage cache yardımcıları ─────────────────────────────────────────
function readCache(): UserData | null {
  if (typeof window === 'undefined') return null
  try { const r = localStorage.getItem('aidex_ud'); return r ? JSON.parse(r) : null }
  catch { return null }
}
function writeCache(data: UserData | null) {
  if (typeof window === 'undefined') return
  try {
    if (data) localStorage.setItem('aidex_ud', JSON.stringify(data))
    else localStorage.removeItem('aidex_ud')
  } catch { }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // SSR uyumluluğu için başlangıçta her şeyi null yapıyoruz. (Hydration hatasını engeller)
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [authChecked, setAuthChecked] = useState<boolean>(false)

  // Sayfa yüklendiğinde ilk iş cache'i okumak
  useEffect(() => {
    const cachedUser = typeof window !== 'undefined' ? auth.currentUser : null
    const cachedData = readCache()
    if (cachedUser) setUser(cachedUser)
    if (cachedData) {
      setUserData(cachedData)
      setLoading(false)
    }
  }, [])

  const save = (data: UserData | null) => {
    setUserData(data)
    writeCache(data)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      if (!firebaseUser) {
        save(null)
        setLoading(false)
        setAuthChecked(true)
        return
      }

      // Kullanıcı var: önce UI'ı hemen göster (cache'den veya auth.currentUser'dan)
      // Firestore güncelleme arka planda çalışsın
      setLoading(false)
      setAuthChecked(true)

      // Arka planda Firestore sync
      syncUserData(firebaseUser)
    })
    return () => unsubscribe()
  }, [])

  // Firestore senkronizasyonunu ana render döngüsünden çıkardık
  const syncUserData = async (firebaseUser: User) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid)
      const snap = await getDoc(userRef)
      const now = new Date().toISOString()
      const isAdmin = (firebaseUser.email || '').toLowerCase() === 'admin@aidex.com'

      if (snap.exists()) {
        const fresh = { ...snap.data() as UserData, sonGirisTarihi: now }
        save(fresh)
        // updateDoc'u fire-and-forget yap — UI beklemez
        updateDoc(userRef, { sonGirisTarihi: now }).catch((err) => console.error("Firestore güncelleme reddedildi:", err))
      } else {
        const newData: UserData = {
          ...DEFAULT_USER_DATA as UserData,
          isim: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Kaşif',
          email: firebaseUser.email || '',
          kayitTarihi: now, sonGirisTarihi: now, toplamSureDk: 0, isAdmin,
        }
        save(newData)
        setDoc(userRef, newData).catch((err) => console.error("Firestore kayıt reddedildi:", err))
      }
    } catch (err) {
      // Firestore başarısız → email'den fallback türet
      console.error("Firestore genel hatası (okuma/yazma):", err)
      const isAdmin = (firebaseUser.email || '').toLowerCase() === 'admin@aidex.com'
      const cached = readCache()
      if (!cached) {
        save({
          ...DEFAULT_USER_DATA as UserData,
          isim: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Kaşif',
          email: firebaseUser.email || '',
          isAdmin,
        })
      } else if (cached.isAdmin !== isAdmin) {
        // Cache var ama isAdmin yanlış → düzelt
        save({ ...cached, isAdmin })
      }
    }
  }

  // Oturum süresi takibi (her 1 dk, fire-and-forget)
  useEffect(() => {
    if (!user || !userData) return
    const iv = setInterval(() => {
      const newSure = (userData.toplamSureDk || 0) + 1
      save({ ...userData, toplamSureDk: newSure })
      updateDoc(doc(db, 'users', user.uid), { toplamSureDk: newSure }).catch(() => {})
    }, 60000)
    return () => clearInterval(iv)
  }, [user, userData?.toplamSureDk])

  // ─── Auth işlemleri ────────────────────────────────────────────────────────
  const googleIleGiris = async () => {
    await signInWithPopup(auth, googleProvider)
  }

  const emailIleKayit = async (email: string, sifre: string, isim: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, sifre)
    const now = new Date().toISOString()
    const newData: UserData = {
      ...DEFAULT_USER_DATA as UserData,
      isim: isim || 'Kaşif', email, kayitTarihi: now, sonGirisTarihi: now,
      toplamSureDk: 0, isAdmin: email.toLowerCase() === 'admin@aidex.com',
    }
    save(newData)
    setDoc(doc(db, 'users', cred.user.uid), newData).catch(() => {})
  }

  const emailIleGiris = async (email: string, sifre: string) => {
    await signInWithEmailAndPassword(auth, email, sifre)
  }

  const cikisYap = async () => {
    save(null)
    await signOut(auth)
  }

  const addXp = async (amount: number) => {
    if (!user || !userData) return
    const newXp = userData.xp + amount
    let lv = userData.seviye, nxt = userData.sonrakiSeviyeXp
    if (newXp >= nxt) { lv++; nxt = Math.floor(nxt * 1.5) }
    const updated = { ...userData, xp: newXp, seviye: lv, sonrakiSeviyeXp: nxt }
    save(updated)
    updateDoc(doc(db, 'users', user.uid), updated).catch(() => {})
  }

  const redeemCode = async (code: string) => {
    if (!user || !userData) throw new Error('Giriş yapmalısınız')
    const codeClean = code.trim().toUpperCase()
    if (!codeClean) throw new Error('Kod boş olamaz')

    const codeRef = doc(db, 'activation_codes', codeClean)
    const userRef = doc(db, 'users', user.uid)

    try {
      await runTransaction(db, async (transaction) => {
        const codeDoc = await transaction.get(codeRef)
        if (!codeDoc.exists()) {
          throw new Error('Geçersiz kod. Lütfen kontrol edip tekrar deneyin.')
        }
        if (codeDoc.data().isUsed) {
          throw new Error('Bu kod daha önce kullanılmış.')
        }

        // Kodu kullanıldı olarak işaretle
        transaction.update(codeRef, {
          isUsed: true,
          usedBy: user.uid,
          usedAt: new Date().toISOString()
        })

        // Kullanıcıyı premium yap
        transaction.set(userRef, { isPremium: true }, { merge: true })
      })

      // İşlem başarılıysa yerel state'i güncelle
      const updated = { ...userData, isPremium: true }
      save(updated)
      return true
    } catch (error: any) {
      throw new Error(error.message || 'Kod doğrulanırken hata oluştu.')
    }
  }

  return (
    <AuthContext.Provider value={{
      user, userData, loading, authChecked,
      googleIleGiris, emailIleKayit, emailIleGiris, cikisYap, addXp, redeemCode
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
