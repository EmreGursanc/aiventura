import React from 'react'
import Link from 'next/link'

export default function YetiskinlerSayfasi() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#030712] text-white">
      <div className="max-w-2xl text-center flex flex-col items-center gap-6">
        <div className="text-7xl animate-pulse">🎬</div>
        <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          NexusCorp Şehri (Yetişkinler)
        </h1>
        <p className="text-slate-400 text-base leading-relaxed max-w-xl">
          Bu alan 12-50 yaş arası kullanıcılar için tasarlanmış, iş hayatı ve profesyonel kullanıma yönelik 
          <strong className="text-cyan-400"> Profesyonel Yapay Zeka Eğitim Panelidir.</strong>
        </p>
        
        <div className="bg-[#0f172a] p-8 rounded-2xl border border-indigo-500/30 w-full mt-4 shadow-[0_0_30px_rgba(99,102,241,0.15)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-9xl pointer-events-none group-hover:scale-110 transition-transform duration-700">🎨</div>
          <div className="flex items-center justify-center gap-2 mb-3 relative z-10">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              AKTİF GÖREV
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2 relative z-10">Midjourney AI Görsel Simülasyonu</h2>
          <p className="text-sm text-slate-400 mb-6 relative z-10">
            NexusMedia Reklam Ajansı'nda Yapay Zeka Yönetmeni ol! Üst düzey parametreleri kullanarak halüsinasyonları temizle, karakter tutarlılığını sağla ve usta bir Prompt Engineer ol.
          </p>
          <Link href="/profesyoneller/video-ai" 
            className="inline-block px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl transition-all hover:scale-105 font-bold shadow-lg shadow-indigo-500/25 relative z-10">
            Görsel Simülasyonuna Başla →
          </Link>
        </div>

        {/* ── Video Üretim Simülasyonu (Reklam) ───────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-[#0f172a] to-[#1e1b4b] p-8 rounded-2xl border-2 border-pink-500/50 w-full mt-6 shadow-[0_0_40px_rgba(236,72,153,0.2)] relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-pink-500/20 transition-all"></div>
          <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl pointer-events-none group-hover:scale-110 transition-transform duration-700">🎬</div>
          
          <div className="flex flex-col items-center justify-center gap-2 mb-4 relative z-10">
            <span className="text-[12px] font-black px-4 py-1 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/50 animate-pulse tracking-widest">
              YENİ GÜNCELLEME: 2 HAFTA SONRA YAYINDA!
            </span>
          </div>
          
          <h2 className="text-2xl font-black text-white mb-2 relative z-10">Sora & Runway: Video Üretim Simülasyonu</h2>
          <p className="text-sm text-slate-300 mb-6 relative z-10 max-w-lg mx-auto">
            Metinden video üretmeyi (Text-to-Video) öğren. Kamera hareketleri, sahne tutarlılığı ve akıcı animasyonlar oluşturmak için gerekli olan doğru prompt mühendisliği tekniklerini keşfet.
          </p>
          
          <div className="flex flex-col items-center gap-3 relative z-10">
            <button disabled
              className="inline-block px-10 py-3 bg-pink-600/30 text-pink-300/80 rounded-xl font-bold border border-pink-600/30 cursor-not-allowed uppercase tracking-wider">
              ⏳ BEKLEMEDE
            </button>
            <span className="text-[10px] text-pink-500/70 font-bold uppercase">Geri Sayım Başladı</span>
          </div>
        </div>

        <Link href="/" className="text-sm text-slate-500 hover:text-slate-300 transition-colors mt-8">
          ← Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  )
}
