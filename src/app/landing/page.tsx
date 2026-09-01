'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function LandingSayfasi() {
  const router = useRouter()
  const { user } = useAuth()

  const [demoPrompt, setDemoPrompt] = useState(
    'Sen bilge bir robot rehbersin. 8 yaşındaki bir kaşife yapay zekayı 2 cümleyle anlat.'
  )
  const [demoYanit, setDemoYanit] = useState<string | null>(null)
  const [yukleniyor, setYukleniyor] = useState(false)

  const handleDemoGonder = () => {
    if (!demoPrompt.trim() || yukleniyor) return
    setYukleniyor(true)
    setDemoYanit(null)

    setTimeout(() => {
      setDemoYanit(
        '🤖 Bip bop! Ben NEX! Yapay zeka, insanların bana öğrettiği fotoğraflara ve yazılara bakarak kalıpları öğrenen akıllı bir yardımcıdır. Tıpkı senin resim çizmeyi pratik yaparak öğrenmen gibi!'
      )
      setYukleniyor(false)
    }, 1000)
  }

  const handleAuthClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault()
    if (!user) {
      alert('SİSTEME ERİŞİM REDDEDİLDİ: Lütfen önce kimliğinizi doğrulayın (Kayıt Olun veya Giriş Yapın).')
      router.push('/giris')
    } else {
      router.push(path)
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ── 1. HERO SECTION ─────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-24 px-4 overflow-hidden">
        {/* Arka Plan Glow Efektleri */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none opacity-20 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #06B6D4 0%, #8B5CF6 50%, transparent 100%)' }}
        />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Sol Kolon: Başlık, Açıklama ve CTA */}
          <div className="lg:col-span-7 text-center lg:text-left flex flex-col items-center lg:items-start gap-6">
            
            {/* Rozet Tag */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold animate-yukari"
              style={{
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.3)',
                color: '#10B981',
              }}
            >
              <span>✨ Türkiye'nin İlk Oyunlaştırılmış AI Platformu</span>
            </div>

            {/* Manşet Başlık */}
            <h1 className="text-3xl sm:text-5xl font-extrabold text-yazi tracking-tight leading-[1.2]">
              Yapay Zekayı <br />
              <span className="metin-yesil">Bir RPG Oyunu Gibi</span> Öğren!
            </h1>

            {/* Alt Metin */}
            <p className="text-yazi-iki text-base sm:text-lg max-w-xl leading-relaxed">
              Sıkıcı teorileri unut. <strong>Her ay eklenen yepyeni oyunlar ve eğitimlerle</strong> hikâyeli görevlere katıl, XP kazan, rozetleri topla ve hem çocuklar hem yetişkinler için AI çağının lideri ol.
            </p>

            {/* CTA Butonları */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 w-full sm:w-auto">
              <a
                href="/labs"
                className="btn-yesil text-base px-8 py-3.5 w-full sm:w-auto text-center"
                id="hero-basla-btn"
              >
                🎮 Maceranı Seç
              </a>
              <a
                href="#nasil-calisir"
                className="btn-hayalet text-base px-6 py-3.5 w-full sm:w-auto text-center"
              >
                🔍 Nasıl Çalışır?
              </a>
            </div>

            {/* Canlı İstatistikler & Sosyal Kanıt */}
            <div className="flex items-center gap-8 pt-4 border-t border-sinir/60 w-full justify-center lg:justify-start">
              <div>
                <div className="text-xl font-extrabold text-yazi font-kod">v2.0</div>
                <div className="text-xs text-yazi-soluk">Yapay Zeka Çağı</div>
              </div>
              <div className="w-px h-8 bg-sinir" />
              <div>
                <div className="text-xl font-extrabold text-altin font-kod">50+</div>
                <div className="text-xs text-yazi-soluk">İnteraktif Görev</div>
              </div>
              <div className="w-px h-8 bg-sinir" />
              <div>
                <div className="text-xl font-extrabold text-cyan font-kod">%100</div>
                <div className="text-xs text-yazi-soluk">Türkçe Müfredat</div>
              </div>
            </div>

          </div>

          {/* Sağ Kolon: İnteraktif Canlı Demo Editör Kartı */}
          <div className="lg:col-span-5 w-full">
            <div className="kart p-1 overflow-hidden shadow-2xl relative group">
              
              {/* Terminal Başlık */}
              <div className="terminal-baslik px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="terminal-nokta bg-[#ff5f56]" />
                  <span className="terminal-nokta bg-[#ffbd2e]" />
                  <span className="terminal-nokta bg-[#27c93f]" />
                </div>
                <span className="pixel-xs text-yazi-soluk">CANLI SANDBOX DEMO</span>
                <span className="text-[10px] text-yesil font-kod">● CANLI</span>
              </div>

              {/* Editör İçi */}
              <div className="p-4 bg-terminal flex flex-col gap-4">
                <div className="text-xs text-yazi-soluk font-kod">
                  // NEX robotuna canlı prompt gönderip dene:
                </div>

                <textarea
                  value={demoPrompt}
                  onChange={(e) => setDemoPrompt(e.target.value)}
                  className="w-full h-24 p-3 bg-input border border-sinir rounded text-xs font-kod text-yazi outline-none focus:border-cyan transition-colors resize-none"
                  placeholder="Promptunu yaz..."
                />

                <button
                  onClick={handleDemoGonder}
                  disabled={yukleniyor}
                  className="btn-yesil text-xs py-2.5 justify-center w-full"
                >
                  {yukleniyor ? '⚡ NEX Yanıtlıyor...' : '✨ Prompt Büyüsünü Çalıştır'}
                </button>

                {/* Yanıt Alanı */}
                {demoYanit && (
                  <div className="p-3 bg-yesil-dim border border-yesil/30 rounded text-xs font-kod text-yazi leading-relaxed animate-yukari">
                    {demoYanit}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 2. DÜNYALAR VE HEDEF KİTLELER ─────────────────────────────── */}
      <section id="dunyalar" className="py-20 px-4 bg-kart/40 border-y border-sinir">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="pixel-sm text-cyan mb-3">HERKES İÇİN YAPAY ZEKA</h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-yazi">
              İlgi Alanına ve Seviyene Göre Tasarlanmış Dünyalar
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Kart 1: Başlangıç / Eğlenceli */}
            <div className="kart p-8 flex flex-col justify-between hover:border-cyan transition-all group">
              <div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-6 bg-cyan-dim border border-cyan/40">
                  🏰
                </div>
                <div className="pixel-xs text-cyan mb-2">ÇOCUKLAR & YENİ BAŞLAYANLAR</div>
                <h4 className="text-xl font-bold text-yazi mb-3">NEXUS Kalesi — Eğlenceli Temeller</h4>
                <p className="text-yazi-iki text-sm leading-relaxed mb-6">
                  Özellikle çocuklar ve yapay zekaya oyun oynayarak sıfırdan giriş yapmak isteyenler için tasarlandı! 3D dünyada kristal toplayarak temel AI mantığını sıkılmadan öğrenin.
                </p>
                <ul className="flex flex-col gap-2.5 text-xs text-yazi-soluk mb-8">
                  <li className="flex items-center gap-2">
                    <span className="text-yesil">✓</span> Kalıp tanıma ve görsel AI eğitimi
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yesil">✓</span> Deepfake ve güvenli içerik farkındalığı
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yesil">✓</span> Eleştirel düşünme ve eğlenceli rozetler
                  </li>
                </ul>
              </div>
              <button 
                onClick={(e) => handleAuthClick(e, '/ders/c-g1-1')}
                className="btn-hayalet text-xs w-full justify-center group-hover:border-cyan"
              >
                🎮 İlk Görevine Çık →
              </button>
            </div>

            {/* Kart 2: Teknik ve Siber Dedektif */}
            <div className="kart p-8 flex flex-col justify-between hover:border-indigo-500 transition-all group"
                 style={{ background: 'rgba(99, 102, 241, 0.02)' }}>
              <div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-6 bg-indigo-500/10 border border-indigo-500/40">
                  💻
                </div>
                <div className="pixel-xs text-indigo-400 mb-2">ANALİTİK & TEKNİK ZEKALAR</div>
                <h4 className="text-xl font-bold text-yazi mb-3">Yapay Zeka Dedektifi — Yıldız Köşkü Gizemi</h4>
                <p className="text-yazi-iki text-sm leading-relaxed mb-6">
                  Kayıp bir vaka dosyasında gizlenmiş ipuçlarını çözerken Yapay Zeka komut yazımını (Prompt Mühendisliği) öğrenin. 4 bölümlük interaktif senaryoda kanıtları birleştirin ve gizemli vakayı aydınlatın.
                </p>
                <ul className="flex flex-col gap-2.5 text-xs text-yazi-soluk mb-8">
                  <li className="flex items-center gap-2">
                    <li className="flex items-center gap-2"><span className="text-indigo-400">🕵️</span> İnteraktif Vaka Senaryosu</li>
                  </li>
                  <li className="flex items-center gap-2">
                    <li className="flex items-center gap-2"><span className="text-indigo-400">🔍</span> Adli Bilişim Analizleri</li>
                  </li>
                  <li className="flex items-center gap-2">
                    <li className="flex items-center gap-2"><span className="text-indigo-400">🧠</span> Gemini Destekli Yargıcı AI</li>
                  </li>
                </ul>
              </div>
              <button 
                onClick={(e) => handleAuthClick(e, '/labs')}
                className="btn-hayalet text-xs w-full justify-center group-hover:border-indigo-500"
              >
                &gt;_ SİSTEME SIZ
              </button>
            </div>

            {/* Kart 3: Yaratıcılar / Profesyoneller */}
            <div className="kart p-8 flex flex-col justify-between hover:border-altin transition-all group">
              <div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-6 bg-altin-dim border border-altin/40">
                  🌆
                </div>
                <div className="pixel-xs text-altin mb-2">YARATICILAR & PROFESYONELLER</div>
                <h4 className="text-xl font-bold text-yazi mb-3">NexusCorp Şehri — Üretkenlik</h4>
                <p className="text-yazi-iki text-sm leading-relaxed mb-6">
                  Yapay zekayı araç olarak kullanın! Üst düzey görsel üretimi (Midjourney), içerik yaratımı ve profesyonel tekniklerle hayatınızdaki verimliliği 10 katına çıkarın.
                </p>
                <ul className="flex flex-col gap-2.5 text-xs text-yazi-soluk mb-8">
                  <li className="flex items-center gap-2">
                    <span className="text-altin">✓</span> Yapay Zeka ile Görsel Sanatlar
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-altin">✓</span> İçerik ve iş akışı otomasyonu
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-altin">✓</span> Parametre tabanlı hassas üretim
                  </li>
                </ul>
              </div>
              <button 
                onClick={(e) => handleAuthClick(e, '/yetiskinler')}
                className="btn-hayalet text-xs w-full justify-center group-hover:border-altin"
              >
                💼 NEXUS AĞINA BAĞLAN →
              </button>
            </div>

          </div>
        </div>
      </section>


    </div>
  )
}
