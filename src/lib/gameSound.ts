'use client'

// Web Audio API ile harici ses dosyası gerektirmeden ses üretir.

let audioCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioCtx
}

function beep(freq: number, duration: number, type: OscillatorType = 'sine', gain = 0.3) {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()
    osc.connect(gainNode)
    gainNode.connect(ctx.destination)
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    gainNode.gain.setValueAtTime(gain, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration)
  } catch { /* sessiz kal */ }
}

export function playGameSound(type: 'unlock' | 'add' | 'connect' | 'wrong' | 'victory' | 'alarm' | 'typewriter') {
  switch (type) {
    case 'unlock':
      beep(440, 0.1, 'square', 0.2)
      setTimeout(() => beep(880, 0.2, 'square', 0.25), 120)
      break
    case 'add':
      beep(523, 0.15, 'sine', 0.3)
      setTimeout(() => beep(659, 0.2, 'sine', 0.2), 80)
      break
    case 'connect':
      beep(220, 0.05, 'sawtooth', 0.3)
      setTimeout(() => beep(440, 0.05, 'sawtooth', 0.3), 60)
      setTimeout(() => beep(880, 0.15, 'square', 0.4), 120)
      setTimeout(() => beep(1174, 0.3, 'sine', 0.25), 200)
      break
    case 'wrong':
      beep(200, 0.08, 'sawtooth', 0.3)
      setTimeout(() => beep(150, 0.15, 'sawtooth', 0.2), 90)
      break
    case 'victory':
      const melody = [523, 659, 784, 1046]
      melody.forEach((f, i) => { setTimeout(() => beep(f, 0.25, 'sine', 0.35), i * 180) })
      setTimeout(() => { beep(784, 0.5, 'sine', 0.3); setTimeout(() => beep(1046, 0.8, 'sine', 0.35), 100) }, melody.length * 180)
      break
    case 'alarm':
      beep(880, 0.2, 'square', 0.15)
      setTimeout(() => beep(660, 0.2, 'square', 0.15), 250)
      setTimeout(() => beep(880, 0.2, 'square', 0.15), 500)
      break
    case 'typewriter':
      beep(800 + Math.random() * 200, 0.03, 'square', 0.1)
      break
  }
}
