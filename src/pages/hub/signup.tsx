/**
 * /signup — Create account + choose a plan
 *
 * Step 1: Full details form (name, email, phone, password)
 * Step 2: Payment plan selection (Monthly / Annual / School / Free trial)
 * After account creation the user picks a plan and goes straight to Stripe checkout.
 * Promo codes bypass payment entirely.
 */
import { useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { signUp } from '@/lib/auth/auth-client.tsx';
import { API_PREFIX } from '@/lib/config';
import {
  Eye, EyeOff, KeyRound, CheckCircle, ArrowRight,
  CreditCard, Calendar, School, Sparkles, Shield, Lock,
  User, Mail, Phone, ChevronRight, Star,
} from 'lucide-react';
const siteUrl = 'https://sodafom.uk';

// ── Plans ─────────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'monthly',
    emoji: '📅',
    label: 'Monthly',
    price: '£2.99',
    period: '/month',
    priceId: 'price_1U5bazK4qwt1chs3b6cnitbe',
    description: 'Flexible — cancel anytime',
    highlight: false,
    badge: null,
    features: ['All games & activities', 'Star rewards system', 'Progress tracking', 'Cancel anytime'],
    icon: Calendar,
    color: 'border-border hover:border-primary',
    selectedColor: 'border-primary bg-primary/5',
    btnColor: 'bg-primary text-primary-foreground',
  },
  {
    id: 'annual',
    emoji: '🏆',
    label: 'Annual',
    price: '£19.99',
    period: '/year',
    priceId: 'price_1U5bb5K4qwt1chs3WvIrzKfS',
    description: 'Best value — Save over 40%',
    highlight: true,
    badge: 'BEST VALUE',
    features: ['Everything in Monthly', 'Huge saving vs monthly', 'Priority new games', 'Family dashboard'],
    icon: Star,
    color: 'border-accent/40 hover:border-accent',
    selectedColor: 'border-accent bg-accent/5',
    btnColor: 'bg-accent text-accent-foreground',
  },
  {
    id: 'school',
    emoji: '🏫',
    label: 'School Plan',
    price: '£1',
    period: '/pupil/year',
    priceId: 'price_1U67njK4qwt1chs37hn3EUeh',
    description: 'Only £1 per pupil per year',
    highlight: false,
    badge: 'For schools',
    features: ['Unlimited pupils', 'All games & subjects', 'Teacher dashboard', 'Dedicated support'],
    icon: School,
    color: 'border-secondary/40 hover:border-secondary',
    selectedColor: 'border-secondary bg-secondary/5',
    btnColor: 'bg-secondary text-secondary-foreground',
  },
] as const;

type PlanId = typeof PLANS[number]['id'];

// ── Animations ────────────────────────────────────────────────────────────────
const slideIn = {
  hidden:  { opacity: 0, x: 48, scale: 0.98 },
  visible: { opacity: 1, x: 0,  scale: 1,   transition: { duration: 0.38, ease: 'easeOut' as const } },
  exit:    { opacity: 0, x: -48, scale: 0.98, transition: { duration: 0.22, ease: 'easeIn' as const } },
} as const;

const fadeUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
} as const;

const errorSlide = {
  hidden:  { opacity: 0, y: -8, height: 0 },
  visible: { opacity: 1, y: 0,  height: 'auto', transition: { duration: 0.25, ease: 'easeOut' as const } },
  exit:    { opacity: 0, y: -4, height: 0,      transition: { duration: 0.15 } },
} as const;

// ── Step indicator ────────────────────────────────────────────────────────────
function StepDots({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2].map((s) => (
        <div
          key={s}
          className={`rounded-full transition-all duration-300 ${
            s === step ? 'w-8 h-2.5 bg-primary' : s < step ? 'w-2.5 h-2.5 bg-primary/40' : 'w-2.5 h-2.5 bg-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const promoFromUrl = searchParams.get('promo')?.toUpperCase() ?? '';
  const refCode     = searchParams.get('ref') ?? '';
  const redirectTo   = searchParams.get('redirect') ?? '';

  // Step 1 fields
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  // Step 2
  const [step, setStep]             = useState<1 | 2>(1);
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('annual');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError]     = useState('');

  // ── Step 1: create account ─────────────────────────────────────────────────
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const result = await signUp.email({
        name,
        email,
        password,
        // @ts-ignore - custom field
        phoneNumber: phone,
      });

      if (result.error) {
        const msg = result.error.message ?? '';
        console.error('Sign up error:', result.error);

        if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exists') || result.error.status === 422 || result.error.status === 409) {
          setError('An account with this email already exists. Please sign in instead.');
        } else {
          setError(msg || 'Sign up failed. Please try again.');
        }
        return;
      }

      // Track referral if a ref code was in the URL
      if (refCode) {
        try {
          await fetch(`${API_PREFIX}/referral/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ code: refCode }),
          });
        } catch { /* non-fatal */ }
      }

      // Promo code path — redeem and skip payment
      if (promoFromUrl) {
        try {
          const res = await fetch(`${API_PREFIX}/promo/redeem`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ code: promoFromUrl }),
          });
          const data = (await res.json()) as { success: boolean };
          if (data.success) { navigate('/games', { replace: true }); return; }
        } catch { /* fall through */ }
      }

      // Redirect path — e.g. came from /subscribe button while not logged in
      if (redirectTo) {
        navigate(redirectTo, { replace: true });
        return;
      }

      // FOR TESTING: Bypass plan selection and go straight to the hub
      navigate('/hub', { replace: true });
      // Move to plan selection (DISABLED FOR TESTING)
      // setStep(2);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleStartPlan = async () => {
    const plan = PLANS.find((p) => p.id === selectedPlan);
    if (!plan) return;
    setCheckoutLoading(true);
    setCheckoutError('');
    try {
      const res = await fetch(`${API_PREFIX}/subscription/create-trial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          priceId: plan.priceId,
          successUrl: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${siteUrl}/signup`,
        }),
      });
      const data = (await res.json()) as { success: boolean; url?: string; error?: string };
      if (!data.success || !data.url) {
        setCheckoutError(data.error ?? 'Could not start checkout. Please try again.');
        return;
      }
      window.location.href = data.url;
    } catch {
      setCheckoutError('Something went wrong. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create Account — Sodafom</title>
        <meta name="description" content="Create your Sodafom account and choose a learning plan for your child." />
        <link rel="canonical" href={`${siteUrl}/signup`} />
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="min-h-screen bg-background flex items-center justify-center p-4 py-10">
        <motion.div
          className="w-full max-w-lg"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' as const }}
        >

          {/* Logo */}
          <div className="text-center mb-6">
            <Link to="/">
              <img
                src="/assets/uploads/airo-logo-shimmer-horizontal.svg"
                alt="Sodafom"
                className="h-12 w-auto mx-auto object-contain"
              />
            </Link>
          </div>

          <StepDots step={step} />

          <AnimatePresence mode="wait">

            {/* ── STEP 1: Account details ── */}
            {step === 1 && (
              <motion.div key="step1" variants={slideIn} initial="hidden" animate="visible" exit="exit">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                    Create your account
                  </h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    Step 1 of 2 — your details
                  </p>
                </div>

                {/* Subscribe redirect banner */}
                {redirectTo === '/subscribe' && !promoFromUrl && (
                  <motion.div
                    variants={fadeUp} initial="hidden" animate="visible"
                    className="mb-5 flex items-center gap-3 bg-accent/10 border-2 border-accent/30 rounded-2xl px-5 py-4"
                  >
                    <Sparkles size={20} className="text-accent-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-black text-foreground">
                        Almost there — create your account first
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Once your account is set up you'll choose your plan and start your 7-day free trial.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Promo banner */}
                {promoFromUrl && (
                  <motion.div
                    variants={fadeUp} initial="hidden" animate="visible"
                    className="mb-5 flex items-center gap-3 bg-primary/10 border-2 border-primary/30 rounded-2xl px-5 py-4"
                  >
                    <KeyRound size={20} className="text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-black text-foreground">
                        Access code: <span className="text-primary">{promoFromUrl}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Full access will be unlocked instantly — no card required.
                      </p>
                    </div>
                  </motion.div>
                )}

                <div className="bg-card rounded-3xl border-2 border-border p-7 shadow-sm">
                  <form onSubmit={handleCreateAccount} className="flex flex-col gap-4">

                    {/* Name */}
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                        <User size={14} className="text-muted-foreground" /> Full name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="e.g. Sarah Johnson"
                        className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground focus:outline-none focus:border-primary font-bold text-sm transition-colors"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                        <Mail size={14} className="text-muted-foreground" /> Email address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground focus:outline-none focus:border-primary font-bold text-sm transition-colors"
                      />
                    </div>

                    {/* Phone (optional) */}
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                        <Phone size={14} className="text-muted-foreground" /> Phone number
                        <span className="text-muted-foreground font-normal text-xs">(optional)</span>
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+44 7700 900000"
                        className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground focus:outline-none focus:border-primary font-bold text-sm transition-colors"
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                        <Lock size={14} className="text-muted-foreground" /> Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPw ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={8}
                          placeholder="At least 8 characters"
                          className="w-full px-4 py-3 pr-11 rounded-xl border-2 border-border bg-background text-foreground focus:outline-none focus:border-primary font-bold text-sm transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          aria-label={showPw ? 'Hide password' : 'Show password'}
                        >
                          {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Minimum 8 characters</p>
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.div key="err1" variants={errorSlide} initial="hidden" animate="visible" exit="exit"
                          className="overflow-hidden">
                          <p className="text-destructive text-sm font-bold bg-destructive/5 border border-destructive/20 rounded-xl px-3 py-2.5">
                            ⚠️ {error}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-black text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
                    >
                    {loading ? 'Creating account…' : (
                        <><span>{promoFromUrl ? 'Create account & unlock access' : redirectTo ? 'Create account & choose a plan' : 'Continue to choose a plan'}</span> <ArrowRight size={16} /></>
                      )}
                    </button>
                  </form>

                  <p className="text-center text-sm text-muted-foreground mt-5">
                    Already have an account?{' '}
                    <Link
                      to={promoFromUrl ? `/hub/login?promo=${encodeURIComponent(promoFromUrl)}` : '/hub/login'}
                      className="text-primary font-bold hover:underline"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap justify-center gap-4 mt-5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Shield size={12} /> Secure & private</span>
                  <span className="flex items-center gap-1"><Lock size={12} /> No spam, ever</span>
                  <span className="flex items-center gap-1"><CheckCircle size={12} /> Cancel anytime</span>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Choose a plan ── */}
            {step === 2 && (
              <motion.div key="step2" variants={slideIn} initial="hidden" animate="visible" exit="exit">
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle size={28} className="text-primary" />
                  </div>
                  <h2 className="text-2xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                    Account created! 🎉
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Step 2 of 2 — choose your plan
                  </p>
                </div>

                {/* 7-day trial callout */}
                <div className="mb-5 flex items-center gap-3 bg-accent/10 border-2 border-accent/30 rounded-2xl px-5 py-3">
                  <Sparkles size={18} className="text-accent-foreground shrink-0" />
                  <p className="text-sm font-bold text-foreground">
                    All plans include a <span className="text-primary">7-day free trial</span> — your card won't be charged until the trial ends.
                  </p>
                </div>

                {/* Plan cards */}
                <div className="flex flex-col gap-3 mb-5">
                  {PLANS.map((plan) => {
                    const Icon = plan.icon;
                    const isSelected = selectedPlan === plan.id;
                    return (
                      <button
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`w-full text-left rounded-2xl border-2 p-4 transition-all duration-200 ${
                          isSelected ? plan.selectedColor : plan.color + ' bg-card'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Radio dot */}
                          <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                          }`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xl">{plan.emoji}</span>
                              <span className="font-black text-foreground text-base" style={{ fontFamily: 'var(--font-heading)' }}>
                                {plan.label}
                              </span>
                              {plan.badge && (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                                  plan.id === 'annual' ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground'
                                }`}>
                                  {plan.badge}
                                </span>
                              )}
                            </div>
                            <div className="flex items-baseline gap-1 mt-0.5">
                              <span className="text-2xl font-black text-foreground">{plan.price}</span>
                              <span className="text-muted-foreground text-sm">{plan.period}</span>
                            </div>
                            <p className="text-muted-foreground text-xs mt-0.5">{plan.description}</p>

                            {/* Features — show when selected */}
                            <AnimatePresence>
                              {isSelected && (
                                <motion.ul
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-2 space-y-1 overflow-hidden"
                                >
                                  {plan.features.map((f) => (
                                    <li key={f} className="flex items-center gap-1.5 text-xs text-foreground">
                                      <CheckCircle size={11} className="text-primary shrink-0" />
                                      <span>{f}</span>
                                    </li>
                                  ))}
                                </motion.ul>
                              )}
                            </AnimatePresence>
                          </div>

                          <Icon size={20} className="text-muted-foreground shrink-0 mt-1" />
                        </div>
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {checkoutError && (
                    <motion.div key="err2" variants={errorSlide} initial="hidden" animate="visible" exit="exit"
                      className="overflow-hidden mb-3">
                      <p className="text-destructive text-sm font-bold bg-destructive/5 border border-destructive/20 rounded-xl px-3 py-2.5">
                        ⚠️ {checkoutError}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* CTA */}
                <button
                  onClick={handleStartPlan}
                  disabled={checkoutLoading}
                  className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black text-base hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg"
                >
                  {checkoutLoading ? 'Redirecting to payment…' : (
                    <><CreditCard size={18} /> Start 7-day free trial <ChevronRight size={16} /></>
                  )}
                </button>

                {/* Trust */}
                <div className="flex flex-wrap justify-center gap-4 mt-5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><CreditCard size={12} /> Card required — no charge for 7 days</span>
                  <span className="flex items-center gap-1"><Shield size={12} /> Secure checkout by Stripe</span>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          <p className="text-center text-xs text-muted-foreground mt-6">
            <Link to="/" className="hover:underline">← Back to Sodafom</Link>
          </p>
        </motion.div>
      </main>
    </>
  );
}
