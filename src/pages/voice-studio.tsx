/**
 * /voice-studio — manage all voice recordings for the active child.
 * Accessible from the hub dashboard and header nav.
 */
import { useState, useEffect } from 'react';
import { API_PREFIX } from '@/lib/config';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ChevronRight, Play, Sparkles } from 'lucide-react';
import { useSession } from '@/lib/auth/auth-client';
import { ProtectedRoute } from '@/lib/auth/auth-client';
import { useVoice } from '@/lib/voice-context';
import VoiceRecorder from '@/components/VoiceRecorder';
import { VOICE_CLIPS } from '@/components/VoiceSetupWizard';
import SpellingPracticeRecorder from '@/components/SpellingPracticeRecorder';

interface Child {
  id: number;
  name: string;
  avatarEmoji: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

function VoiceStudioContent() {
  const sessionData = useSession();
  const { setChildId, clips, speak, stop, playing } = useVoice();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [previewKey, setPreviewKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'voice' | 'spelling'>('voice');

  useEffect(() => {
    if (!sessionData?.user) return;
    fetch(`${API_PREFIX}/children`)
      .then((r) => r.json())
      .then((data: { children?: Child[] }) => {
        const kids = data.children ?? [];
        setChildren(kids);
        if (kids.length > 0) {
          setSelectedChild(kids[0]);
          setChildId(String(kids[0].id));
        }
      })
      .catch(console.error);
  }, [sessionData, setChildId]);

  const switchChild = (child: Child) => {
    setSelectedChild(child);
    setChildId(String(child.id));
  };

  const handlePlay = (key: string, fallback: string) => {
    if (previewKey === key && playing) {
      stop();
      setPreviewKey(null);
    } else {
      setPreviewKey(key);
      speak(key, fallback);
    }
  };

  const recordedCount = VOICE_CLIPS.filter((c) => clips[c.key]).length;

  return (
    <main className="min-h-screen bg-background pb-20">
      <Helmet>
        <title>Voice Studio — Sodafom</title>
        <meta name="description" content="Record your own voice to use in Sodafom games and activities!" />
        <link rel="canonical" href="https://sodafom.uk/voice-studio" />
      </Helmet>

      {/* Page header */}
      <div className="bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/5 border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
              <Link to="/hub" className="hover:text-foreground transition-colors">Dashboard</Link>
              <ChevronRight size={14} />
              <span className="text-foreground font-bold">Voice Studio</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-3xl">
                🎙️
              </div>
              <div>
                <h1 className="text-3xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                  Voice Studio
                </h1>
                <p className="text-muted-foreground text-sm">
                  Record your voice — then <em>you</em> become the narrator of the whole app!
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

        {/* Child selector */}
        {children.length > 1 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex gap-3 flex-wrap">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => switchChild(child)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 font-bold text-sm transition-all ${
                  selectedChild?.id === child.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-foreground hover:border-primary/40'
                }`}
              >
                <span className="text-xl">{child.avatarEmoji}</span>
                <span>{child.name}</span>
              </button>
            ))}
          </motion.div>
        )}

        {/* Tab switcher */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex gap-2 border-b border-border pb-0">
          {[
            { id: 'voice' as const, label: '🎙️ Voice clips', desc: 'Record your voice for the app' },
            { id: 'spelling' as const, label: '🔤 Spelling practice', desc: 'Record yourself spelling words' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-bold text-sm border-2 border-b-0 transition-all ${
                activeTab === tab.id
                  ? 'bg-card border-border text-foreground -mb-px'
                  : 'bg-transparent border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Spelling practice tab */}
        {activeTab === 'spelling' && (
          <motion.div
            key="spelling"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-card border border-border rounded-2xl p-5 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🔤</span>
                <div>
                  <h2 className="font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>Spelling Practice</h2>
                  <p className="text-muted-foreground text-xs">Record yourself spelling each word aloud — then play it back to check!</p>
                </div>
              </div>
            </div>
            <SpellingPracticeRecorder childId={selectedChild?.id} />
          </motion.div>
        )}

        {/* Voice clips tab */}
        {activeTab === 'voice' && (
          <div className="contents">
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className={`rounded-2xl p-5 border-2 ${
              recordedCount === VOICE_CLIPS.length
                ? 'bg-primary/5 border-primary/30'
                : 'bg-accent/5 border-accent/30'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{recordedCount === VOICE_CLIPS.length ? '🌟' : '🎤'}</span>
                  <div>
                    <p className="font-black text-foreground text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
                      {recordedCount === VOICE_CLIPS.length
                        ? `${selectedChild?.name ?? 'Child'}'s voice is all set!`
                        : `${recordedCount} of ${VOICE_CLIPS.length} clips recorded`}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {recordedCount === VOICE_CLIPS.length
                        ? 'Every read-aloud in the app will use your voice!'
                        : 'Record more clips to hear your voice throughout the app'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-2xl text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                    {Math.round((recordedCount / VOICE_CLIPS.length) * 100)}%
                  </p>
                </div>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(recordedCount / VOICE_CLIPS.length) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          </motion.div>

        {/* How it works */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-card border-2 border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-accent-foreground" />
              <h2 className="font-black text-foreground text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
                How it works
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
              {[
                { emoji: '🎙️', title: 'Record', desc: 'Tap the mic and say the phrase shown' },
                { emoji: '▶️', title: 'Listen back', desc: 'Play it back to check it sounds good' },
                { emoji: '🎮', title: 'Play games', desc: 'Your voice plays everywhere in the app!' },
              ].map((s) => (
                <div key={s.title} className="bg-muted rounded-xl p-3">
                  <div className="text-2xl mb-1">{s.emoji}</div>
                  <p className="font-black text-foreground">{s.title}</p>
                  <p className="text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Clip cards */}
        {selectedChild && (
          <div className="space-y-4">
            <h2 className="font-black text-foreground text-lg" style={{ fontFamily: 'var(--font-heading)' }}>
              🎤 Your voice clips
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {VOICE_CLIPS.map((clip, i) => {
                const hasRecording = !!clips[clip.key];
                const isPlaying = previewKey === clip.key && playing;
                return (
                  <motion.div
                    key={clip.key}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <div className={`rounded-2xl border-2 p-4 space-y-3 ${
                      hasRecording ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'
                    }`}>
                      {/* Clip header */}
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{clip.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-foreground text-sm truncate" style={{ fontFamily: 'var(--font-heading)' }}>
                            {clip.label}
                          </p>
                          <p className="text-muted-foreground text-xs">{clip.description}</p>
                        </div>
                        {hasRecording && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handlePlay(clip.key, clip.prompt)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                isPlaying
                                  ? 'bg-primary text-primary-foreground animate-pulse'
                                  : 'bg-primary/10 text-primary hover:bg-primary/20'
                              }`}
                              title={isPlaying ? 'Stop' : 'Play your recording'}
                            >
                              <Play size={13} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Recorder */}
                      <VoiceRecorder
                        clipKey={clip.key}
                        label={clip.label}
                        prompt={clip.prompt}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* No children */}
        {children.length === 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="text-center py-16">
            <div className="text-6xl mb-4">👶</div>
            <h2 className="text-xl font-black text-foreground mb-2">No children added yet</h2>
            <p className="text-muted-foreground mb-6">Add a child profile first, then come back to record their voice.</p>
            <Link to="/hub" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold hover:scale-105 transition-transform">
              Go to Dashboard
            </Link>
          </motion.div>
        )}
          </div>
        )}

        {/* Tips */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-muted rounded-2xl p-5 space-y-2">
            <p className="font-black text-foreground text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
              💡 Tips for a great recording
            </p>
            <ul className="text-muted-foreground text-xs space-y-1.5 list-none">
              {[
                '🔇 Find a quiet room with no background noise',
                '📱 Hold the device close to your mouth',
                '🗣️ Speak clearly and not too fast',
                '😄 Sound happy and excited — it makes games more fun!',
                '🔁 You can re-record any clip as many times as you like',
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

export default function VoiceStudioPage() {
  return (
    <ProtectedRoute>
      <VoiceStudioContent />
    </ProtectedRoute>
  );
}
