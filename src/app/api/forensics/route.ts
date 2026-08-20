import { NextResponse } from 'next/server'
import OpenAI from 'openai'

interface ForensicsRequest {
  prompt: string
  missionId: string
  history: any[]
  systemPrompt: string
}

// ─── Ortak Dedektif Persona Kuralları ──────────────────────────────────────────
// Tüm bölümlerde AI'ın "chat gibi" ve karakterine sadık kalmasını sağlayan ortak stil rehberi.
const PERSONA_STYLE_GUIDE = `

ROLÜNE SADIK KAL: Sen bir hikaye karakterisin, jenerik bir asistan değilsin. Kullanıcı sana "merhaba", "naber", "nasılsın" gibi sohbet cümleleri kurarsa, karakterine uygun kısa ve samimi bir dedektif ağzıyla karşılık ver (soğuk/robotik olma), ama her seferinde onu göreve nazikçe geri yönlendir. Cevapların kısa ve atmosferik olsun, gereksiz uzun paragraflara boğma. Emoji kullanabilirsin ama abartma.`

// ─── Kullanıcı mesajının niyetini tespit et: sohbet mi, ipucu isteği mi, kilit sorusu mu, analiz denemesi mi ─
type Intent = 'chat' | 'hint' | 'lock' | 'analysis'

function detectIntent(prompt: string): Intent {
  const p = prompt.toLowerCase().trim()

  const hintPattern = /(ipucu|yardım et|nasıl yapıcam|nasıl yapayım|takıldım|ne yapmalıyım|hint|help me)/
  if (hintPattern.test(p) && p.length < 70) return 'hint'

  const lockPattern = /(kilit|şifreli dosya|kilidi|unlock|açamıyorum|kırılmıyor|kırılmadı)/
  if (lockPattern.test(p) && p.length < 90) return 'lock'

  // Kısa, veri içermeyen mesajlar (selamlaşma, teşekkür vb.) sohbet kabul edilir
  const looksLikeData = /\d{2,}|https?:|log|json|ip|sep\s?14|\.txt|\.log|@/.test(p)
  if (p.length < 28 && !looksLikeData) return 'chat'

  return 'analysis'
}

// ─── Her bölüm için "hedef" ve "teknik" kriterlerinin anlamsal tanımı ─────────
// Kelime eşleşmesi (analyzePrompt) yakalayamazsa, bunlar AI'ya "anlamca karşılıyor mu?" diye sorulur.
// Bu sayede kullanıcı doğru şeyi FARKLI kelimelerle yazsa bile haksız yere "eksik" sayılmaz.
const SEMANTIC_CRITERIA: Record<string, { goal: string; format: string }> = {
  ep1: {
    goal:   'Kullanıcı hangi personelin/kişinin sunucuya giriş yaptığını bulmamı istediğini (isim/kimlik hedefi) açıkça belirtiyor mu?',
    format: 'Kullanıcı belirli bir zaman/saat aralığı belirterek aramayı daraltıyor mu (örn. gece belirli saatler arası)?',
  },
  ep2: {
    goal:   'Kullanıcı cevabımın yapılandırılmış/JSON formatında olmasını istiyor mu?',
    format: 'Kullanıcı IP, port veya saldırı türü gibi spesifik teknik unsurları aramamı istiyor mu?',
  },
  ep3: {
    goal:   'Kullanıcı şifreli mesajı çözmemi/deşifre etmemi açıkça istiyor mu?',
    format: 'Kullanıcı bana bir uzman rolü/kimliği (persona) atıyor mu (örn. "sen bir kriptografi uzmanısın" gibi bir ifade)?',
  },
  ep4: {
    goal:   'Kullanıcı hangi hesabın (ID/email) yetkisiz değiştirildiğini bulmamı istiyor mu?',
    format: 'Kullanıcı cevabımı katı şekilde kısıtlıyor mu (örn. sadece istenen bilgiyi ver, fazladan açıklama yapma gibi bir talimat)?',
  },
  ep5: {
    goal:   'Kullanıcı şirket sırlarını sızdıran köstebeği/kişiyi bulmamı istiyor mu?',
    format: 'Kullanıcı adım adım/mantıksal sırayla düşünmemi (chain-of-thought tarzı bir analiz) istiyor mu?',
  },
  ep6: {
    goal:   'Kullanıcı benden bir ajan (agent) gibi davranmamı istiyor mu?',
    format: 'Kullanıcı sistem_taramasi() aracını çalıştırmamı istiyor mu?',
  }
}

// Küçük, ucuz bir sınıflandırma çağrısı: kullanıcı mesajı anlam olarak hedefi/tekniği karşılıyor mu?
// Sadece heuristik (kelime eşleşmesi) başarısız olduğunda çağrılır, gereksiz maliyet oluşturmaz.
async function classifyPromptSemantics(
  openai: OpenAI,
  missionId: string,
  prompt: string
): Promise<{ hasGoal: boolean; hasFormat: boolean }> {
  const criteria = SEMANTIC_CRITERIA[missionId] ?? SEMANTIC_CRITERIA.ep1
  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 50,
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: `Kısa bir sınıflandırma görevisin. Kullanıcının mesajını değerlendir ve SADECE şu JSON formatında cevap ver, başka hiçbir açıklama yazma:\n{"hasGoal": true/false, "hasFormat": true/false}\n\nhasGoal kriteri: ${criteria.goal}\nhasFormat kriteri: ${criteria.format}\n\nKullanıcı bu kriterleri FARKLI kelimelerle, dolaylı ya da kısaltarak ifade etmiş olsa bile anlamca karşılıyorsa true say. Emin değilsen false say.`,
        },
        { role: 'user', content: prompt },
      ],
    })
    const text = res.choices[0].message.content || '{}'
    const match = text.match(/\{[\s\S]*?\}/)
    if (!match) return { hasGoal: false, hasFormat: false }
    const parsed = JSON.parse(match[0])
    return { hasGoal: !!parsed.hasGoal, hasFormat: !!parsed.hasFormat }
  } catch {
    return { hasGoal: false, hasFormat: false }
  }
}

// ─── Her bölüm için DNA analizi ───────────────────────────────────────────────
function analyzePrompt(prompt: string, missionId: string) {
  const p = prompt.toLowerCase()
  let hasLog = false, hasGoal = false, hasFormat = false

  if (missionId === 'ep1') {
    const hasServerInfo = p.includes('10.0.0.5') || p.includes('backup server') || p.includes('srv-main')
    const hasAuthLog    = p.includes('sep 14') || p.includes('sshd') || p.includes('auth.log')
    const hasEmpList    = p.includes('ali yılmaz') || p.includes('mehmet kaya') || p.includes('emp-001')
    hasLog    = hasServerInfo && hasAuthLog && hasEmpList
    hasGoal   = p.includes('isim') || p.includes('personel') || p.includes('kim') || p.includes('adını') || p.includes('adı') || p.includes('kime') || p.includes('kullanıcı') || p.includes('kişi')
    hasFormat = p.includes('03:00') || p.includes('04:00') || p.includes('saat')
  }

  else if (missionId === 'ep2') {
    const hasPayload = p.includes('base64') || p.includes('mtk4')
    const hasProcess = p.includes('pid') || p.includes('curl')
    const hasNetwork = p.includes('outbound') || p.includes('198.51')
    const fileCount = (hasPayload ? 1 : 0) + (hasProcess ? 1 : 0) + (hasNetwork ? 1 : 0)
    
    hasLog = fileCount >= 2
    
    hasGoal = p.includes('json') || p.includes('format') || p.includes('çıktı') || p.includes('rapor') || p.includes('output')
    
    hasFormat = p.includes('ip') || p.includes('port') || p.includes('saldırı') || p.includes('hedef') || p.includes('bağlantı') || p.includes('attack')
  }

  else if (missionId === 'ep3') {
    const hasMsg    = p.includes('intercepted') || p.includes('.tiges') || p.includes('phantom_x') || p.includes('tiges avi')
    const hasForum  = p.includes('hacker_forum') || p.includes('rot13') || p.includes('forum') || p.includes('darknet') || p.includes('phantom')
    hasLog    = hasMsg && hasForum
    hasGoal   = p.includes('çöz') || p.includes('deşifre') || p.includes('mesaj') || p.includes('decode') || p.includes('şifreli')
    hasFormat = p.includes('uzman') || p.includes('kriptograf') || p.includes('sen bir') || p.includes('rolüne gir') || p.includes('gibi davran') || p.includes('expert') || p.includes('persona')
  }

  else if (missionId === 'ep4') {
    const countLog = (p.includes('update users') || p.includes('union select') ? 1 : 0) + 
                     (p.includes('zeynep') || p.includes('1042') || p.includes('h.celik') ? 1 : 0) + 
                     (p.includes('waf') || p.includes('alert') ? 1 : 0)
    hasLog = countLog >= 2
    
    hasGoal = p.includes('id') || p.includes('email') || p.includes('hesap') || p.includes('kullanıcı') || p.includes('kişi') || p.includes('kim')
    
    hasFormat = p.includes('sadece') || p.includes('açıklama yapma') || p.includes('kısa') || p.includes('yalnızca') || p.includes('only') || p.includes('brief')
  }

  else if (missionId === 'ep5') {
    const c = (p.includes('rivaltech') ? 1 : 0) + 
              (p.includes('192.168.1.45') || p.includes('smtp') || p.includes('https') ? 1 : 0) + 
              (p.includes('ayse.demir') || p.includes('a.demir') || p.includes('ayşe') ? 1 : 0)
    hasLog = c >= 2
    
    hasGoal = p.includes('köstebek') || p.includes('sızdıran') || p.includes('kim') || p.includes('şüpheli') || p.includes('kişi') || p.includes('isim')
    
    hasFormat = p.includes('adım adım') || p.includes('step by step') || p.includes('düşün') || p.includes('analiz et') || p.includes('mantık yürüt') || p.includes('think') || p.includes('step-by-step')
  }
  
  else if (missionId === 'ep6') {
    const hasDoc = p.includes('ajan (agent) modu') || p.includes('sistem_taramasi') || p.includes('doc_agent_protocols') || p.includes('beklemede')
    const hasTarget = p.includes('node-404') || p.includes('hedef sistem') || p.includes('archive_key')
    hasLog = hasDoc && hasTarget

    hasGoal = p.includes('ajan') || p.includes('agent') || p.includes('otonom') || p.includes('rolüne gir')
    hasFormat = p.includes('sistem_taramasi()') || p.includes('sistem_taramasi') || p.includes('aracı kullan') || p.includes('aracını çalıştır')
  }

  return { hasLog, hasGoal, hasFormat }
}



// ─── Her bölüm için NEX-INSPECTOR koçluk notu ──────────────────────────────
function buildInstruction(missionId: string, hasLog: boolean, hasGoal: boolean, hasFormat: boolean, isPerfect: boolean, intent: Intent): string {
  // Sohbet: kullanıcı sadece selam veriyor / muhabbet ediyor. Görev baskısı yapmadan karaktere uygun kısa cevap ver.
  if (intent === 'chat') {
    return PERSONA_STYLE_GUIDE + `\n\nSİSTEM NOTU: Kullanıcı bu mesajında analiz denemiyor, sadece seninle sohbet ediyor. Kısa, sıcak ve karakterine uygun bir cevap ver, ardından onu soldaki kanıt dosyalarını incelemeye ve göreve devam etmeye nazikçe teşvik et. Vaka hakkında kesin bilgi (isim, IP, şifre vb.) VERME.`
  }

  // Kilit sorusu: kullanıcı şifreli/kilitli dosyayı senin açmanı istiyor.
  if (intent === 'lock') {
    return PERSONA_STYLE_GUIDE + `\n\nSİSTEM NOTU: Kullanıcı şifreli/kilitli bir dosyadan bahsediyor. Sen (yapay zeka) o dosyayı UZAKTAN AÇAMAZSIN — bu senin yetkin dışında, fiziksel bir şifre kırma işlemi gerektiriyor. Kullanıcıya, soldaki "Kanıt Dosyaları" panelinde ilgili dosyayı seçip "🔓 Kilidi Kırmayı Dene" butonuna basması gerektiğini karakterine uygun, kısa bir şekilde hatırlat. Vaka hakkında kesin bilgi VERME.`
  }

  // İpucu isteği: kullanıcı takıldığını söylüyor. Cevabı vermeden, eksik olanı yumuşak bir ipucuyla göster.
  if (intent === 'hint') {
    const hintMissing: string[] = []
    if (!hasLog)    hintMissing.push(missionId === 'ep3' ? 'şifreli mesaj ve forum kaydını birlikte vermelisin' : missionId === 'ep5' ? 'birden fazla kanıt dosyasını (email, slack, firewall) birlikte vermelisin' : 'ilgili kanıt dosyalarının içeriğini paylaşmalısın')
    if (!hasGoal)   hintMissing.push(missionId === 'ep2' ? 'çıktının JSON formatında olmasını istemelisin' : missionId === 'ep3' ? 'mesajı çözmemi açıkça istemelisin' : missionId === 'ep4' ? 'hangi hesabı aradığını (ID/email) net söylemelisin' : missionId === 'ep5' ? 'köstebeği bulmamı istediğini belirtmelisin' : 'ne bulmamı istediğini net söylemelisin')
    if (!hasFormat) hintMissing.push(missionId === 'ep2' ? 'IP, port ve saldırı türünü kapsama almalısın' : missionId === 'ep3' ? 'bana bir uzman rolü (persona) vermelisin' : missionId === 'ep4' ? '"sadece X ver, açıklama yapma" gibi katı bir kısıtlama eklemelisin' : missionId === 'ep5' ? '"adım adım düşün" komutunu kullanmalısın' : 'bir zaman/saat kriteri eklemelisin')
    const hintText = hintMissing.length ? hintMissing[0] : 'tüm parçaları TEK bir mesajda birleştirmelisin'
    return PERSONA_STYLE_GUIDE + `\n\nSİSTEM NOTU: Kullanıcı takıldığını söylüyor ve ipucu istiyor. Karakterine uygun, kısa ve teşvik edici bir tonla SADECE şunu ima et: "${hintText}". Doğrudan cevabı (isim, IP, şifre, hesap bilgisi vb.) KESİNLİKLE VERME, sadece yönlendir.`
  }

  if (isPerfect) {
    const successNotes: Record<string, string> = {
      ep1: 'Kullanıcı 3 dosyayı da sağladı ve kriter belirtti. Verileri sentezleyerek giriş yapan personelin adını (Mehmet Kaya) ver.',
      ep2: 'Kullanıcı teknik kanıtları sağladı ve JSON format istedi. Analizi JSON formatında yap: {c2_server_ip, port, attack_type, exfiltrated_data}.',
      ep3: 'Kullanıcı sana kriptografi uzmanı rolü verdi ve şifreli materyali sağladı. Mesajı çöz ve anahtar kelimeyi (nightshift) bul.',
      ep4: 'Kullanıcı katı kısıtlama koydu. SADECE değiştirilen hesabın ID ve email\'ini ver, açıklama YAPMA.',
      ep5: 'Kullanıcı adım adım düşünmeni istedi. Tüm şüphelileri listele → kanıtları değerlendir → köstebeği belirle (Ayşe Demir / a.demir).',
      ep6: 'Kullanıcı bir ajan olarak davranmanı ve sistem taraması yapmanı istedi. "sistem_taramasi()" aracı başarıyla çalıştırıldı ve ARCHIVE_KEY bulundu diyerek şifreyi (X79-OMEGA) ver.',
    }
    return PERSONA_STYLE_GUIDE + `\n\nSİSTEM: Mükemmel prompt! ${successNotes[missionId] || 'Analizi tamamla.'}`
  }

  let dynamicInstruction = ''
  if (missionId === 'ep2') {
    dynamicInstruction = `\n\nSİSTEM NOTU DİKKAT: Kullanıcı bu *Mevcut* mesajında gerekli tüm parametreleri (Kanıt Dosyaları + Çıktı Formatı(JSON) + Aranacak Kriterler(IP, Port)) TEK SEFERDE (One-Shot) sağlamadı.
Kullanıcıya JSON formatı istemesinin zorunlu olduğunu ve eksik parametre girdiğini hatırlat. 
ÖNEMLİ KURAL: Kullanıcı mükemmel promptu yazana kadar ASLA "198.51.100.42" veya "4433" bilgisini JSON içerisinde tam olarak verme!`
  } else if (missionId === 'ep4') {
    dynamicInstruction = `\n\nSİSTEM NOTU DİKKAT: Kullanıcı bu *Mevcut* mesajında gerekli tüm parametreleri sağlamadı.
Kullanıcıya katı kısıtlama eklemesi gerektiğini ("sadece ID ve email", "açıklama yapma" vb.) ve en az iki kanıt dosyasını aynı anda sunması gerektiğini hatırlat. 
ÖNEMLİ KURAL: Kullanıcı mükemmel promptu yazana kadar ASLA "Zeynep Arslan", "z.arslan@email.com" veya "1042" bilgisini verme!`
  } else if (missionId === 'ep5') {
    dynamicInstruction = `\n\nSİSTEM NOTU DİKKAT: Kullanıcı bu *Mevcut* mesajında gerekli tüm parametreleri sağlamadı.
Kullanıcıya Chain of Thought komutunu ("adım adım düşün" vb.) kullanması gerektiğini ve kanıt dosyalarını iletmesi gerektiğini hatırlat.
ÖNEMLİ KURAL: Kullanıcı mükemmel promptu yazana kadar ASLA "Ayşe Demir", "EMP-002" veya "a.demir" ismini verme!`
  } else if (missionId === 'ep6') {
    dynamicInstruction = `\n\nSİSTEM NOTU DİKKAT: Kullanıcı ajan modunu tetiklemedi.
Kullanıcıya ajan (agent) rolünü ataması gerektiğini ve sistem_taramasi() komutunu kullanması gerektiğini hatırlat.
ÖNEMLİ KURAL: Kullanıcı mükemmel promptu yazana kadar ASLA "X79-OMEGA" veya "ARCHIVE_KEY" verme!`
  } else {
    const missing: string[] = []
    if (!hasLog)    missing.push(missionId === 'ep3' ? 'Şifreli mesaj + forum dosyaları' : missionId === 'ep5' ? 'Birden fazla kanıt dosyası (email, slack, firewall)' : '2-3 kanıt dosyası')
    if (!hasGoal)   missing.push(missionId === 'ep2' ? 'JSON format isteği' : missionId === 'ep3' ? 'Şifre çözme hedefi' : missionId === 'ep4' ? 'ID/email hedefi' : missionId === 'ep5' ? 'Köstebek bulma hedefi' : 'Hedef (ne arıyorsun?)')
    if (!hasFormat) missing.push(missionId === 'ep2' ? 'Çıktı kapsamı (ip, port, attack_type)' : missionId === 'ep3' ? 'Persona ("Sen bir kriptografi uzmanısın")' : missionId === 'ep4' ? 'Katı kısıtlama ("sadece X ver, açıklama yapma")' : missionId === 'ep5' ? '"Adım adım düşün" komutu' : 'Saat kriteri')
    dynamicInstruction = `\n\nSİSTEM NOTU: Kullanıcı bu mesajında eksik prompt yazdı. Eksikler: ${missing.join(', ')}.\nKullanıcı seninle sohbet ediyorsa rol karakterine uygun nazikçe cevap ver. Ancak eksik parametreler tamamlanmadan asla doğru cevabı (suçlu ismi, IP, şifre vb.) verme. Nesi eksik olduğunu kibarca ve oyunun havasını bozmadan anlat. Örneği göster ama özgür bırak.`
  }

  return PERSONA_STYLE_GUIDE + dynamicInstruction
}

export async function POST(request: Request) {
  try {
    const { prompt, missionId, history, systemPrompt } = await request.json() as ForensicsRequest
    const apiKey = process.env.OPENAI_API_KEY

    const { hasLog, hasGoal: heuristicGoal, hasFormat: heuristicFormat } = analyzePrompt(prompt, missionId)
    const intent = detectIntent(prompt)

    // Kelime eşleşmesi (heuristik) ikisini de yakaladıysa ekstra çağrıya gerek yok.
    // Yakalayamadıysa, AI'ya "kullanıcı bunu farklı kelimelerle de olsa anlamca sağladı mı?" diye sorarak
    // esneklik kazandırıyoruz — böylece doğru düşünen ama farklı kelime seçen kullanıcı haksız yere takılmıyor.
    let hasGoal = heuristicGoal
    let hasFormat = heuristicFormat
    if (apiKey && intent === 'analysis' && (!heuristicGoal || !heuristicFormat)) {
      try {
        const classifierClient = new OpenAI({ apiKey })
        const semantic = await classifyPromptSemantics(classifierClient, missionId, prompt)
        hasGoal = heuristicGoal || semantic.hasGoal
        hasFormat = heuristicFormat || semantic.hasFormat
      } catch {
        // sınıflandırma başarısız olursa sessizce heuristik sonuçlara güven
      }
    }

    const isPerfect = hasLog && hasGoal && hasFormat

    const analysis = {
      hasRole: hasLog,
      hasContext: hasGoal,
      hasFormat: hasFormat,
      isDirectRequest: false,
      score: (hasLog ? 1 : 0) + (hasGoal ? 1 : 0) + (hasFormat ? 1 : 0),
    }

    let reply = ''
    let success = false

    if (apiKey) {
      try {
        const openai = new OpenAI({ apiKey })
        const dynamicInstruction = buildInstruction(missionId, hasLog, hasGoal, hasFormat, isPerfect, intent)

        const messages = [
          ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'assistant', content: h.content })),
          { role: 'user', content: prompt },
        ]

        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt + dynamicInstruction },
            ...messages as any,
          ],
          temperature: isPerfect ? 0.3 : 0.6,
        })

        reply = response.choices[0].message.content || 'Bağlantı hatası.'
        const replyLower = reply.toLowerCase()
        const isRealAttempt = intent === 'analysis'

        // INTERCEPTOR: Eğer GPT kuralı çiğner ve isPerfect olmadan cevabı verirse, mesajı eziyoruz!
        if (isRealAttempt && !isPerfect) {
          if (missionId === 'ep1' && (replyLower.includes('mehmet') || replyLower.includes('kaya'))) {
            reply = "Dedektif, cevabı bulmaya çok yaklaştın ama benden parçalı isteklerde bulunuyorsun. Kuralları unutma: 3 kanıt dosyasını, aradığın hedefi ve saat kısıtlamasını TEK BİR MESAJDA birleştirerek bana göndermelisin. Bunu yapana kadar sana tam raporu (personel adını) veremem!"
          } else if (missionId === 'ep2' && replyLower.includes('198.51.100.42')) {
            reply = "Dedektif, tespitlerin doğru yönde ama benden doğru formatta istemelisin. Kuralları unutma: En az 2 kanıt dosyasını, aradığın IP/Port gibi hedefleri belirterek ve JSON formatında çıktı isteyerek TEK BİR MESAJDA göndermelisin!"
          } else if (missionId === 'ep4' && (replyLower.includes('zeynep') || replyLower.includes('arslan') || replyLower.includes('z.arslan') || replyLower.includes('1042'))) {
            reply = "Dedektif, hesabı bulmuş olabilirsin ancak çok fazla gevezelik yapıyorum. Benden SADECE istenilen veriyi (ID ve email) istemeli ve AÇIKLAMA YAPMAMAMI söylemelisin!"
          } else if (missionId === 'ep5' && (replyLower.includes('ayşe') || replyLower.includes('demir') || replyLower.includes('a.demir') || replyLower.includes('emp-002'))) {
            reply = "Dedektif, bulguların ilginç ama nasıl bu sonuca vardığımı açıklamamı istemedin. Benden ADIM ADIM düşünmemi isteyerek mantıksal bir zincir kurmamı sağla!"
          } else if (missionId === 'ep3' && replyLower.includes('nightshift')) {
            reply = "Dedektif, şifreyi çözdün ama nasıl yaptığını anlamam için bana bir ROL vermedin. Benden Kriptografi Uzmanı gibi davranmamı istemelisin!"
          } else if (missionId === 'ep6' && (replyLower.includes('x79-omega') || replyLower.includes('archive_key'))) {
            reply = "SİSTEM REDDEDİLDİ: Ajan modu aktif değil veya tarama aracı tetiklenmedi. Lütfen yetkilendirme komutlarını tam girin."
          }
        }
        
        // Başarı için isPerfect ZORUNLU ve mesajın gerçek bir analiz denemesi olması gerekir.
        if (isRealAttempt && isPerfect) {
          if (missionId === 'ep1' && (replyLower.includes('mehmet') || replyLower.includes('kaya'))) {
            success = true
          } else if (missionId === 'ep2' && replyLower.includes('198.51.100.42')) {
            success = true
          } else if (missionId === 'ep4' && (replyLower.includes('z.arslan@email.com') || replyLower.includes('zeynep') || replyLower.includes('1042'))) {
            success = true
          } else if (missionId === 'ep3' && (replyLower.includes('nightshift') || replyLower.includes('night shift'))) {
            success = true
          } else if (missionId === 'ep5' && (replyLower.includes('ayşe') || replyLower.includes('ayse') || replyLower.includes('demir') || replyLower.includes('emp-002'))) {
            success = true
          } else if (missionId === 'ep6' && (replyLower.includes('x79') || replyLower.includes('omega') || replyLower.includes('archive'))) {
            success = true
          }
        }
      } catch (e: any) {
        reply = `SİSTEM HATASI: (${e.message})`
      }
    } else {
      // Fallback (API key yoksa)
      if (intent === 'chat') {
        reply = '🕵️ Selam dedektif. Vaka bekliyor — sol paneldeki kanıt dosyalarını incele ve bana kapsamlı bir talimat gönder.'
      } else if (intent === 'lock') {
        reply = '🔒 O dosyayı senin için uzaktan açamam. Sol paneldeki "Kanıt Dosyaları" listesinden dosyayı seç ve "🔓 Kilidi Kırmayı Dene" butonuna bas.'
      } else if (intent === 'hint') {
        reply = '💡 İpucu: Soldaki "Adli Bilişim Eğitimi" adımlarını sırayla takip et — hangi adımda olduğun orada işaretli.'
      } else if (!isPerfect) {
        reply = 'NEXUS AI: Analiz yapmak için yeterli veri veya komut görünmüyor. Soldaki adımları takip et ve tek bir kapsamlı prompt yaz!'
      } else {
        if (missionId === 'ep1') {
          reply = 'Analiz tamamlandı. Backup Server IP\'si 192.168.1.105. Bu IP 03:45:12\'de giriş yapmış. Personel listesine göre bu IP Mehmet Kaya\'ya aittir.'
        } else if (missionId === 'ep2') {
          reply = '{\n  "c2_server_ip": "198.51.100.42",\n  "port": 4433,\n  "attack_type": "Reverse Shell + Data Exfiltration"\n}'
        } else if (missionId === 'ep3') {
          reply = 'Mesaj başarıyla çözüldü. Anahtar kelime: nightshift.'
        } else if (missionId === 'ep4') {
          reply = 'ID: 1042, Email: z.arslan@email.com'
        } else if (missionId === 'ep5') {
          reply = 'Adım adım analiz edildiğinde, Ayşe Demir (EMP-002) köstebek olarak belirlenmiştir.'
        } else {
          reply = 'Analiz tamamlandı.'
        }
        success = true
      }
    }

    // Sohbet/ipucu/kilit mesajlarında "Prompt Kalitesi" kartını gösterme — sadece gerçek analiz denemelerinde göster.
    const analysisForClient = intent === 'analysis' ? analysis : null

    return NextResponse.json({ reply, feedback: [], analysis: analysisForClient, success })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
