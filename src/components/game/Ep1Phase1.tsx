'use client';
import React, { useState, useEffect } from 'react';

const QUIZZES: Record<string, {
  id: string;
  icon: string;
  title: string;
  badge: string;
  question: string;
  hint: string;
  options: string[];
  correct: number;
  content: string;
}> = {
  'auth-log': {
    id: 'auth-log',
    icon: 'AUTH',
    title: 'Kimlik Dogrulama Logu',
    badge: '/var/log/auth.log',
    question: 'Bir sunucuya yetkisiz giris yapildigini anlamak icin oncelikle hangi log kayitlarini incelemelisiniz?',
    hint: 'Sunucuya kimlerin baglandigini bu loglar soyler.',
    options: [
      'Web sunucusu erisim kayitlari (access.log)',
      'SSH baglanti kayitlari (sshd authentication logs)',
      'Uygulama hata kayitlari (error.log)',
    ],
    correct: 1,
    content: `Sep 14 03:45:12 srv-main sshd[15103]: Accepted password for root from 192.168.1.105 port 55112 ssh2
Sep 14 03:45:13 srv-main sshd[15103]: pam_unix(sshd:session): session opened for user root by (uid=0)
Sep 14 04:12:22 srv-main sshd[15103]: Received disconnect from 192.168.1.105
Sep 14 04:12:22 srv-main sshd[15103]: pam_unix(sshd:session): session closed for user root`,
  },
  'server-info': {
    id: 'server-info',
    icon: 'SRV',
    title: 'Sunucu Yapilandirmasi',
    badge: '/etc/server.conf',
    question: 'Hangi IP adresinin saldirgan mi yoksa yetkili kullanici mi oldugunu belirlemek icin ne kullaniliriz?',
    hint: 'Ag topolojisi bilgisi IP adreslerinin konumunu aciklar.',
    options: [
      'Kullanici sifre hashleri',
      'Sunucunun ag arayuzu ve IP adresi atama bilgileri',
      'Kurulu yazilim listesi',
    ],
    correct: 1,
    content: `[SERVER CONFIGURATION]
Hostname: srv-main
OS: Ubuntu 22.04 LTS

[NETWORK INTERFACES]
eth0: 10.0.0.5 (Internal Network)
eth1: 45.33.22.11 (External/Internet)

[CRITICAL NODES]
Backup Server IP: 192.168.1.105
Database Server IP: 192.168.1.200`,
  },
  'employee-list': {
    id: 'employee-list',
    icon: 'EMP',
    title: 'Personel Kayitlari',
    badge: 'HR_DATABASE.csv',
    question: 'Bir IP adresinin hangi calisana atandigini bulmak icin hangi kayda bakmalisiniz?',
    hint: 'Her calisana sirket agi icinde sabit bir IP adresi atanir.',
    options: [
      'Calisanin sosyal medya profili',
      'Sirket ici IP atama kayitlari (DHCP / statik atama)',
      'Calisanin telefon numarasi',
    ],
    correct: 1,
    content: `EMP-001: Ali Yilmaz    - SysAdmin  - IP: 192.168.1.10
EMP-002: Ayse Demir    - Developer - IP: 192.168.1.45
EMP-003: Mehmet Kaya   - Security  - IP: 192.168.1.105
EMP-004: Fatma Sahin   - HR        - IP: 192.168.1.200`,
  },
};

const FILE_IDS = Object.keys(QUIZZES);

export default function Ep1Phase1({
  onComplete,
  playSound,
}: {
  onComplete: () => void;
  playSound: (t: string) => void;
}) {
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [board, setBoard] = useState<Set<string>>(new Set());
  const [quizOpen, setQuizOpen] = useState<string | null>(null);
  const [wrongAnim, setWrongAnim] = useState(false);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<string | null>(null);

  useEffect(() => {
    if (board.size === FILE_IDS.length) {
      const t = setTimeout(() => onComplete(), 1800);
      return () => clearTimeout(t);
    }
  }, [board.size, onComplete]);

  const handleFileClick = (id: string) => {
    if (unlocked.has(id)) {
      setActiveCard(activeCard === id ? null : id);
    } else {
      setQuizOpen(id);
    }
  };

  const handleAnswer = (index: number) => {
    if (!quizOpen) return;
    const quiz = QUIZZES[quizOpen];
    if (index === quiz.correct) {
      setUnlocked(prev => new Set(prev).add(quizOpen));
      setActiveCard(quizOpen);
      playSound('unlock');
      setQuizOpen(null);
    } else {
      setWrongAnim(true);
      playSound('wrong');
      setTimeout(() => setWrongAnim(false), 500);
    }
  };

  const handleAddToBoard = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!board.has(id)) {
      setBoard(prev => new Set(prev).add(id));
      setJustAdded(id);
      playSound('add');
      setTimeout(() => setJustAdded(null), 1200);
    }
  };

  const currentQuiz = quizOpen ? QUIZZES[quizOpen] : null;

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
          {FILE_IDS.map(id => (
            <div key={id} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${board.has(id) ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : unlocked.has(id) ? 'bg-indigo-400' : 'bg-slate-700'}`} />
          ))}
          <span className="text-xs text-slate-500 ml-2">{board.size}/{FILE_IDS.length} Kanit Eklendi</span>
        </div>
      </div>

      {/* Mission header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-indigo-900/30" style={{ background: 'rgba(99,102,241,0.05)' }}>
        <div className="flex items-start gap-4">
          <div className="text-2xl">🕵️</div>
          <div>
            <div className="text-xs text-indigo-400 font-bold tracking-wider mb-1">FAZ 1 / 4 &mdash; DELİL TOPLA</div>
            <div className="text-white font-bold">Sunucu kayitlarinda spheli aktivite tespit edildi!</div>
            <div className="text-slate-400 text-xs mt-1">Her dosyayi acmak icin guvenlik sorusunu dogru yanitle, sonra kanit panosuna ekle.</div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="flex-shrink-0 px-6 py-2">
        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-700 rounded-full"
            style={{ width: `${(board.size / FILE_IDS.length) * 100}%` }}
          />
        </div>
        {board.size === FILE_IDS.length && (
          <div className="text-center text-emerald-400 text-sm font-bold mt-3 animate-pulse">
            Tum kanıtlar toplandı! Sonraki faza geciyor...
          </div>
        )}
      </div>

      {/* File cards */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-5 p-6">
        {FILE_IDS.map(id => {
          const quiz = QUIZZES[id];
          const isUnlocked = unlocked.has(id);
          const isOnBoard = board.has(id);
          const isActive = activeCard === id;
          const isJustAdded = justAdded === id;

          return (
            <div
              key={id}
              onClick={() => handleFileClick(id)}
              className={`relative flex flex-col rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                isOnBoard
                  ? 'border-emerald-500/60 shadow-[0_0_20px_rgba(52,211,153,0.15)]'
                  : isUnlocked
                  ? 'border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)] hover:border-indigo-400/70'
                  : 'border-slate-700/50 hover:border-slate-600'
              }`}
              style={{ background: isOnBoard ? 'rgba(16,50,30,0.6)' : isUnlocked ? 'rgba(20,22,45,0.8)' : 'rgba(13,14,26,0.8)' }}
            >
              {/* Card header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                <div className={`w-8 h-8 rounded text-xs font-black flex items-center justify-center flex-shrink-0 ${
                  isOnBoard ? 'bg-emerald-500/30 text-emerald-300' : isUnlocked ? 'bg-indigo-500/30 text-indigo-300' : 'bg-slate-800 text-slate-500'
                }`}>{quiz.icon}</div>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-white truncate">{quiz.title}</div>
                  <div className="text-[10px] text-slate-500 truncate">{quiz.badge}</div>
                </div>
                <div className="ml-auto flex-shrink-0">
                  {isOnBoard ? (
                    <span className="text-emerald-400 text-xs font-bold">✓ EKLENDI</span>
                  ) : isUnlocked ? (
                    <span className="text-indigo-300 text-[10px]">ACIK</span>
                  ) : (
                    <span className="text-2xl">🔒</span>
                  )}
                </div>
              </div>

              {/* Card body */}
              {!isUnlocked ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-3">
                  <div className="text-5xl opacity-30">🔒</div>
                  <div className="text-slate-500 text-sm">Dosya kilitli</div>
                  <div className="text-indigo-400 text-xs px-3 py-1.5 rounded-full border border-indigo-700/50" style={{ background: 'rgba(99,102,241,0.1)' }}>
                    Kilit acmak icin tikla
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  <pre className="text-emerald-400 text-[11px] leading-relaxed p-4 overflow-y-auto flex-1 font-mono whitespace-pre-wrap" style={{ background: 'rgba(0,0,0,0.4)' }}>
                    {quiz.content}
                  </pre>
                  <div className="p-3 border-t border-white/5">
                    <button
                      onClick={e => handleAddToBoard(e, id)}
                      disabled={isOnBoard}
                      className={`w-full py-2 rounded-lg font-bold text-sm transition-all duration-200 ${
                        isOnBoard
                          ? 'bg-emerald-700/40 text-emerald-400 cursor-default'
                          : isJustAdded
                          ? 'bg-emerald-500 text-white scale-95'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95'
                      }`}
                    >
                      {isOnBoard ? '✓ Kanit Panosuna Eklendi' : '+ Kanit Panosuna Ekle'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quiz modal */}
      {currentQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(3,7,18,0.9)', backdropFilter: 'blur(6px)' }}>
          <div
            className={`w-full max-w-lg rounded-2xl border overflow-hidden shadow-2xl transition-all ${wrongAnim ? 'animate-[shake_0.4s_ease]' : ''}`}
            style={{ background: 'rgba(13,14,26,0.98)', border: '1px solid rgba(99,102,241,0.5)', boxShadow: '0 0 60px rgba(99,102,241,0.2)' }}
          >
            <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`}</style>

            {/* Modal header */}
            <div className="px-6 py-4 border-b border-indigo-900/50 flex items-center gap-3" style={{ background: 'rgba(30,27,75,0.6)' }}>
              <div className="text-yellow-400 text-xl">🔓</div>
              <div>
                <div className="text-xs text-indigo-400 font-bold tracking-wider">GUVENLIK DOGRULAMASI</div>
                <div className="text-white font-bold text-sm">{currentQuiz.title}</div>
              </div>
            </div>

            <div className="p-6">
              {/* Question */}
              <div className="mb-2 text-indigo-200 text-sm leading-relaxed font-bold">{currentQuiz.question}</div>
              <div className="mb-5 text-slate-500 text-xs flex items-center gap-1">
                <span>💡</span> {currentQuiz.hint}
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQuiz.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    className="w-full text-left p-4 rounded-xl border transition-all duration-150 hover:scale-[1.01] active:scale-95 text-sm text-slate-200"
                    style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(99,102,241,0.3)' }}
                    onMouseEnter={e => (e.currentTarget.style.border = '1px solid rgba(99,102,241,0.7)')}
                    onMouseLeave={e => (e.currentTarget.style.border = '1px solid rgba(99,102,241,0.3)')}
                  >
                    <span className="text-indigo-400 font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                ))}
              </div>

              <button onClick={() => setQuizOpen(null)} className="mt-5 text-xs text-slate-600 hover:text-slate-400 transition-colors">
                Vazgec
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}