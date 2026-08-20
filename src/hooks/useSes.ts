'use client'

import { useCallback, useRef } from 'react'

// ══════════════════════════════════════════════════════════════════════════
// AIVentura: Web Audio API 8-Bit Retro Ses Sentezleyici
// Harici dosya yok — tamamen tarayıcı içi sentezleme
// ══════════════════════════════════════════════════════════════════════════

type DalgaFormu = 'square' | 'sawtooth' | 'triangle' | 'sine'

interface NotaOynat {
  frekans: number
  sure: number       // saniye
  gecikme?: number   // saniye (default: 0)
  dalga?: DalgaFormu
  ses?: number       // 0.0 - 1.0
}

export function useSes() {
  const ctxRef = useRef<AudioContext | null>(null)

  // AudioContext'i lazy oluştur (kullanıcı etkileşimi sonrası)
  const ctx = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return ctxRef.current
  }, [])

  // ── Tek Nota Çalar ──────────────────────────────────────────────────────
  const notaCal = useCallback((
    { frekans, sure, gecikme = 0, dalga = 'square', ses = 0.18 }: NotaOynat
  ) => {
    const audioCtx = ctx()
    if (!audioCtx) return

    const baslangic = audioCtx.currentTime + gecikme

    // Osilatör (titreşim üreteci)
    const osc = audioCtx.createOscillator()
    osc.type = dalga
    osc.frequency.setValueAtTime(frekans, baslangic)

    // Ses kısma (yumuşak giriş/çıkış)
    const gain = audioCtx.createGain()
    gain.gain.setValueAtTime(0, baslangic)
    gain.gain.linearRampToValueAtTime(ses, baslangic + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, baslangic + sure)

    osc.connect(gain)
    gain.connect(audioCtx.destination)

    osc.start(baslangic)
    osc.stop(baslangic + sure + 0.01)
  }, [ctx])

  // ══════════════════════════════════════════════════════════════════════
  // HAZIR SES EFEKTLERİ
  // ══════════════════════════════════════════════════════════════════════

  // 🖱️ Buton tıklama — kısa, sert klik
  const tiklamaClick = useCallback(() => {
    notaCal({ frekans: 800, sure: 0.04, dalga: 'square', ses: 0.12 })
    notaCal({ frekans: 600, sure: 0.04, gecikme: 0.04, dalga: 'square', ses: 0.08 })
  }, [notaCal])

  // ✅ Görev geçti — 8-bit zafer fanfarı (yukarı arpej)
  const zaferFanfari = useCallback(() => {
    const notalar = [
      { frekans: 523, sure: 0.1 },   // C5
      { frekans: 659, sure: 0.1 },   // E5
      { frekans: 784, sure: 0.1 },   // G5
      { frekans: 1047, sure: 0.22 }, // C6
    ]
    notalar.forEach((nota, i) => {
      notaCal({
        frekans: nota.frekans,
        sure: nota.sure,
        gecikme: i * 0.11,
        dalga: 'square',
        ses: 0.2,
      })
    })
  }, [notaCal])

  // ❌ Hata / Eksik kelime — aşağı düşüş sesi
  const hataSesi = useCallback(() => {
    notaCal({ frekans: 400, sure: 0.1, dalga: 'sawtooth', ses: 0.15 })
    notaCal({ frekans: 250, sure: 0.18, gecikme: 0.1, dalga: 'sawtooth', ses: 0.12 })
  }, [notaCal])

  // ⬆️ Seviye atlama — epik yükselen arpej
  const seviyeAtlama = useCallback(() => {
    const notalar = [
      { frekans: 262, sure: 0.08 },  // C4
      { frekans: 330, sure: 0.08 },  // E4
      { frekans: 392, sure: 0.08 },  // G4
      { frekans: 523, sure: 0.08 },  // C5
      { frekans: 659, sure: 0.08 },  // E5
      { frekans: 784, sure: 0.12 },  // G5
      { frekans: 1047, sure: 0.35 }, // C6
    ]
    notalar.forEach((nota, i) => {
      notaCal({
        frekans: nota.frekans,
        sure: nota.sure,
        gecikme: i * 0.09,
        dalga: 'square',
        ses: 0.18,
      })
    })
  }, [notaCal])

  // 💡 İpucu açıldı — meraklı ping sesi
  const ipucuSesi = useCallback(() => {
    notaCal({ frekans: 1318, sure: 0.07, dalga: 'sine', ses: 0.12 })
    notaCal({ frekans: 1047, sure: 0.12, gecikme: 0.08, dalga: 'sine', ses: 0.09 })
  }, [notaCal])

  // 🔒 Kilitli görev — düşük, engelli bip
  const kilitliSes = useCallback(() => {
    notaCal({ frekans: 200, sure: 0.12, dalga: 'sawtooth', ses: 0.14 })
    notaCal({ frekans: 150, sure: 0.18, gecikme: 0.12, dalga: 'sawtooth', ses: 0.1 })
  }, [notaCal])

  // 🏆 Boss Battle açıldı — dramatik fanfar
  const bossFanfari = useCallback(() => {
    const notalar = [
      { frekans: 196, sure: 0.2 },  // G3
      { frekans: 196, sure: 0.2 },  // G3
      { frekans: 196, sure: 0.2 },  // G3
      { frekans: 156, sure: 0.6 },  // Eb3
    ]
    notalar.forEach((nota, i) => {
      notaCal({
        frekans: nota.frekans,
        sure: nota.sure,
        gecikme: i * 0.22,
        dalga: 'sawtooth',
        ses: 0.22,
      })
    })
  }, [notaCal])

  // 📜 Sayfa açılış — yumuşak hoş geldin tonu
  const hosGeldinSesi = useCallback(() => {
    notaCal({ frekans: 523, sure: 0.15, dalga: 'sine', ses: 0.1 })
    notaCal({ frekans: 659, sure: 0.15, gecikme: 0.18, dalga: 'sine', ses: 0.1 })
  }, [notaCal])

  return {
    tiklamaClick,
    zaferFanfari,
    hataSesi,
    seviyeAtlama,
    ipucuSesi,
    kilitliSes,
    bossFanfari,
    hosGeldinSesi,
  }
}
