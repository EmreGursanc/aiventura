'use client';
import React, { useState, useEffect } from 'react';

const EMPLOYEES = [
  { id: 'EMP-001', name: 'Ali Yilmaz', role: 'SysAdmin', ip: '192.168.1.10', emoji: '👨‍💻' },
  { id: 'EMP-002', name: 'Ayse Demir', role: 'Developer', ip: '192.168.1.45', emoji: '👩‍💻' },
  { id: 'EMP-003', name: 'Mehmet Kaya', role: 'Security', ip: '192.168.1.105', emoji: '🛡️' },
  { id: 'EMP-004', name: 'Fatma Sahin', role: 'HR Manager', ip: '192.168.1.200', emoji: '👩‍💼' },
];

const SUSPECT_IP = '192.168.1.105';
const SUSPECT_ID = 'EMP-003';

export default function Ep1Phase2({
  onComplete,
  playSound,
}: {
  onComplete: () => void;
  playSound: (t: string) => void;
}) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [dropped, setDropped] = useState<string | null>(null);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (dropped === SUSPECT_ID) {
      setShowSuccess(true);
      const t = setTimeout(() => onComplete(), 2200);
      return () => clearTimeout(t);
    }
  }, [dropped, onComplete]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDragging(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    setDragging(null);
    if (id === SUSPECT_ID) {
      setDropped(id);
      playSound('connect');
    } else {
      setWrongFlash(true);
      playSound('wrong');
      setTimeout(() => setWrongFlash(false), 800);
    }
  };

  const matched = dropped === SUSPECT_ID;
  const matchedEmp = EMPLOYEES.find(e => e.id === dropped);

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#08090f] text-white font-mono overflow-auto">

      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-b border-indigo-900/40" style={{ background: 'rgba(13,14,26,0.97)' }}>
        <div className="flex items-center gap-3">
          <div className="text-indigo-400 text-xs font-bold tracking-widest">NEXUS-AI</div>
          <div className="text-slate-600 text-xs">|</div>
          <div className="text-xs text-slate-400">BOLU 1 &mdash; Gece Saldirisi</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className="text-xs text-slate-500 ml-2">3/3 Kanit Toplandi</span>
        </div>
      </div>

      {/* Mission header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-indigo-900/30" style={{ background: 'rgba(99,102,241,0.05)' }}>
        <div className="flex items-start gap-4">
          <div className="text-2xl">🔗</div>
          <div>
            <div className="text-xs text-indigo-400 font-bold tracking-wider mb-1">FAZ 2 / 4 &mdash; BAGLANTI KUR</div>
            <div className="text-white font-bold">Sunucuya bu IP ile baglanildi. Bu IP kime ait?</div>
            <div className="text-slate-400 text-xs mt-1">
              Auth logda gorulen IP adresini personel listesindeki kisiyle eslestiriniz.
              Dogru kisiyi IP kutusunun uzerine surukle-birak.
            </div>
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 items-center justify-center">

        {/* Left: Evidence */}
        <div className="flex flex-col gap-4 w-full lg:w-80">
          <div className="text-xs text-slate-500 font-bold tracking-widest uppercase mb-1">Toplanan Kanıtlar</div>

          {/* Auth log evidence */}
          <div className="rounded-xl border border-slate-700/50 overflow-hidden" style={{ background: 'rgba(13,14,26,0.8)' }}>
            <div className="px-4 py-2 border-b border-slate-700/40 text-xs text-slate-400 font-bold">AUTH LOG</div>
            <div className="p-4 font-mono text-xs text-emerald-400 leading-relaxed">
              <div>Sep 14 03:45:12 sshd: Accepted</div>
              <div>password for root</div>
              <div className="text-yellow-400 font-bold mt-1">from {SUSPECT_IP}</div>
            </div>
          </div>

          {/* Drop zone */}
          <div>
            <div className="text-xs text-slate-500 mb-2 uppercase tracking-widest">Suphe uzerine surukle</div>
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`rounded-xl border-2 border-dashed min-h-[80px] flex items-center justify-center p-4 transition-all duration-300 ${
                matched
                  ? 'border-emerald-500 bg-emerald-900/20 shadow-[0_0_20px_rgba(52,211,153,0.2)]'
                  : wrongFlash
                  ? 'border-red-500 bg-red-900/20'
                  : dragging
                  ? 'border-indigo-400 bg-indigo-900/20 scale-[1.02]'
                  : 'border-slate-600/50 hover:border-indigo-600/60'
              }`}
            >
              {matched ? (
                <div className="text-center">
                  <div className="text-2xl mb-1">{matchedEmp?.emoji}</div>
                  <div className="text-emerald-400 font-bold text-sm">{matchedEmp?.name}</div>
                  <div className="text-emerald-300 text-xs">{matchedEmp?.role} &mdash; {matchedEmp?.ip}</div>
                  <div className="text-emerald-400 text-xs mt-1 font-bold">ESLESME ONAYLANDI ✓</div>
                </div>
              ) : wrongFlash ? (
                <div className="text-center text-red-400 font-bold text-sm">Yanlis kisi! Tekrar dene.</div>
              ) : (
                <div className="text-center text-slate-600 text-sm">
                  <div className="text-2xl mb-1">🎯</div>
                  {dragging ? 'Birak!' : 'Supheliyi buraya surukle'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="hidden lg:flex flex-col items-center gap-2 text-slate-700">
          <div className="text-2xl">→</div>
        </div>

        {/* Right: Personnel list */}
        <div className="flex flex-col gap-3 w-full lg:w-96">
          <div className="text-xs text-slate-500 font-bold tracking-widest uppercase mb-1">Personel Listesi — Kim yapti?</div>

          {EMPLOYEES.map(emp => {
            const isMatched = dropped === emp.id;
            const isCorrect = isMatched && emp.id === SUSPECT_ID;

            return (
              <div
                key={emp.id}
                draggable={!matched}
                onDragStart={e => handleDragStart(e, emp.id)}
                onDragEnd={() => setDragging(null)}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 select-none ${
                  isCorrect
                    ? 'border-emerald-500/60 bg-emerald-900/20 shadow-[0_0_15px_rgba(52,211,153,0.15)]'
                    : matched
                    ? 'border-slate-700/30 bg-slate-900/20 opacity-40'
                    : dragging === emp.id
                    ? 'border-indigo-400/60 bg-indigo-900/20 scale-95 opacity-60'
                    : 'border-slate-700/50 hover:border-indigo-500/60 hover:bg-indigo-900/10 cursor-grab active:cursor-grabbing'
                }`}
                style={{ background: isCorrect ? undefined : 'rgba(13,14,26,0.7)' }}
              >
                <div className="text-2xl">{emp.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-white">{emp.name}</div>
                  <div className="text-slate-400 text-xs">{emp.role}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-mono text-xs text-indigo-300">{emp.ip}</div>
                  <div className="text-slate-600 text-[10px]">{emp.id}</div>
                </div>
                {!matched && (
                  <div className="text-slate-600 text-xs ml-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 9l4-4 4 4M5 15l4 4 4-4" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Success overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none" style={{ background: 'rgba(3,7,18,0.7)' }}>
          <div className="text-center">
            <div className="text-6xl mb-4">🎯</div>
            <div className="text-3xl font-black text-emerald-400 mb-2" style={{ textShadow: '0 0 30px rgba(52,211,153,0.8)' }}>
              SUPHELIYI BULDUN!
            </div>
            <div className="text-emerald-300 text-lg">Mehmet Kaya &mdash; IP: {SUSPECT_IP}</div>
            <div className="text-slate-400 text-sm mt-2">Sonraki faza geciliyor...</div>
          </div>
        </div>
      )}
    </div>
  );
}