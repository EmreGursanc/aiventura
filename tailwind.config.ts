import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ─── AI-DEX Renk Paleti ─────────────────────────────────────────────
      colors: {
        // Arka planlar
        'arka':         '#0f172a',  // Ana arka plan (koyu lacivert)
        'kart':         '#1e293b',  // Kart arka planı
        'kart-hover':   '#263348',  // Kart hover
        'terminal':     '#0a0f1a',  // Terminal/editör arka planı
        'input':        '#111827',  // Input arka planı

        // Sınırlar
        'sinir':        '#2d3748',  // Normal sınır
        'sinir-acik':   '#4a5568',  // Açık sınır

        // Vurgu renkleri
        'yesil':        '#10B981',  // Başarı, "Çalıştır", tamamlandı
        'yesil-dim':    'rgba(16,185,129,0.15)',
        'yesil-glow':   'rgba(16,185,129,0.30)',
        'cyan':         '#06B6D4',  // Aktif durum, linkler, NPC rengi
        'cyan-dim':     'rgba(6,182,212,0.15)',
        'altin':        '#F59E0B',  // XP, premium, yıldız
        'altin-dim':    'rgba(245,158,11,0.20)',
        'altin-glow':   'rgba(245,158,11,0.40)',
        'pembe':        '#F43F5E',  // Rozetler, vurgu, hata
        'pembe-dim':    'rgba(244,63,94,0.15)',
        'mor':          '#8B5CF6',  // İkincil vurgu
        'turuncu':      '#F97316',  // Uyarı, sıcak vurgu

        // Metin
        'yazi':         '#f1f5f9',  // Ana metin
        'yazi-iki':     '#94a3b8',  // İkincil metin
        'yazi-soluk':   '#4b5563',  // Soluk metin
      },

      // ─── Fontlar ──────────────────────────────────────────────────────────
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'monospace'],
        'ui':    ['Inter', 'system-ui', 'sans-serif'],
        'kod':   ['"Fira Code"', 'monospace'],
      },

      // ─── Box Shadows (Glow efektleri) ─────────────────────────────────────
      boxShadow: {
        'pixel':        '0 4px 0 #000',
        'pixel-sm':     '0 2px 0 #000',
        'glow-yesil':   '0 0 20px rgba(16,185,129,0.35)',
        'glow-cyan':    '0 0 20px rgba(6,182,212,0.35)',
        'glow-altin':   '0 0 28px rgba(245,158,11,0.45)',
        'glow-pembe':   '0 0 20px rgba(244,63,94,0.35)',
        'glow-mor':     '0 0 20px rgba(139,92,246,0.35)',
      },

      // ─── Animasyonlar ─────────────────────────────────────────────────────
      keyframes: {
        'parlama': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
        'yukari-gel': {
          '0%':   { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        'xp-ucus': {
          '0%':   { transform: 'translateY(0)',    opacity: '1' },
          '100%': { transform: 'translateY(-40px)', opacity: '0' },
        },
        'scale-in': {
          '0%':   { transform: 'scale(0.85)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        'toast-gel': {
          '0%':   { transform: 'translateY(100px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',      opacity: '1' },
        },
      },
      animation: {
        'parlama':  'parlama 2s ease-in-out infinite',
        'yukari':   'yukari-gel 0.3s ease-out',
        'xp-ucus':  'xp-ucus 1s ease-out forwards',
        'scale-in': 'scale-in 0.35s cubic-bezier(0.18,0.89,0.32,1.28)',
        'toast':    'toast-gel 0.4s cubic-bezier(0.18,0.89,0.32,1.28)',
      },

      // ─── Border Radius ──────────────────────────────────────────────────
      borderRadius: {
        'pixel': '4px',
      },
    },
  },
  plugins: [],
};

export default config;
