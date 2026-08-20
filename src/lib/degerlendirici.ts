// AIVentura: Prompt Değerlendirme Motoru
// Kural tabanlı — harici API gerektirmez
// ================================================

import type { ValidationRule } from '@/types'

export interface DegerlendirmeSonucu {
  basarili: boolean
  puan: number // 0-100
  mesaj: string
  eksikKelimeler?: string[]
}

/**
 * Kullanıcının promptunu görevin doğrulama kurallarına göre değerlendirir.
 * Kodlama öğretmek değil AI kavramları — kural tabanlı yeterli.
 */
export function promptDegerlendir(
  prompt: string,
  kural: ValidationRule
): DegerlendirmeSonucu {
  const temizPrompt = prompt.trim().toLowerCase()

  // 1. Uzunluk kontrolü — boş gönderme
  if (temizPrompt.length < 5) {
    return {
      basarili: false,
      puan: 0,
      mesaj: '⚠️ Prompt çok kısa! En az birkaç kelime yazman gerekiyor.',
    }
  }

  // 2. Min uzunluk kontrolü
  if (kural.minUzunluk && temizPrompt.length < kural.minUzunluk) {
    return {
      basarili: false,
      puan: 20,
      mesaj: `📝 Biraz daha detaylı yaz! En az ${kural.minUzunluk} karakter olmalı. (Şu an: ${temizPrompt.length})`,
    }
  }

  // 3. Max uzunluk kontrolü
  if (kural.maxUzunluk && temizPrompt.length > kural.maxUzunluk) {
    return {
      basarili: false,
      puan: 40,
      mesaj: `✂️ Çok uzun! Maksimum ${kural.maxUzunluk} karakter. (Şu an: ${temizPrompt.length})`,
    }
  }

  // 4. Zorunlu kelime kontrolü
  if (kural.zorunluKelimeler && kural.zorunluKelimeler.length > 0) {
    const eksikler = kural.zorunluKelimeler.filter(
      (kelime) => !temizPrompt.includes(kelime.toLowerCase())
    )

    if (eksikler.length > 0) {
      return {
        basarili: false,
        puan: 50,
        mesaj: `🔍 Promptunda şu anahtar kelimeler eksik: <strong>${eksikler.join(', ')}</strong> — bunları kullanmayı dene!`,
        eksikKelimeler: eksikler,
      }
    }
  }

  // ✅ Tüm kontroller geçti
  return {
    basarili: true,
    puan: 100,
    mesaj: '✨ Harika prompt! NEXUS yanıt veriyor...',
  }
}

/**
 * Simüle edilmiş AI yanıtını parça parça döndürür (typewriter efekti için)
 */
export async function* yanitSimule(
  yanit: string,
  hizMs: number = 28
): AsyncGenerator<string> {
  const kelimeler = yanit.split(' ')
  let birikenMetin = ''
  for (const kelime of kelimeler) {
    birikenMetin += (birikenMetin ? ' ' : '') + kelime
    yield birikenMetin
    await bekle(hizMs + Math.random() * 15)
  }
}

function bekle(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
