'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, UserData } from '@/hooks/useAuth'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface AdminUserData extends UserData { id: string }

export default function AdminPanel() {
  const { user, userData, authChecked } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<AdminUserData[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [hata, setHata] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)

  const fetchUsers = () => {
    if (!userData?.isAdmin) return
    setLoadingData(true)
    setHata(null)
    getDocs(collection(db, 'users'))
      .then((snap) => {
        const list: AdminUserData[] = []
        snap.forEach((d) => list.push({ id: d.id, ...d.data() } as AdminUserData))
        list.sort((a, b) => {
          if (!a.sonGirisTarihi) return 1
          if (!b.sonGirisTarihi) return -1
          return new Date(b.sonGirisTarihi).getTime() - new Date(a.sonGirisTarihi).getTime()
        })
        setUsers(list)
      })
      .catch((err) => {
        console.error('Firestore okuma hatası:', err)
        setHata('Firestore Rules okuma iznini engelliyor.')
      })
      .finally(() => setLoadingData(false))
  }

  // Mevcut admin kullanıcısını Firestore'a zorla yaz
  const forceSyncUser = async () => {
    if (!user || !userData) return
    setSyncing(true)
    try {
      const { doc: firestoreDoc, setDoc: firestoreSet } = await import('firebase/firestore')
      await firestoreSet(firestoreDoc(db, 'users', user.uid), {
        isim: userData.isim,
        email: userData.email || user.email || '',
        seviye: userData.seviye,
        xp: userData.xp,
        sonrakiSeviyeXp: userData.sonrakiSeviyeXp,
        seriGunu: userData.seriGunu,
        toplamSureDk: userData.toplamSureDk || 0,
        isAdmin: userData.isAdmin || false,
        kayitTarihi: userData.kayitTarihi || new Date().toISOString(),
        sonGirisTarihi: new Date().toISOString(),
      })
      fetchUsers()
    } catch (err) {
      console.error('Senkronizasyon hatası:', err)
      alert('Hata: Firebase Rules hâlâ kapalı. Lütfen önce kuralları açın.')
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [userData?.isAdmin])

  // Firebase henüz yanıt vermedi VE cache'den veri de yok → spinner göster
  // Cache varsa zaten userData doldu, authChecked'i beklemeye gerek yok
  if (!authChecked && !userData) {
    return (
      <div className="min-h-screen bg-[#05060b] flex flex-col items-center justify-center gap-3 font-mono">
        <div className="w-8 h-8 border-2 border-cyan border-t-transparent rounded-full animate-spin" />
        <p className="text-cyan text-sm animate-pulse">Kimlik doğrulanıyor...</p>
      </div>
    )
  }

  // Firebase yanıt verdi ama kullanıcı yok → giriş sayfasına at
  if (authChecked && !user) {
    router.push('/giris')
    return null
  }

  // Kullanıcı var ama admin değil
  if (!userData?.isAdmin) {
    return (
      <div className="min-h-screen bg-[#05060b] flex flex-col items-center justify-center font-mono text-center p-4">
        <div className="text-6xl mb-6">🚫</div>
        <h1 className="text-3xl font-black text-red-500 mb-4">SİSTEME ERİŞİM REDDEDİLDİ</h1>
        <p className="text-slate-400 max-w-md text-sm mb-2">Bu alan yalnızca yöneticilere açıktır.</p>
        <p className="text-xs text-slate-600">
          Aktif hesap: <span className="text-cyan">{userData?.email || user?.email || '?'}</span>
        </p>
        <button onClick={() => router.push('/')}
          className="mt-8 bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded transition-colors text-xs">
          ← Anasayfaya Dön
        </button>
      </div>
    )
  }

  // ── Admin paneli ──────────────────────────────────────────────────────────────
  const toplamSure = users.reduce((acc, u) => acc + (u.toplamSureDk || 0), 0)
  const bugunGirenler = users.filter(u => {
    if (!u.sonGirisTarihi) return false
    return u.sonGirisTarihi.startsWith(new Date().toISOString().split('T')[0])
  }).length
  const fmt = (iso?: string) => iso
    ? new Date(iso).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '-'

  return (
    <div className="min-h-screen bg-[#05060b] p-8 font-mono text-white">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 border-b border-slate-800 pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-cyan mb-1">&gt;_ NEXUS_ADMIN_PANEL</h1>
            <p className="text-xs text-slate-500">Hoş geldin, <span className="text-cyan">{userData.isim}</span>.</p>
          </div>
          <button onClick={() => router.push('/')} className="btn-hayalet text-xs">← Sisteme Dön</button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'TOPLAM AJAN', val: users.length, color: 'text-white' },
            { label: 'BUGÜN AKTİF', val: bugunGirenler, color: 'text-green-400' },
            { label: 'TOPLAM SÜRE (Dk)', val: toplamSure, color: 'text-indigo-400' },
          ].map(({ label, val, color }) => (
            <div key={label} className="bg-[#0a0d14] border border-slate-800 p-6 rounded-lg">
              <div className="text-slate-500 text-xs mb-2">{label}</div>
              <div className={`text-4xl font-bold ${color}`}>{val}</div>
            </div>
          ))}
        </div>

        <div className="bg-[#0a0d14] border border-slate-800 rounded-lg overflow-hidden">
          <div className="bg-[#111622] px-6 py-4 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-sm font-bold">📡 Ajan Veritabanı</h2>
            <button onClick={fetchUsers}
              className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded transition-colors">
              🔄 Yenile
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0f141f] text-xs text-slate-400">
                <tr>
                  {['Ajan (İsim / E-posta)', 'Seviye / XP', 'Süre (Dk)', 'Kayıt', 'Son Görülme'].map(h => (
                    <th key={h} className="px-6 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {loadingData ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Veriler çekiliyor...</td></tr>
                ) : hata ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <div className="text-red-400 font-bold mb-2">⚠️ Firestore erişim engeli</div>
                      <div className="text-xs text-slate-400 mb-4">
                        Firebase → Firestore Database → Rules sekmesine gidin ve şunu yapıştırıp Publish edin:
                      </div>
                      <code className="block bg-black/60 text-cyan text-xs p-3 rounded font-mono mb-4 text-left max-w-sm mx-auto">
                        {`rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if true;\n    }\n  }\n}`}
                      </code>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="text-yellow-400 font-bold mb-2">⚠️ Firestore boş görünüyor</div>
                      <p className="text-xs text-slate-400 mb-1">Firebase Auth'da kullanıcılar var ama Firestore'a henüz yazılamamış.</p>
                      <p className="text-xs text-slate-500 mb-4">Çözüm: önce Firebase Rules'u açın (<code className="text-cyan">allow read, write: if true</code>), sonra aşağıdaki butona basın:</p>
                      <button
                        onClick={forceSyncUser}
                        disabled={syncing}
                        className="bg-cyan/10 hover:bg-cyan/20 border border-cyan/40 text-cyan text-xs px-6 py-2 rounded transition-colors disabled:opacity-50"
                      >
                        {syncing ? '⏳ Yazılıyor...' : '🔄 Admin Hesabımı Firestore\'a Yaz'}
                      </button>
                    </td>
                  </tr>
                ) : users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white flex items-center gap-2">
                        {u.isim}
                        {u.isAdmin && <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded">ADMIN</span>}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{u.email || u.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-green-400 font-bold">SVY {u.seviye}</div>
                      <div className="text-xs text-slate-500">{u.xp} XP</div>
                    </td>
                    <td className="px-6 py-4 text-indigo-300 font-bold">{u.toplamSureDk || 0}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">{fmt(u.kayitTarihi)}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">{fmt(u.sonGirisTarihi)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
