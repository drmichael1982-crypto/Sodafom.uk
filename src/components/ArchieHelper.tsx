/**
 * ArchieHelper — Unified floating assistant.
 * Available across all screens and games.
 * Provides AI-backed chat, voice input (STT), and auto read-aloud (TTS).
 * Context-aware: can read current questions and provide game hints.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Volume2, X, Send, Square, Sparkles, BookOpen, Play } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useVoice } from '@/lib/voice-context';
import { API_PREFIX } from '@/lib/config';
import { ArchieCharacter } from './ArchieCharacter';
import { useArchieContext } from '@/contexts/ArchieContext';
import { tryLocalArchieResponse, getRememberedChildName } from '@/lib/archie-local';
import { findLearnedAnswer, rememberOnlineAnswer } from '@/lib/archie-device-memory';
import { games as gamesContent } from 'virtual:content';

type State = 'idle' | 'listening' | 'thinking' | 'speaking';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// ── Parse [PLAY:slug|label] markers out of Archie's message ──────────────────
interface PlayButton { slug: string; label: string; }
interface ParsedMessage { text: string; buttons: PlayButton[]; }

const APP_DESTINATIONS: Array<{ patterns: RegExp; label: string; route: string }> = [
  { patterns: /\b(ai teacher|teacher|teach me|lesson|tutor)\b/i, label: 'Archie AI Teacher', route: '/ai-teacher' },
  { patterns: /\b(maths?|mathematics|numbers?)\b/i, label: 'Maths games', route: '/games/maths' },
  { patterns: /\b(reading|read)\b/i, label: 'Reading games', route: '/games/reading' },
  { patterns: /\b(spelling|spell)\b/i, label: 'Spelling games', route: '/games/spelling' },
  { patterns: /\b(science)\b/i, label: 'Science games', route: '/games?subject=science' },
  { patterns: /\b(cartoon|cartoons|cartoon theatre|theatre)\b/i, label: 'Cartoon Theatre', route: '/cartoons' },
  { patterns: /\b(sticker|stickers|sticker book)\b/i, label: 'Sticker Book', route: '/?screen=stickers' },
  { patterns: /\b(rewards?|stars?)\b/i, label: 'Stars and Rewards', route: '/rewards' },
  { patterns: /\b(progress)\b/i, label: 'Progress', route: '/hub/progress' },
  { patterns: /\b(parent|parents|parent area)\b/i, label: 'Parent Area', route: '/parent-dashboard' },
  { patterns: /\b(home|main page)\b/i, label: 'Home', route: '/' },
];

function normaliseGameRequest(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function requestedDestination(text: string): { label: string; route: string } | null {
  if (!/\b(play|open|start|load|show|go to|take me to|watch|choose)\b/i.test(text)) return null;
  const request = normaliseGameRequest(text);
  const catalog = gamesContent.games ?? [];
  const exact = catalog.find((game) => {
    const title = normaliseGameRequest(game.title.replace(/!/g, ''));
    const slug = normaliseGameRequest(game.slug);
    return request.includes(title) || request.includes(slug);
  });
  if (exact) return { label: exact.title, route: `/games/${exact.slug}` };
  return APP_DESTINATIONS.find((item) => item.patterns.test(text)) ?? null;
}

function parseArchieMessage(content: string): ParsedMessage {
  const buttons: PlayButton[] = [];
  const text = content.replace(/\[PLAY:([^\]|]+)\|([^\]]+)\]/g, (_match, slug, label) => {
    buttons.push({ slug: slug.trim(), label: label.trim() });
    return '';
  }).trim();
  return { text, buttons };
}

export default function ArchieHelper({ gameMode = false }: { gameMode?: boolean }) {
  const navigate = useNavigate();
  const { gameTitle, subject, currentQuestion, currentOptions } = useArchieContext();
  const { playing: isSpeaking, stop: stopSpeaking, speak: speakWithVoiceState } = useVoice();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastReadQuestionRef = useRef<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (open) scrollToBottom();
  }, [messages, open]);

  // Handle global "speaking" state from VoiceContext
  const currentStatus: State = isListening ? 'listening' : isLoading ? 'thinking' : isSpeaking ? 'speaking' : 'idle';

  const speak = useCallback((text: string) => {
    console.log('TTS_STARTED');
    recognitionRef.current?.abort?.();
    recognitionRef.current = null;
    setIsListening(false);
    speakWithVoiceState('read:archie-ai', text);
    console.log('TTS_FINISHED');
  }, [speakWithVoiceState]);

  // Games that supply their current question are read automatically once.
  // This is intentionally keyed by the question text so re-renders do not
  // make Archie repeat himself or speak over the child's answer.
  useEffect(() => {
    if (!gameMode || !currentQuestion || currentQuestion === lastReadQuestionRef.current) return;
    lastReadQuestionRef.current = currentQuestion;
    const timer = window.setTimeout(() => speak(`The question is: ${currentQuestion}`), 350);
    return () => window.clearTimeout(timer);
  }, [gameMode, currentQuestion, speak]);

  // Automatically start listening after Archie finishes speaking
  const prevSpeakingRef = useRef(isSpeaking);
  useEffect(() => {
    if (prevSpeakingRef.current && !isSpeaking && open) {
      const timer = setTimeout(() => {
        startListening();
      }, 500);
      return () => clearTimeout(timer);
    }
    prevSpeakingRef.current = isSpeaking;
  }, [isSpeaking, open]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    console.log('AI_REQUEST_SENT');
    const userMessage: Message = { id: `user-${Date.now()}`, role: 'user', content: trimmed };
    const assistantId = `assistant-${Date.now()}`;

    setMessages((prev) => [...prev, userMessage, { id: assistantId, role: 'assistant', content: '' }]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      console.log('AI_RESPONSE_RECEIVED');
      const destination = requestedDestination(trimmed);
      if (destination) {
        const reply = `Of course! Opening ${destination.label} now.`;
        setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: reply } : m));
        speak(reply);
        window.setTimeout(() => {
          navigate(destination.route);
          setOpen(false);
        }, 900);
        return;
      }
      const local = tryLocalArchieResponse(trimmed);
      const learned = !local ? findLearnedAnswer(trimmed) : null;
      const hintRequest = /\b(hint|help|what do i have to do|instructions?)\b/i.test(trimmed);
      if (local || learned || (gameTitle && hintRequest)) {
        const localText = local?.text ?? learned ?? (currentQuestion
          ? `Let's work it out together. Read this carefully: ${currentQuestion}. Look at each choice, rule out the ones that cannot be right, then choose your best answer.`
          : `You are playing ${gameTitle}. Read the instructions carefully, take your time, and try one step at a time. I'm right here if you need me.`);
        setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: localText } : m));
        speak(localText);
        return;
      }

      console.log('[Archie Diagnostic] 8. AI response received');
      console.log(`[Archie] START sendMessage: "${trimmed}"`);
      // Build context-aware prompt if in a game, and keep the learner's name consistent.
      const rememberedName = getRememberedChildName();
      let contextPrompt = rememberedName
        ? `\n\nLEARNER: The child's remembered name is ${rememberedName}. Use it naturally, but not in every sentence.`
        : "";
      if (gameTitle) {
        contextPrompt += `\n\nCONTEXT: The child is currently playing "${gameTitle}" (${subject}).`;
        if (currentQuestion) {
          contextPrompt += ` The current question is: "${currentQuestion}".`;
        }
        contextPrompt += ` If they ask for help or a hint, help them think through this specific question without giving the answer away directly.`;
      }

      // Filter out empty messages from history
      const history = [...messages, userMessage]
        .filter(m => m.content && m.content.trim().length > 0)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));
      console.log(`[Archie] Sanitized history length: ${history.length}`);

      const fetchUrl = `${API_PREFIX}/chat`;
      console.log(`[Archie] Fetching URL: ${fetchUrl}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn('[Archie] Request TIMEOUT triggered (45s)');
        controller.abort();
      }, 45000);

      console.log('[Archie] Calling fetch...');
      const response = await fetch(fetchUrl, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/plain, */*'
        },
        body: JSON.stringify({
          messages: history,
          systemExtra: contextPrompt
        }),
      }).catch(e => {
        clearTimeout(timeoutId);
        console.error(`[Archie] Fetch CATCH block:`, e);
        if (e.name === 'AbortError') throw new Error('Request timed out. Please try again!');
        throw new Error(`Connection failed: ${e.message || 'Check internet'}.`);
      });

      clearTimeout(timeoutId);
      console.log(`[Archie] Fetch COMPLETED. Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error(`[Archie] Response NOT OK. Status: ${response.status}. Error: ${errorText}`);
        throw new Error(errorText || `Server error: ${response.status}`);
      }

      let fullContent = '';
      const contentType = response.headers.get('content-type');
      console.log(`[Archie] Content-Type: ${contentType}`);

      // Only treat as stream if explicitly told so by the server
      const isStream = contentType?.includes('text/event-stream');
      console.log(`[Archie] isStream: ${isStream}`);

      if (isStream && response.body && typeof (response.body as any).getReader === 'function') {
        console.log('[Archie] Starting STREAM processing...');
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let chunkCount = 0;
        for (let result = await reader.read(); !result.done; result = await reader.read()) {
          const chunk = decoder.decode(result.value, { stream: true });
          chunkCount++;
          console.log(`[Archie] Received chunk #${chunkCount} (${chunk.length} chars)`);
          fullContent += chunk;
        }
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: fullContent } : m))
        );
        console.log(`[Archie] STREAM finished. Total length: ${fullContent.length}`);
      } else {
        console.log('[Archie] Starting BUFFERED processing (text)...');
        fullContent = await response.text();
        console.log(`[Archie] BUFFERED finished. Length: ${fullContent?.length}`);
        if (!fullContent) {
          console.warn('[Archie] Received EMPTY content from server');
          throw new Error('Received empty response from Archie.');
        }

        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: fullContent } : m))
        );
      }

      // Save useful online Q&A on this device so Local Archie can reuse it offline.
      rememberOnlineAnswer(trimmed, fullContent);

      console.log(`[Archie] Parsing Archie message...`);
      const { text } = parseArchieMessage(fullContent);
      console.log(`[Archie] Final parsed text length: ${text?.length}`);
      if (text) {
        console.log(`[Archie] Triggering TTS speak...`);
        speak(text);
      } else {
        console.warn('[Archie] No text to speak after parsing.');
      }
    } catch (err) {
      console.error('Archie Chat Error:', err);
      const fallback = currentQuestion
        ? `I can still help offline. The question is ${currentQuestion}. Take it one step at a time and check each choice.`
        : `I'm still here. I cannot reach the online teacher just now, but I can read the game and help with maths, spelling and instructions.`;
      setError('Online Archie is unavailable, so I am helping offline.');
      setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: fallback } : m));
      speak(fallback);
    } finally {
      setIsLoading(false);
    }
  }

  const startListening = () => {
    console.log('MIC_PERMISSION_REQUESTED');
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[Archie Diagnostic] Speech recognition not supported in browser');
      setError("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      console.log('MIC_PERMISSION_GRANTED');
      console.log('MIC_LISTENING_STARTED');
      setIsListening(true);
      setError(null);
    };

    if ('onspeechstart' in recognition) {
      (recognition as any).onspeechstart = () => {
        console.log('VOICE_DETECTED');
      };
    }

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      console.log('TRANSCRIPT_CREATED');
      setInput(text);
      sendMessage(text);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      console.error('[Archie Diagnostic] Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError("Microphone permission denied. Please allow it in settings!");
      } else if (event.error !== 'no-speech') {
        setError("I didn't quite catch that. Try again!");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error('[Archie Diagnostic] Error starting recognition:', e);
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleReadQuestion = () => {
    if (currentQuestion) {
      speak(`The question is: ${currentQuestion}`);
    }
  };

  const handleReadAnswers = () => {
    if (currentOptions && currentOptions.length > 0) {
      const text = `The choices are: ${currentOptions.map((o, i) => `${i + 1}: ${o}`).join('. ')}`;
      speak(text);
    }
  };

  const handleArchieButton = () => {
    console.log('ARCHIE_BUTTON_PRESSED');
    // A single tap should always open Archie. If he is speaking, stop him first.
    if (isSpeaking) stopSpeaking();
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen) window.setTimeout(() => startListening(), 300);
  };

  return (
    <div className={`fixed z-[9999] flex flex-col items-end gap-2 print:hidden ${gameMode ? 'bottom-20 right-3 sm:bottom-20 sm:right-5' : 'bottom-20 right-4'}`}>
      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-card border-2 border-primary/20 rounded-3xl shadow-2xl flex flex-col w-[90vw] max-w-[360px] h-[70vh] max-h-[500px] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary/5 border-b border-primary/10 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white border border-primary/20 flex items-center justify-center overflow-hidden">
                  <ArchieCharacter size={32} speaking={isSpeaking} />
                </div>
                <div>
                  <p className="font-black text-foreground text-sm">Ask Archie</p>
                  {gameTitle && <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Helping with {gameTitle}</p>}
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-full hover:bg-primary/10 transition-colors">
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-6">
                  <ArchieCharacter size={80} speaking={isSpeaking} />
                  <p className="text-sm font-bold text-foreground mt-2">Hi! I'm Archie.</p>
                  <p className="text-xs text-muted-foreground mt-1 px-4">
                    {gameTitle
                      ? `I can help you with "${gameTitle}". Ask me for a hint or to read the question!`
                      : "I'm your Sodafom buddy. Ask me anything about learning or the app!"}
                  </p>
                </div>
              )}
              {messages.map((m) => {
                const isAi = m.role === 'assistant';
                const { text, buttons } = isAi ? parseArchieMessage(m.content) : { text: m.content, buttons: [] };
                if (isAi && !text && buttons.length === 0 && m.content) return null;

                return (
                  <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} gap-1.5`}>
                    {text && (
                      <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                        m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                      }`}>
                        {text}
                      </div>
                    )}
                    {buttons.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-0.5">
                        {buttons.map((btn, i) => (
                          <button
                            key={i}
                            onClick={() => { navigate(`/games/${btn.slug}`); setOpen(false); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-black text-[10px] shadow-sm hover:shadow-md transition-all border border-yellow-300"
                          >
                            <Play size={10} className="fill-white" />
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {isLoading && !messages[messages.length-1]?.content && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl px-3 py-2 text-sm flex gap-1">
                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Error Area */}
            {error && (
              <div className="px-4 py-2 bg-red-50 border-t border-red-100 flex items-center justify-between gap-2">
                <p className="text-[10px] text-red-600 font-bold leading-tight">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 font-black text-[10px] hover:underline shrink-0"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Controls */}
            <div className="p-3 bg-white border-t border-primary/10 space-y-2">
              {/* Quick actions for games */}
              {gameTitle && (currentQuestion || (currentOptions && currentOptions.length > 0)) && (
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {currentQuestion && (
                    <button
                      onClick={handleReadQuestion}
                      className="whitespace-nowrap px-3 py-1.5 rounded-full bg-primary/5 hover:bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary flex items-center gap-1.5 transition-colors"
                    >
                      <Volume2 size={12} /> Read Question
                    </button>
                  )}
                  {currentOptions && currentOptions.length > 0 && (
                    <button
                      onClick={handleReadAnswers}
                      className="whitespace-nowrap px-3 py-1.5 rounded-full bg-secondary/5 hover:bg-secondary/10 border border-secondary/20 text-[10px] font-bold text-secondary flex items-center gap-1.5 transition-colors"
                    >
                      <Volume2 size={12} /> Read Answers
                    </button>
                  )}
                  <button
                    onClick={() => sendMessage("Give me a hint please!")}
                    className="whitespace-nowrap px-3 py-1.5 rounded-full bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 text-[10px] font-bold text-yellow-800 flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles size={12} /> Get a Hint
                  </button>
                  <button
                    onClick={() => sendMessage("What do I have to do?")}
                    className="whitespace-nowrap px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[10px] font-bold text-blue-800 flex items-center gap-1.5 transition-colors"
                  >
                    <BookOpen size={12} /> Instructions
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm shrink-0 ${
                    isListening ? 'bg-red-500 animate-pulse text-white' : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                  aria-label="Talk to Archie"
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                <form
                  onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
                  className="flex-1 flex gap-1"
                >
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Archie..."
                    className="w-full px-3 py-2 rounded-xl border border-border focus:border-primary outline-none text-xs bg-muted/30"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-40 transition-opacity"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>

              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="w-full py-1.5 rounded-lg bg-red-50 text-red-600 text-[10px] font-bold flex items-center justify-center gap-1.5 border border-red-100"
                >
                  <Square size={10} fill="currentColor" /> Stop Archie Speaking
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        onClick={handleArchieButton}
        style={{ touchAction: 'manipulation' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={gameMode ? 'Ask Archie for help with this game' : 'Ask Archie'}
        title={gameMode ? 'Ask Archie for help with this game' : 'Ask Archie'}
        className={`${gameMode ? 'w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 ring-4 ring-amber-300/60' : 'w-14 h-14 rounded-2xl border-2'} shadow-2xl flex items-center justify-center transition-all border-white relative pointer-events-auto cursor-pointer select-none z-[99999] ${
          open ? 'bg-primary text-white' : 'bg-white'
        }`}
      >
        <div className="relative">
          <img
            src="/assets/images/sodafom-launcher-icon-v2.png"
            alt="Archie"
            className={`${gameMode ? 'h-14 w-14 sm:h-16 sm:w-16' : 'h-10 w-10'} rounded-full object-cover`}
          />
          {currentStatus === 'listening' && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
          )}
        </div>

        {/* Unread badge/indicator or status label */}
        {!open && !isSpeaking && (
          <div className={`absolute bg-yellow-400 font-black rounded-full shadow-md text-yellow-900 border-2 border-white whitespace-nowrap ${gameMode ? '-bottom-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1' : '-top-2 -left-2 text-[8px] px-2 py-0.5'}`}>
            ASK ARCHIE
          </div>
        )}
      </motion.button>
    </div>
  );
}
