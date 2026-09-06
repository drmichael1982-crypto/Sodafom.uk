import { onboarding } from 'virtual:content';
import { API_PREFIX } from '@/lib/config';
import { Helmet } from '@dr.pogodin/react-helmet';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Check, Star } from 'lucide-react';
import { useState } from 'react';
import { useSession } from '@/lib/auth/auth-client';
import { ProtectedRoute } from '@/lib/auth/auth-client';

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all ${
            i < current ? 'w-6 h-2 bg-primary' : i === current ? 'w-8 h-2 bg-primary' : 'w-2 h-2 bg-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  );
}

function OnboardingInner() {
  const navigate = useNavigate();
  const { user } = useSession();
  const [step, setStep] = useState(0);
  const [childName, setChildName] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [avatar, setAvatar] = useState('🦁');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function toggleSubject(id: string) {
    setSubjects(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  }

  async function handleFinish() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API_PREFIX}/children`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: childName.trim(), ageGroup, avatarEmoji: avatar }),
      });
      if (!res.ok) throw new Error('Could not save child profile');
      setStep(5);
    } catch {
      setError('Something went wrong — please try again.');
      setSaving(false);
    }
  }

  const slideVariants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  return (
    <>
      <Helmet>
        <title>Get Started — Set Up Your Child's Profile | Sodafom</title>
        <meta name="description" content="Set up your child's Sodafom profile in 60 seconds. Choose their name, age group, and favourite subjects to personalise their learning journey." />
        <link rel="canonical" href="https://sodafom.uk/onboarding" />
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <img src="/assets/uploads/airo-logo-shimmer-horizontal.svg" alt="Sodafom" className="h-10 w-auto mx-auto object-contain" width={160} height={40} />
          </div>

          <div className="bg-card rounded-3xl border border-border shadow-xl p-8">
            {step < 5 && <StepIndicator current={step} total={5} />}

            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="step-0" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: 'easeOut' as const }} className="text-center">
                  <div className="text-6xl mb-4">👋</div>
                  <h1 className="text-2xl font-black text-foreground mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                    Welcome to Sodafom{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
                  </h1>
                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    Let's set up your child's profile so we can personalise their learning journey. It only takes 60 seconds!
                  </p>
                  <button onClick={() => setStep(1)} className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black text-lg hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2">
                    Let's go! <ChevronRight size={20} />
                  </button>
                  <button onClick={() => navigate('/hub')} className="mt-3 w-full py-3 rounded-2xl text-muted-foreground text-sm hover:text-foreground transition-colors">
                    Skip for now
                  </button>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="step-1" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: 'easeOut' as const }}>
                  <h2 className="text-2xl font-black text-foreground mb-2 text-center" style={{ fontFamily: 'var(--font-heading)' }}>
                    What's your child's name?
                  </h2>
                  <p className="text-muted-foreground text-sm text-center mb-8">We'll use this to personalise their experience and certificates.</p>
                  <input
                    type="text"
                    value={childName}
                    onChange={e => setChildName(e.target.value)}
                    placeholder="e.g. Amara, Jake, Lily…"
                    maxLength={30}
                    autoFocus
                    className="w-full px-5 py-4 rounded-2xl border-2 border-border bg-background text-foreground text-lg font-bold placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors mb-6"
                    onKeyDown={e => e.key === 'Enter' && childName.trim() && setStep(2)}
                  />
                  <div className="flex gap-3">
                    <button onClick={() => setStep(0)} className="flex items-center gap-1 px-5 py-3 rounded-2xl border border-border text-muted-foreground hover:text-foreground transition-colors">
                      <ChevronLeft size={16} /> Back
                    </button>
                    <button onClick={() => setStep(2)} disabled={!childName.trim()} className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-black hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 disabled:scale-100 flex items-center justify-center gap-2">
                      Next <ChevronRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step-2" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: 'easeOut' as const }}>
                  <h2 className="text-2xl font-black text-foreground mb-2 text-center" style={{ fontFamily: 'var(--font-heading)' }}>
                    How old is {childName || 'your child'}?
                  </h2>
                  <p className="text-muted-foreground text-sm text-center mb-8">We'll show age-appropriate games and challenges.</p>
                  <div className="space-y-3 mb-6">
                    {onboarding.AGE_GROUPS.map((ag) => (
                      <button key={ag.id} onClick={() => setAgeGroup(ag.id)} className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${ageGroup === ag.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
                        <span className="text-3xl">{ag.emoji}</span>
                        <div>
                          <div className="font-black text-foreground">{ag.label}</div>
                          <div className="text-xs text-muted-foreground">{ag.description}</div>
                        </div>
                        {ageGroup === ag.id && <Check size={20} className="ml-auto text-primary shrink-0" />}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="flex items-center gap-1 px-5 py-3 rounded-2xl border border-border text-muted-foreground hover:text-foreground transition-colors">
                      <ChevronLeft size={16} /> Back
                    </button>
                    <button onClick={() => setStep(3)} disabled={!ageGroup} className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-black hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 disabled:scale-100 flex items-center justify-center gap-2">
                      Next <ChevronRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step-3" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: 'easeOut' as const }}>
                  <h2 className="text-2xl font-black text-foreground mb-2 text-center" style={{ fontFamily: 'var(--font-heading)' }}>
                    What does {childName || 'your child'} enjoy?
                  </h2>
                  <p className="text-muted-foreground text-sm text-center mb-8">Pick one or more subjects — you can always change this later.</p>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {onboarding.SUBJECTS.map((s) => (
                      <button key={s.id} onClick={() => toggleSubject(s.id)} className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all ${subjects.includes(s.id) ? `border-primary ${s.color}` : 'border-border hover:border-primary/40'}`}>
                        <span className="text-4xl">{s.emoji}</span>
                        <span className="font-black text-foreground text-sm">{s.label}</span>
                        {subjects.includes(s.id) && <Check size={16} className="text-primary" />}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(2)} className="flex items-center gap-1 px-5 py-3 rounded-2xl border border-border text-muted-foreground hover:text-foreground transition-colors">
                      <ChevronLeft size={16} /> Back
                    </button>
                    <button onClick={() => setStep(4)} className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-black hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2">
                      {subjects.length === 0 ? 'Skip' : 'Next'} <ChevronRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="step-4" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: 'easeOut' as const }}>
                  <h2 className="text-2xl font-black text-foreground mb-2 text-center" style={{ fontFamily: 'var(--font-heading)' }}>
                    Pick {childName || 'their'}'s avatar
                  </h2>
                  <p className="text-muted-foreground text-sm text-center mb-8">This will appear on the leaderboard and certificates.</p>
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    {onboarding.AVATAR_EMOJIS.map((emoji) => (
                      <button key={emoji} onClick={() => setAvatar(emoji)} className={`aspect-square rounded-2xl text-3xl flex items-center justify-center border-2 transition-all hover:scale-110 ${avatar === emoji ? 'border-primary bg-primary/10 scale-110' : 'border-border hover:border-primary/40'}`}>
                        {emoji}
                      </button>
                    ))}
                  </div>
                  {error && <p className="text-secondary text-sm text-center mb-4">{error}</p>}
                  <div className="flex gap-3">
                    <button onClick={() => setStep(3)} className="flex items-center gap-1 px-5 py-3 rounded-2xl border border-border text-muted-foreground hover:text-foreground transition-colors">
                      <ChevronLeft size={16} /> Back
                    </button>
                    <button onClick={handleFinish} disabled={saving} className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-black hover:scale-105 active:scale-95 transition-transform disabled:opacity-60 disabled:scale-100 flex items-center justify-center gap-2">
                      {saving ? 'Saving…' : 'Create profile'} <ChevronRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 5 && (
                <motion.div key="step-5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: 'easeOut' as const }} className="text-center">
                  <motion.div animate={{ rotate: [0, 10, -10, 10, 0], scale: [1, 1.2, 1] }} transition={{ duration: 0.8, ease: 'easeOut' as const }} className="text-7xl mb-4">
                    🎉
                  </motion.div>
                  <h2 className="text-2xl font-black text-foreground mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                    {childName}'s profile is ready!
                  </h2>
                  <p className="text-muted-foreground mb-2 leading-relaxed">Time to earn some stars! Head to the games page and start playing.</p>
                  <div className="flex items-center justify-center gap-1 text-accent font-bold mb-8">
                    {[...Array(3)].map((_, i) => (
                      <motion.div key={i} animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity, ease: 'easeInOut' as const }}>
                        <Star size={24} className="fill-accent" />
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-3">
                    <button onClick={() => navigate('/games')} className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black text-lg hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2">
                      Start playing! <ChevronRight size={20} />
                    </button>
                    <button onClick={() => navigate('/hub')} className="w-full py-3 rounded-2xl border border-border text-muted-foreground hover:text-foreground transition-colors text-sm">
                      Go to my hub
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </>
  );
}

export default function OnboardingPage() {
  return (
    <ProtectedRoute>
      <OnboardingInner />
    </ProtectedRoute>
  );
}
