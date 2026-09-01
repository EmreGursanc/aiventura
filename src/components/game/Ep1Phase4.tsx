'use client'

import { useEffect, useRef } from 'react'
import { playGameSound } from '@/lib/gameSound'

interface Ep1Phase4Props {
  onNextEpisode: () => void
  onMainMenu: () => void
}

export default function Ep1Phase4({ onNextEpisode, onMainMenu }: Ep1Phase4Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    playGameSound('victory')

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: { x: number; y: number; vx: number; vy: number; color: string; size: number; alpha: number }[] = []
    const colors = ['#10B981', '#6366F1', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6']

    for (let i = 0; i < 200; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        alpha: 1,
      })
    }

    let animId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.1
        p.alpha -= 0.008
        if (p.alpha <= 0) return
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.globalAlpha = 1
      if (particles.some(p => p.alpha > 0)) {
        animId = requestAnimationFrame(animate)
      }
    }
    animId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(3,7,18,0.97)' }}>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      <div className="relative z-10 text-center max-w-lg mx-4">
        {/* Başlık */}
        <div className="text-6xl mb-4 animate-bounce">??</div>
        <div className="text-4xl font-black mb-2"
          style={{ color: '#10B981', textShadow: '0 0 30px rgba(16,185,129,0.8)' }}>
          VAKA ÇÖZÜLDÜ!
        </div>
        <div className="text-slate-400 text-sm mb-6">Bölüm 1/6 tamamlandı</div>

        {/* XP Animasyonu */}
        <div className="text-2xl font-black mb-6"
          style={{ color: '#F59E0B', textShadow: '0 0 20px rgba(245,158,11,0.6)' }}>
          +150 XP ?
        </div>

        {/* Öğrenme Özeti */}
        <div className="rounded-xl p-4 mb-6 text-left"
          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
          <div className="text-sm font-bold text-emerald-400 mb-3">?? Bu bölümde öğrendiklerin:</div>
          <div className="space-y-2">
            {[
              { icon: '??', text: "AI'a ROL vermek onu uzman gibi düşündürür" },
              { icon: '??', text: 'Tüm kanıtları TEK promptta göndermek AI\'ın bağlantı kurmasını sağlar' },
              { icon: '??', text: 'Zaman filtresi AI\'ı odaklar, daha hızlı ve kesin cevap alırsın' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="text-base flex-shrink-0">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-emerald-800/40">
            <div className="text-xs text-emerald-300/70">
              ?? <strong>Gerçek hayatta:</strong> ChatGPT'ye bu tekniklerle hukuki belge analizi, CV değerlendirme ve kod inceleme yaptırabilirsin.
            </div>
          </div>
        </div>

        {/* Butonlar */}
        <div className="flex flex-col gap-3">
          <button onClick={onNextEpisode}
            className="w-full py-3 text-white font-black rounded-xl transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 0 30px rgba(99,102,241,0.5)' }}>
            › Bölüm 2: Karanlık Kod
          </button>
          <button onClick={onMainMenu}
            className="w-full py-2.5 text-slate-400 font-semibold rounded-xl border border-slate-700 hover:border-slate-500 transition-all text-sm">
            Ana Menüye Dön
          </button>
        </div>
      </div>
    </div>
  )
}
