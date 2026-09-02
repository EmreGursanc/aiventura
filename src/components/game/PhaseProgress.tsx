// PhaseProgress — Bölüm içi faz gösterge çubuğu
'use client';
import React from 'react';

interface PhaseProgressProps {
  phases: { label: string; icon: React.ReactNode }[];
  current: number; // 0-indexed
}

export default function PhaseProgress({ phases, current }: PhaseProgressProps) {
  return (
    <div className="flex items-center gap-0">
      {phases.map((phase, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={i}>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all duration-300 ${
              done ? 'text-emerald-400' : active ? 'text-white' : 'text-slate-600'
            }`} style={{ background: active ? 'rgba(99,102,241,0.25)' : 'transparent', border: active ? '1px solid rgba(99,102,241,0.5)' : '1px solid transparent' }}>
              <span>{done ? '✓' : phase.icon}</span>
              <span className="hidden sm:inline">{phase.label}</span>
            </div>
            {i < phases.length - 1 && (
              <div className={`h-px flex-1 mx-1 transition-all duration-500 ${done ? 'bg-emerald-500/50' : 'bg-slate-700/50'}`} style={{ minWidth: 12 }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
