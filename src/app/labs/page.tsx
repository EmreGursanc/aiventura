'use client'

import { useState, useEffect } from 'react'
import { DETECTIVE_MISSIONS } from '@/data/detective-missions'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Target, Terminal, ChevronRight, Lock, CheckCircle, Play, ShieldAlert, Cpu } from 'lucide-react'

export default function LabsHaritasi() {
  const router = useRouter()
  const [completedEps, setCompletedEps] = useState<Set<string>>(new Set())
  const [isRedeemOpen, setIsRedeemOpen] = useState(false)
  const [redeemInput, setRedeemInput] = useState('')
  const [redeemError, setRedeemError] = useState('')
  const [redeemLoading, setRedeemLoading] = useState(false)
  const { user, userData, redeemCode } = useAuth()

  useEffect(() => {
    const done = new Set<string>()
    DETECTIVE_MISSIONS.forEach(m => {
      if (localStorage.getItem(`aidex_detective_${m.id}`) === 'done') done.add(m.id)
    })
    setCompletedEps(done)
  }, [])

  const nextEp = DETECTIVE_MISSIONS.find(m => m.chapterNumber <= 4 && !completedEps.has(m.id))
  const totalFree = DETECTIVE_MISSIONS.filter(m => m.chapterNumber <= 4).length
  const completedFree = DETECTIVE_MISSIONS.filter(m => m.chapterNumber <= 4 && completedEps.has(m.id)).length

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
    <div className="min-h-screen bg-[#030408] text-slate-300 font-sans p-4 md:p-8 selection:bg-indigo-500/30 relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12 border-b border-white/5 pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tighter uppercase flex items-center gap-3">
              <Cpu className="w-8 h-8 text-indigo-500" /> AIVentura Labs
            </h1>
            <p className="text-slate-500 text-sm mt-2 font-mono">v2.5.0 // NEXUS AI FORENSICS NETWORK</p>
          </div>
          <Link href="/" className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold transition-all flex items-center gap-2">
            SİSTEMDEN ÇIK
          </Link>
        </header>

        {/* ── DEVAM ET BANNER ── */}
        {nextEp ? (
          <div className="mb-10 p-6 bg-gradient-to-r from-indigo-950/40 to-cyan-950/20 border border-indigo-500/30 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_40px_rgba(79,70,229,0.1)] backdrop-blur-md">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/50">
                <Play className="w-5 h-5 text-indigo-400 ml-1" />
              </div>
              <div>
                <div className="text-xs text-indigo-400 font-black uppercase tracking-widest mb-1">
                  KALDIĞIN YERDEN DEVAM ET
                </div>
                <div className="text-xl text-white font-black">
                  Bölüm {nextEp.chapterNumber}: {nextEp.title}
                </div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                  <span>İlerleme: {completedFree}/{totalFree} Tamamlandı</span>
                  <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(completedFree/totalFree)*100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={(e) => handleOynaClick(e, nextEp.id)}
              className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] flex items-center justify-center gap-2"
            >
              VAKAYA DÖN <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        ) : completedFree === totalFree && totalFree > 0 ? (
          <div className="mb-10 p-6 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl flex items-center gap-5 shadow-[0_0_30px_rgba(16,185,129,0.1)] backdrop-blur-md">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
            <div>
              <div className="text-lg text-emerald-400 font-black">Tüm Vakalar Çözüldü!</div>
              <div className="text-sm text-emerald-200/60 mt-0.5">Harika iş çıkardın dedektif, adaleti sağladın.</div>
            </div>
          </div>
        ) : null}

        <main className="max-w-6xl mx-auto">
          {/* ── PRO REKLAM BANNER (YENİLENMİŞ) ── */}
          <div className="mb-12 relative overflow-hidden bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-indigo-500/30 transition-all">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-amber-500/20 transition-all"></div>
            
            <div className="flex-1 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-black text-amber-400 uppercase mb-4 tracking-widest">
                YAKINDA GELECEK
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-3">Kendi Yapay Zekanı Kodlama Oyunu</h2>
              <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
                Dedektif vakalarını çözmek sadece başlangıçtı. 2 hafta sonra yayınlanacak devasa güncellemede <strong>Kendi YZ'nı Kodlayacak</strong>, onu eğitecek ve büyük turnuvada diğer yapay zekalarla savaştıracaksın!
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 relative z-10 flex-shrink-0 bg-black/40 p-6 rounded-2xl border border-white/5">
              <div className="text-center mb-1">
                <span className="text-xs text-slate-500 font-bold block mb-1 uppercase tracking-wider">GERİ SAYIM BAŞLADI</span>
                <span className="text-2xl font-black text-amber-400">14 GÜN KALDI</span>
              </div>
              <button disabled className="w-full bg-amber-500/20 border border-amber-500/30 text-amber-500 font-black text-sm px-8 py-3 rounded-xl uppercase tracking-wider transition-colors cursor-not-allowed">
                BEKLEMEDE
              </button>
            </div>
          </div>

          {/* ── YAPAY ZEKA DEDEKTİFİ ── */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Yapay Zeka Dedektifi: Yıldız Köşkü Cinayeti</h2>
            <p className="text-slate-400 leading-relaxed max-w-3xl text-sm">
              Gerçek bir cinayeti çözerken <strong>Prompt Mühendisliği (Prompt Engineering)</strong> sanatını adım adım öğrenin. 
              Doğru 'Rol', 'Bağlam', 'Netlik' ve 'Format' yapılarını kurgulayarak Nexus AI'yi ustaca yönlendirin ve katili yakalayın.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-16">
            {DETECTIVE_MISSIONS.map((mission) => {
              const isFree = true 
              const isLocked = false
              const isDone = completedEps.has(mission.id)
              const isNext = nextEp?.id === mission.id
              
              return (
                <div key={mission.id} className={`group relative bg-white/[0.02] backdrop-blur-lg border rounded-2xl p-6 md:p-8 transition-all duration-300 ${
                  isDone ? 'border-emerald-500/30 hover:border-emerald-500/50' :
                  isNext ? 'border-indigo-500/50 shadow-[0_0_30px_rgba(79,70,229,0.15)] hover:border-indigo-400 hover:shadow-[0_0_40px_rgba(79,70,229,0.25)] scale-[1.02]' :
                  'border-white/10 hover:border-white/20'
                }`}>
                  
                  <div className="flex justify-between items-start mb-6">
                    <span className={`text-xs font-black px-3 py-1.5 rounded-full ${(isFree || userData?.isPremium) ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-400'}`}>BÖLÜM {mission.chapterNumber}</span>
                    {isDone ? (
                      <span className="text-[10px] uppercase font-black px-3 py-1.5 rounded-full border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> TAMAMLANDI
                      </span>
                    ) : isNext ? (
                      <span className="text-[10px] uppercase font-black px-3 py-1.5 rounded-full border border-indigo-500/50 text-indigo-300 bg-indigo-500/20 animate-pulse flex items-center gap-1">
                        <Target className="w-3 h-3" /> SIRADAKİ VAKA
                      </span>
                    ) : (
                      <span className={`text-[10px] uppercase font-black px-3 py-1.5 rounded-full border ${(isFree || userData?.isPremium) ? 'border-white/10 text-slate-400' : 'border-amber-500/30 text-amber-400'}`}>
                        {isFree ? 'ÜCRETSİZ' : userData?.isPremium ? 'PREMİUM AÇIK' : 'KULÜP ÜYESİ'}
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-black text-white mb-2">{mission.title}</h3>
                  <p className={`text-sm mb-4 font-bold ${(isFree || userData?.isPremium) ? 'text-indigo-400' : 'text-amber-400'}`}>{mission.subtitle}</p>
                  <p className="text-sm text-slate-400 mb-8 line-clamp-3 leading-relaxed min-h-[60px]">
                    {mission.description}
                  </p>

                  <div className="flex items-center justify-between mt-auto border-t border-white/5 pt-6">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Terminal className="w-4 h-4" /> Nexus AI
                    </span>
                    {!isLocked ? (
                      <button 
                        onClick={(e) => handleOynaClick(e, mission.id)}
                        className={`text-white text-sm font-black px-6 py-3 rounded-xl transition-all flex items-center gap-2 ${
                          isDone ? 'bg-emerald-600/80 hover:bg-emerald-500' :
                          isNext ? 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.4)]' :
                          'bg-white/10 hover:bg-white/20'
                        }`}
                      >
                        {isDone ? 'TEKRAR OYNA' : isNext ? 'VAKAYA GİR' : 'VAKAYI AÇ'} {isNext ? <ChevronRight className="w-4 h-4" /> : null}
                      </button>
                    ) : (
                      <button 
                        onClick={() => setIsRedeemOpen(true)}
                        className="bg-amber-500 hover:bg-amber-400 text-black text-sm font-black px-6 py-3 rounded-xl transition-all flex items-center gap-2"
                      >
                        <Lock className="w-4 h-4" /> KİLİTLİ
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </main>
      </div>

      {/* ── REDEEM MODAL (Aktivasyon Kodu) ── */}
      {isRedeemOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f172a] border border-white/10 p-8 rounded-3xl max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => setIsRedeemOpen(false)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
            >
              ✕
            </button>
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Lock className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-2xl font-black text-white text-center mb-3">AIVentura Kulübü</h2>
            <p className="text-sm text-slate-400 text-center mb-8 leading-relaxed">
              Premium görevlere erişmek için Patreon veya Buy Me A Coffee üzerinden edindiğin <strong className="text-amber-400">tek kullanımlık aktivasyon kodunu</strong> aşağıya gir.
            </p>
            
            <div className="flex flex-col gap-4 mb-6">
              <input 
                type="text" 
                value={redeemInput}
                onChange={e => setRedeemInput(e.target.value.toUpperCase())}
                placeholder="Örn: NEXUS-A1B2C3"
                className="w-full bg-black/50 border border-slate-700 text-white text-center font-bold tracking-widest px-4 py-4 rounded-xl outline-none focus:border-amber-500 transition-colors uppercase"
              />
              {redeemError && <div className="text-xs text-red-400 text-center font-bold bg-red-500/10 py-2 rounded-lg">{redeemError}</div>}
              
              <button 
                onClick={handleRedeem}
                disabled={redeemLoading || !redeemInput.trim()}
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-xl transition-all disabled:opacity-50"
              >
                {redeemLoading ? 'Doğrulanıyor...' : 'KİLİTLERİ AÇ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
