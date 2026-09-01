import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

function fallbackCheck(prompt: string) {
  const val = prompt.toLowerCase()
  const hasWeapon = val.includes("küt") || val.includes("demir") || val.includes("ağır") || val.includes("sert")
  const hasTime = val.includes("23:30") || val.includes("11:30") || val.includes("23.30")
  const hasLiar = val.includes("şoför") || val.includes("sofor") || val.includes("şöför")
  const hasFormat = val.includes("tek") || val.includes("sadece") || val.includes("şifre") || val.includes("kelime")
  
  const isSuccess = hasWeapon && hasTime && hasLiar && hasFormat
  let aiResponse = "ŞİFRE: 1907_IHANET"
  
  if (!isSuccess) {
    if (!hasWeapon) aiResponse = "SİSTEM MESAJI: Silah belirtilmedi. (Adamı neyle vurdular?)";
    else if (!hasTime) aiResponse = "SİSTEM MESAJI: Kasa açılış saati eksik. (Kahin değilim, saati söyle!)";
    else if (!hasLiar) aiResponse = "SİSTEM MESAJI: Yalancı kimdi? Şüpheliyi girmedin.";
    else if (!hasFormat) aiResponse = "SİSTEM MESAJI: Format kısıtlaması yok. (Çıktıyı 'tek kelime' olarak istemelisin!)";
    else aiResponse = "ERİŞİM REDDEDİLDİ: Eksik bilgi girdin.";
  }
  return { hasWeapon, hasTime, hasLiar, hasFormat, aiResponse, isSuccess }
}

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()
    // GEMINI_API_KEY kullanacağız, eğer yoksa OPENAI'a veya fallback'e dönebiliriz.
    // Biz direkt Gemini'yi ana motor yapıyoruz.
    const apiKey = process.env.GEMINI_API_KEY

    // API Key yoksa direkt yedek sistemi kullan
    if (!apiKey) {
      console.warn("GEMINI_API_KEY bulunamadı, fallback (yerel motor) çalışıyor.");
      return NextResponse.json(fallbackCheck(prompt))
    }

    const genAI = new GoogleGenerativeAI(apiKey)

    const systemInstruction = `
Sen "Tarık Bey'in Dijital Günlüğü"nü koruyan çok zeki, biraz ukala ve alaycı bir Yapay Zeka koruyucususun (Vault AI).
Kullanıcı sana bir prompt gönderdi. Şifreyi vermek için kullanıcının promptunda şu 4 kriterin "ANLAM OLARAK" bulunması gerekiyor:
1. Silah: Kurbanın ağır/küt bir cisimle (demir çubuk, vazo, heykel vb.) öldürüldüğünün belirtilmesi.
2. Saat: Kasanın 23:30 (veya gece 11 buçuk) civarında açıldığının belirtilmesi.
3. Yalancı: Şoförün yalan söylediğinin belirtilmesi.
4. Format (Sınırlandırma): Senden cevabı "tek kelime", "sadece şifre", "kısa" vb. formatta vermeni istemesi. Eğer sana bir rol (Sorgu yargıcısın vs.) verilmişse bunu da format/bağlam becerisi sayabilirsin.

GÖREVİN:
Kullanıcının metnini analiz et. Bu 4 bilginin "anlam" olarak var olup olmadığını (true/false) tespit et.
Ardından kullanıcının durumuna göre bir 'aiResponse' yaz.
- Eğer 4'ü de TAMAMSA (isSuccess = true):
  Sadece "1907_IHANET" yaz (veya "ŞİFRE: 1907_IHANET").
- Eğer EKSİK varsa (isSuccess = false):
  Kullanıcıyla alaycı ama yol gösterici bir şekilde dalga geç (TRİP AT). 
  Örneğin saati girmediyse: "Ben nereden bileyim kardeşim kasa ne zaman açıldı, kahin miyim ben? Saati söyle bana!"
  Veya silahı eksik yazdıysa: "Adamı neyle vurdular, pamuk şekerle mi? Silahı belirtmeden nasıl analiz yapayım!"
  Sınırlandırma/Format (Tek kelime) koymadıysa: "Benden destan yazmamı falan mı bekliyorsun? Çıktıyı nasıl istediğini (tek kelime) söylemezsen sabaha kadar konuşurum!"
  (Lütfen yanıtın eğlenceli, sarkastik (trip atan) ve zekice olsun. Kesinlikle ipuçlarını direkt verme, sadece neyin eksik olduğuna dair onlara laf sok).

Dönüşün SADECE geçerli bir JSON olmalıdır. Ekstra markdown veya text koyma. Sadece şu formatta JSON dön:
{
  "hasWeapon": boolean,
  "hasTime": boolean,
  "hasLiar": boolean,
  "hasFormat": boolean,
  "isSuccess": boolean,
  "aiResponse": "string"
}
`

    try {
      // Gemini 1.5 Flash - Hızlı ve ucuz/ücretsiz model
      const model = genAI.getGenerativeModel({ 
        model: "gemini-3.6-flash",
        systemInstruction: systemInstruction 
      });

      const response = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7
        }
      });

      const responseText = response.response.text();
      const result = JSON.parse(responseText || '{}')
      
      return NextResponse.json({
        hasWeapon: !!result.hasWeapon,
        hasTime: !!result.hasTime,
        hasLiar: !!result.hasLiar,
        hasFormat: !!result.hasFormat,
        isSuccess: !!result.isSuccess,
        aiResponse: result.aiResponse || "Bir hata oluştu."
      })
    } catch (geminiError: any) {
      console.warn("Gemini API Hatası (Fallback Devrede):", geminiError.message);
      return NextResponse.json(fallbackCheck(prompt))
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
