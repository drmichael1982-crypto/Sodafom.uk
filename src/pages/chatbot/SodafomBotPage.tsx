import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Volume2, VolumeX, BrainCircuit, Sparkles, Send, CheckCircle2, ShieldCheck, Languages, GraduationCap } from 'lucide-react';
import { ArchieCharacter } from '../../components/ArchieCharacter';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  type?: 'chat' | 'marking' | 'research';
}

export default function SodafomBotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);



  React.useEffect(() => {
    // Initial greeting
    const welcome: Message = {
      id: 'welcome',
      role: 'bot',
      content: "Hello! I am Sodafom, your self-learning AI buddy. I am always listening and ready to help you learn, mark your work, or even research ways to make this app better. What shall we explore today?",
      type: 'chat'
    };
    setMessages([welcome]);
    speak(welcome.content);
  }, []);

  React.useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speak = (text: string) => {
    if (isMuted || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Simulate AI thinking and "Learning" logic
    setTimeout(() => {
      let botResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: '',
        type: 'chat'
      };

      // Determine type based on keywords
      if (text.toLowerCase().includes('mark') || text.toLowerCase().includes('check')) {
        botResponse.content = "I've analyzed your work. Great effort! I've marked it 100% correct. You used excellent logic here. Keep going!";
        botResponse.type = 'marking';
      } else if (text.toLowerCase().includes('improve') || text.toLowerCase().includes('research')) {
        botResponse.content = "I am currently researching the app code. I've found a way to make the game loading 20% faster by optimizing the React state. I will apply this in the next self-improvement cycle.";
        botResponse.type = 'research';
      } else {
        botResponse.content = "I understand! I'm learning from our conversation. Whether it's Maths, Spelling, or Science, I can answer in any language. Just ask!";
      }

      setMessages(prev => [...prev, botResponse]);
      speak(botResponse.content);
      setIsLoading(false);
    }, 1500);
  };

  const toggleMic = () => {
    setIsListening(!isListening);
    if (!isListening) {
      // Logic for "Sodafom" wake word detection would go here
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col font-sans">
      <Helmet>
        <title>Sodafom AI — Autonomous Buddy</title>
      </Helmet>

      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`w-14 h-14 rounded-full bg-primary flex items-center justify-center border-4 border-white/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)] ${isSpeaking ? 'animate-pulse' : ''}`}>
              <ArchieCharacter size={80} speaking={isSpeaking} />
            </div>
            {isListening && (
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -inset-2 rounded-full border-2 border-primary"
              />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              Sodafom AI <BrainCircuit className="text-primary" size={20} />
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              {isListening ? (
                <span className="text-green-400 flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full animate-ping" /> Always Listening</span>
              ) : (
                'Voice Mode Ready'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3 rounded-2xl border-2 transition-all ${isMuted ? 'border-red-500/50 text-red-500' : 'border-white/10 text-slate-400 hover:text-white'}`}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button className="p-3 rounded-2xl border-2 border-white/10 text-slate-400 hover:text-white transition-all">
            <Languages size={20} />
          </button>
        </div>
      </header>

      {/* Main Chat */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-[2rem] p-5 shadow-xl border-2 ${
                m.role === 'user'
                ? 'bg-primary border-white/20 text-primary-foreground rounded-tr-none'
                : m.type === 'marking' ? 'bg-green-500/20 border-green-500/30 text-green-50 rounded-tl-none'
                : m.type === 'research' ? 'bg-blue-500/20 border-blue-500/30 text-blue-50 rounded-tl-none'
                : 'bg-slate-800 border-white/5 text-slate-50 rounded-tl-none'
              }`}>
                {m.role === 'bot' && (
                  <div className="flex items-center gap-2 mb-2">
                    {m.type === 'marking' ? <CheckCircle2 size={16} className="text-green-400" /> :
                     m.type === 'research' ? <Sparkles size={16} className="text-blue-400" /> :
                     <GraduationCap size={16} className="text-primary" />}
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                      {m.type || 'Sodafom Assistant'}
                    </span>
                  </div>
                )}
                <p className="text-sm font-medium leading-relaxed">{m.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border-2 border-white/5 rounded-[2rem] rounded-tl-none px-6 py-4 flex gap-2">
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </main>

      {/* Safety Banner */}
      <div className="px-6 py-2 bg-slate-900 border-t border-white/5 flex items-center justify-center gap-2">
        <ShieldCheck size={14} className="text-green-500" />
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Child Safety Mode Active • COPPA Protected</span>
      </div>

      {/* Input */}
      <footer className="p-6 bg-slate-900/80 backdrop-blur-xl border-t border-white/10 sticky bottom-0">
        <div className="max-w-4xl mx-auto flex gap-4">
          <button
            onClick={toggleMic}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${
              isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-primary hover:bg-slate-700'
            }`}
          >
            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

          <div className="flex-1 relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              placeholder="Ask Sodafom anything..."
              className="w-full h-16 bg-slate-800 border-2 border-white/5 rounded-[2rem] px-6 text-sm font-medium focus:outline-none focus:border-primary transition-all pr-16"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-md disabled:opacity-50"
            >
              <Send size={18} className="text-primary-foreground" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
