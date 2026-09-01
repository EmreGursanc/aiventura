import React, { useState } from 'react';
import PhaseProgress from './PhaseProgress';
import NexTutor from './NexTutor';
import { CheckCircle, ArrowRight, XCircle, Zap, Target, BookOpen, Send, ChevronRight, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const EP1_PHASES = [
  { label: 'Gör', icon: <BookOpen className="w-4 h-4" /> },
  { label: 'Öğren', icon: <Target className="w-4 h-4" /> },
  { label: 'Yap', icon: <Zap className="w-4 h-4" /> },
  { label: 'Karşılaştır', icon: <CheckCircle className="w-4 h-4" /> },
];

const BAD_PROMPT = "Şu otopsi raporunu anlat.";
const BAD_RESPONSE = "Kadavranın kraniyal bölgesinde künt travmaya bağlı subdural hematom gözlemlenmiş olup, toksikoloji raporu negatiftir. Eksitus saati takriben 23:00 - 01:00 arasıdır.";

const GOOD_PROMPT = "Sen cinayet bürodan emekli, olayları halk ağzıyla anlatan tecrübeli bir dedektifsin.\n\nBağlam: Yıldız Köşkü cinayeti otopsi raporu.\n\nGörev: Raporu benim gibi bir çaylağın anlayacağı şekilde basitleştir.";
const GOOD_RESPONSE = "Dinle çömez. Adam zehirlenmemiş, kanı tertemiz. Ama kafasının arkasına ağır ve küt bir cisimle çok sert vurmuşlar. Gece 11 ile 1 arasında işi bitirilmiş. Yani silahımız bir vazo, heykel veya levye olabilir. Gözünü açık tut!";

const QUIZ_QUESTIONS = [
  {
    q: "Aşağıdaki hangi cümle AI'a bir ROL atar?",
    options: [
      "Bu otopsi raporunu analiz et.",
      "Sen emekli bir cinayet dedektifisin.",
      "Kısa ve öz yaz.",
      "Lütfen bana yardım et."
    ],
    correct: 1,
    explain: "ROL vermek, AI'ın 'kim' gibi davranacağını belirler. Tecrübeli bir dedektif dersen, sana dedektif gibi cevap verir!"
  },
  {
    q: "AI'dan tıbbi bir raporu basitleştirmesini isterken HANGİ ROL en kötü sonucu verir?",
    options: [
      "İlkokul öğretmeni",
      "Halk dilinde konuşan polis",
      "Kıdemli Adli Tıp Profesörü",
      "Masal anlatıcısı"
    ],
    correct: 2,
    explain: "Zaten rapor çok tıbbi! AI'a 'Profesör' rolü verirsen, daha da ağır ve karmaşık tıbbi kelimeler kullanacaktır."
  }
];

export default function Ep1Full({ missionId, playSound, onComplete }: any) {
  const [phase, setPhase] = useState(0);
  const [quizIdx, setQuizIdx] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);

  const [selRole, setSelRole] = useState("");
  const [selContext, setSelContext] = useState("");
  const [selTask, setSelTask] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [builtPrompt, setBuiltPrompt] = useState("");
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

  const handleGenerate = async () => {
    if (!selRole || !selContext || !selTask) {
      setShowBuilderError("Tüm blokları seçmelisin dedektif!");
      return;
    }
    if (selRole === "Kıdemli Adli Tıp Profesörü") {
      setShowBuilderError("Profesör seçersen yine anlaşılmaz konuşur! Halk ağzıyla konuşacak birini seç.");
      return;
    }

    setShowBuilderError("");
    if (playSound) playSound('click');
    setIsGenerating(true);
    
    const finalPrompt = `Sen ${selRole}.\nBağlam: ${selContext}\nGörev: ${selTask}`;
    setBuiltPrompt(finalPrompt);

    setTimeout(() => {
      setAiResponse(GOOD_RESPONSE);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#08090f] text-white font-sans overflow-hidden">
      <div className="flex-shrink-0 border-b border-slate-800/80 px-6 py-3 flex items-center justify-between bg-[#0d0e1a]">
        <div className="text-emerald-400 font-bold text-sm tracking-wider flex items-center gap-2">
          <Target className="w-5 h-5" /> BÖLÜM 1: ROLÜ BELİRLE
        </div>
        <PhaseProgress phases={EP1_PHASES} current={phase} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8 relative">
        <div className="max-w-4xl mx-auto">
          
          {phase === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
              
              {/* YENİ EKLENEN NOT UYARISI */}
              <div className="bg-amber-950/40 border-2 border-amber-500/50 p-6 rounded-xl relative overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                <div className="absolute top-0 left-0 w-2 h-full bg-amber-500"></div>
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0 mt-1 animate-pulse" />
                  <div>
                    <h2 className="text-xl font-black text-amber-400 mb-2 tracking-wide">DİKKAT DEDEKTİF: KAĞIT KALEMİNİ HAZIRLA!</h2>
                    <p className="text-amber-100/90 leading-relaxed">
                      Olay yerinde kurbanın şifreli bir dijital günlüğünü bulduk. Günlük özel bir YZ tarafından korunuyor ve sadece <strong>"Gerçekleri Bilen"</strong> birine açılmaya programlanmış. 
                      <br/><br/>
                      Önündeki 3 bölüm boyunca karşına çıkacak analizlerden şu bilgileri mutlaka bir kenara not et: 
                      <strong className="text-white bg-black/40 px-2 py-1 rounded mx-1">1. Cinayet Silahı</strong>, 
                      <strong className="text-white bg-black/40 px-2 py-1 rounded mx-1">2. Kasanın Açılış Saati</strong> ve 
                      <strong className="text-white bg-black/40 px-2 py-1 rounded mx-1">3. Yalan Söyleyen Kişi</strong>.
                      <br/><br/>
                      Finalde günlüğün şifresini kırmak için onlara ihtiyacın olacak!
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-red-950/20 border border-red-900/40 p-6 rounded-xl text-center mt-4">
                <h2 className="text-xl font-black text-red-400 mb-2">VAKA: YILDIZ KÖŞKÜ CİNAYETİ</h2>
                <p className="text-slate-300">Zengin iş adamı Tarık Bey ölü bulundu. Elimizde tıbbi bir otopsi raporu var ama çok karmaşık.</p>
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

              <button onClick={() => { if(playSound) playSound('click'); setPhase(1); }} className="mx-auto mt-4 flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-full font-bold transition-all">
                Öğrenme Aşamasına Geç <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {phase === 1 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto">
              <div className="bg-[#0a0d16] border border-indigo-900/30 p-8 rounded-2xl">
                <div className="text-sm font-bold text-indigo-400 mb-6 flex items-center justify-between">
                  <span>GÜVENLİK DÜĞÜMÜ {quizIdx + 1}/2</span>
                  <span className="bg-indigo-950 px-3 py-1 rounded-full animate-pulse">Sistem İyileştiriliyor...</span>
                </div>
                <h3 className="text-xl font-bold mb-6">{QUIZ_QUESTIONS[quizIdx].q}</h3>
                
                <div className="space-y-3">
                  {QUIZ_QUESTIONS[quizIdx].options.map((opt, i) => (
                    <button
                      key={i}
                      disabled={showExplanation}
                      onClick={() => handleOptionClick(i)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        showExplanation 
                          ? i === QUIZ_QUESTIONS[quizIdx].correct 
                            ? 'bg-emerald-900/40 border-emerald-500 text-emerald-200' 
                            : 'bg-slate-900 border-slate-800 opacity-50'
                          : 'bg-slate-900/50 border-slate-700 hover:border-indigo-500 hover:bg-indigo-950/30'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {showExplanation && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-6 p-4 rounded-xl flex items-start gap-4 ${lastAnswerCorrect ? 'bg-emerald-950/30 border border-emerald-900/50' : 'bg-red-950/30 border border-red-900/50'}`}>
                    {lastAnswerCorrect ? <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" /> : <XCircle className="w-6 h-6 text-red-400 shrink-0" />}
                    <div>
                      <div className={`font-bold mb-1 ${lastAnswerCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                        {lastAnswerCorrect ? 'DOĞRU CEVAP' : 'YANLIŞ CEVAP!'}
                      </div>
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
                    <h2 className="text-2xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">PROMPT İNŞA EDİLİYOR</h2>
                    <p className="text-slate-400">Yıldız Köşkü cinayetindeki otopsi raporunu çözmek için doğru blokları seç.</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-slate-500 mb-2">1. KİMSİN? (ROL)</div>
                      {["Kıdemli Adli Tıp Profesörü", "Halk ağzıyla konuşan tecrübeli dedektif", "Sıradan bir vatandaş"].map(opt => (
                        <button key={opt} onClick={() => setSelRole(opt)} className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${selRole === opt ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-[#0a0d16] border-slate-700 text-slate-400 hover:border-indigo-500/50'}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-slate-500 mb-2">2. KONU NE? (BAĞLAM)</div>
                      {["Tarık Bey'in otopsi raporu"].map(opt => (
                        <button key={opt} onClick={() => setSelContext(opt)} className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${selContext === opt ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-[#0a0d16] border-slate-700 text-slate-400 hover:border-emerald-500/50'}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-slate-500 mb-2">3. NE İSTİYORSUN? (GÖREV)</div>
                      {["Bana raporu basitçe, çaylağın anlayacağı gibi anlat.", "Raporu özetle."].map(opt => (
                        <button key={opt} onClick={() => setSelTask(opt)} className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${selTask === opt ? 'bg-amber-600 border-amber-400 text-white' : 'bg-[#0a0d16] border-slate-700 text-slate-400 hover:border-amber-500/50'}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {showBuilderError && (
                    <div className="text-red-400 text-center font-bold animate-pulse">{showBuilderError}</div>
                  )}

                  <div className="flex justify-center mt-8">
                    <button onClick={handleGenerate} disabled={isGenerating} className="group relative px-8 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl font-bold text-lg transition-all shadow-[0_0_40px_rgba(79,70,229,0.3)] hover:shadow-[0_0_60px_rgba(79,70,229,0.5)] overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                      <div className="flex items-center gap-2">
                        {isGenerating ? "Analiz Ediliyor..." : "AI'a Gönder"} <Send className="w-5 h-5" />
                      </div>
                    </button>
                  </div>
                </>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mx-auto">
                  <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl overflow-hidden">
                    <div className="bg-emerald-900/40 p-4 border-b border-emerald-800/40 flex items-center gap-3">
                      <Zap className="w-6 h-6 text-emerald-400" />
                      <div>
                        <div className="font-bold text-emerald-400 text-lg">HARİKA! İPUCU BULUNDU!</div>
                        <div className="text-emerald-200/60 text-sm">Katilin silahının türü tespit edildi!</div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="text-xs font-bold text-slate-500 mb-2">SENİN PROMPTUN:</div>
                      <div className="bg-black/50 p-4 rounded-lg font-mono text-sm text-indigo-300 mb-6 border border-indigo-900/30">
                        {builtPrompt}
                      </div>
                      <div className="text-xs font-bold text-slate-500 mb-2">AI CEVABI:</div>
                      <div className="text-white text-lg leading-relaxed bg-slate-900/50 p-6 rounded-lg border border-slate-700">
                        {aiResponse}
                      </div>
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
                <h2 className="text-2xl font-black mb-2">BÖLÜM 1 TAMAMLANDI!</h2>
                <p className="text-slate-400">Rol atamanın gücünü gördün mü?</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
                  <div className="text-red-400 font-bold mb-4 flex items-center gap-2">
                    <XCircle className="w-5 h-5" /> ROL YOKKEN
                  </div>
                  <div className="text-slate-400 text-sm mb-4">"Şu otopsi raporunu anlat."</div>
                  <div className="bg-black/40 p-4 rounded text-sm text-slate-500 line-clamp-3">
                    {BAD_RESPONSE}
                  </div>
                </div>
                
                <div className="bg-indigo-950/30 border border-indigo-500/50 rounded-xl p-6">
                  <div className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" /> ROL VARKEN
                  </div>
                  <div className="text-indigo-300 text-sm mb-4">"Sen cinayet bürodan emekli, halk ağzıyla anlatan tecrübeli bir dedektifsin..."</div>
                  <div className="bg-black/40 p-4 rounded text-sm text-white">
                    {GOOD_RESPONSE}
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-8">
                <button onClick={() => onComplete(150)} className="flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-lg transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  150 XP KAZAN & SONRAKİ BÖLÜM <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <NexTutor 
        mood={phase === 0 ? "warning" : phase === 3 ? "happy" : "neutral"}
        message={
          phase === 0 ? "Kağıt kalemin hazır mı? Bu bilgileri (Silah, Saat, Yalancı) not etmeyi sakın unutma!" :
          phase === 1 ? "Doğru yoldasın! Sadece doğru ROLÜ ver." :
          phase === 2 ? "İşte şimdi Dedektiflik zamanı. Blokları yerleştir ve o raporu basitleştir!" :
          "Harika iş çıkardın! Küt cismi not ettin mi? Sırada şüphelilerin telefon kayıtları var."
        }
      />
    </div>
  );
}
