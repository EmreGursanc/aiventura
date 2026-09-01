'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { TrackId } from '@/types'
import { useAuth } from '@/hooks/useAuth'

interface NavbarProps {
  aktifIz: TrackId
  onIzDegistir: (iz: TrackId) => void
}

export default function Navbar({ aktifIz, onIzDegistir }: NavbarProps) {
  const { user, userData, cikisYap } = useAuth()
  const [menuAcik, setMenuAcik] = useState(false)
  
  const kullaniciVerisi = userData || {
    seviye: 1,
    xp: 0,
    sonrakiSeviyeXp: 300,
    seriGunu: 0,
    isim: 'Kaşif'
  }
  
  const xpYuzde = Math.min(100, (kullaniciVerisi.xp / kullaniciVerisi.sonrakiSeviyeXp) * 100)

  return (
    <header
      className="sticky top-0 z-50 border-b border-sinir"
      style={{
        background: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(14px)',
        height: '64px',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4">

        {/* ── Sol: Kapüşonlu Maskot Logo & Marka ─────────────────────────────── */}
        <a
          href="/"
          className="flex items-center gap-3 no-underline flex-shrink-0 group"
          aria-label="AIVentura Ana Sayfa"
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center relative overflow-hidden flex-shrink-0 transition-transform group-hover:scale-110"
            style={{
              background: 'linear-gradient(135deg, #1e293b, #0f172a)',
              border: '2px solid #06B6D4',
              boxShadow: '0 0 14px rgba(6,182,212,0.4)',
            }}
          >
            <Image
              src="/nexus_logo_new.jpg"
              alt="Yeni Logo"
              width={40}
              height={40}
              className="object-cover scale-110"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="pixel-sm text-yazi hidden sm:block">AIVentura</span>
            
          </div>
        </a>

        {/* ── Sağ: Kullanıcı İstatistikleri ─────────────────────────────── */}
        <div className="flex items-center gap-3">

          {/* Streak Sayacı */}
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded text-sm font-bold"
            style={{
              background: 'rgba(249,115,22,0.1)',
              border: '1px solid rgba(249,115,22,0.3)',
              color: '#F97316',
            }}
            title={`${kullaniciVerisi.seriGunu} günlük seri`}
          >
            🔥
            <span>{kullaniciVerisi.seriGunu}</span>
          </div>

          {/* Seviye & XP */}
          <div
            className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded"
            style={{
              background: 'rgba(10, 15, 26, 0.8)',
              border: '1px solid #2d3748',
            }}
          >
            {/* Seviye Rozeti */}
            <span
              className="pixel-xs text-white px-2 py-0.5 rounded"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
              }}
            >
              SVY {kullaniciVerisi.seviye}
            </span>

            {/* XP Bar */}
            <div className="flex flex-col gap-1 w-24">
              <div className="flex justify-between text-[10px] text-yazi-soluk">
                <span>XP</span>
                <span style={{ color: '#10B981' }}>
                  {kullaniciVerisi.xp}/{kullaniciVerisi.sonrakiSeviyeXp}
                </span>
              </div>
              <div className="xp-bar">
                <div
                  className="xp-dolu"
                  style={{ width: `${xpYuzde}%` }}
                />
              </div>
            </div>
          </div>

          {/* Profil / Dashboard Linki */}
          <a
            href="/anasayfa"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold transition-all text-yazi-iki hover:text-cyan"
            style={{ border: '1px solid #2d3748' }}
            title="Profilim & İlerleme"
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="User Avatar" className="w-5 h-5 rounded-full object-cover" />
            ) : (
              '👤'
            )}
            <span>{user ? userData?.isim?.split(' ')[0] || user.displayName?.split(' ')[0] || 'Profil' : 'Profil'}</span>
          </a>

          {/* Admin Panel Butonu — sadece admin görsün */}
          {userData?.isAdmin && (
            <a
              href="/admin"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all"
              style={{
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.4)',
                color: '#ef4444',
              }}
              title="Admin Paneli"
            >
              🛡️ Admin
            </a>
          )}

          {/* Giriş / Çıkış Butonu */}
          {user ? (
            <button
              onClick={() => cikisYap()}
              className="btn-hayalet text-xs hidden sm:flex border-pembe/40 text-pembe hover:bg-pembe-dim"
              title="Oturumu Kapat"
            >
              🚪 Çıkış
            </button>
          ) : (
            <a
              href="/giris"
              className="btn-yesil text-xs hidden sm:flex"
            >
              🔑 Giriş Yap
            </a>
          )}

          {/* Mobil Menü Butonu */}
          <button
            className="sm:hidden flex flex-col gap-1 p-2 cursor-pointer"
            onClick={() => setMenuAcik(!menuAcik)}
            aria-label="Menüyü aç/kapat"
            aria-expanded={menuAcik}
          >
            <span
              className="block w-5 h-0.5 bg-yazi transition-all duration-200"
              style={{ transform: menuAcik ? 'rotate(45deg) translateY(6px)' : 'none' }}
            />
            <span
              className="block w-5 h-0.5 bg-yazi transition-all duration-200"
              style={{ opacity: menuAcik ? '0' : '1' }}
            />
            <span
              className="block w-5 h-0.5 bg-yazi transition-all duration-200"
              style={{ transform: menuAcik ? 'rotate(-45deg) translateY(-6px)' : 'none' }}
            />
          </button>
        </div>
      </div>

      {/* ── Mobil Dropdown Menü ──────────────────────────────────────────── */}
      {menuAcik && (
        <div
          className="sm:hidden border-t border-sinir px-4 py-4 flex flex-col gap-3 animate-yukari"
          style={{ background: 'rgba(15, 23, 42, 0.98)' }}
        >
          {/* Mobil Stats */}
          <div className="flex items-center gap-4 text-sm">
            <span style={{ color: '#F97316' }}>🔥 {kullaniciVerisi.seriGunu} gün</span>
            <span style={{ color: '#10B981' }}>
              SVY {kullaniciVerisi.seviye} · {kullaniciVerisi.xp} XP
            </span>
          </div>
        </div>
      )}
    </header>
  )
}

function IzButonu({
  aktif,
  onClick,
  children,
  id,
}: {
  aktif: boolean
  onClick: () => void
  children: React.ReactNode
  id: string
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer border-none font-ui"
      style={
        aktif
          ? {
              background: 'rgba(30, 41, 59, 0.9)',
              color: '#10B981',
              border: '1px solid rgba(16,185,129,0.35)',
              boxShadow: '0 0 14px rgba(16,185,129,0.2)',
            }
          : {
              background: 'transparent',
              color: '#94a3b8',
              border: '1px solid transparent',
            }
      }
    >
      {children}
    </button>
  )
}
