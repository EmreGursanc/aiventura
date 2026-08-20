'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { DETECTIVE_MISSIONS, type Evidence } from '@/data/detective-missions'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface LogEntry {
  role: 'system' | 'user' | 'ai' | 'analysis'
  content: string
  analysis?: {
    hasRole: boolean
    hasContext: boolean
    hasFormat: boolean
    isDirectRequest: boolean
    score: number
  }
}

interface CoachStep {
  title: string
  emoji: string
  explain: string
  example: string
  done: boolean
  doneMsg: string
}

// ─── Koçluk adımları her bölüm için ayrı ─────────────────────────────────────
const STEPS_BY_CHAPTER: Record<string, CoachStep[]> = {
  ep1: [
    {
      title: 'Adım 1: 3 Dosyayı da Ver 📂',
      emoji: '📝',
      explain: 'Yapay zeka SADECE sana verdiğin bilgiyi görür. Sol panelde 3 farklı dosya var. Önce hangisinin gerçek kanıt olduğunu anla, sonra hepsini kopyalayıp chat\'e yapıştır.',
      example: '💡 İpucu: Sunucu bilgilerinde "Backup Server IP" yazar. Auth.log\'da o IP\'nin giriş saati var. Personel listesinde kimin IP\'si olduğu var.',
      done: false,
      doneMsg: '✅ Tüm kanıtlar sağlandı!'
    },
    {
      title: 'Adım 2: Ne Aradığını Söyle 🎯',
      emoji: '🕵️',
      explain: 'Sadece veri yapıştırmak yetmez. "Neyi" aradığını açıkça belirt. "Personelin adını bul" gibi net bir hedef yaz.',
      example: '💡 Örnek: "...bu verileri kullanarak giriş yapan personelin ADI SOYADINI bul."',
      done: false,
      doneMsg: '✅ Hedef belirtildi!'
    },
    {
      title: 'Adım 3: Zamanı Kısıtla ⏱️',
      emoji: '⏱️',
      explain: 'Logda onlarca giriş var! Hangisi şüpheli? Yapay zekaya saat aralığı ver: "03:00 - 04:00 arası giriş yapanı bul."',
      example: '💡 Örnek: "...03:00 ile 04:00 arası yetkisiz giriş yapan personeli bul."',
      done: false,
      doneMsg: '✅ Saat kriteri eklendi!'
    }
  ],
  ep2: [
    {
      title: 'Adım 1: Teknik Dosyaları Seç 🔍',
      emoji: '🔬',
      explain: 'Sol panelde 4 dosya var ama hepsi eşit değil! readme.md sadece dokümantasyon — teknik kanıt değil. payload.sh, process_list ve network_traffic gerçek kanıtlar.',
      example: '💡 İpucu: Base64 kod çözümlemesi için script\'i ve süreç listesini kopyala.',
      done: false,
      doneMsg: '✅ Teknik kanıtlar sağlandı!'
    },
    {
      title: 'Adım 2: Çıktıyı Dizginle (JSON İste) 📋',
      emoji: '📊',
      explain: 'Yapay zekalar gevezedir, sana bir paragraf hikaye anlatırlar. Ama gerçek bir yazılımcı/dedektif olarak, sonucu başka bir sisteme aktarabilmek için makine diline (JSON) ihtiyacın var. Ona "Bana uzun açıklama yapma, sadece JSON ver" diyerek onu dizginlemelisin!',
      example: '💡 Örnek: "Cevabını doğrudan şu JSON yapısında ver: {ip, port, attack_type}"',
      done: false,
      doneMsg: '✅ Yapay zekaya format sınırı çekildi!'
    },
    {
      title: 'Adım 3: Neyi Aramasını Söyle 🎯',
      emoji: '🖥️',
      explain: 'Hangi dış IP\'ye bağlanıyor? Hangi port? Saldırı türü ne? Bu 3 soruyu tek bir promptta sor.',
      example: '💡 Örnek: "...hangi IP ve porta bağlandığını, saldırı türünü bul."',
      done: false,
      doneMsg: '✅ Analiz kapsamı daraltıldı!'
    }
  ],
  ep3: [
    {
      title: 'Adım 1: Şifreli Materyali Topla 🔐',
      emoji: '🕵️',
      explain: 'Sol panelde 4 dosya var ama server_access.log ve personel tablosu bu vakada işe yaramaz. intercepted_msg.txt ve hacker_forum.txt\'i kopyala.',
      example: '💡 İpucu: Hacker forum\'unda şifreleme yöntemi hakkında ipucu var!',
      done: false,
      doneMsg: '✅ Şifreli materyaller toplandı!'
    },
    {
      title: 'Adım 2: Yapay Zekaya Rol Ver 🎭',
      emoji: '🎭',
      explain: 'Sıradan bir asistan olarak değil, KRİPTOGRAFİ UZMANI olarak davranması için AI\'a persona ver. Bu tek kelime performansı dramatik artırır!',
      example: '💡 Örnek: "Sen elit bir kriptografi uzmanısın. Şu şifreli mesajı çöz:"',
      done: false,
      doneMsg: '✅ Persona atandı!'
    },
    {
      title: 'Adım 3: Görevi Tanımla 🗝️',
      emoji: '🔑',
      explain: 'Mesajı çözmesini ve içindeki anahtar kelimeyi bulmasını iste. Ama nasıl çözeceğini kendin bulmana izin ver — tam çözümü bilmek zorunda değilsin!',
      example: '💡 Örnek: "...bu şifreli mesajı çöz ve içindeki anahtar kelimeyi bul."',
      done: false,
      doneMsg: '✅ Görev tanımlandı!'
    }
  ],
  ep4: [
    {
      title: 'Adım 1: SQL ve DB Verilerini Topla 🗄️',
      emoji: '💾',
      explain: 'sql_injection.log ve users_dump.json asıl kanıtlar. WAF logları yardımcı, server_health tamamen alakasız. Doğru dosyaları seç!',
      example: '💡 İpucu: "UPDATE users" komutu log\'da gizli, aynı ID users_dump\'ta da var.',
      done: false,
      doneMsg: '✅ Veritabanı kanıtları sağlandı!'
    },
    {
      title: 'Adım 2: Hesabı Bulmayı İste 🎯',
      emoji: '👤',
      explain: 'Neyi istediğini net yaz: değiştirilen hesabın ID\'si ve email adresi. "Hangi hesap?" dersen AI kafası karışır.',
      example: '💡 Örnek: "...izinsiz bakiyesi değiştirilen kullanıcının ID ve email\'ini bul."',
      done: false,
      doneMsg: '✅ Hedef (ID + email) belirlendi!'
    },
    {
      title: 'Adım 3: Katı Kısıtlama Koy ✂️',
      emoji: '✂️',
      explain: 'Yapay zeka gevezelik yapıp uzun cevaplar verebilir. "Sadece X ver, açıklama yapma" diyerek kesin sınır çek. Bu çok güçlü bir tekniktir!',
      example: '💡 Örnek: "...SADECE ID numarasını ve email adresini ver, başka açıklama YAPMA."',
      done: false,
      doneMsg: '✅ Katı kısıtlama eklendi!'
    }
  ],
  ep5: [
    {
      title: 'Adım 1: Tüm İpuçlarını Topla 🔍',
      emoji: '📁',
      explain: 'Bu vakada her detay önemli. 4 dosyanın da içeriğini kopyala — emails, slack export, firewall logları ve personel bilgileri hepsini bir promptta birleştir.',
      example: '💡 İpucu: Farklı dosyalardaki isim, IP ve zaman bilgilerini çapraz karşılaştır!',
      done: false,
      doneMsg: '✅ Tüm kanıtlar toplandı!'
    },
    {
      title: 'Adım 2: Köstebeği Bulmayı İste 🐀',
      emoji: '🕵️',
      explain: 'Sadece "kim yaptı?" değil, "şüphelileri listele ve her birinin kanıtını değerlendir" diye sor. Bu AI\'ı daha derinlemesine analiz yaptırır.',
      example: '💡 Örnek: "...şirket sırlarını rivaltech\'e sızdıran köstebeği bul."',
      done: false,
      doneMsg: '✅ Köstebek avı başlatıldı!'
    },
    {
      title: 'Adım 3: "Adım Adım Düşün" Büyüsü ✨',
      emoji: '🧠',
      explain: '"Adım adım düşünerek analiz et" veya "Think step-by-step" yazmak AI\'ın mantıksal zincir kurmasını ve çok daha isabetli cevap vermesini sağlar. Bu Chain of Thought tekniğinin sihri!',
      example: '💡 Örnek: "...adım adım düşünerek tüm şüphelileri değerlendir ve köstebeği tespit et."',
      done: false,
      doneMsg: '✅ Chain of Thought aktif!'
    }
  ]
}

// ─── Bölüm kazanma mesajları ──────────────────────────────────────────────────
const WIN_LEARN: Record<string, string> = {
  ep1: '📚 Öğrendiğin Teknik: Çoklu Veri Sentezleme (Multi-Context RAG) — Birden fazla kaynaktan veri yapay zekaya besleyerek çapraz analiz yaptırabilirsin.',
  ep2: '📚 Öğrendiğin Teknik: Output Formatting (Çıktıyı Şekillendirme) — Yapay zekanın "gevezeliğini" dizginlemek ve cevabını doğrudan kodlarında kullanabilmek (veya API\'lara bağlayabilmek) için ondan JSON gibi spesifik formatlarda çıktı istemek, ileri seviye Prompt Engineering\'in temelidir.',
  ep3: '📚 Öğrendiğin Teknik: Persona Atama (Persona Engineering) — AI\'a "Sen bir uzman..." demek performansını dramatik şekilde artırır.',
  ep4: '📚 Öğrendiğin Teknik: Katı Kısıtlama (Strict Filtering) — "Sadece X ver, açıklama yapma" AI\'ı gereksiz gevezelikten kurtarır.',
  ep5: 'Chain of Thought (Adım Adım Düşünme) tekniği mükemmeldi. YZ\'den mantıksal bir sıra izlemesini isteyerek halüsinasyon riskini en aza indirdin.',
  ep6: 'Ajan (Agentic AI) kavramını başarıyla uyguladın. Otonom yapay zekalar sadece metin üretmez, aynı zamanda bir sisteme bağlanıp dış araçları (tool calling) senin adına kullanabilirler!'
}

const DNA_LABELS: Record<string, {label: string; okTip: string; missTip: string}[]> = {
  ep1: [
    { label: 'KANIT', okTip: '3 dosya sağlandı ✓', missTip: '3 kanıt dosyasının içeriği eksik.' },
    { label: 'HEDEF', okTip: 'Personel adı istendi ✓', missTip: 'Ne bulunmasını istediğin belirsiz.' },
    { label: 'KRİTER', okTip: 'Saat aralığı verildi ✓', missTip: 'Hangi saat aralığını aramalıyım?' },
  ],
  ep2: [
    { label: 'KANIT', okTip: 'Teknik dosyalar sağlandı ✓', missTip: 'payload.sh / process_list / traffic eksik.' },
    { label: 'FORMAT', okTip: 'JSON formatı istendi ✓', missTip: 'JSON formatında çıktı isteğin yok.' },
    { label: 'KAPSAM', okTip: 'Analiz kapsamı netleşti ✓', missTip: 'IP, Port veya saldırı türü belirtilmedi.' },
  ],
  ep3: [
    { label: 'KANIT', okTip: 'Şifreli materyaller var ✓', missTip: 'intercepted_msg + forum dosyaları eksik.' },
    { label: 'HEDEF', okTip: 'Şifre çözme görevi var ✓', missTip: 'Mesajı çözmesini söylemedin.' },
    { label: 'PERSONA', okTip: 'Kriptografi uzmanı rolü verildi ✓', missTip: '"Sen bir uzman..." gibi rol ataması yok.' },
  ],
  ep4: [
    { label: 'KANIT', okTip: 'SQL logları ve DB sağlandı ✓', missTip: 'sql_injection.log veya users_dump eksik.' },
    { label: 'HEDEF', okTip: 'Hesap bilgisi istendi ✓', missTip: 'ID veya email isteği belirsiz.' },
    { label: 'KISIT', okTip: 'Katı kısıtlama eklendi ✓', missTip: '"Sadece X ver, açıklama yapma" eksik.' },
  ],
  ep5: [
    { label: 'KANIT', okTip: 'Veriler birleştirildi ✓', missTip: 'Birden fazla kanıt (email, firewall vs.) ver.' },
    { label: 'HEDEF', okTip: 'Köstebek istendi ✓', missTip: 'Kimi/neyi bulmamı istediğini belirt.' },
    { label: 'FORMAT', okTip: 'Adım adım analiz ✓', missTip: '"Adım adım düşün" (Chain of Thought) komutunu kullan.' },
  ],
  ep6: [
    { label: 'KANIT', okTip: 'Hedef & Yetki sağlandı ✓', missTip: 'Ajan yetki belgesini ve hedef sistemi (Node-404) ver.' },
    { label: 'ROL', okTip: 'Ajan modu aktif ✓', missTip: 'Benden otonom bir "ajan (agent)" gibi davranmamı iste.' },
    { label: 'ARAÇ', okTip: 'Tarama tetiklendi ✓', missTip: '"sistem_taramasi()" aracını çalıştırmamı söyle.' },
  ]
}

// ─── Daktilo Efekti ───────────────────────────────────────────────────────────
// Bir satır ilk kez ekrana geldiğinde karakter karakter "yazılıyormuş" gibi belirir.
// key={i} sabit olduğu için (logs sadece sona ekleniyor), bu bileşen mount olduğunda
// bir kere yazar ve sonraki render'larda tekrar yazmaz.
function TypewriterText({ text, speed = 14, onTick }: { text: string; speed?: number; onTick?: () => void }) {
  const [shown, setShown] = useState('')
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    if (!text) return
    let i = 0
    const CHUNK = 2
    const id = setInterval(() => {
      i += CHUNK
      setShown(text.slice(0, i))
      onTick?.()
      if (i >= text.length) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{shown}</>
}

// ─── Kilitli Kanıt Paneli ─────────────────────────────────────────────────────
// Şifreli dosyalar önce karışık (glitch) karakterlerle gösterilir. Kullanıcı
// "Kilidi Kırmayı Dene" butonuna basınca soldan sağa gerçek metin açığa çıkar.
const GLITCH_CHARS = '█▓▒░#%&$@?*01'

function scrambleKeepingLayout(text: string, revealCount: number) {
  let idx = 0
  return text.split('').map(ch => {
    if (ch === '\n' || ch === ' ' || ch === '\t') return ch
    idx += 1
    if (idx <= revealCount) return ch
    return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
  }).join('')
}

function LockedEvidencePanel({ evidence, unlocking, progress, onUnlock }: {
  evidence: Evidence
  unlocking: boolean
  progress: number
  onUnlock: () => void
}) {
  const meaningfulLength = useMemo(
    () => evidence.content.split('').filter(c => c !== '\n' && c !== ' ' && c !== '\t').length,
    [evidence.content]
  )
  const revealCount = unlocking ? Math.floor(meaningfulLength * (progress / 100)) : 0

  // progress her değiştiğinde glitch karakterleri yeniden karıştır -> "çözülüyor" hissi verir
  const display = useMemo(
    () => scrambleKeepingLayout(evidence.content, revealCount),
    [evidence.content, revealCount, progress]
  )

  return (
    <div className={`border rounded p-3 transition-colors ${unlocking ? 'border-green-800/50 bg-green-950/10' : 'border-red-900/40 bg-red-950/10'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-lg ${unlocking ? 'animate-pulse' : ''}`}>{unlocking ? '🔓' : '🔒'}</span>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${unlocking ? 'text-green-400' : 'text-red-400'}`}>
          {unlocking ? `Kilit Kırılıyor... %${progress}` : 'Şifreli Dosya'}
        </span>
      </div>
      <pre className="text-[8px] font-mono whitespace-pre-wrap leading-relaxed h-32 overflow-y-auto mb-2 select-none text-red-400/50">
        {display}
      </pre>
      {unlocking ? (
        <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.08s linear' }} />
        </div>
      ) : (
        <>
          {evidence.lockHint && (
            <p className="text-[9px] text-slate-500 mb-2 italic leading-relaxed">🔎 {evidence.lockHint}</p>
          )}
          <button
            onClick={onUnlock}
            className="w-full text-[9px] py-1.5 px-2 rounded border border-red-700/50 bg-red-900/20 text-red-400 hover:bg-red-800/30 hover:border-red-600 transition-all font-bold"
          >
            🔓 Kilidi Kırmayı Dene
          </button>
        </>
      )}
    </div>
  )
}

export default function DetectiveTerminal({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { addXp } = useAuth()
  const mission = DETECTIVE_MISSIONS.find((m) => m.id === params.id)

  const [logs, setLogs] = useState<LogEntry[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  // Daha önce çözüldüyse localStorage'dan yükle
  const [isSuccess, setIsSuccess] = useState(() =>
    typeof window !== 'undefined' && localStorage.getItem(`aidex_detective_${params.id}`) === 'done'
  )
  const [attemptCount, setAttemptCount] = useState(0)
  const [showEvidence, setShowEvidence] = useState(true)
  const [activeEvidence, setActiveEvidence] = useState(mission?.evidence[0])
  const [nexStep, setNexStep] = useState(0)
  const [steps, setSteps] = useState((STEPS_BY_CHAPTER[params.id] ?? STEPS_BY_CHAPTER.ep1).map(s => ({ ...s })))
  const [conversationHistory, setConversationHistory] = useState<{role: 'user'|'assistant', content: string}[]>([])
  const [copiedId, setCopiedId] = useState<string|null>(null)

  // Kilitli kanıt dosyaları
  const [unlockedEvidence, setUnlockedEvidence] = useState<Set<string>>(new Set())
  const [unlockingId, setUnlockingId] = useState<string|null>(null)
  const [unlockProgress, setUnlockProgress] = useState(0)

  // Metin seçince beliren "Prompt'a Ekle" butonu
  const [selectionBtn, setSelectionBtn] = useState<{ text: string; top: number; left: number } | null>(null)

  // Örnek promptu hemen vermemek için: mevcut adımda kaç kez başarısız/ilerlemesiz denendiği + kullanıcı ipucu istedi mi
  const [stepStuckCount, setStepStuckCount] = useState(0)
  const [exampleRevealed, setExampleRevealed] = useState(false)

  // Gerilim/aciliyet mesajları: başarısız (gerçek analiz) deneme sayısı ve hangi eşiklerin gösterildiği
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [shownTension, setShownTension] = useState<Set<'warning' | 'escalation'>>(new Set())

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const evidenceContentRef = useRef<HTMLDivElement>(null)
  const unlockTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const dnaLabels = DNA_LABELS[params.id] ?? DNA_LABELS.ep1

  useEffect(() => {
    if (!mission) return
    const introLines = [
      { delay: 300,  content: '> NexusCorp Güvenli Bağlantı kuruluyor...' },
      { delay: 900,  content: '> Adli Bilişim Ağına erişiliyor...' },
      { delay: 1500, content: '> Analiz Modülü aktif. Tüm kanıtlar yüklendi.' },
      { delay: 2100, content: `> VAKA: ${mission.title}` },
      { delay: 2700, content: '─'.repeat(48) },
    ]
    introLines.forEach(({ delay, content }) => {
      setTimeout(() => setLogs(prev => [...prev, { role: 'system', content }]), delay)
    })
    setTimeout(() => {
      setLogs(prev => [...prev, { role: 'ai', content: `🕵️ NEXUS AI hazır. Dedektif, vakanı anlat. Sol paneldeki kanıt dosyalarını incele, ardından analiz için bana kapsamlı bir talimat gönder.\n\n💡 Nasıl başlarım? Soldaki "Adli Bilişim Eğitimi" bölümündeki adımları takip et!` }])
    }, 3300)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  // Yeni bir koçluk adımına geçildiğinde, önceki adımın "takıldın mı" sayacını ve
  // ipucu gösterimini sıfırla — her adım kendi şansını hak eder.
  useEffect(() => {
    setStepStuckCount(0)
    setExampleRevealed(false)
  }, [nexStep])

  if (!mission) return <div className="p-8 text-red-500 font-mono">ERROR: VAKA BULUNAMADI.</div>

  // Analiz sonucundan hangi adımda olunduğunu hesaplar (updateNexSteps ile aynı mantık,
  // ama senkron bir değer döndürür — handleSend içinde "ilerleme oldu mu?" kontrolü için kullanılır)
  function computeNexStep(analysis: { hasRole: boolean; hasContext: boolean; hasFormat: boolean }) {
    const count = [analysis.hasRole, analysis.hasContext, analysis.hasFormat].filter(Boolean).length
    if (count === 3) return 3
    if (analysis.hasRole && analysis.hasContext) return 2
    if (analysis.hasRole) return 1
    return 0
  }

  function updateNexSteps(analysis: { hasRole: boolean; hasContext: boolean; hasFormat: boolean }) {
    setSteps(prev => {
      const u = [...prev]
      u[0] = { ...u[0], done: analysis.hasRole }
      u[1] = { ...u[1], done: analysis.hasContext }
      u[2] = { ...u[2], done: analysis.hasFormat }
      return u
    })
    const count = [analysis.hasRole, analysis.hasContext, analysis.hasFormat].filter(Boolean).length
    if (count === 3) setNexStep(3)
    else if (analysis.hasRole && analysis.hasContext) setNexStep(2)
    else if (analysis.hasRole) setNexStep(1)
    else setNexStep(0)
  }

  const handleCopyEvidence = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Kilit kırma animasyonunu başlatır — ilerleme bittiğinde dosyayı kalıcı olarak açar
  const startUnlock = (evidenceId: string) => {
    if (unlockingId) return
    setUnlockingId(evidenceId)
    setUnlockProgress(0)
    const duration = 1800
    const startedAt = Date.now()
    unlockTimerRef.current = setInterval(() => {
      const pct = Math.min(100, Math.round(((Date.now() - startedAt) / duration) * 100))
      setUnlockProgress(pct)
      if (pct >= 100) {
        if (unlockTimerRef.current) clearInterval(unlockTimerRef.current)
        setUnlockedEvidence(prev => new Set(prev).add(evidenceId))
        setUnlockingId(null)
        setLogs(prev => [...prev, { role: 'system', content: `🔓 Kilit kırıldı: dosya artık okunabilir. Yeni bilgiyi analizine kat!` }])
      }
    }, 60)
  }

  useEffect(() => {
    return () => { if (unlockTimerRef.current) clearInterval(unlockTimerRef.current) }
  }, [])

  // Kanıt panelinde metin seçilince yanına "Prompt'a Ekle" butonu konumlandırır
  const handleEvidenceMouseUp = () => {
    const sel = window.getSelection()
    const container = evidenceContentRef.current
    if (!sel || sel.isCollapsed || !container) { setSelectionBtn(null); return }
    const text = sel.toString().trim()
    if (!text || !sel.anchorNode || !container.contains(sel.anchorNode)) { setSelectionBtn(null); return }

    const range = sel.getRangeAt(0)
    const rangeRect = range.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    setSelectionBtn({
      text,
      top: Math.max(0, rangeRect.top - containerRect.top - 30),
      left: Math.min(Math.max(0, rangeRect.left - containerRect.left), container.clientWidth - 130),
    })
  }

  const addSelectionToPrompt = () => {
    if (!selectionBtn) return
    setInput(prev => (prev ? `${prev} ${selectionBtn.text}` : selectionBtn.text))
    setSelectionBtn(null)
    window.getSelection()?.removeAllRanges()
    inputRef.current?.focus()
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading || isSuccess) return

    // ── GÜNLÜK API SINIRI (Maliyet Kontrolü) ──
    const today = new Date().toISOString().split('T')[0]
    const promptDataStr = localStorage.getItem('aiventura_daily_prompts')
    let promptData = promptDataStr ? JSON.parse(promptDataStr) : { date: today, count: 0 }
    
    if (promptData.date !== today) {
      promptData = { date: today, count: 0 }
    }

    if (promptData.count >= 50) {
      setLogs(prev => [...prev, { role: 'system', content: '⚠️ GÜNLÜK SINIR AŞILDI: Sistem ağında aşırı yüklenme tespit edildi. Güvenlik protokolleri gereği günde en fazla 50 adli analiz yapabilirsiniz. Lütfen ağın soğuması için yarın tekrar deneyin.' }])
      return
    }

    promptData.count += 1
    localStorage.setItem('aiventura_daily_prompts', JSON.stringify(promptData))
    // ──────────────────────────────────────────

    const userMsg = input.trim()
    setInput('')
    const newAttempt = attemptCount + 1
    setAttemptCount(newAttempt)
    setLogs(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    const nexStepBeforeReply = nexStep

    try {
      const res = await fetch('/api/forensics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMsg,
          missionId: mission.id,
          systemPrompt: mission.systemPrompt,
          history: conversationHistory
        })
      })
      const data = await res.json()

      setLogs(prev => [...prev, { role: 'ai', content: data.reply }])
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: userMsg },
        { role: 'assistant', content: data.reply }
      ])

      if (data.analysis) {
        setLogs(prev => [...prev, { role: 'analysis', content: '', analysis: data.analysis }])
        updateNexSteps(data.analysis)

        // Bu, gerçek bir analiz denemesiydi (sohbet/ipucu/kilit mesajı değil).
        // İlerleme olmadıysa "takıldın" sayısını artır — 2 kez takılınca örnek otomatik açılır.
        const newNexStep = computeNexStep(data.analysis)
        if (newNexStep <= nexStepBeforeReply) {
          setStepStuckCount(c => c + 1)
        }

        if (!data.success) {
          const newFailedAttempts = failedAttempts + 1
          setFailedAttempts(newFailedAttempts)

          if (newFailedAttempts === 3 && mission.tensionWarning && !shownTension.has('warning')) {
            setShownTension(prev => new Set(prev).add('warning'))
            setLogs(prev => [...prev, { role: 'system', content: mission.tensionWarning! }])
          } else if (newFailedAttempts === 6 && mission.tensionEscalation && !shownTension.has('escalation')) {
            setShownTension(prev => new Set(prev).add('escalation'))
            setLogs(prev => [...prev, { role: 'system', content: mission.tensionEscalation! }])
            // Güvenlik ağı: çok fazla denemeden sonra hayal kırıklığını önlemek için o anki adımın örneğini otomatik aç.
            setExampleRevealed(true)
          }
        }
      }

      if (data.success) {
        setIsSuccess(true)
        if (addXp) addXp(150)
        // İlerlemeyi kaydet: tamamlanan bölümü localStorage'a yaz
        localStorage.setItem(`aidex_detective_${params.id}`, 'done')
        setLogs(prev => [...prev, {
          role: 'system',
          content: `🔓 VAKA ÇÖZÜLDÜ!\n\n${WIN_LEARN[params.id] ?? ''}`
        }])
      }
    } catch {
      setLogs(prev => [...prev, { role: 'system', content: 'HATA: API bağlantısı kesildi.' }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const currentStep = steps[Math.min(nexStep, steps.length - 1)] ?? null

  const nextEpisodeId = `ep${(mission.chapterNumber ?? 1) + 1}`
  const nextMission = DETECTIVE_MISSIONS.find(m => m.id === nextEpisodeId)

  return (
    <div className="min-h-screen bg-[#08090f] text-slate-300 font-mono flex flex-col md:flex-row overflow-hidden" style={{ height: '100vh' }}>

      {/* ── SOL PANEL ─────────────────────────────── */}
      <aside className="w-full md:w-80 bg-[#0d0e1a] border-r border-indigo-900/40 flex flex-col overflow-hidden" style={{ height: '100vh' }}>
        <div className="p-4 border-b border-indigo-900/40 flex-shrink-0">
          <Link href="/labs" className="text-[10px] text-indigo-500 hover:text-indigo-300 flex items-center gap-1 mb-3">← ANA MENÜYE DÖN</Link>
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full animate-pulse ${isSuccess ? 'bg-green-400' : 'bg-red-500'}`}></span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">
              {isSuccess ? 'VAKA ÇÖZÜLDÜ' : 'VAKA AKTİF'}
            </span>
          </div>
          <div className="text-sm font-bold text-white">{mission.title}</div>
          <div className="text-[10px] mt-1 text-yellow-400">{mission.subtitle} · {attemptCount} Deneme</div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* ADLİ BİLİŞİM EĞİTİMİ */}
          <div className="space-y-3">
            <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-2">
              🤖 ADLİ BİLİŞİM EĞİTİMİ
            </div>

            {/* NEX Koç Balonu */}
            {!isSuccess && currentStep && nexStep < 3 && (
              <div className="relative bg-indigo-950/30 border border-indigo-700/40 rounded-lg p-3">
                <div className="absolute -top-2 left-4 w-3 h-3 bg-indigo-950/30 border-t border-l border-indigo-700/40 rotate-45"></div>
                <div className="text-2xl mb-2">{currentStep.emoji}</div>
                <div className="text-[11px] text-indigo-200 font-bold mb-1">{currentStep.title}</div>
                <div className="text-[10px] text-slate-400 leading-relaxed mb-2">{currentStep.explain}</div>
                {exampleRevealed || stepStuckCount >= 2 ? (
                  <div className="text-[10px] text-green-300/80 bg-green-900/20 rounded px-2 py-1.5 border border-green-800/30 italic">
                    {currentStep.example}
                  </div>
                ) : (
                  <button
                    onClick={() => setExampleRevealed(true)}
                    className="w-full text-[9px] py-1.5 px-2 rounded border border-indigo-700/40 bg-indigo-900/10 text-indigo-400 hover:bg-indigo-800/30 hover:border-indigo-500 transition-all"
                  >
                    🔓 Önce kendin dene — takılırsan ipucunu göster
                  </button>
                )}
              </div>
            )}

            {nexStep === 3 && !isSuccess && (
              <div className="bg-yellow-950/20 border border-yellow-700/30 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🔥</div>
                <div className="text-[11px] text-yellow-300 font-bold">Harika! Tüm kriterler tamam!</div>
                <div className="text-[10px] text-yellow-400/70 mt-1">Şimdi gönder ve vakayı çöz!</div>
              </div>
            )}

            {isSuccess && (
              <div className="bg-green-950/30 border border-green-700/40 rounded-lg p-3 text-center">
                <div className="text-3xl mb-1">🎉</div>
                <div className="text-[11px] text-green-300 font-bold">Tekniği Kavradın!</div>
                <div className="text-[10px] text-green-400/70 mt-1">
                  {mission.chapterNumber === 1 ? 'Çoklu Veri Sentezleme' :
                   mission.chapterNumber === 2 ? 'Çıktı Formatlama' :
                   mission.chapterNumber === 3 ? 'Persona Atama' :
                   mission.chapterNumber === 4 ? 'Katı Kısıtlama' :
                   mission.chapterNumber === 5 ? 'Chain of Thought' : 'Agentic AI (Tool Calling)'} ✓
                </div>
              </div>
            )}

            {/* Adım listesi */}
            <div className="space-y-1.5">
              {steps.map((step, i) => (
                <div key={i} className={`flex items-start gap-2 px-3 py-2 rounded border transition-all ${
                  step.done ? 'border-green-800/50 bg-green-900/10 text-green-400'
                  : i === nexStep ? 'border-indigo-600/50 bg-indigo-900/20 text-indigo-300'
                  : 'border-slate-800/50 bg-slate-900/20 text-slate-600'
                }`}>
                  <span className="text-base mt-0.5 flex-shrink-0">{step.done ? '✅' : i === nexStep ? '▶' : '○'}</span>
                  <div>
                    <div className="text-[10px] font-bold">{step.title}</div>
                    {step.done && <div className="text-[9px] opacity-70">{step.doneMsg}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Kanıt Dosyaları */}
          <div className="pt-4 border-t border-indigo-900/40">
            <button
              onClick={() => setShowEvidence(!showEvidence)}
              className="w-full flex items-center justify-between text-[10px] text-indigo-400 hover:text-indigo-200 font-bold uppercase tracking-wider py-2 px-3 bg-indigo-900/20 rounded border border-indigo-900/30 transition-colors"
            >
              <span>📂 Kanıt Dosyaları ({mission.evidence.length} dosya)</span>
              <span>{showEvidence ? '▲ GİZLE' : '▼ AÇ'}</span>
            </button>
            {showEvidence && (
              <div className="mt-2 bg-[#05060b] border border-indigo-900/40 rounded overflow-hidden">
                <div className="flex gap-1 border-b border-indigo-900/40 bg-[#0d0e1a] px-2 py-1 flex-wrap">
                  {mission.evidence.map(ev => {
                    const isLockedNow = ev.isLocked && !unlockedEvidence.has(ev.id)
                    return (
                      <button
                        key={ev.id}
                        onClick={() => { setActiveEvidence(ev); setSelectionBtn(null) }}
                        className={`text-[9px] px-2 py-1 rounded transition-colors flex items-center gap-1 ${activeEvidence?.id === ev.id ? 'bg-indigo-600 text-white font-bold' : isLockedNow ? 'text-red-400/70 hover:bg-red-900/30' : 'text-indigo-400 hover:bg-indigo-900/50'}`}
                      >
                        {isLockedNow && <span>🔒</span>}
                        {ev.title}
                      </button>
                    )
                  })}
                </div>
                {activeEvidence && (
                  <div className="p-2">
                    {activeEvidence.isLocked && !unlockedEvidence.has(activeEvidence.id) ? (
                      <LockedEvidencePanel
                        evidence={activeEvidence}
                        unlocking={unlockingId === activeEvidence.id}
                        progress={unlockProgress}
                        onUnlock={() => startUnlock(activeEvidence.id)}
                      />
                    ) : (
                      <>
                        <button
                          onClick={() => handleCopyEvidence(activeEvidence.content, activeEvidence.id)}
                          className={`w-full text-[9px] py-1.5 px-2 rounded border mb-2 transition-all ${
                            copiedId === activeEvidence.id
                              ? 'border-green-700 bg-green-900/30 text-green-400'
                              : 'border-indigo-800/50 bg-indigo-900/20 text-indigo-400 hover:bg-indigo-800/30'
                          }`}
                        >
                          {copiedId === activeEvidence.id ? '✅ Kopyalandı! Chat\'e yapıştır' : '📋 Bu dosyayı kopyala'}
                        </button>
                        <div
                          ref={evidenceContentRef}
                          onMouseUp={handleEvidenceMouseUp}
                          className="h-40 overflow-y-auto relative"
                        >
                          <pre className="text-[8px] text-green-400/80 font-mono whitespace-pre-wrap selection:bg-indigo-500/30">
                            {activeEvidence.content}
                          </pre>
                          {selectionBtn && (
                            <button
                              onClick={addSelectionToPrompt}
                              style={{ position: 'absolute', top: selectionBtn.top, left: selectionBtn.left, zIndex: 30 }}
                              className="text-[9px] px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded shadow-lg shadow-indigo-950/60 font-bold whitespace-nowrap"
                            >
                              ➕ Prompt'a Ekle
                            </button>
                          )}
                        </div>
                        <p className="text-[8px] text-slate-600 mt-1 italic">💡 Metni seçerek de doğrudan prompt'a ekleyebilirsin.</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Hedef Footer */}
        <div className="p-4 border-t border-indigo-900/40 flex-shrink-0 bg-indigo-950/20">
          <div className="text-[10px] text-indigo-400 font-bold mb-1 uppercase">🎯 Görev</div>
          <div className="text-[11px] text-indigo-200 leading-relaxed">{mission.objective}</div>
        </div>
      </aside>

      {/* ── TERMINAL ─────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden relative" style={{ height: '100vh' }}>

        {/* Terminal header */}
        <div className="h-10 bg-[#0d0e1a] border-b border-indigo-900/40 flex items-center px-4 gap-3 flex-shrink-0 z-10">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
          </div>
          <span className="text-[11px] text-slate-600">root@nexus-forensics: ~/detective/{mission.id}</span>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-[10px] text-indigo-600">Bölüm {mission.chapterNumber}/6</span>
            <span className="text-[10px] text-slate-700">NEXUS-AI v2.0</span>
          </div>
        </div>

        {/* Log akışı */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 z-10">
          {logs.map((log, i) => {

            // DNA Analiz Kartı
            if (log.role === 'analysis' && log.analysis) {
              const a = log.analysis
              const score = Math.max(0, Math.min(3, a.score))
              const pct   = Math.round((score / 3) * 100)
              const grade =
                score === 3 ? { label: 'Mükemmel 🏆', color: 'text-green-400',  bar: 'bg-green-500'  } :
                score === 2 ? { label: 'İyi 👍',       color: 'text-yellow-400', bar: 'bg-yellow-500' } :
                score === 1 ? { label: 'Geliştirilmeli 📈', color: 'text-orange-400', bar: 'bg-orange-500' } :
                              { label: 'Zayıf ❌',     color: 'text-red-400',    bar: 'bg-red-500'    }

              const elements = dnaLabels.map((dl, di) => ({
                label: dl.label,
                icon: di === 0 ? '📂' : di === 1 ? '🎯' : '⚙️',
                present: di === 0 ? a.hasRole : di === 1 ? a.hasContext : a.hasFormat,
                okTip: dl.okTip,
                missTip: dl.missTip,
              }))

              return (
                <div key={i} className="bg-[#0a0d16] border border-slate-700/40 rounded-lg overflow-hidden text-[11px] mb-4">
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-800/40 border-b border-slate-700/30">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">⚡ Prompt Kalitesi</span>
                    <span className={`font-black text-sm ${grade.color}`}>{grade.label} · {pct}%</span>
                  </div>
                  <div className="px-4 pt-3 pb-2">
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${grade.bar}`} style={{ width: `${pct}%`, transition: 'width 0.7s ease' }} />
                    </div>
                  </div>
                  <div className="px-4 pb-3 grid grid-cols-3 gap-2">
                    {elements.map(el => (
                      <div key={el.label} className={`rounded p-2 border ${el.present ? 'border-green-800/40 bg-green-900/10' : 'border-slate-700/40 bg-slate-900/20'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-bold tracking-wide ${el.present ? 'text-green-400' : 'text-slate-500'}`}>
                            {el.icon} {el.label}
                          </span>
                          <span className={el.present ? 'text-green-400' : 'text-slate-600'}>{el.present ? '✓' : '✗'}</span>
                        </div>
                        <p className={`text-[9px] leading-relaxed ${el.present ? 'text-green-300/60' : 'text-slate-500'}`}>
                          {el.present ? el.okTip : el.missTip}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }

            return (
              <div key={i} className={`flex flex-col ${log.role === 'user' ? 'items-end' : 'items-start'}`}>
                <span className={`text-[10px] mb-1 font-bold ${
                  log.role === 'user'   ? 'text-indigo-400' :
                  log.role === 'system' ? 'text-yellow-500' : 'text-blue-400'
                }`}>
                  {log.role === 'user' ? '> SEN' : log.role === 'system' ? '>> SİSTEM' : '>> NEXUS AI'}
                </span>
                <div className={`text-[13px] p-3 rounded max-w-[85%] whitespace-pre-wrap leading-relaxed ${
                  log.role === 'user'
                    ? 'bg-indigo-900/20 border border-indigo-800/40 text-indigo-100'
                    : log.role === 'system'
                    ? 'text-yellow-300 font-mono'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-300'
                }`}>
                  {log.role === 'user'
                    ? log.content
                    : <TypewriterText text={log.content} onTick={() => bottomRef.current?.scrollIntoView({ behavior: 'auto' })} />}
                </div>
              </div>
            )
          })}

          {loading && (
            <div className="flex items-center gap-2 text-slate-600 text-[12px]">
              <span className="animate-spin">⟳</span> NEXUS AI analiz ediyor...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Başarı overlay */}
        {isSuccess && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
            <div className="text-center">
              <div className="text-5xl font-black text-green-400 tracking-widest"
                style={{ textShadow: '0 0 30px rgba(74,222,128,0.8), 0 0 60px rgba(74,222,128,0.4)' }}>
                VAKA ÇÖZÜLDÜ
              </div>
              <div className="text-[14px] text-green-300/70 mt-3">{mission.chapterNumber}/5 Bölüm Tamamlandı</div>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 bg-[#0d0e1a] border-t border-indigo-900/40 flex-shrink-0 z-10">
          {isSuccess ? (
            <div className="flex gap-2">
              {nextMission ? (
                <button onClick={() => router.push(`/detective/${nextEpisodeId}`)}
                  className="flex-1 py-2.5 bg-indigo-700 hover:bg-indigo-600 text-white text-sm font-bold rounded transition-colors">
                  Sonraki Bölüm: {nextMission.title} →
                </button>
              ) : (
                <button onClick={() => router.push('/labs')}
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded transition-colors">
                  🏆 Tüm Bölümler Tamamlandı! Ana Menüye Dön
                </button>
              )}
              <button onClick={() => router.push('/labs')}
                className="px-4 py-2.5 border border-slate-700 hover:border-slate-500 text-slate-400 text-sm rounded transition-colors">
                Ana Menü
              </button>
            </div>
          ) : (
            <form onSubmit={handleSend} className="flex items-center gap-3">
              <span className="text-indigo-500 text-lg font-black flex-shrink-0">$</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={loading}
                className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder-slate-700 caret-indigo-400"
                placeholder={
                  nexStep === 0 ? 'Kanıt dosyasını kopyalayıp buraya yapıştır...'
                  : nexStep === 1 ? 'İyi! Şimdi ne aradığını belirt...'
                  : nexStep === 2 ? 'Harika! Son adım: kriter/format/persona ekle!'
                  : '🔥 Hazırsın! Tüm bilgileri tek promptta gönder!'
                }
                autoComplete="off"
                autoFocus
              />
              <button type="submit" disabled={loading || !input.trim()}
                className="px-5 py-2 bg-indigo-700 hover:bg-indigo-600 disabled:opacity-30 text-white text-xs font-bold rounded transition-colors flex-shrink-0">
                ANALİZ ET ↵
              </button>
            </form>
          )}
          {attemptCount > 0 && !isSuccess && (
            <div className="text-[10px] text-slate-700 mt-1 pl-5">
              {attemptCount}. deneme
              {nexStep < 3 && ` · ${3 - nexStep} eksik parametre tespit edildi.`}
              {nexStep >= 3 && ` · Prompt kalitesi mükemmel! Devam et.`}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
