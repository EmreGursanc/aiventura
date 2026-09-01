// NEX Tutor — Rehber karakter bileşeni
// Sayfanın alt köşesinde konuşan robot mascot
'use client';
import React, { useState, useEffect } from 'react';

interface NexTutorProps {
  message: string;
  mood?: 'neutral' | 'happy' | 'warning' | 'excited';
  onDismiss?: () => void;
  autoHide?: number; // ms
}

export default function NexTutor({ message, mood = 'neutral', onDismiss, autoHide }: NexTutorProps) {
  const [visible, setVisible] = useState(true);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setVisible(true);
    setAnimating(true);
    const t = setTimeout(() => setAnimating(false), 400);
    return () => clearTimeout(t);
  }, [message]);

  useEffect(() => {
    if (!autoHide) return;
    const t = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, autoHide);
    return () => clearTimeout(t);
  }, [autoHide, onDismiss]);

  if (!visible) return null;

  const moodColors = {
    neutral: { bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.5)', face: '🤖', glow: 'rgba(99,102,241,0.3)' },
    happy: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.5)', face: '🥳', glow: 'rgba(16,185,129,0.3)' },
    warning: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.5)', face: '⚠️', glow: 'rgba(245,158,11,0.3)' },
    excited: { bg: 'rgba(236,72,153,0.15)', border: 'rgba(236,72,153,0.5)', face: '🎉', glow: 'rgba(236,72,153,0.3)' },
  };
  const c = moodColors[mood];

  return (
    <div
      className={`fixed bottom-4 left-4 z-40 max-w-xs transition-all duration-300 ${animating ? 'translate-y-2 opacity-0' : 'translate-y-0 opacity-100'}`}
    >
      <div
        className="rounded-2xl p-4 flex items-start gap-3 shadow-xl"
        style={{ background: c.bg, border: `1px solid ${c.border}`, boxShadow: `0 0 20px ${c.glow}` }}
      >
        <div className="text-2xl flex-shrink-0 mt-0.5">{c.face}</div>
        <div className="flex-1">
          <div className="text-[10px] font-bold text-slate-400 mb-1 tracking-widest">NEX</div>
          <div className="text-sm text-white leading-relaxed">{message}</div>
        </div>
        {onDismiss && (
          <button onClick={() => { setVisible(false); onDismiss(); }} className="text-slate-500 hover:text-white text-xs ml-1 mt-0.5 flex-shrink-0">✕</button>
        )}
      </div>
    </div>
  );
}
