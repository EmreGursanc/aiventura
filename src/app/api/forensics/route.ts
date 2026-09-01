import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { analyzePrompt, buildInstruction, detectIntent } from '@/lib/forensics-analyzer'

type ForensicsRequest = {
  prompt: string
  missionId: string
  systemPrompt: string
  history: { role: string, content: string }[]
}

// Minimal classification using Gemini instead of OpenAI
async function classifyPromptSemanticsGemini(genAI: any, missionId: string, prompt: string) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.6-flash",
      systemInstruction: `
You are a prompt analyzer. The user is playing a detective game.
Mission ID: ${missionId}
Analyze if the user's prompt semantically includes:
1. hasGoal: Are they explicitly asking the AI to find a specific target (e.g. name of person, IP address, password)?
2. hasFormat: Are they explicitly setting a constraint or format (e.g. "JSON ver", "tablo yap", "sadece isim", "zaman aralığı: 03:00")?

Reply ONLY with a JSON object:
{"hasGoal": boolean, "hasFormat": boolean}
`
    });
    
    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.1 }
    });
    
    return JSON.parse(response.response.text());
  } catch (e) {
    return { hasGoal: false, hasFormat: false }
  }
}

export async function POST(request: Request) {
  try {
    const { prompt, missionId, history, systemPrompt } = await request.json() as ForensicsRequest
    const geminiKey = process.env.GEMINI_API_KEY

    const { hasLog, hasGoal: heuristicGoal, hasFormat: heuristicFormat } = analyzePrompt(prompt, missionId)
    const intent = detectIntent(prompt)

    let hasGoal = heuristicGoal
    let hasFormat = heuristicFormat
    
    let genAI = null;
    if (geminiKey) {
      genAI = new GoogleGenerativeAI(geminiKey);
    }

    if (genAI && intent === 'analysis' && (!heuristicGoal || !heuristicFormat)) {
      const semantic = await classifyPromptSemanticsGemini(genAI, missionId, prompt)
      hasGoal = heuristicGoal || semantic.hasGoal
      hasFormat = heuristicFormat || semantic.hasFormat
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

    if (genAI) {
      try {
        const dynamicInstruction = buildInstruction(missionId, hasLog, hasGoal, hasFormat, isPerfect, intent)
        const model = genAI.getGenerativeModel({ 
          model: "gemini-3.6-flash",
          systemInstruction: systemPrompt + dynamicInstruction
        });

        // Convert history to Gemini format (user vs model)
        const contents = history.map(h => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }]
        }));
        contents.push({ role: 'user', parts: [{ text: prompt }] });

        const response = await model.generateContent({
          contents: contents,
          generationConfig: { temperature: isPerfect ? 0.3 : 0.6 }
        });

        reply = response.response.text() || 'Bağlantı hatası.'
        const replyLower = reply.toLowerCase()
        const isRealAttempt = intent === 'analysis'

        // INTERCEPTOR: Eger YZ kurali cigner ve isPerfect olmadan cevabi verirse, mesaji eziyoruz!
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
        reply = `SİSTEM HATASI (Gemini): (${e.message})`
      }
    } else {
      // Fallback (API key yoksa)
      if (intent === 'chat') {
        reply = '🤖 Selam dedektif. Vaka bekliyor — sol paneldeki kanıt dosyalarını incele ve bana kapsamlı bir talimat gönder.'
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

    const analysisForClient = intent === 'analysis' ? analysis : null

    return NextResponse.json({ reply, feedback: [], analysis: analysisForClient, success })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
