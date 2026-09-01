// BeforeAfter — Kötü prompt vs İyi prompt karşılaştırma bileşeni
'use client';
import React, { useState } from 'react';

interface BeforeAfterProps {
  badPrompt: string;
  goodPrompt: string;
  badResponse: string;
  goodResponse: string;
  concept: string;
}

export default function BeforeAfter({ badPrompt, goodPrompt, badResponse, goodResponse, concept }: BeforeAfterProps) {
  const [showGood, setShowGood] = useState(false);

  return (
    <div className="w-full">
      {/* Concept badge */}
      <div className="flex justify-center mb-4">
        <div className="px-4 py-1.5 rounded-full text-xs font-bold" style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.5)', color: '#a5b4fc' }}>
          ⚡ {concept}
        </div>
      </div>

      {/* Toggle */}
      <div className="flex rounded-xl overflow-hidden border border-slate-700/50 mb-4">
        <button
          onClick={() => setShowGood(false)}
          className={`flex-1 py-2.5 text-sm font-bold transition-all ${!showGood ? 'bg-red-900/40 text-red-300' : 'bg-slate-900/40 text-slate-500 hover:text-slate-300'}`}
        >
          ❌ Kötü Prompt
        </button>
        <button
          onClick={() => setShowGood(true)}
          className={`flex-1 py-2.5 text-sm font-bold transition-all ${showGood ? 'bg-emerald-900/40 text-emerald-300' : 'bg-slate-900/40 text-slate-500 hover:text-slate-300'}`}
        >
          ✅ İyi Prompt
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Prompt */}
        <div className="rounded-xl overflow-hidden border" style={{ border: showGood ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(239,68,68,0.4)' }}>
          <div className="px-4 py-2 text-xs font-bold tracking-wider" style={{ background: showGood ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: showGood ? '#6ee7b7' : '#fca5a5' }}>
            {showGood ? '✅ GELİŞTİRİLMİŞ PROMPT' : '❌ KULLANICININ YAZDIĞI'}
          </div>
          <div className="p-4 font-mono text-sm text-slate-300 leading-relaxed" style={{ background: 'rgba(0,0,0,0.3)' }}>
            {showGood ? goodPrompt : badPrompt}
          </div>
        </div>

        {/* AI Response */}
        <div className="rounded-xl overflow-hidden border border-slate-700/40">
          <div className="px-4 py-2 text-xs font-bold tracking-wider text-slate-400" style={{ background: 'rgba(30,41,59,0.5)' }}>
            🤖 AI CEVABI
          </div>
          <div className={`p-4 text-sm leading-relaxed transition-all duration-300 ${showGood ? 'text-emerald-300' : 'text-red-300/80'}`} style={{ background: 'rgba(0,0,0,0.3)' }}>
            {showGood ? goodResponse : badResponse}
          </div>
        </div>
      </div>
    </div>
  );
}
