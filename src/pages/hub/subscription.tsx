/**
 * /hub/subscription — Subscription management page
 * Shows current plan, billing date, upgrade/cancel options.
 */
import { useState, useEffect } from 'react';
import { API_PREFIX } from '@/lib/config';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import { ArrowLeft, CreditCard, CheckCircle, Clock, AlertTriangle, Zap, Crown, School, ExternalLink } from 'lucide-react';
import { Link } from 'react-router';
import { ProtectedRoute } from '@/lib/auth/auth-client';

interface SubscriptionData {
  subscribed: boolean;
  status: 'none' | 'trial_active' | 'trial_expired' | 'active' | 'cancelled' | 'school';
  plan?: string;
  trialEndsAt?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  promoAccess?: boolean;
}

const STATUS_CONFIG = {
  none:          { icon: <AlertTriangle size={20} className="text-muted-foreground" />, label: 'No active plan',    color: 'text-muted-foreground', bg: 'bg-muted' },
  trial_active:  { icon: <Clock size={20} className="text-blue-600" />,                label: 'Free trial active', color: 'text-blue-700',          bg: 'bg-blue-50 border-blue-200' },
  trial_expired: { icon: <AlertTriangle size={20} className="text-amber-600" />,       label: 'Trial ended',       color: 'text-amber-700',         bg: 'bg-amber-50 border-amber-200' },
  active:        { icon: <CheckCircle size={20} className="text-green-600" />,         label: 'Active',            color: 'text-green-700',         bg: 'bg-green-50 border-green-200' },
  cancelled:     { icon: <AlertTriangle size={20} className="text-destructive" />,     label: 'Cancelled',         color: 'text-destructive',       bg: 'bg-destructive/10 border-destructive/20' },
  school:        { icon: <School size={20} className="text-primary" />,                label: 'School plan',       color: 'text-primary',           bg: 'bg-primary/10 border-primary/20' },
};

function SubscriptionManager() {
  const [sub, setSub] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelDone, setCancelDone] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    fetch(`${API_PREFIX}/subscription`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => { setSub(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await fetch(`${API_PREFIX}/subscription/cancel`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        setCancelDone(true);
        setSub(prev => prev ? { ...prev, cancelAtPeriodEnd: true } : prev);
      }
    } catch { /* ignore */ }
    setCancelling(false);
    setShowCancelConfirm(false);
  };

  const statusKey = sub?.status ?? 'none';
  const cfg = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.none;

  const planLabel = sub?.plan === 'annual' ? 'Annual plan (£10/year)'
    : sub?.plan === 'monthly' ? 'Monthly plan (£1/month)'
    : sub?.plan === 'school' ? 'School plan (£100/year)'
    : 'No plan';

  const billingDate = sub?.currentPeriodEnd
    ? new Date(sub.currentPeriodEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const trialDate = sub?.trialEndsAt
    ? new Date(sub.trialEndsAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <main className="min-h-screen bg-muted py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/hub" className="p-2 rounded-xl bg-card border border-border hover:bg-muted transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
              My Subscription
            </h1>
            <p className="text-sm text-muted-foreground">Manage your Sodafom plan</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <div key={i} className="h-28 rounded-2xl bg-card border border-border animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Status card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-5 rounded-2xl border ${cfg.bg}`}
            >
              <div className="flex items-center gap-3 mb-3">
                {cfg.icon}
                <span className={`font-black text-base ${cfg.color}`}>{cfg.label}</span>
              </div>

              {sub?.subscribed || sub?.status === 'trial_active' ? (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Plan</span>
                    <span className="font-bold text-foreground">{planLabel}</span>
                  </div>
                  {trialDate && sub.status === 'trial_active' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Trial ends</span>
                      <span className="font-bold text-foreground">{trialDate}</span>
                    </div>
                  )}
                  {billingDate && sub.status === 'active' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {sub.cancelAtPeriodEnd ? 'Access until' : 'Next billing date'}
                      </span>
                      <span className="font-bold text-foreground">{billingDate}</span>
                    </div>
                  )}
                  {sub.cancelAtPeriodEnd && (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
                      Your subscription is cancelled and will not renew. You have full access until the date above.
                    </p>
                  )}
                  {cancelDone && (
                    <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mt-2">
                      Cancellation confirmed. You'll keep access until your billing period ends.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {sub?.status === 'trial_expired' || sub?.status === 'cancelled'
                    ? 'Your access has ended. Subscribe to keep learning.'
                    : 'Start a 7-day free trial to unlock all 118 games.'}
                </p>
              )}
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl border border-border p-5 space-y-3"
            >
              <h2 className="font-black text-foreground text-sm">Actions</h2>

              {/* Upgrade (show if on monthly or no plan) */}
              {(!sub?.subscribed || sub?.plan === 'monthly') && sub?.status !== 'school' && (
                <Link
                  to="/pricing"
                  className="flex items-center justify-between w-full p-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  <div className="flex items-center gap-2">
                    <Crown size={16} />
                    <span className="font-bold text-sm">
                      {sub?.plan === 'monthly' ? 'Upgrade to Annual — save £2' : 'Start 7-Day Free Trial'}
                    </span>
                  </div>
                  <ExternalLink size={14} />
                </Link>
              )}

              {/* Manage via Stripe portal (if active) */}
              {sub?.subscribed && sub.status === 'active' && !sub.cancelAtPeriodEnd && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="flex items-center justify-between w-full p-3 rounded-xl border border-border hover:bg-muted transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className="text-muted-foreground" />
                    <span className="font-bold text-sm text-foreground">Cancel subscription</span>
                  </div>
                </button>
              )}

              {/* Resubscribe */}
              {(sub?.status === 'cancelled' || sub?.status === 'trial_expired') && (
                <Link
                  to="/pricing"
                  className="flex items-center justify-between w-full p-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  <div className="flex items-center gap-2">
                    <Zap size={16} />
                    <span className="font-bold text-sm">Resubscribe — from £1/month</span>
                  </div>
                  <ExternalLink size={14} />
                </Link>
              )}

              <Link
                to="/pricing"
                className="flex items-center gap-2 text-sm text-primary font-bold hover:underline"
              >
                View all plans →
              </Link>
            </motion.div>

            {/* What's included */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl border border-border p-5"
            >
              <h2 className="font-black text-foreground text-sm mb-3">What's included</h2>
              <ul className="space-y-2">
                {[
                  '118 educational games across Maths, Spelling, Reading & Science',
                  'Ages 5–7, 8–10, and 11–13 difficulty tiers',
                  'Star rewards, badges, and achievement certificates',
                  'Parent dashboard with progress charts',
                  'Daily Challenge with bonus stars',
                  'Leaderboard and Friend Battle mode',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle size={14} className="text-primary flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        )}

        {/* Cancel confirmation modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-2xl border border-border p-6 max-w-sm w-full shadow-xl"
            >
              <h3 className="font-black text-foreground text-lg mb-2">Cancel subscription?</h3>
              <p className="text-sm text-muted-foreground mb-5">
                You'll keep full access until your current billing period ends. You can resubscribe at any time.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border font-bold text-sm hover:bg-muted transition-colors"
                >
                  Keep my plan
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {cancelling ? 'Cancelling…' : 'Yes, cancel'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function SubscriptionPage() {
  return (
    <>
      <Helmet>
        <title>My Subscription — Sodafom</title>
        <meta name="description" content="Manage your Sodafom subscription — view your plan, billing date, and upgrade or cancel at any time." />
        <link rel="canonical" href="https://sodafom.uk/hub/subscription" />
        <meta name="robots" content="noindex" />
      </Helmet>
      <ProtectedRoute redirectTo="/login">
        <SubscriptionManager />
      </ProtectedRoute>
    </>
  );
}
