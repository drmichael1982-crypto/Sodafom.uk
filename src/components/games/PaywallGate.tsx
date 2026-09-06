/**
 * PaywallGate
 *
 * Wraps a game page. Behaviour:
 *  - Demo games (Number Pop, Spelling Bee, Phonics Parrot) → always pass through
 *  - trial_active  → pass through + show countdown banner at top
 *  - active        → pass through
 *  - everything else (none / trial_expired / cancelled) → show paywall overlay
 *
 * FOR TESTING: Bypassed to allow full access.
 */
import { motion } from 'motion/react';
import { Link, useLocation } from "react-router";
import { Lock, Star, Zap, ArrowLeft, Clock, AlertCircle } from 'lucide-react';
import { useSubscription, isDemoGame } from '@/hooks/useSubscription';
import CancelSubscriptionButton from '@/components/CancelSubscriptionButton';
import { OPEN_TESTING_MODE } from '@/lib/testing-mode';

interface PaywallGateProps {
  children: React.ReactNode;
  gameTitle: string;
  gameEmoji: string;
  subject: 'maths' | 'spelling' | 'reading' | 'science' | 'art';
}

const subjectGradient: Record<string, string> = {
  maths: 'from-amber-500/20 to-amber-600/5',
  spelling: 'from-red-500/20 to-red-600/5',
  reading: 'from-green-700/20 to-green-800/5'
};

const PLANS = [{
  label: 'Monthly',
  price: '£1',
  period: '/month',
  href: '/subscribe',
  highlight: false
}, {
  label: 'Annual',
  price: '£10',
  period: '/year',
  href: '/subscribe',
  highlight: true,
  saving: 'Best value'
}, {
  label: 'School',
  price: '£100',
  period: '/year',
  href: '/pricing#school',
  highlight: false,
  saving: 'Unlimited devices'
}];

// ── Trial countdown banner ────────────────────────────────────────────────────
function TrialBanner({
  daysLeft
}: {
  daysLeft: number;
}) {
  const urgent = daysLeft <= 2;
  return <motion.div initial={{
    opacity: 0,
    y: -8
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.35
  }} className={`flex items-center justify-between gap-3 px-4 py-2.5 text-sm font-bold ${urgent ? 'bg-secondary text-white' : 'bg-accent text-accent-foreground'}`}>
      <span className="flex items-center gap-2">
        {urgent ? <AlertCircle size={15} /> : <Clock size={15} />}
        {daysLeft === 0 ? 'Your free trial ends today — add a payment method to keep access.' : `Free trial: ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
      </span>
      <Link to="/subscribe" className={`shrink-0 px-3 py-1 rounded-full text-xs font-black transition-opacity hover:opacity-80 ${urgent ? 'bg-white text-secondary' : 'bg-primary text-primary-foreground'}`}>
        {urgent ? 'Add card now' : 'Manage plan'}
      </Link>
    </motion.div>;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PaywallGate({
  children,
  gameTitle,
  gameEmoji,
  subject
}: PaywallGateProps) {
  const {
    pathname
  } = useLocation();
  const {
    subscribed,
    loading,
    status,
    daysLeft,
    plan
  } = useSubscription();

  // Open testing: grant access without creating a fake signed-in user.
  const forceFullAccess = OPEN_TESTING_MODE;
  if (forceFullAccess) return <div className="flex flex-col min-h-screen">{children}</div>;

  // Demo games are always free
  if (isDemoGame(pathname)) return <>{children}</>;

  // Loading skeleton
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>;
  }

  // Subscribed (active or in trial) — show game with optional trial banner
  if (subscribed) {
    return <div className="flex flex-col min-h-screen">
        {status === 'trial_active' && daysLeft !== null && <TrialBanner daysLeft={daysLeft} />}
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        {/* Subtle cancel link at the very bottom of every game for subscribed users */}
        <div className="py-2 flex justify-center border-t border-border/30 bg-background/50">
          <CancelSubscriptionButton plan={plan ?? null} variant="button" />
        </div>
      </div>;
  }

  // Not subscribed — show paywall
  const grad = (Object.hasOwn(subjectGradient, subject) ? subjectGradient[subject as keyof typeof subjectGradient] : undefined) ?? subjectGradient['maths'];
  const trialExpired = status === 'trial_expired' || status === 'cancelled';
  return <div className={`min-h-screen bg-gradient-to-b ${grad} bg-background flex flex-col`}>
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3 shadow-md">
        <Link to="/games" className="flex items-center gap-2 font-bold text-sm opacity-80 hover:opacity-100 transition-opacity">
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">Back to Games</span>
        </Link>
        <div className="flex items-center gap-2 mx-auto">
          <span className="text-2xl">{gameEmoji}</span>
          <span className="font-black text-lg" style={{
          fontFamily: 'var(--font-heading)'
        }}>{gameTitle}</span>
        </div>
        <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold">
          <Lock size={12} /> Premium
        </span>
      </div>

      {/* Blurred game preview */}
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none filter blur-sm opacity-30 scale-105">
          {children}
        </div>

        {/* Paywall overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-4 z-10">
          <motion.div initial={{
          opacity: 0,
          scale: 0.92,
          y: 24
        }} animate={{
          opacity: 1,
          scale: 1,
          y: 0
        }} transition={{
          duration: 0.45,
          ease: 'easeOut' as const
        }} className="w-full max-w-md bg-card rounded-3xl shadow-2xl border-2 border-primary/30 overflow-hidden">
            {/* Header */}
            <div className="bg-primary text-primary-foreground p-6 text-center">
              <motion.div animate={{
              rotate: [0, -8, 8, 0],
              scale: [1, 1.1, 1]
            }} transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut' as const
            }} className="text-5xl mb-3 inline-block">
                {trialExpired ? '⏰' : '🔒'}
              </motion.div>
              <h2 className="text-2xl font-black mb-1" style={{
              fontFamily: 'var(--font-heading)'
            }}>
                {trialExpired ? 'Trial ended' : 'Premium Game'}
              </h2>
              <p className="text-primary-foreground/75 text-sm">
                {trialExpired ? 'Your free trial has ended. Subscribe to keep playing.' : <><span className="font-bold">{gameTitle}</span> is part of the full Sodafom experience.</>}
              </p>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Trial CTA — most prominent */}
              <Link to="/subscribe" className="block w-full py-4 rounded-xl bg-accent text-accent-foreground font-black text-center text-base hover:opacity-90 transition-opacity shadow-md mb-4 flex items-center justify-center gap-2">
                <Zap size={18} />
                {trialExpired ? 'Resubscribe — from £1/month' : 'Start 7-Day Free Trial'}
              </Link>

              {!trialExpired && <p className="text-center text-xs text-muted-foreground font-bold mb-4">
                  Card required — no charge for 7 days. Cancel anytime.
                </p>}

              {/* Demo nudge */}
              <div className="bg-accent/15 border border-accent/40 rounded-2xl p-4 mb-5 flex items-start gap-3">
                <Star size={20} className="text-accent-foreground shrink-0 mt-0.5 fill-current" />
                <div>
                  <p className="font-black text-foreground text-sm mb-0.5">Try before you subscribe</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Play <strong>Number Pop</strong>, <strong>Spelling Bee</strong> and <strong>Phonics Parrot</strong> completely free — no card needed.
                  </p>
                  <Link to="/demo" className="inline-flex items-center gap-1.5 mt-2 text-xs font-black text-primary hover:underline">
                    <Zap size={12} /> Go to free demo →
                  </Link>
                </div>
              </div>

              {/* Plan pills */}
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Or choose a plan directly</p>
              <div className="flex flex-col gap-2">
                {PLANS.map(plan => <Link key={plan.label} to={plan.href} className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] ${plan.highlight ? 'border-primary bg-primary text-primary-foreground shadow-md' : 'border-border bg-muted/50 text-foreground hover:border-primary/50'}`}>
                    <span className="flex items-center gap-2">
                      {plan.highlight && <Star size={14} className="fill-current shrink-0" />}
                      {plan.label}
                      {plan.saving && <span className={`text-xs px-2 py-0.5 rounded-full font-black ${plan.highlight ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                          {plan.saving}
                        </span>}
                    </span>
                    <span className="font-black">
                      {plan.price}<span className="font-bold opacity-70">{plan.period}</span>
                    </span>
                  </Link>)}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>;
}
