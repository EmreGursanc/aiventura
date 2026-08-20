'use client'

import { useState, useEffect } from 'react'
import { DETECTIVE_MISSIONS } from '@/data/detective-missions'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function LabsHaritasi() {
  const router = useRouter()
  const [completedEps, setCompletedEps] = useState<Set<string>>(new Set())
  const [isRedeemOpen, setIsRedeemOpen] = useState(false)
  const [redeemInput, setRedeemInput] = useState('')
  const [redeemError, setRedeemError] = useState('')
  const [redeemLoading, setRedeemLoading] = useState(false)
  const { user, userData, redeemCode } = useAuth()

  // Tamamlanan bölümleri localStorage'dan yükle
  useEffect(() => {
    const done = new Set<string>()
    DETECTIVE_MISSIONS.forEach(m => {
      if (localStorage.getItem(`aidex_detective_${m.id}`) === 'done') done.add(m.id)
    })
    setCompletedEps(done)
  }, [])

  // Kullanıcının devam edeceği sonraki bölüm
  const nextEp = DETECTIVE_MISSIONS.find(m => m.chapterNumber <= 2 && !completedEps.has(m.id))
  const totalFree = DETECTIVE_MISSIONS.filter(m => m.chapterNumber <= 2).length
  const completedFree = DETECTIVE_MISSIONS.filter(m => m.chapterNumber <= 2 && completedEps.has(m.id)).length

  const handleRedeem = async () => {
    if (!redeemInput.trim()) return
    setRedeemLoading(true)
    setRedeemError('')
    try {
      await redeemCode(redeemInput)
      setIsRedeemOpen(false)
      alert('Tebrikler! AIVentura Kulübü Premium hesabınız aktifleşti. Tüm görevlere erişebilirsiniz.')
    } catch (err: any) {
      setRedeemError(err.message || 'Kod doğrulanamadı.')
    } finally {
      setRedeemLoading(false)
    }
  }

  const handleOynaClick = (e: React.MouseEvent, missionId: string) => {
    e.preventDefault()
    if (!user) {
      alert('SİSTEME ERİŞİM REDDEDİLDİ: Lütfen önce kimliğinizi doğrulayın (Kayıt Olun veya Giriş Yapın).')
      router.push('/giris')
    } else {
      router.push(`/detective/${missionId}`)
    }
  }

  return (
    <div className="min-h-screen bg-black text-indigo-400 font-mono p-8 selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="mb-8 border-b border-indigo-900/50 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-indigo-300 tracking-tighter uppercase flex items-center gap-3">
            <span className="text-4xl animate-pulse text-indigo-500">_</span> AIVentura Labs
          </h1>
          <p className="text-indigo-500/70 text-sm mt-2">v2.4.1 // SECURE TERMINAL CONNECTION ESTABLISHED</p>
        </div>
        <Link href="/" className="px-4 py-2 border border-indigo-500/30 rounded text-xs hover:bg-indigo-500/10 transition-colors">
          [X] SISTEMDEN ÇIK
        </Link>
      </header>

      {/* ── DEVAM ET BANNER ── */}
      {nextEp ? (
        <div className="mb-8 p-4 bg-indigo-950/30 border border-indigo-500/40 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-2xl">▶️</div>
            <div>
              <div className="text-[10px] text-indigo-500 uppercase font-bold tracking-wider mb-0.5">
                KALDI&#286;IN YERDEN DEVAM ET
              </div>
              <div className="text-sm text-white font-bold">
                Bölüm {nextEp.chapterNumber}: {nextEp.title}
              </div>
              <div className="text-[10px] text-indigo-400 mt-0.5">
                {completedFree}/{totalFree} bölüm tamamlandı
                <span className="ml-2 text-indigo-600">{'█'.repeat(completedFree)}{'░'.repeat(totalFree - completedFree)}</span>
              </div>
            </div>
          </div>
          <button
            onClick={(e) => handleOynaClick(e, nextEp.id)}
            className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-6 py-3 rounded-lg transition-colors"
          >
            &gt;_ DEVAM ET →
          </button>
        </div>
      ) : completedFree === totalFree && totalFree > 0 ? (
        <div className="mb-8 p-4 bg-green-950/30 border border-green-500/40 rounded-xl flex items-center gap-4">
          <div className="text-2xl">🏆</div>
          <div>
            <div className="text-sm text-green-400 font-bold">Tüm Ücretsiz Bölümler Tamamlandı!</div>
            <div className="text-[10px] text-green-600 mt-0.5">Harika iş çıkardın — {totalFree}/{totalFree} bölüm çözüldü.</div>
          </div>
        </div>
      ) : null}

      <main className="max-w-5xl mx-auto">
        {/* ── AIVentura PRO REKLAM BANNER ── */}
        <div className="mb-10 relative overflow-hidden bg-[#0d0e1a] border border-altin/40 rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-altin shadow-glow-altin transition-all">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-altin/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-altin/20 transition-all"></div>
          
          <div className="flex-1 relative z-10">
            <div className="inline-flex items-center gap-2 px-2 py-1 bg-altin/10 border border-altin/20 rounded text-[10px] font-bold text-altin uppercase mb-3 tracking-wider animate-pulse">
              YAKINDA GELECEK
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Kendi Yapay Zekanı Kodlama Oyunu 2 Hafta Sonra Yayında!</h2>
            <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
              Dedektif vakalarını çözmek başlangıçtı... AIVentura Kulübüne katılarak 2 hafta sonra yayınlanacak devasa güncellemede <strong className="text-altin">Kendi YZ&apos;nı Kodlayacak</strong>, onu eğitecek ve siber dünyadaki diğer ajanlarla savaştıracaksın!
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 relative z-10 flex-shrink-0">
            <div className="text-center">
              <span className="text-xs text-slate-500 block mb-1">Geri Sayım Başladı</span>
              <span className="text-xl font-black text-altin">14 GÜN KALDI</span>
            </div>
            <button className="bg-altin/50 cursor-not-allowed text-black font-black text-sm px-8 py-3 rounded uppercase tracking-wider transition-colors">
              ⏳ BEKLEMEDE
            </button>
          </div>
        </div>
        {/* ── SİBER DEDEKTİF (RAG & PROMPT ENGINEERING) ── */}
        <div className="mt-16 mb-8 p-4 bg-green-950/20 border-l-4 border-green-500">
          <h2 className="text-xl font-bold text-green-400 mb-2">Siber Dedektif (RAG &amp; Prompt Engineering)</h2>
          <p className="text-sm leading-relaxed text-green-300">
            <strong>GÖREV:</strong> Verilen logları ve kanıtları yapay zekaya besleyerek karmaşık vakaları çöz. 
            Burada AI&apos;ı &quot;hacklemek&quot; yerine onu ustaca yönlendirmeyi ve &quot;Prompt Engineering&quot; sanatını öğreneceksin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {DETECTIVE_MISSIONS.map((mission) => {
            // BAŞLANGIÇ STRATEJİSİ: Kullanıcı toplamak için her şey %100 ücretsiz (Premium kilitleri geçici olarak devre dışı)
            const isFree = true 
            const isLocked = false
            const isDone = completedEps.has(mission.id)
            const isNext = nextEp?.id === mission.id
            
            return (
              <div key={mission.id} className={`group relative bg-[#05060b] border rounded-lg p-6 transition-all ${
                isDone ? 'border-green-500/60 bg-green-950/10' :
                isNext ? 'border-indigo-500/70 shadow-[0_0_20px_rgba(99,102,241,0.15)]' :
                isFree || userData?.isPremium ? 'border-green-900/50 hover:border-green-500' : 
                'border-altin/30 hover:border-altin'
              }`}>
                <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l ${isDone ? 'border-green-500' : (isFree || userData?.isPremium) ? 'border-green-500' : 'border-altin'}`}></div>
                <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r ${isDone ? 'border-green-500' : (isFree || userData?.isPremium) ? 'border-green-500' : 'border-altin'}`}></div>
                
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${(isFree || userData?.isPremium) ? 'bg-green-900/40 text-green-400' : 'bg-altin/20 text-altin'}`}>BÖLÜM {mission.chapterNumber}</span>
                  {isDone ? (
                    <span className="text-[10px] uppercase font-bold px-2 py-1 rounded border border-green-500/50 text-green-400 bg-green-900/20">
                      ✅ TAMAMLANDI
                    </span>
                  ) : isNext ? (
                    <span className="text-[10px] uppercase font-bold px-2 py-1 rounded border border-indigo-500/70 text-indigo-300 animate-pulse">
                      ▶ SIRADAKI
                    </span>
                  ) : (
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${(isFree || userData?.isPremium) ? 'border-green-500/50 text-green-500/80' : 'border-altin/50 text-altin'}`}>
                      {isFree ? 'ÜCRETSİZ' : userData?.isPremium ? 'PREMİUM AÇIK' : 'KULÜP ÜYESİ'}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{mission.title}</h3>
                <p className={`text-xs mb-2 font-bold ${(isFree || userData?.isPremium) ? 'text-green-400/70' : 'text-altin/70'}`}>{mission.subtitle}</p>
                <p className="text-xs text-slate-400 mb-6 h-16 overflow-hidden">
                  {mission.description}
                </p>

                <div className="flex items-center justify-between mt-auto">
                  <span className={`text-xs ${(isFree || userData?.isPremium) ? 'text-green-500/50' : 'text-altin/50'}`}>Gizli Servis Ağı</span>
                  {!isLocked ? (
                    <button 
                      onClick={(e) => handleOynaClick(e, mission.id)}
                      className={`text-white text-xs font-bold px-4 py-2 rounded transition-colors ${
                        isDone ? 'bg-green-800 hover:bg-green-700' :
                        isNext ? 'bg-indigo-600 hover:bg-indigo-500' :
                        'bg-green-700 hover:bg-green-600'
                      }`}
                    >
                      {isDone ? '↩ Tekrar Oyna' : isNext ? '>_ DEVAM ET' : '>_ VAKAYI AÇ'}
                    </button>
                  ) : (
                    <button 
                      onClick={() => setIsRedeemOpen(true)}
                      className="bg-altin/80 hover:bg-altin text-black text-xs font-bold px-4 py-2 rounded transition-colors shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                    >
                      🔒 KİLİTLİ (KOD GİR)
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {/* ── REDEEM MODAL (Aktivasyon Kodu) ── */}
      {isRedeemOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f172a] border-2 border-altin/50 p-8 rounded-2xl max-w-md w-full shadow-[0_0_40px_rgba(251,191,36,0.15)] relative">
            <button 
              onClick={() => setIsRedeemOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white"
            >
              ✕
            </button>
            <div className="text-4xl text-center mb-4">👑</div>
            <h2 className="text-2xl font-black text-white text-center mb-2">AIVentura Kulübüne Katıl</h2>
            <p className="text-sm text-slate-400 text-center mb-6 leading-relaxed">
              Premium görevlere erişmek için Patreon veya Buy Me A Coffee üzerinden projeyi destekleyerek edindiğin <strong className="text-altin">tek kullanımlık aktivasyon kodunu</strong> aşağıya gir.
            </p>
            
            <div className="flex flex-col gap-3 mb-4">
              <input 
                type="text" 
                value={redeemInput}
                onChange={e => setRedeemInput(e.target.value.toUpperCase())}
                placeholder="Örn: NEXUS-A1B2C3"
                className="w-full bg-[#05060b] border border-slate-700 text-white text-center font-bold tracking-widest px-4 py-3 rounded-xl outline-none focus:border-altin transition-colors uppercase"
              />
              {redeemError && <div className="text-xs text-red-400 text-center font-bold">{redeemError}</div>}
              
              <button 
                onClick={handleRedeem}
                disabled={redeemLoading || !redeemInput.trim()}
                className="w-full bg-altin hover:bg-yellow-400 text-black font-black py-3 rounded-xl transition-all disabled:opacity-50"
              >
                {redeemLoading ? 'Doğrulanıyor...' : 'KİLİTLERİ AÇ'}
              </button>
            </div>
            
            <div className="text-center mt-6 pt-6 border-t border-slate-800">
              <p className="text-xs text-slate-500 mb-2">Henüz kodun yok mu?</p>
              <a 
                href="https://patreon.com" // Kendi linkinle değiştirebilirsin
                target="_blank" 
                rel="noreferrer"
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-1"
              >
                ❤️ Projeyi Patreon'dan Destekle
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

