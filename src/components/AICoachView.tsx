// ============================================================================
// SI-7KAIH AI - Interactive AI Coach Component
// Supportive, encouraging, non-judgmental conversational guide
// ============================================================================

import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, Lightbulb, ShieldCheck } from 'lucide-react';

interface AICoachViewProps {
  studentName: string;
  role: string;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AICoachView: React.FC<AICoachViewProps> = ({ studentName, role }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: `Halo ${studentName}! 😊 Aku Teman Belajar SI-7KAIH. Aku siap membantumu menemukan ide seru untuk bangun pagi ceria, sarapan sehat, ide kebaikan, atau tips tidur nyenyak. Apa yang ingin kamu tanyakan hari ini?`,
      timestamp: 'Baru saja',
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickQuestions = [
    '💡 Tips tidur tepat waktu tanpa bermain gawai?',
    '🍎 Ide bekal & sarapan sehat yang lezat?',
    '🤝 Contoh kebaikan sederhana di rumah?',
    '🏃 Olahraga 15 menit yang asyik di pagi hari?',
  ];

  const handleSend = async (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: 'Baru saja',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: 'AI_CHAT_ASSISTANT',
          payload: {
            question: userText,
            studentName,
            role,
          },
        }),
      });

      let reply = '';
      if (res.ok) {
        const data = await res.json();
        reply = data.data?.reply || data.data?.recommendations?.join('\n') || '';
      }

      if (!reply) {
        // High quality fallback guidance
        if (userText.toLowerCase().includes('tidur')) {
          reply = `Wah, pertanyaan bagus tentang tidur cepat! 🌙 
1. Redupkan lampu kamar 30 menit sebelum tidur.
2. Letakkan ponsel atau gawai di luar kamar agar tidak tergoda melihat layar.
3. Baca buku cerita santai atau dengarkan cerita keluarga sebelum memejamkan mata.
Kamu pasti bisa bangun lebih segar besok pagi!`;
        } else if (userText.toLowerCase().includes('sarapan') || userText.toLowerCase().includes('makan')) {
          reply = `Sarapan adalah bahan bakar hebat untuk harimu! 🥗
Cobalah kombinasi telur rebus atau telur dadar, roti gandum atau nasi porsi cukup, ditambah pisang atau pepaya segar dan segelas air putih. Tubuhmu akan bertenaga sepanjang hari di sekolah!`;
        } else if (userText.toLowerCase().includes('kebaikan') || userText.toLowerCase().includes('masyarakat')) {
          reply = `Kebaikan itu menular dan bikin hati bahagia! ❤️
Hal sederhana yang bisa kamu lakukan hari ini:
- Membantu ibu merapikan sandal atau meja makan.
- Menyapa tetangga atau teman dengan senyum hangat.
- Menawarkan bantuan jika melihat adik atau teman kesulitan.`;
        } else {
          reply = `Terima kasih sudah bercerita, ${studentName}! Kunci utama dari 7 Kebiasaan adalah melakukannya selangkah demi selangkah dengan riang gembira bersama keluarga. Terus bersemangat ya! 🌟`;
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: reply,
          timestamp: 'Baru saja',
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `Semangat terus ya, ${studentName}! Jaga kesehatan, nikmati proses pembiasaan baikmu setiap hari, dan selalu komunikasikan dengan orang tua serta gurumu!`,
          timestamp: 'Baru saja',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-500 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Teman AI SI-7KAIH
            </h2>
            <p className="text-xs text-slate-500">
              Konselor virtual ramah untuk tips pembiasaan karakter positif.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Aktif</span>
        </div>
      </div>

      {/* Chat Messages Window */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs h-[450px] flex flex-col justify-between">
        <div className="overflow-y-auto space-y-4 pr-2 flex-1">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${
                m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-indigo-100 text-indigo-600'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#0753A5] text-white rounded-tr-xs'
                    : 'bg-slate-100/90 text-slate-800 rounded-tl-xs whitespace-pre-line'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-100 p-3 rounded-2xl text-xs text-slate-500">
                Teman AI sedang menyusun jawaban terbaik...
              </div>
            </div>
          )}
        </div>

        {/* Quick prompt chips */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {quickQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-[11px] font-semibold text-slate-600 border border-slate-200/80 transition-colors whitespace-nowrap cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              placeholder="Tulis pertanyaan atau ceritakan kebiasaanmu..."
              className="flex-1 p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-blue-500 bg-slate-50/50"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={isLoading || !input.trim()}
              className="px-4 py-3 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-white transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
        <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
        <span>Privasi aman: Pesan diproses secara etis dan mendidik tanpa penilaian menghakimi.</span>
      </div>
    </div>
  );
};
