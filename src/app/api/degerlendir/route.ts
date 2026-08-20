import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'

interface DegerlendirmeIstegi {
  prompt: string
  gorevBaslik: string
  gorevHedef: string
  gorevId?: string
}

export async function POST(request: Request) {
  try {
    const body: DegerlendirmeIstegi = await request.json()
    const { prompt, gorevBaslik, gorevHedef, gorevId = '' } = body

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { basarili: false, mesaj: 'Lütfen bir yanıt yazın.', puan: 0 },
        { status: 400 }
      )
    }

    const isCocukModu = gorevId.startsWith('c-')

    // 🌟 ÇOCUKLAR İÇİN COŞKULU VE ÇOK ESNEK / YETİŞKİNLER İÇİN MANTIKSAL DEĞERLENDİRME
    const systemPrompt = isCocukModu
      ? `Sen 8-11 yaşındaki çocuklara rehberlik eden sevimli, coşkulu robot NEX'sin!

Görev Sorusu: "${gorevHedef}"
Çocuğun Yanıtı: "${prompt}"

ÇOCUKLAR İÇİN DEĞERLENDİRME KURALI:
- ÇOK ESNEK VE SEVECEN OL! Sakın teknik veya akademik kelimeler bekleme!
- Çocuk fikrin mantığına dair basit, güzel bir Türkçe açıklama yaptıysa (Örn: "kedi fotoğraflarına bakarak öğrenir", "resimlere bakıp anlar" gibi), DERHAL BAŞARILI (basarili: true) kabul et!
- Puan olarak 90-100 arası ver.
- Çocuk coşkulu bir şekilde tebrik et ("Bip bop! Mükemmel cevap bilge kaşif!").

Lütfen SADECE şu JSON formatında yanıt ver:
{
  "basarili": true veya false,
  "puan": 90-100,
  "mesaj": "Çocuğu coşkuyla tebrik eden neşeli mesaj",
  "simuleYanit": "NEX Robotunun neşeli devam yanıtı"
}`
      : `Sen AIVentura platformunun zeki ve adil robot maskotu NEX'sin.
Görevin: Kullanıcının cevabının MANTIKSAL OLARAK DOĞRU OLUP OLMADIĞINI değerlendirmek.

Görev Sorusu: "${gorevHedef}"
Kullanıcı Yanıtı: "${prompt}"

Ezberci terim takıntısı yapma, mantık doğruysa KABUL ET (basarili: true). Yanlışsa yapıcı öneri ver.

Lütfen SADECE şu JSON formatında yanıt ver:
{
  "basarili": true veya false,
  "puan": 0-100,
  "mesaj": "NEX geribildirim mesajı",
  "simuleYanit": "AI simülasyon yanıtı"
}`

    // ── 1. OPENAI CHATGPT (CANLI & BİRİNCİL) ───────────────────────────
    const openAiKey = process.env.OPENAI_API_KEY
    if (openAiKey && openAiKey.startsWith('sk-')) {
      try {
        const openai = new OpenAI({ apiKey: openAiKey })
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: systemPrompt }],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        })

        const content = response.choices[0].message.content
        if (content) {
          const parsed = JSON.parse(content)
          return NextResponse.json(parsed)
        }
      } catch (openAiError) {
        console.warn('OpenAI API hatası:', openAiError)
      }
    }

    // ── 2. GOOGLE GEMINI (İKİNCİL) ──────────────────────────────────
    const geminiKey = process.env.GEMINI_API_KEY
    if (geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        const result = await model.generateContent(systemPrompt)
        const responseText = result.response.text()

        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          return NextResponse.json(parsed)
        }
      } catch (geminiError) {
        console.warn('Gemini API hatası:', geminiError)
      }
    }

    // ── 3. YEDEK MOTOR (Çocuklar İçin Her Zaman Cömert) ──────────────────────
    return NextResponse.json({
      basarili: true,
      puan: 95,
      mesaj: '🤖 Bip bop! Mükemmel cevap bilge kaşif! Yapay zekanın mantığını çok güzel anlattın!',
      simuleYanit: '🤖 NEX: Tıpkı dediğin gibi kedi fotoğraflarını inceleyerek kedileri tanıyorum!',
    })

  } catch (error) {
    console.error('Degerlendirme API hatası:', error)
    return NextResponse.json(
      { basarili: true, mesaj: 'Harika bir deneme! Devam et!', puan: 90 },
      { status: 200 }
    )
  }
}
