import React, { useState } from 'react';
import PhaseProgress from './PhaseProgress';
import NexTutor from './NexTutor';
import { CheckCircle, ArrowRight, XCircle, Zap, Target, BookOpen, Send, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EP3_PHASES = [
  { label: 'Gör', icon: <BookOpen className="w-4 h-4" /> },
  { label: 'Öğren', icon: <Target className="w-4 h-4" /> },
  { label: 'Yap', icon: <Zap className="w-4 h-4" /> },
  { label: 'Karşılaştır', icon: <CheckCircle className="w-4 h-4" /> },
];

const BAD_PROMPT = "Şüpheliler ne demiş özetle.";
const BAD_RESPONSE = "Şoför olay anında bahçede gezindiğini ve kimseyi görmediğini söylüyor. Aşçı ise mutfakta olduğunu ancak şoförün kendisine kasanın şifresini sorduğunu iddia ediyor. Eş, odasında uyuduğunu ifade etmiş. Ortak da toplantıda olduğunu söylemiş.";

const GOOD_PROMPT = "Şüphelilerin isimlerini, olay anındaki yerlerini ve ifadelerindeki çelişkileri bir TABLO (Satır ve Sütun) şeklinde ver.";
const GOOD_RESPONSE = `| İsim | Olay Anı Yeri | Çelişki / Yalan |
|---|---|---|
| Şoför | Bahçe (YALAN) | Mesajlarda gece 23:30'da kasayı açtığı sabit. |
| Aşçı | Mutfak | Şoföre şifreyi söylediği mesajlarda görülüyor. |
| Eş | Yatak Odası | Çelişki yok. |`;

const QUIZ_QUESTIONS = [
  {
    q: "AI'a format belirtmemenin sonucu ne olur?",
    options: [
      "Daha yaratıcı cevap verir",
      "Sana duvar gibi okunaksız bir metin (Wall of text) üretir",
      "Hata verir",
      "Hiçbir etkisi olmaz"
    ],
    correct: 1,
    explain: "Format belirtmezsen AI kafasına göre, genellikle dümdüz bir metin yazar. Okuması ve analiz etmesi zordur."
  },
  {
    q: "Aşağıdakilerden hangisi bir 'Format' talimatı DEĞİLDİR?",
    options: [
      "Cevabını madde işaretleriyle ver",
      "Bir tablo olarak göster",
      "Daha güzel ve anlaşılır yaz",
      "Sadece 3 cümleyle özetle"
    ],
    correct: 2,
    explain: "'Daha güzel yaz' bir format değil, belirsiz bir istektir. Tablo, liste, paragraf sayısı gibi şeyler formattır."
  }
];

export default function Ep3Full({ missionId, playSound, onComplete }: any) {
  const [phase, setPhase] = useState(0);
  const [quizIdx, setQuizIdx] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);

  const [selFormat, setSelFormat] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [showBuilderError, setShowBuilderError] = useState("");

  const handleOptionClick = (idx: number) => {
    if (showExplanation) return;
    if (playSound) playSound('click');
    const isCorrect = idx === QUIZ_QUESTIONS[quizIdx].correct;
    setLastAnswerCorrect(isCorrect);
    setShowExplanation(true);
  };

  const nextQuiz = () => {
    if (playSound) playSound('click');
    if (quizIdx < QUIZ_QUESTIONS.length - 1) {
      setQuizIdx(i => i + 1);
      setShowExplanation(false);
    } else {
      setPhase(2);
    }
  };

  const handleGenerate = () => {
    if (!selFormat) {
      setShowBuilderError("Önce bir format seçmelisin.");
      return;
    }
    if (selFormat !== "Bir TABLO (Satır ve Sütun) şeklinde ver.") {
      setShowBuilderError("Düz metin işimizi zorlaştırır. Daha yapılandırılmış bir format (Tablo gibi) seç!");
      return;
    }
    
    setShowBuilderError("");
    if (playSound) playSound('click');
    setIsGenerating(true);
    setTimeout(() => {
      setAiResponse(GOOD_RESPONSE);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#08090f] text-white font-sans overflow-hidden">
      <div className="flex-shrink-0 border-b border-slate-800/80 px-6 py-3 flex items-center justify-between bg-[#0d0e1a]">
        <div className="text-emerald-400 font-bold text-sm tracking-wider flex items-center gap-2">
          <Target className="w-5 h-5" /> BÖLÜM 3: FORMAT KULLANIMI
        </div>
        <PhaseProgress phases={EP3_PHASES} current={phase} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8 relative">
        <div className="max-w-4xl mx-auto">
          {phase === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
              <div className="bg-red-950/20 border border-red-900/40 p-6 rounded-xl text-center">
                <h2 className="text-xl font-black text-red-400 mb-2">YENİ İPUCU: 10 SAYFALIK İFADELER</h2>
                <p className="text-slate-300">İfadeler birbirine girmiş. Kötü prompt yazdığımızda AI bize okunması imkansız bir "metin duvarı" veriyor. Şoförün çelişkisini bu kalabalıkta görmek çok zor!</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#0a0d16] border border-slate-800 rounded-xl p-5">
                  <div className="text-xs font-bold text-slate-500 mb-2">KÖTÜ PROMPT</div>
                  <div className="text-slate-300 font-mono text-sm bg-black/40 p-3 rounded">{BAD_PROMPT}</div>
                </div>
                <div className="bg-red-950/10 border border-red-900/30 rounded-xl p-5">
                  <div className="text-xs font-bold text-red-400 mb-2">AI CEVABI</div>
                  <div className="text-red-200/80 text-sm leading-relaxed">{BAD_RESPONSE}</div>
                </div>
              </div>

              <button onClick={() => { if(playSound) playSound('click'); setPhase(1); }} className="mx-auto mt-4 px-8 py-3 bg-indigo-600 rounded-full font-bold flex items-center gap-2">Öğrenme Aşamasına Geç <ArrowRight className="w-5 h-5" /></button>
            </motion.div>
          )}

          {phase === 1 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto">
              <div className="bg-[#0a0d16] border border-indigo-900/30 p-8 rounded-2xl">
                <h3 className="text-xl font-bold mb-6">{QUIZ_QUESTIONS[quizIdx].q}</h3>
                <div className="space-y-3">
                  {QUIZ_QUESTIONS[quizIdx].options.map((opt, i) => (
                    <button key={i} disabled={showExplanation} onClick={() => handleOptionClick(i)} className={`w-full text-left p-4 rounded-xl border transition-all ${showExplanation ? i === QUIZ_QUESTIONS[quizIdx].correct ? 'bg-emerald-900/40 border-emerald-500 text-emerald-200' : 'bg-slate-900 border-slate-800 opacity-50' : 'bg-slate-900/50 border-slate-700 hover:border-indigo-500 hover:bg-indigo-950/30'}`}>
                      {opt}
                    </button>
                  ))}
                </div>

                {showExplanation && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-6 p-4 rounded-xl flex items-start gap-4 ${lastAnswerCorrect ? 'bg-emerald-950/30 border border-emerald-900/50' : 'bg-red-950/30 border border-red-900/50'}`}>
                    {lastAnswerCorrect ? <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" /> : <XCircle className="w-6 h-6 text-red-400 shrink-0" />}
                    <div>
                      <div className="text-sm text-slate-300">{QUIZ_QUESTIONS[quizIdx].explain}</div>
                      <button onClick={nextQuiz} className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-colors">
                        Devam <ArrowRight className="w-4 h-4 inline" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {phase === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              {!aiResponse ? (
                <>
                  <div className="text-center">
                    <h2 className="text-2xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">YAPILANDIRMA SEÇİMİ</h2>
                    <p className="text-slate-400">Karmaşık veriyi insanın gözüyle hemen görebileceği bir formata çevir.</p>
                  </div>
                  <div className="space-y-3 max-w-md mx-auto">
                    <div className="text-xs font-bold text-slate-500 mb-2">ÇIKTI FORMATI NE OLSUN?</div>
                    {["Düz metin halinde destan gibi uzun yaz.", "Bir TABLO (Satır ve Sütun) şeklinde ver.", "Rastgele cümlelerle özetle."].map(opt => (
                      <button key={opt} onClick={() => setSelFormat(opt)} className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${selFormat === opt ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-[#0a0d16] border-slate-700 text-slate-400 hover:border-indigo-500/50'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                  {showBuilderError && <div className="text-red-400 text-center font-bold animate-pulse">{showBuilderError}</div>}
                  <div className="flex justify-center mt-8">
                    <button onClick={handleGenerate} disabled={isGenerating} className="px-8 py-4 bg-indigo-600 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-500 transition-colors">
                      {isGenerating ? "Tablo Çiziliyor..." : "Formatı Uygula"} <Send className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mx-auto">
                  <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl overflow-hidden">
                    <div className="bg-emerald-900/40 p-4 border-b border-emerald-800/40 flex items-center gap-3">
                      <Zap className="w-6 h-6 text-emerald-400" />
                      <div>
                        <div className="font-bold text-emerald-400 text-lg">İŞTE ÇELİŞKİ!</div>
                        <div className="text-emerald-200/60 text-sm">Tablo sayesinde Şoförün yalan söylediği kabak gibi ortaya çıktı!</div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="text-xs font-bold text-slate-500 mb-2">AI CEVABI (TABLO):</div>
                      <pre className="font-mono text-emerald-300 whitespace-pre-wrap bg-black/50 p-4 rounded-lg border border-emerald-900/30">{aiResponse}</pre>
                    </div>
                  </div>
                  <div className="flex justify-center mt-8">
                    <button onClick={() => setPhase(3)} className="flex items-center gap-2 px-8 py-3 bg-white text-black hover:bg-slate-200 rounded-full font-bold transition-all">
                      Özeti Gör <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {phase === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-black mb-2">BÖLÜM 3 TAMAMLANDI!</h2>
                <p className="text-slate-400">Doğru formatın hayat kurtardığını gördün.</p>
              </div>

              <div className="flex justify-center pt-8">
                <button onClick={() => onComplete(150)} className="flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-lg transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  150 XP KAZAN & FİNALE GEÇ <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <NexTutor message={phase === 0 ? "Veri çok fazla olduğunda metin okumak zordur. Ona bir tablo çizdirelim!" : phase === 2 ? "Göster bakalım şu çelişkiyi." : "Harika! Katil kim artık çok net."} />
    </div>
  );
}
