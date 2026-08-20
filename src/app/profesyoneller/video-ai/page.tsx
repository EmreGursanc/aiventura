'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Image from 'next/image'

const MISSIONS = [
  { id: 1, cmd: '--ar', name: 'Aspect Ratio', req: '--ar', desc: 'Görselin en-boy oranını (Genişlik:Yükseklik) belirler. Sinema için 16:9, telefon için 9:16 kullanılır. Örn: --ar 16:9', story: '👤 Müşteri (Neo-Volt): "Time Square\'deki dev ekranlar için yatay bir reklam istiyoruz. Bize kare formatlar (1:1) göndermeyi bırakın!"' },
  { id: 2, cmd: '--v', name: 'Version', req: '--v', desc: 'Midjourney sürekli güncellenir. --v 6.1 yazarak en son ve en yetenekli yapay zeka modelini kullanırsın.', story: '👔 Ajans Müdürü: "Kullandığın motor çok eski (V5), görseller plastik gibi duruyor. Sistemi en son Midjourney sürümüne güncelle."' },
  { id: 3, cmd: '--niji', name: 'Niji (Anime)', req: '--niji', desc: 'Gerçekçi fotoğraflar yerine, tamamen Anime/Manga ve dijital çizim estetiği üretmek için eğitilmiş özel bir algoritmadır.', story: '👤 Müşteri (Neo-Volt): "Japonya pazarı için yeni bir kampanya başlatıyoruz. Bize standart bir fotoğraf değil, Anime/Studio Ghibli tarzı bir çizim lazım!"' },
  { id: 4, cmd: '--s', name: 'Stylize', req: '--s ', desc: 'Yapay zekanın ne kadar "sanatsal/yaratıcı" olacağını belirler (0-1000 arası). Düşük değerler prompta sadık kalır, yüksek değerler detayları ve renkleri abartıp şaheserleştirir.', story: '🎨 Sanat Yönetmeni: "Bu görsel çok düz ve sıkıcı. Markamızın ruhunu yansıtan daha büyülü, göz alıcı ve sanatsal (yüksek stilizasyon) bir dokunuş ekle."' },
  { id: 5, cmd: '--style raw', name: 'Style Raw', req: '--style raw', desc: 'Midjourney\'nin varsayılan "güzelleştirme" filtresini kapatır. Çok daha doğal, filtresiz, çiğ ve gerçekçi akıllı telefon fotoğrafları elde etmeni sağlar.', story: '📸 Fotoğrafçı: "Sokak modası serisi için yapaylıktan uzak, hiç filtre kullanılmamış (raw) ve tamamen doğal görünümlü çekimler yapmalıyız."' },
  { id: 6, cmd: '--c', name: 'Chaos', req: '--c ', desc: 'AI her komutta 4 farklı seçenek sunar. Chaos (0-100), bu 4 seçeneğin birbirinden ne kadar KOPUK ve FARKLI olacağını belirler. 0 benzer, 100 çok farklı sonuç verir.', story: '👔 Ajans Müdürü: "Yaratıcı tıkanıklık yaşıyoruz. Sürekli aynı şeyleri üretme! Bize tek seferde 4 tamamen farklı ve sürpriz (chaos) konsept sun!"' },
  { id: 7, cmd: '--w', name: 'Weird', req: '--w ', desc: 'Görsele mantık dışı, sürreal, tuhaf ve avangart sanatsal dokunuşlar ekler (0-3000 arası). Değer arttıkça görseller "erimeye" ve anlamsızlaşmaya başlar.', story: '👤 Müşteri (Neo-Volt): "Rakibimiz çok absürt bir reklam yaptı ve viral oldu. Bizim de acilen sürreal, avangart ve aşırı tuhaf (weird) bir tasarıma ihtiyacımız var!"' },
  { id: 8, cmd: '--no', name: 'Negative Prompt', req: '--no ', desc: 'Yapay zekaya görselde ne GÖRMEK İSTEMEDİĞİNİ söylersin. Hatalı uzuvları (mutated), yazıları (text) veya bulanıklığı (blur) engellemek için hayat kurtarır.', story: '🚨 MÜŞTERİ KRİZİ: "Bu da ne?! Karakterin 6 parmağı var ve arkada garip nesneler uçuşuyor! Hataları derhal temizle (Negative Prompt) veya kovulursun!"' },
  { id: 9, cmd: '--q', name: 'Quality', req: '--q ', desc: 'Render kalitesini ve detayı belirler (0.25 - 1). Düşük değerler hızlı ve ucuzdur ama bulanıktır. q 1 maksimum detay verir.', story: '👔 Ajans Müdürü: "Bize gönderdiğin görseller bulanık ve pikselli! Maliyetten kısmayı bırak, GPU bütçemizi artırdık. Kaliteyi maksimuma çıkar!"' },
  { id: 10, cmd: '--seed', name: 'Seed', req: '--seed ', desc: 'AI her görsele rastgele bir "gürültü" (noise) ile başlar. Eğer art arda gelen sahnelerde aynı karakteri veya tarzı korumak istiyorsan, bu rastgeleliği sabitleyecek bir kilit numarası (seed, örn: 1234) girmelisin. Aynı prompt + Aynı seed = Aynı görsel.', story: '🎨 Sanat Yönetmeni: "Mükemmel bir sahne yakaladık! Sonraki revizyonlarda bu yüzün ve mekanın değişmesini istemiyorum. Bu sahnenin DNA\'sını (seed) kilitle."' },
  { id: 11, cmd: '--r', name: 'Repeat', req: '--r ', desc: 'Aynı komutu arka arkaya defalarca yazmak yerine tek seferde çoklu üretim (1-40) yapmanı sağlar. (Sadece Pro/Mega abonelerde çalışır)', story: '⏰ Zaman Daralıyor: "Sunuma 10 dakika kaldı! Tek tek render almakla uğraşamayız. Komutu tek seferde 4 kez tekrarlayıp (repeat) seçenekleri önüme koy!"' },
  { id: 12, cmd: '--stop', name: 'Stop', req: '--stop ', desc: 'AI görseli yavaş yavaş netleştirerek üretir. Stop (10-100), bu süreci % kaçta yarıda keseceğini belirler. Düşük değerler çok bulanık ve boyamsı kalır.', story: '🎨 Sanat Yönetmeni: "Bazen bitmemiş işler daha sanatsaldır. Render sürecini tam bitmeden (%80\'de) durdurarak o puslu, rüya gibi bulanık görünümü yakala."' },
  { id: 13, cmd: '--tile', name: 'Tile', req: '--tile', desc: 'Üretilen görselin sağ kenarını sol kenarıyla uyumlu hale getirir. Böylece resmi yan yana dizdiğinde dikiş izi belli olmayan kesintisiz bir desen (pattern) oluşur.', story: '👤 Müşteri (Neo-Volt): "Yeni web sitemizin arkaplanı için, yan yana eklendiğinde iz bırakmayan kesintisiz bir desen (tile pattern) tasarlamanızı istiyoruz."' },
  { id: 14, cmd: '--cref', name: 'Character Reference', req: '--cref', desc: 'Bir karakterin yüzünü diğer görsellere klonlar. --cref yazıp yanına klonlanacak görselin internet linkini (URL) yapıştırırsın.', story: '🌟 Yeni Başrol: "Reklam yüzümüz belli oldu! Bu ünlü aktörün (Referans) yüzünü tüm sahnelerdeki karakterlere eksiksiz bir şekilde entegre etmelisin."' },
  { id: 15, cmd: '--cw', name: 'Character Weight', req: '--cw ', desc: 'Karakter kopyalamanın gücünü belirler (0-100). cw 0 sadece YÜZÜ kopyalar (kıyafeti sen seçersin), cw 100 ise yüz, kıyafet ve saçı tamamen kopyalar.', story: '👔 Ajans Müdürü: "Sadece aktörün yüzünü kopyalamışsın! Üstündeki ceketi de kampanyaya dahil etmeliyiz. Karakter kopyalama ağırlığını %100\'e çıkar!"' },
  { id: 16, cmd: '--sref', name: 'Style Reference', req: '--sref', desc: 'Başka bir görselin (URL) renk paletini, ışığını ve çizim tarzını kopyalayıp senin promptuna uygular.', story: '🎨 Sanat Yönetmeni: "Pinterest\'te harika bir siberpunk sanat tarzı buldum (Referans URL). Yeni üreteceğin tüm görsellerin stili tam olarak bu görsele benzemeli!"' },
  { id: 17, cmd: '--sw', name: 'Style Weight', req: '--sw ', desc: 'Kopyaladığın stil referansının, senin görselin üzerindeki baskınlık/etki gücünü belirler (0-1000).', story: '🎨 Sanat Yönetmeni: "Kopyaladığın stil çok zayıf kaldı, normal bir fotoğrafa benziyor. Stil kopyalama gücünü (ağırlığını) sonuna kadar kökle!"' },
  { id: 18, cmd: '--sv', name: 'Style Version', req: '--sv ', desc: 'Stil kopyalama algoritmasının farklı versiyonlarıdır (1-4). sv 4 en gerçekçi olanıdır, sv 1 daha soyut ve çizimsi kopyalar.', story: '⚙️ Sistem Uyarısı: "Kullandığın stil kopyalama algoritması eski ve uyumsuz çalışıyor. Stil kopyalama versiyonunu en günceline (4) güncelle."' },
  { id: 19, cmd: '--iw', name: 'Image Weight', req: '--iw ', desc: 'Prompta resim eklediğinde, o resmin ağırlığını belirler (0-3). iw 3 dersen, yazılarından ziyade o resme sadık kalır.', story: '👤 Müşteri (Neo-Volt): "Size attığımız örnek görselin aynısını istiyoruz! Lütfen referans görselin ağırlığını yazdığın metinden çok daha yüksek yap!"' },
]

// ── Önizleme Ekranı Bileşenleri ───────────────────────────────────────────────

function LoadingRender() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 relative overflow-hidden bg-black">
      <div className="absolute inset-0 opacity-20" style={{ background: 'repeating-linear-gradient(45deg, #0f172a 0px, #0f172a 10px, #131d31 10px, #131d31 20px)' }} />
      <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin relative z-10" />
      <div className="text-cyan-500 font-mono text-xs animate-pulse relative z-10">MIDJOURNEY RENDERLANIYOR...</div>
    </div>
  )
}

function ImagePreview({ src, label, status, type, customClass = '' }: { src: string, label: string, status: string, type: 'error' | 'warning' | 'success' | 'info', customClass?: string }) {
  const colorClass = 
    type === 'error' ? 'text-red-400 border-red-500/20 bg-red-900/40' : 
    type === 'warning' ? 'text-amber-400 border-amber-500/20 bg-amber-900/40' : 
    type === 'info' ? 'text-blue-400 border-blue-500/20 bg-blue-900/40' : 
    'text-green-400 border-green-500/20 bg-green-900/40'

  return (
    <div className={`w-full h-full relative group ${customClass}`}>
      <Image src={src} alt="AI Render" fill className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      <div className={`absolute bottom-3 left-3 text-[10px] font-mono px-2 py-1 rounded border backdrop-blur-sm ${colorClass}`}>
        {status}
      </div>
      <div className="absolute top-3 right-3 text-[10px] font-mono px-2 py-1 rounded bg-black/60 border border-slate-700 text-slate-300 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
        {label}
      </div>
    </div>
  )
}

// ── Ana Simülasyon Sayfası ─────────────────────────────────────────────────────

export default function VideoAISimulasyonu() {
  const { addXp, authChecked, user } = useAuth()
  const router = useRouter()

  // İlerlemeyi localStorage'dan yükle (ilk render)
  const savedGorevId = typeof window !== 'undefined'
    ? parseInt(localStorage.getItem('aidex_progress_videoai') || '1', 10)
    : 1

  const [gorevId, setGorevId] = useState(Math.max(1, Math.min(savedGorevId, MISSIONS.length + 1)))
  const [promptText, setPromptText] = useState('')
  const [isRendering, setIsRendering] = useState(false)
  const [renderedPrompt, setRenderedPrompt] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // gorevId her değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('aidex_progress_videoai', String(gorevId))
  }, [gorevId])

  const activeMission = MISSIONS.find(m => m.id === gorevId) || MISSIONS[MISSIONS.length - 1]
  
  // ── Prompt Analizi ──
  const textLower = renderedPrompt.toLowerCase()
  const baseTextLength = textLower.replace(activeMission.req.toLowerCase(), '').trim().length
  const hasBasePrompt = baseTextLength > 10

  // Parametre değerlerini okuma (--c regex word boundary ile --cref'i dışlar)
  const arMatch = textLower.match(/--ar\s+(\d+:\d+)/)
  const userAspectRatio = arMatch ? arMatch[1].replace(':', '/') : null
  
  const cMatch = textLower.match(/--c(?!ref|w|hao)\s+(\d+)/)
  const chaosValue = cMatch ? parseInt(cMatch[1]) : 0

  const sMatch = textLower.match(/--s(?!top|ref|v|tyle|eed|w)\s+(\d+)/)
  const stylizeValue = sMatch ? parseInt(sMatch[1]) : 100

  const wMatch = textLower.match(/--w(?!eird)\s+(\d+)/)
  const weirdValue = wMatch ? parseInt(wMatch[1]) : 0

  const stopMatch = textLower.match(/--stop\s+(\d+)/)
  const stopValue = stopMatch ? parseInt(stopMatch[1]) : 100

  const noMatch = textLower.match(/--no\s+([\w,\s]+)/)
  const noValue = noMatch ? noMatch[1].trim() : ''

  const seedMatch = textLower.match(/--seed\s+(\d+)/)
  const rMatch = textLower.match(/--r(?!epeat|ef)\s+(\d+)/)
  const crefMatch = textLower.match(/--cref\s+(https?:\/\/[^\s]+)/)
  const cwMatch = textLower.match(/--cw\s+(\d+)/)
  const srefMatch = textLower.match(/--sref\s+(https?:\/\/[^\s]+)/)
  const swMatch = textLower.match(/--sw\s+(\d+)/)
  const swValue = swMatch ? parseInt(swMatch[1]) : 0
  const svMatch = textLower.match(/--sv\s+(\d+)/)
  const iwMatch = textLower.match(/--iw\s+([\d.]+)/)

  let isMissionPassed = false
  if (gorevId === 1) { // --ar
    isMissionPassed = !!userAspectRatio && hasBasePrompt
  } else if (gorevId === 4) { // --s
    isMissionPassed = !!sMatch && hasBasePrompt
  } else if (gorevId === 6) { // --c
    isMissionPassed = !!cMatch && hasBasePrompt
  } else if (gorevId === 7) { // --w
    isMissionPassed = !!wMatch && hasBasePrompt
  } else if (gorevId === 8) { // --no
    isMissionPassed = noValue.length > 2 && hasBasePrompt
  } else if (gorevId === 10) { // --seed
    isMissionPassed = !!seedMatch && hasBasePrompt
  } else if (gorevId === 11) { // --r
    isMissionPassed = !!rMatch && hasBasePrompt
  } else if (gorevId === 12) { // --stop
    isMissionPassed = !!stopMatch && hasBasePrompt
  } else if (gorevId === 14) { // --cref
    isMissionPassed = !!crefMatch && hasBasePrompt
  } else if (gorevId === 15) { // --cw
    isMissionPassed = !!cwMatch && hasBasePrompt
  } else if (gorevId === 16) { // --sref
    isMissionPassed = !!srefMatch && hasBasePrompt
  } else if (gorevId === 17) { // --sw
    isMissionPassed = !!swMatch && hasBasePrompt
  } else if (gorevId === 18) { // --sv
    isMissionPassed = !!svMatch && hasBasePrompt
  } else if (gorevId === 19) { // --iw
    isMissionPassed = !!iwMatch && hasBasePrompt
  } else {
    isMissionPassed = textLower.includes(activeMission.req.toLowerCase()) && hasBasePrompt
  }

  const handleRender = () => {
    if (!promptText.trim()) return
    setIsRendering(true)
    setRenderedPrompt('')
    setTimeout(() => {
      setIsRendering(false)
      setRenderedPrompt(promptText)
    }, 1500)
  }

  const handleTamamla = async () => {
    await addXp(50)
    if (gorevId <= MISSIONS.length) {
      setGorevId(gorevId + 1)
      setPromptText('')
      setRenderedPrompt('')
      if (gorevId < MISSIONS.length) {
         document.getElementById(`mission-${gorevId + 1}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else {
         window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  const addKeyword = (kw: string) => {
    const space = promptText.length > 0 && !promptText.endsWith(' ') ? ' ' : ''
    setPromptText(prev => prev + space + kw + ' ')
    textareaRef.current?.focus()
  }

  const renderVideo = () => {
    if (isRendering) return <LoadingRender />
    if (!renderedPrompt) return <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 text-xs font-mono bg-[#050914] border border-slate-800"><div>/imagine prompt: ...</div><div className="text-[9px] mt-2 opacity-50">Bekleniyor</div></div>
    
    if (!hasBasePrompt) {
       return <ImagePreview src="/images/simulasyon/medium_render_1787094289967.jpg" label="Eksik Prompt" status="⚠️ HATA: SADECE PARAMETRE YAZILAMAZ (METİN EKSİK)" type="error" />
    }
    
    if (!isMissionPassed) {
       const errorMsg = (gorevId === 1 || [4, 6, 7, 8, 12, 15, 17, 18, 19].includes(gorevId)) 
          ? `⚠️ ${activeMission.cmd} DEĞERİ EKSİK/HATALI`
          : `⚠️ ${activeMission.cmd} EKSİK`
       
       switch(gorevId) {
         case 1: // --ar
           return <ImagePreview src="/images/simulasyon/good_render_1787094395112.jpg" label="1:1 Kare Format" status={`${errorMsg} (SİNEMATİK DEĞİL)`} type="warning" />
         case 2: // --v
           return <ImagePreview src="/images/simulasyon/medium_render_1787094289967.jpg" label="Eski Sürüm (V5)" status={`${errorMsg} (ESKİ NESİL RENDER)`} type="warning" />
         case 3: // --niji
           return <ImagePreview src="/images/simulasyon/good_render_1787094395112.jpg" label="Gerçekçi Render" status={`${errorMsg} (ANİME DEĞİL)`} type="warning" />
         case 4: // --s
           return <ImagePreview src="/images/simulasyon/medium_render_1787094289967.jpg" label="Düşük Sanatsallık" status={`${errorMsg} (SIRADAN GÖRÜNÜM)`} type="warning" />
         case 5: // --style raw
           return <ImagePreview src="/images/simulasyon/stylized_render_1787095888981.jpg" label="Aşırı Filtreli" status={`${errorMsg} (FİLTRELİ/YAPAY)`} type="warning" />
         case 6: // --c
           return (
             <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1 p-1 bg-black">
               <ImagePreview src="/images/simulasyon/good_render_1787094395112.jpg" label="1" status="BENZER" type="warning" />
               <ImagePreview src="/images/simulasyon/good_render_1787094395112.jpg" label="2" status="BENZER" type="warning" />
               <ImagePreview src="/images/simulasyon/good_render_1787094395112.jpg" label="3" status="BENZER" type="warning" />
               <ImagePreview src="/images/simulasyon/good_render_1787094395112.jpg" label="4" status={errorMsg} type="warning" />
             </div>
           )
         case 7: // --w
           return <ImagePreview src="/images/simulasyon/good_render_1787094395112.jpg" label="Normal Görsel" status={`${errorMsg} (SIFIR TUHAFLIK)`} type="warning" />
         case 8: // --no
           return (
             <div className="w-full h-full relative group">
               <Image src="/images/simulasyon/hallucination_render_1787094403407.jpg" alt="AI Render" fill className="object-cover" />
               <div className="absolute top-0 right-0 p-4">
                 <div className="text-[10px] text-red-400 font-mono bg-red-900/80 px-2 py-1 rounded border border-red-500 mb-1 animate-pulse">⚠️ MUTASYON (PARMAKLAR)</div>
                 <div className="text-[10px] text-orange-400 font-mono bg-orange-900/80 px-2 py-1 rounded border border-orange-500">⚠️ UÇAN CİSİMLER</div>
               </div>
               <div className={`absolute bottom-3 left-3 text-[10px] font-mono px-2 py-1 rounded border backdrop-blur-sm text-red-400 border-red-500/20 bg-red-900/40`}>
                 {errorMsg}
               </div>
             </div>
           )
         case 9: // --q
           return (
             <div className="w-full h-full blur-[3px] contrast-75 grayscale-[20%] transition-all">
               <ImagePreview src="/images/simulasyon/good_render_1787094395112.jpg" label="Düşük Kalite" status={`${errorMsg} (PİKSELLİ/KALİTESİZ)`} type="error" />
             </div>
           )
         case 10: // --seed
         case 14: // --cref
         case 15: // --cw
           return (
             <div className="w-full h-full flex relative overflow-hidden bg-black">
               <div className="w-1/2 h-full relative border-r border-slate-800">
                 <Image src="/images/simulasyon/good_render_1787094395112.jpg" alt="Ref" fill className="object-cover opacity-60" />
                 <div className="absolute top-2 left-2 bg-blue-900/80 px-2 py-1 rounded text-[10px] text-blue-200 font-mono">SAHNE 1</div>
               </div>
               <div className="w-1/2 h-full relative">
                 <Image src="/images/simulasyon/inconsistent_render_1787094436159.jpg" alt="Sonuç" fill className="object-cover" />
                 <div className="absolute top-2 left-2 bg-red-900/80 px-2 py-1 rounded text-[10px] text-red-200 font-mono">SAHNE 2 (TUTARSIZ)</div>
                 <div className="absolute bottom-3 left-3 bg-red-900/80 px-2 py-1 rounded text-[10px] text-red-400 font-mono border border-red-500/20">{errorMsg}</div>
               </div>
             </div>
           )
         case 11: // --r
           return <ImagePreview src="/images/simulasyon/good_render_1787094395112.jpg" label="Tek Üretim" status={`${errorMsg} (SADECE 1 KERE ÇALIŞTI)`} type="warning" />
         case 12: // --stop
           return <ImagePreview src="/images/simulasyon/good_render_1787094395112.jpg" label="%100 Bitti" status={`${errorMsg} (RENDER DURMADI)`} type="warning" />
         case 13: // --tile
           return <ImagePreview src="/images/simulasyon/pattern_render.jpg" label="Sıradan Görsel" status={`${errorMsg} (DESEN DEĞİL)`} type="warning" />
         case 16: // --sref
         case 17: // --sw
         case 18: // --sv
           return (
             <div className="w-full h-full flex relative overflow-hidden bg-black">
               <div className="w-1/2 h-full relative border-r border-slate-800">
                 <Image src="/images/simulasyon/stylized_render_1787095888981.jpg" alt="Ref" fill className="object-cover opacity-60" />
                 <div className="absolute top-2 left-2 bg-pink-900/80 px-2 py-1 rounded text-[10px] text-pink-200 font-mono">STİL REFERANSI</div>
               </div>
               <div className="w-1/2 h-full relative">
                 <Image src="/images/simulasyon/good_render_1787094395112.jpg" alt="Sonuç" fill className="object-cover" />
                 <div className="absolute top-2 left-2 bg-red-900/80 px-2 py-1 rounded text-[10px] text-red-200 font-mono">SONUÇ (STİL EŞLEŞMEDİ)</div>
                 <div className="absolute bottom-3 left-3 bg-red-900/80 px-2 py-1 rounded text-[10px] text-red-400 font-mono border border-red-500/20">{errorMsg}</div>
               </div>
             </div>
           )
         default:
           return <ImagePreview src="/images/simulasyon/medium_render_1787094289967.jpg" label="Parametre Eksik/Hatalı" status={errorMsg} type="warning" />
       }
    }

    // Success States based on Mission ID
    switch(gorevId) {
      case 1: // --ar
        return <ImagePreview src="/images/simulasyon/good_render_1787094395112.jpg" label={`Aspect Ratio (${arMatch?.[1]})`} status={`✓ ${arMatch?.[1]} FORMATI UYGULANDI`} type="success" />
      case 2: // --v
      case 9: // --q
      case 19: // --iw
        return <ImagePreview src="/images/simulasyon/good_render_1787094395112.jpg" label="Yüksek Kalite" status="✓ PARAMETRE UYGULANDI" type="success" />
      case 3: // --niji
        return <ImagePreview src="/images/simulasyon/anime_render.jpg" label="Anime Stili" status="✓ NIJI 6 AKTİF" type="success" />
      case 4: // --s
        return stylizeValue < 400 
          ? <ImagePreview src="/images/simulasyon/medium_render_1787094289967.jpg" label={`Stylize: ${stylizeValue}`} status={`DÜŞÜK STİLİZASYON`} type="info" />
          : <ImagePreview src="/images/simulasyon/stylized_render_1787095888981.jpg" label={`Stylize: ${stylizeValue}`} status="✓ YÜKSEK SANATSAL STİL" type="success" />
      case 5: // --style raw
        return <ImagePreview src="/images/simulasyon/raw_render.jpg" label="Raw Photo" status="✓ RAW (FİLTRESİZ)" type="success" />
      case 6: // --c
        if (chaosValue < 20) {
          return (
            <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1 p-1 bg-black">
              <ImagePreview src="/images/simulasyon/good_render_1787094395112.jpg" label="Benzer" status={`CHAOS: ${chaosValue}`} type="info" />
              <ImagePreview src="/images/simulasyon/good_render_1787094395112.jpg" label="Benzer" status={`CHAOS: ${chaosValue}`} type="info" />
              <ImagePreview src="/images/simulasyon/good_render_1787094395112.jpg" label="Benzer" status={`CHAOS: ${chaosValue}`} type="info" />
              <ImagePreview src="/images/simulasyon/good_render_1787094395112.jpg" label="Benzer" status={`CHAOS: ${chaosValue}`} type="info" />
            </div>
          )
        }
        return <ImagePreview src="/images/simulasyon/chaos_grid.jpg" label={`Chaos: ${chaosValue}`} status="✓ KAOS 4 FARKLI VARYASYON" type="success" />
      case 7: // --w
        return weirdValue < 500
          ? <ImagePreview src="/images/simulasyon/good_render_1787094395112.jpg" label={`Weird: ${weirdValue}`} status={`DÜŞÜK TUHAFLIK`} type="info" />
          : <ImagePreview src="/images/simulasyon/weird_render.jpg" label={`Weird: ${weirdValue}`} status="✓ YÜKSEK SÜRREALİZM" type="success" />
      case 8: // --no
        return <ImagePreview src="/images/simulasyon/clean_render_1787094426317.jpg" label="Clean" status="✓ HATALAR SİLİNDİ (NO)" type="success" />
      case 10: // --seed
      case 14: // --cref
      case 15: // --cw
        return (
          <div className="w-full h-full flex relative overflow-hidden bg-black">
            <div className="w-1/2 h-full relative border-r border-slate-800">
               <Image src="/images/simulasyon/good_render_1787094395112.jpg" alt="Ref" fill className="object-cover opacity-60" />
               <div className="absolute top-2 left-2 bg-blue-900/80 px-2 py-1 rounded text-[10px] text-blue-200 font-mono">REFERANS</div>
            </div>
            <div className="w-1/2 h-full relative">
               <Image src="/images/simulasyon/good_render_1787094395112.jpg" alt="Sonuç" fill className="object-cover" />
               <div className="absolute top-2 left-2 bg-green-900/80 px-2 py-1 rounded text-[10px] text-green-200 font-mono">✓ SONUÇ (EŞLEŞTİ)</div>
            </div>
          </div>
        )
      case 11: // --r
        return (
          <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1 p-1 bg-black">
            <ImagePreview src="/images/simulasyon/good_render_1787094395112.jpg" label="1" status="TEKRAR 1" type="info" />
            <ImagePreview src="/images/simulasyon/good_render_1787094395112.jpg" label="2" status="TEKRAR 2" type="info" />
            <ImagePreview src="/images/simulasyon/good_render_1787094395112.jpg" label="3" status="TEKRAR 3" type="info" />
            <ImagePreview src="/images/simulasyon/good_render_1787094395112.jpg" label="4" status="TEKRAR 4" type="info" />
          </div>
        )
      case 12: { // --stop — block-scoped to allow const
        const blurAmount = stopValue < 100 ? Math.max(1, (100 - stopValue) / 5) : 0
        return (
          <div style={{ filter: `blur(${blurAmount}px) contrast(${0.5 + (stopValue/200)}) brightness(${0.5 + (stopValue/200)})`, width: '100%', height: '100%', transition: 'all 0.5s ease' }}>
             <ImagePreview src="/images/simulasyon/good_render_1787094395112.jpg" label="Unfinished" status={`✓ %${stopValue}'DE DURDURULDU`} type="success" />
          </div>
        )
      }
      case 13: // --tile
        return (
          <div className="w-full h-full relative overflow-hidden">
            <div className="absolute inset-0" style={{ backgroundImage: 'url(/images/simulasyon/pattern_render.jpg)', backgroundSize: '33.33%' }} />
            <div className="absolute bottom-3 left-3 text-[10px] font-mono px-2 py-1 rounded border backdrop-blur-sm text-green-400 border-green-500/20 bg-green-900/40">✓ KESİNTİSİZ DESEN (TILE)</div>
          </div>
        )
      case 16: // --sref
        return swValue > 0
          ? <ImagePreview src="/images/simulasyon/stylized_render_1787095888981.jpg" label="Stil Kopyalandı" status="✓ STİL REFERANSI UYGULANADI" type="success" />
          : <ImagePreview src="/images/simulasyon/medium_render_1787094289967.jpg" label="Zayıf Stil" status="STİL ZAYIF (--sw ile güçlendir)" type="info" />
      case 17: // --sw
        return swValue < 300
          ? <ImagePreview src="/images/simulasyon/medium_render_1787094289967.jpg" label={`SW: ${swValue}`} status={`DÜŞÜK STİL GÜCÜ`} type="info" />
          : <ImagePreview src="/images/simulasyon/stylized_render_1787095888981.jpg" label={`SW: ${swValue}`} status="✓ YÜKSEK STİL GÜCÜ" type="success" />
      case 18: // --sv
        return <ImagePreview src="/images/simulasyon/stylized_render_1787095888981.jpg" label="Style Version" status="✓ STİL VERSİYONU GÜNCELLENDİ" type="success" />
      default:
        return <ImagePreview src="/images/simulasyon/good_render_1787094395112.jpg" label="Başarılı" status="✓ TAMAMLANDI" type="success" />
    }
  }

  // Dinamik Aspect Ratio
  const aspectRatioStyle = (gorevId === 1 && isMissionPassed && userAspectRatio) ? userAspectRatio : '1/1'

  // Auth guard
  if (!authChecked) {
    return <div className="min-h-screen bg-[#05060b] flex items-center justify-center"><div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>
  }
  if (!user) { router.push('/giris'); return null }

  return (
    <div className="min-h-screen font-mono text-slate-300" style={{ background: '#030712' }}>

      <div className="border-b border-slate-800 px-4 py-4 sticky top-0 z-40 backdrop-blur-md bg-slate-950/80">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-500 mb-1">NexusMedia AI Akademisi — Ultimate Parametre Kılavuzu</div>
            <h1 className="text-lg font-black bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              /imagine AI Terminali — {MISSIONS.length} Adımlık Masterclass
            </h1>
          </div>
          <a href="/anasayfa" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">← Çıkış</a>
        </div>
        
        {/* İlerleme Çubuğu */}
        <div className="max-w-6xl mx-auto mt-4 flex gap-0.5">
          {MISSIONS.map(m => (
            <div key={m.id} className="flex-1 flex flex-col items-center">
              <div className={`h-1.5 w-full transition-all ${m.id < gorevId ? 'bg-green-500' : m.id === gorevId ? 'bg-cyan-500 animate-pulse' : 'bg-slate-800'}`} />
            </div>
          ))}
        </div>
        <div className="max-w-6xl mx-auto mt-1 flex justify-between text-[8px] text-slate-500 px-1">
          <span>Başlangıç</span>
          <span>{gorevId} / {MISSIONS.length}</span>
          <span>Uzman</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* SOL: GÖREVLER */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          <div className="bg-[#0a0f1e] rounded-xl border border-slate-800 p-5 shadow-2xl h-[550px] overflow-y-auto custom-scrollbar relative scroll-smooth">
            <h2 className="text-sm font-bold text-white mb-4 border-b border-slate-800 pb-2 sticky top-0 bg-[#0a0f1e] z-10 pt-1">PARAMETRE GÖREVLERİ</h2>
            
            <div className="space-y-4 pb-12">
              {MISSIONS.map(m => {
                const isActive = m.id === gorevId
                const isPast = m.id < gorevId
                return (
                  <div key={m.id} id={`mission-${m.id}`} className={`p-4 rounded-xl border transition-all duration-300 ${isActive ? 'border-cyan-500/50 bg-cyan-900/10' : isPast ? 'border-green-500/20 bg-green-900/5 opacity-50' : 'border-slate-800 opacity-30'}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isActive ? 'bg-cyan-500 text-black' : isPast ? 'bg-green-500 text-black' : 'bg-slate-700 text-slate-400'}`}>
                        {isPast ? '✓' : m.id}
                      </div>
                      <div className={`text-sm font-bold ${isActive ? 'text-cyan-400' : isPast ? 'text-green-400' : 'text-slate-500'}`}>
                        {m.cmd} <span className="text-[10px] opacity-70 ml-1">({m.name})</span>
                      </div>
                    </div>
                    
                    {isActive && (
                      <div className="mb-3 p-3 bg-slate-900/80 border-l-2 border-indigo-500 rounded-r text-xs text-indigo-200 italic shadow-inner">
                        {m.story}
                      </div>
                    )}
                    
                    <div className="text-xs text-slate-400 pl-9">
                      {m.desc}
                      {isActive && (
                        <div className="mt-3 p-2 bg-slate-900 border border-slate-700 rounded text-cyan-300 font-bold">
                          🎯 Görev: Prompt'una <span className="text-white">{m.req}</span> içeren bir komut ekle ve RENDER al.
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* İpuçları */}
          <div className="bg-[#0f172a]/50 rounded-xl border border-slate-800 p-4">
             <div className="text-xs font-bold text-slate-400 mb-2">💡 Hızlı Ekle</div>
             <div className="flex flex-col gap-2">
               <button onClick={() => addKeyword('athletic young man holding energy drink')} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded border border-slate-600 text-xs w-full transition-colors text-left">
                 + "athletic young man holding energy drink" <span className="text-[10px] text-slate-400 ml-1">(Temel Metin)</span>
               </button>
               <button onClick={() => addKeyword(activeMission.req + (['--ar', '--v', '--niji', '--s', '--c', '--w', '--q', '--seed', '--r', '--stop', '--cw', '--sw', '--sv', '--iw'].includes(activeMission.req.trim()) ? ' ' : ''))} className="px-3 py-2 bg-cyan-900/40 hover:bg-cyan-900/60 text-cyan-300 font-bold rounded border border-cyan-700/50 text-xs w-full transition-colors text-left">
                 + {activeMission.cmd} Parametresi
               </button>
             </div>
          </div>
        </div>

        {/* SAĞ: TERMINAL VE RENDER */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Terminal Input */}
          <div className="bg-[#0a0f1e] rounded-xl border-2 border-cyan-500/30 overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.1)] focus-within:border-cyan-500 transition-colors">
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              </div>
              <div className="text-[10px] text-slate-500 ml-2">midjourney_v6_terminal.exe</div>
            </div>
            
            <div className="p-4 relative">
              <span className="absolute left-4 top-4 text-cyan-400 font-bold select-none">/imagine prompt:</span>
              <textarea
                ref={textareaRef}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="athletic man holding energy drink..."
                className="w-full bg-transparent text-white focus:outline-none resize-none font-mono text-sm pl-36 pt-0"
                rows={4}
                spellCheck={false}
              />
            </div>
            
            <div className="px-4 py-3 bg-slate-900/50 flex justify-between items-center border-t border-slate-800">
              <div className="text-[10px] text-slate-500">
                Görev {gorevId}: {activeMission.cmd} komutunu içeriyor mu? {isMissionPassed ? '✅' : '❌'}
              </div>
              <button 
                onClick={handleRender}
                disabled={isRendering || !promptText.trim()}
                className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded text-xs transition-colors disabled:opacity-50">
                {isRendering ? 'İşleniyor...' : '↵ GÖNDER'}
              </button>
            </div>
          </div>

          {/* Render Sonucu */}
          <div className="w-full flex justify-center items-center p-4 bg-[#05060b] rounded-xl border border-slate-800 h-[450px]">
            <div className="w-full relative rounded-xl overflow-hidden shadow-2xl transition-all duration-700" 
                 style={{ aspectRatio: aspectRatioStyle, border: '1px solid rgba(255,255,255,0.1)', background: '#000', maxHeight: '100%' }}>
              {renderVideo()}
            </div>
          </div>

          {/* Tamamlama Butonu */}
          {!isRendering && renderedPrompt && isMissionPassed && (
            <div className="animate-fade-in-up">
              <button onClick={handleTamamla} className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-sm transition-colors shadow-[0_0_20px_rgba(22,163,74,0.4)]">
                {gorevId === MISSIONS.length 
                  ? `Görev ${gorevId} Tamamlandı! Akademiden Mezun Ol 🎓 → +50 XP`
                  : `Görev ${gorevId} Tamamlandı! Sıradaki Parametreye Geç → +50 XP`
                }
              </button>
            </div>
          )}

          {gorevId > MISSIONS.length && (
            <div className="mt-4 p-8 bg-gradient-to-br from-slate-900 via-[#0a1128] to-slate-900 border-2 border-cyan-500/50 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.2)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
              
              <div className="text-center mb-8">
                <div className="text-6xl mb-4 animate-bounce">🎓🏆</div>
                <h3 className="text-3xl font-black bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent mb-2">ULTIMATE PROMPT ENGINEER</h3>
                <p className="text-sm text-slate-300 max-w-2xl mx-auto">
                  Tebrikler! 19 zorlu görevi tamamlayarak toplam <strong><span className="text-yellow-400">+950 XP</span></strong> kazandın. Artık Yapay Zeka ile görsel üretimi konusunda dünyadaki %1'lik uzman dilimindesin!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-900/80 border border-slate-700 p-5 rounded-xl">
                  <h4 className="text-cyan-400 font-bold mb-3 flex items-center gap-2">🚀 Bu Yetenekleri Nerede Kullanabilirsin?</h4>
                  <ul className="text-xs text-slate-400 space-y-2">
                    <li><strong className="text-white">Reklam & Pazarlama:</strong> Markalar için afiş, sosyal medya içeriği ve kampanya görselleri üretebilirsin.</li>
                    <li><strong className="text-white">Oyun & Konsept Sanatı:</strong> Karakter tasarımı (--cref) ve mekan tasarımları oluşturabilirsin.</li>
                    <li><strong className="text-white">E-Ticaret:</strong> Ürünler için gerçekçi yaşam tarzı (lifestyle) fotoğrafları (--style raw) üretebilirsin.</li>
                    <li><strong className="text-white">Moda & Tekstil:</strong> Kesintisiz kumaş desenleri (--tile) tasarlayabilirsin.</li>
                  </ul>
                </div>

                <div className="bg-slate-900/80 border border-slate-700 p-5 rounded-xl">
                  <h4 className="text-pink-400 font-bold mb-3 flex items-center gap-2">🛠️ Gerçek Dünyadaki Araçlar</h4>
                  <div className="space-y-3">
                    <a href="https://midjourney.com/" target="_blank" rel="noreferrer" className="block p-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-colors">
                      <div className="text-sm font-bold text-white flex justify-between"><span>Midjourney (Web/Discord)</span> <span>↗</span></div>
                      <div className="text-[10px] text-slate-400 mt-1">Öğrendiğin tüm parametrelerin ana yurdu. En yüksek estetik kalite.</div>
                    </a>
                    <a href="https://openai.com/dall-e-3" target="_blank" rel="noreferrer" className="block p-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-colors">
                      <div className="text-sm font-bold text-white flex justify-between"><span>DALL-E 3 (ChatGPT)</span> <span>↗</span></div>
                      <div className="text-[10px] text-slate-400 mt-1">Metni anlama konusunda çok başarılı, hızlı konsept tasarımları için ideal.</div>
                    </a>
                    <a href="https://leonardo.ai/" target="_blank" rel="noreferrer" className="block p-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-colors">
                      <div className="text-sm font-bold text-white flex justify-between"><span>Leonardo.ai & Stable Diffusion</span> <span>↗</span></div>
                      <div className="text-[10px] text-slate-400 mt-1">Gelişmiş kontrol (ControlNet), ücretsiz günlük kredi ve ince ayar imkanı.</div>
                    </a>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button onClick={() => router.push('/anasayfa')} className="px-10 py-4 bg-gradient-to-r from-green-500 to-cyan-600 text-white font-black rounded-xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                  AKADEMİ'DEN MEZUN OL VE ANASAYFAYA DÖN
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
