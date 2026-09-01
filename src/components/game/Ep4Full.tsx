import React, { useState } from 'react';
import { Send, Lock, Unlock, AlertOctagon, Terminal, BrainCircuit } from 'lucide-react';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';
import NexTutor from './NexTutor';

export default function Ep4Full({ onComplete, playSound }: any) {
  const [done, setDone] = useState(false);
  const [userPrompt, setUserPrompt] = useState("");
  const [aiError, setAiError] = useState("");
  const [isHacking, setIsHacking] = useState(false);
  
  const handleHack = async () => {
    if (!userPrompt.trim()) {
      setAiError("Prompt alanı boş olamaz!");
      return;
    }
    
    if (playSound) playSound('click');
    setIsHacking(true);
    setAiError("");

    try {
      const res = await fetch('/api/judge-finale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt })
      });
      
      const data = await res.json();
      
      if (data.error) {
        setAiError("Sistem Hatası: " + data.error);
        setIsHacking(false);
        if (playSound) playSound('wrong');
        return;
      }
      
      if (!data.isSuccess) {
        setAiError(data.aiResponse || "Erişim Reddedildi.");
        setIsHacking(false);
        if (playSound) playSound('wrong');
        return;
      }

      // Success
      setDone(true);
      setIsHacking(false);
      if (playSound) playSound('connect');
    } catch (err: any) {
      setAiError("Ağ bağlantısı kurulamadı. Nexus AI çevrimdışı: " + err.message);
      setIsHacking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#030408] text-white font-sans overflow-hidden">
      {done && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      
      {/* Arka plan ışıkları */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto w-full flex flex-col h-full justify-center p-8">
        {!done ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-2xl relative z-10 rounded-2xl overflow-hidden">
            
            {/* Terminal Header */}
            <div className="bg-red-950/30 px-6 py-4 border-b border-red-900/30 flex items-center justify-between">
              <div className="flex items-center gap-3 text-red-500 font-mono text-sm font-black tracking-widest">
                <Lock className="w-5 h-5" /> TARIK BEY - DİJİTAL GÜNLÜK [KİLİTLİ]
              </div>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
              </div>
            </div>

            <div className="p-8">
              <h1 className="text-2xl font-black text-white mb-2 flex items-center gap-3">
                <Terminal className="w-6 h-6 text-indigo-400" /> PROMPT GİRİŞ EKRANI
              </h1>
              <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                Güvenlik YZ'si sadece gerçeği bilenlere günlüğü açar. Oyun boyunca not aldığın <strong>Silah Türü</strong>, <strong>Olay Saati</strong> ve <strong>Yalancı Şüpheliyi</strong> içeren tek bir prompt yaz. Şifreyi vermesi için ona doğru formatı (Tek Kelime) söylemeyi unutma! 
                <br/><span className="text-indigo-400/80 text-xs italic mt-2 block">* Dikkat: Karşındaki AI çok zeki ve alaycıdır. Hata yaparsan sana laf sokabilir!</span>
              </p>
              
              <div className="relative">
                <textarea 
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="Örnek: Sen bir sorgu yargıcısın. Kurban ağır bir demir çubukla öldürüldü. Kasa 23:30'da açıldı. Şoför yalan söylüyor. Şifreyi bana tek kelime olarak ver."
                  className="w-full h-40 bg-black/40 border border-indigo-500/30 rounded-xl p-5 text-indigo-200 font-mono text-sm focus:outline-none focus:border-indigo-400 focus:shadow-[0_0_30px_rgba(79,70,229,0.2)] resize-none transition-all placeholder:text-indigo-900/50"
                />
              </div>

              {aiError && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 p-5 bg-red-950/40 border border-red-500/30 rounded-xl flex items-start gap-4 text-red-200 text-sm shadow-[0_0_30px_rgba(239,68,68,0.15)]">
                  <BrainCircuit className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-black text-red-400 uppercase tracking-widest text-[10px] mb-1">NEXUS AI YANITI:</div>
                    <div className="leading-relaxed font-mono whitespace-pre-wrap">{aiError}</div>
                  </div>
                </motion.div>
              )}

              <button 
                onClick={handleHack}
                disabled={isHacking}
                className="mt-6 w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl font-black text-lg flex justify-center items-center gap-3 transition-all shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_50px_rgba(79,70,229,0.5)]"
              >
                {isHacking ? "YZ METNİ ANALİZ EDİYOR..." : "SİSTEME GÖNDER VE ŞİFREYİ ÇÖZ"} <Send className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center relative z-10">
            <h1 className="text-6xl font-black text-emerald-400 mb-6 drop-shadow-[0_0_30px_rgba(16,185,129,0.8)] flex items-center justify-center gap-4">
              <Unlock className="w-12 h-12" /> KİLİT KIRILDI!
            </h1>
            
            <div className="bg-white/[0.02] backdrop-blur-xl border border-emerald-500/50 text-left p-10 rounded-3xl shadow-[0_0_100px_rgba(16,185,129,0.2)] max-w-2xl mx-auto mb-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,1)]"></div>
              <div className="text-emerald-400 font-mono text-xs mb-5 font-bold tracking-widest">GÜNLÜK_ŞİFRESİ: 1907_IHANET</div>
              <h2 className="text-3xl font-black text-white mb-6">Tarık Bey'in Son Notu:</h2>
              <p className="text-slate-300 italic text-lg leading-relaxed border-l-4 border-slate-700 pl-6">
                "Şoförümün kasadan para aşırdığını fark ettim. Şifreyi 1907 yaptığımı sanıyor ama asıl servet bu dijital günlükte saklı. Eğer başıma bir şey gelirse, adaleti ancak tüm gerçekleri parçalarıyla birleştirebilen zeki bir dedektif bulabilir."
              </p>
            </div>

            <button onClick={() => onComplete(1000)} className="px-12 py-5 bg-emerald-600 hover:bg-emerald-500 rounded-full font-black text-xl shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)] transition-all">
              1000 XP AL & DEDEKTİF SERTİFİKANLA OYUNU BİTİR
            </button>
          </motion.div>
        )}
      </div>

      <NexTutor mood={done ? "happy" : "warning"} message={done ? "İnanılmaz bir iş başardın dedektif! Prompt Mühendisliği sayesinde cinayeti aydınlattık." : "İşte kurbanın günlüğü. Notlarını (Silah, Saat, Yalancı) kullanarak YZ'ye mükemmel bir prompt yaz. Dikkat et, bu YZ biraz alaycıdır!"} />
    </div>
  );
}
