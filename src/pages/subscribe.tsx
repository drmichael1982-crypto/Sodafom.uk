import { subscribe } from 'virtual:content';
/**
 * /subscribe — 7-Day Free Trial Sign-Up Page
 *
 * Users pick a plan (Monthly £1/mo or Annual £10/yr), sign in if needed,
 * then go to Stripe Checkout. Card is captured upfront; no charge for 7 days.
 * After the trial, Stripe auto-charges and keeps billing until cancelled.
 */
import React, { useState, useEffect } from 'react';
import { API_PREFIX } from '@/lib/config';
import { Link, useSearchParams, useNavigate } from "react-router";
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Star, Shield, RotateCcw, Zap, ArrowRight, CreditCard, Lock, AlertCircle, Loader2, Calendar } from 'lucide-react';
import PromoCodeBox from '@/components/PromoCodeBox';
import CancelSubscriptionButton from '@/components/CancelSubscriptionButton';
import { useSubscription } from '@/hooks/useSubscription';
const siteUrl = 'https://sodafom.uk';
const ogImage = `${siteUrl}/og-image.png`;

// ── Price IDs (registered in Stripe) ─────────────────────────────────────────
const PLANS = [{
  id: 'monthly',
  label: 'Monthly',
  emoji: '📅',
  price: '£2.99',
  period: '/month',
  priceId: 'price_1U5bazK4qwt1chs3b6cnitbe',
  description: 'Flexible — cancel anytime',
  highlight: false,
  saving: null
}, {
  id: 'annual',
  label: 'Annual',
  emoji: '🏆',
  price: '£19.99',
  period: '/year',
  priceId: 'price_1U5bb5K4qwt1chs3WvIrzKfS',
  description: 'Best value — SAVE OVER 40%',
  highlight: true,
  saving: 'BEST VALUE'
}] as const;

// ── Trust points ──────────────────────────────────────────────────────────────
const TRUST = [{
  icon: <CreditCard size={16} />,
  text: 'Charged immediately on signup'
}, {
  icon: <RotateCcw size={16} />,
  text: 'Monthly: rolls each month until you cancel'
}, {
  icon: <Shield size={16} />,
  text: 'Annual: full year from payment date'
}, {
  icon: <Lock size={16} />,
  text: 'Cancel via the icon — access stops immediately'
}];

// ── Animations ────────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut' as const
    }
  }
} as const;
const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08
    }
  }
} as const;

// ── Trial countdown display ───────────────────────────────────────────────────


// ── Main page ─────────────────────────────────────────────────────────────────
export default function SubscribePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  React.useEffect(() => {
    const isResearch = localStorage.getItem('sodafom_research_mode') === 'true' || localStorage.getItem('sodafom_free_access') === 'true';
    if (isResearch) navigate('/', { replace: true });
  }, [navigate]);

  const cancelled = searchParams.get('cancelled') === '1';
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { subscribed, plan: activePlan } = useSubscription();
  const plan = PLANS.find(p => p.id === selectedPlan)!;
  const handleStartTrial = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_PREFIX}/subscription/create-trial`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          priceId: plan.priceId
        })
      });
      const data = (await res.json()) as {
        success: boolean;
        url?: string;
        error?: string;
      };
      if (data.success && data.url) {
        window.location.href = data.url;
      } else if (data.error?.includes('sign in') || res.status === 401) {
        // Not logged in — send to signup with return URL so they create an account first
        window.location.href = `/hub/signup?redirect=/subscribe`;
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
        setLoading(false);
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };
  return <>
      <Helmet>
        <title>Start Your 7-Day Free Trial — Sodafom</title>
        <meta name="description" content="Try Sodafom free for 7 days. Full access to all 10 learning games for children ages 5–13. Card required — cancel anytime before day 7 and pay nothing." />
        <link rel="canonical" href={`${siteUrl}/subscribe`} />
        <meta property="og:title" content="Start Your 7-Day Free Trial — Sodafom" />
        <meta property="og:description" content="Full access to all 10 games free for 7 days. Card required — no charge until day 8." />
        <meta property="og:url" content={`${siteUrl}/subscribe`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>

      <main>
        {/* ── HERO ── */}
        <section className="bg-primary text-primary-foreground py-14 px-4 text-center relative overflow-hidden">
          {/* Floating emojis */}
          {['🎈', '⭐', '🐝', '🦜', '🎮', '✨'].map((em, i) => <motion.span key={i} className="absolute text-2xl pointer-events-none select-none opacity-40" style={{
          top: `${10 + i * 13}%`,
          left: i % 2 === 0 ? `${4 + i * 3}%` : undefined,
          right: i % 2 !== 0 ? `${4 + i * 3}%` : undefined
        }} animate={{
          y: [0, -8, 0]
        }} transition={{
          duration: 3 + i * 0.4,
          repeat: Infinity,
          ease: 'easeInOut' as const,
          delay: i * 0.2
        }}>
              {em}
            </motion.span>)}
          <motion.div variants={stagger} initial="hidden" animate="visible" className="relative z-10 max-w-2xl mx-auto">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/40 mb-5">
              <Zap size={14} className="text-accent" />
              <span className="text-accent font-black text-sm">Instant access — from £1/month</span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-black mb-4 leading-tight" style={{
            fontFamily: 'var(--font-heading)'
          }}>
              Unlock all games today
            </motion.h1>
            <motion.p variants={fadeUp} className="text-primary-foreground/75 text-lg max-w-xl mx-auto">
              Pay now and get <strong className="text-primary-foreground">instant full access</strong>. Monthly rolls each month. Annual gives you a full year from today.
            </motion.p>
          </motion.div>
        </section>

        {/* ── CANCELLED BANNER ── */}
        <AnimatePresence>
          {cancelled && <motion.div initial={{
          opacity: 0,
          y: -10
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0
        }} className="bg-secondary/10 border-b border-secondary/20 px-4 py-3 text-center">
              <p className="text-sm font-bold text-secondary flex items-center justify-center gap-2">
                <AlertCircle size={16} />
                No worries — your checkout was cancelled. Pick a plan below whenever you're ready.
              </p>
            </motion.div>}
        </AnimatePresence>

        {/* ── MAIN CONTENT ── */}
        <section className="py-14 px-4 bg-background">
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

            {/* LEFT — Plan selector + CTA */}
            <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col gap-6">

              {/* Plan picker */}
              <motion.div variants={fadeUp}>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Choose your plan</p>
                <div className="flex flex-col gap-3">
                  {PLANS.map(p => <button key={p.id} onClick={() => setSelectedPlan(p.id)} className={`flex items-center justify-between px-5 py-4 rounded-2xl border-2 font-bold text-sm transition-all hover:scale-[1.01] active:scale-[0.99] ${selectedPlan === p.id ? 'border-primary bg-primary/5 shadow-md' : 'border-border bg-card hover:border-primary/40'}`}>
                      <span className="flex items-center gap-3">
                        <span className="text-2xl">{p.emoji}</span>
                        <span className="flex flex-col items-start">
                          <span className="flex items-center gap-2">
                            {p.label}
                            {p.saving && <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-black">
                                {p.saving}
                              </span>}
                            {p.highlight && <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-black">
                                Best value
                              </span>}
                          </span>
                          <span className="text-xs font-bold text-muted-foreground">{p.description}</span>
                        </span>
                      </span>
                      <span className="font-black text-lg text-foreground">
                        {p.price}<span className="text-xs font-bold text-muted-foreground">{p.period}</span>
                      </span>
                    </button>)}
                </div>
              </motion.div>

              {/* How it works */}
              <motion.div variants={fadeUp} className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar size={16} className="text-primary" />
                  <p className="text-sm font-black text-foreground">How it works</p>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-black flex items-center justify-center shrink-0">1</span>
                    <p className="text-sm font-bold text-foreground leading-snug">
                      Pay now — <strong>{plan.price}{plan.period}</strong> charged immediately to your card.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-black flex items-center justify-center shrink-0">2</span>
                    <p className="text-sm font-bold text-foreground leading-snug">
                      {selectedPlan === 'annual'
                        ? 'Get full access for exactly 1 year from today.'
                        : 'Get full access immediately. Renews monthly on the same date.'}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-destructive text-destructive-foreground text-xs font-black flex items-center justify-center shrink-0">3</span>
                    <p className="text-sm font-bold text-foreground leading-snug">
                      Cancel via the icon on the Games page — <strong className="text-destructive">access stops immediately</strong> and bank payments stop.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Error */}
              <AnimatePresence>
                {error && <motion.div initial={{
                opacity: 0,
                y: -8
              }} animate={{
                opacity: 1,
                y: 0
              }} exit={{
                opacity: 0
              }} className="flex items-start gap-3 bg-secondary/10 border border-secondary/30 rounded-xl p-4 text-sm text-secondary font-bold">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    {error}
                  </motion.div>}
              </AnimatePresence>

              {/* CTA button */}
              <motion.div variants={fadeUp}>
                <motion.button whileHover={{
                scale: 1.02
              }} whileTap={{
                scale: 0.98
              }} onClick={handleStartTrial} disabled={loading} className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black text-lg flex items-center justify-center gap-3 hover:opacity-90 transition-opacity shadow-lg disabled:opacity-60">
                  {loading ? <><Loader2 size={20} className="animate-spin" /> Setting up your subscription…</> : <><Zap size={20} /> Subscribe Now — {plan.price}{plan.period} <ArrowRight size={18} /></>}
                </motion.button>
                <p className="text-center text-xs text-muted-foreground mt-3 font-bold">
                  You'll be taken to Stripe's secure checkout. Charged immediately.
                </p>
              </motion.div>

              {/* Trust badges */}
              <motion.div variants={fadeUp} className="grid grid-cols-2 gap-2">
                {TRUST.map(t => <div key={t.text} className="flex items-start gap-2 text-xs text-muted-foreground font-bold">
                    <span className="text-primary shrink-0 mt-0.5">{t.icon}</span>
                    {t.text}
                  </div>)}
              </motion.div>

              {/* Promo code */}
              <motion.div variants={fadeUp}>
                <PromoCodeBox />
              </motion.div>

              {/* Cancel subscription — shown only when already subscribed */}
              {subscribed && (
                <motion.div variants={fadeUp} className="pt-1">
                  <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-600 shrink-0" />
                      <span className="text-sm font-bold text-green-800 dark:text-green-300">
                        You have full access
                        {activePlan === 'promo' ? ' (promo code)' : activePlan ? ` (${activePlan})` : ''}
                      </span>
                    </div>
                    <CancelSubscriptionButton
                      plan={activePlan ?? null}
                      variant="button"
                      onCancelled={() => navigate('/', { replace: true })}
                    />
                  </div>
                </motion.div>
              )}

              <motion.div variants={fadeUp} className="text-center text-xs text-muted-foreground">
                Already have an account?{' '}
                <Link to="/hub" className="text-primary font-bold hover:underline">Go to your dashboard →</Link>
              </motion.div>
            </motion.div>

            {/* RIGHT — What's included */}
            <motion.div initial={{
            opacity: 0,
            x: 20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.5,
            delay: 0.15
          }} className="bg-card rounded-3xl border-2 border-primary/20 overflow-hidden shadow-lg">
              <div className="bg-primary text-primary-foreground p-6">
                <div className="text-4xl mb-3">🔑</div>
                <h2 className="text-xl font-black mb-1" style={{
                fontFamily: 'var(--font-heading)'
              }}>
                  Everything included
                </h2>
                <p className="text-primary-foreground/70 text-sm">Full access from day one of your trial.</p>
              </div>
              <div className="p-6">
                <ul className="flex flex-col gap-3 mb-6">
                  {subscribe.FEATURES.map(f => <li key={f} className="flex items-start gap-3">
                      <CheckCircle size={18} className="text-primary shrink-0 mt-0.5" />
                      <span className="text-sm font-bold text-foreground">{f}</span>
                    </li>)}
                </ul>

                {/* Subject pills */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                  {[{
                  label: '🔢 Maths',
                  color: 'bg-accent/20 text-accent-foreground border-accent/30'
                }, {
                  label: '🔤 Spelling',
                  color: 'bg-secondary/10 text-secondary border-secondary/30'
                }, {
                  label: '📖 Reading',
                  color: 'bg-primary/10 text-primary border-primary/30'
                }].map(s => <span key={s.label} className={`px-3 py-1 rounded-full text-xs font-bold border ${s.color}`}>
                      {s.label}
                    </span>)}
                </div>

                {/* Age groups */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Ages 5–7 ⭐', 'Ages 8–10 🚀', 'Ages 11–12 🏆'].map(ag => <span key={ag} className="px-3 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground">
                      {ag}
                    </span>)}
                </div>

                {/* Demo nudge */}
                <div className="mt-5 bg-accent/10 border border-accent/30 rounded-xl p-4 flex items-start gap-3">
                  <Star size={16} className="text-accent-foreground shrink-0 mt-0.5 fill-current" />
                  <div>
                    <p className="text-xs font-black text-foreground mb-0.5">Want to try first?</p>
                    <p className="text-xs text-muted-foreground">
                      Play <strong>Number Pop</strong>, <strong>Spelling Bee</strong> and <strong>Phonics Parrot</strong> free — no card needed.
                    </p>
                    <Link to="/demo" className="inline-flex items-center gap-1 mt-1.5 text-xs font-black text-primary hover:underline">
                      Go to free demo →
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </>;
}
