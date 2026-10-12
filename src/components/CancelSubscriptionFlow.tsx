/**
 * CancelSubscriptionFlow
 * A multi-step modal that walks the user through cancellation:
 *   Step 1 — Reason selection
 *   Step 2 — Retention offer (1 month free)
 *   Step 3 — Final confirmation
 *   Step 4 — Confirmed / done
 *
 * Usage: <CancelSubscriptionFlow onClose={() => {}} onCancelled={() => {}} />
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, Gift, AlertTriangle, CheckCircle, Heart } from 'lucide-react';
import { API_PREFIX } from '@/lib/config';

interface Props {
  onClose: () => void;
  onCancelled: () => void;
}

const REASONS = [
  { id: 'too_expensive',   label: 'It\'s too expensive' },
  { id: 'not_using',       label: 'We\'re not using it enough' },
  { id: 'missing_feature', label: 'Missing a feature I need' },
  { id: 'child_too_old',   label: 'My child has outgrown it' },
  { id: 'technical',       label: 'Technical problems' },
  { id: 'other',           label: 'Other reason' },
];

type Step = 'reason' | 'offer' | 'confirm' | 'done';

export default function CancelSubscriptionFlow({ onClose, onCancelled }: Props) {
  const [step, setStep] = useState<Step>('reason');
  const [reason, setReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');

  const showOffer = reason === 'too_expensive' || reason === 'not_using';

  async function doCancel() {
    setCancelling(true); setError('');
    try {
      const res = await fetch(`${API_PREFIX}/subscription/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setStep('done');
      onCancelled();
    } catch (e) {
      setError(String(e));
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-card border-2 border-border rounded-3xl p-6 max-w-md w-full shadow-2xl"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center">
              {step === 'done' ? <CheckCircle size={16} className="text-green-600" /> : <Heart size={16} className="text-destructive" />}
            </div>
            <span className="font-black text-foreground text-sm">
              {step === 'reason' && 'Cancel subscription'}
              {step === 'offer' && 'Wait — a gift for you'}
              {step === 'confirm' && 'Are you sure?'}
              {step === 'done' && 'Subscription cancelled'}
            </span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground">
            <X size={16} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* ── Step 1: Reason ─────────────────────────────────────────────── */}
          {step === 'reason' && (
            <motion.div key="reason" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                We're sorry to see you go. Could you tell us why you're leaving? It helps us improve Sodafom for everyone.
              </p>
              <div className="space-y-2 mb-5">
                {REASONS.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setReason(r.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-bold transition-colors
                      ${reason === r.id ? 'border-primary bg-primary/5 text-primary' : 'border-border text-foreground hover:border-primary/40'}`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border-2 border-border text-muted-foreground font-bold text-sm hover:bg-muted transition-colors">
                  Keep subscription
                </button>
                <button
                  onClick={() => reason && (showOffer ? setStep('offer') : setStep('confirm'))}
                  disabled={!reason}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-black text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  Continue <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Retention offer ────────────────────────────────────── */}
          {step === 'offer' && (
            <motion.div key="offer" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-center mb-5">
                <div className="text-5xl mb-3">🎁</div>
                <h2 className="font-black text-foreground text-xl mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  Before you go…
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {reason === 'too_expensive'
                    ? 'We\'d love to keep you. How about 1 month completely free? No charge, no strings — just keep learning.'
                    : 'Life gets busy! Take a break and come back when you\'re ready. We\'ll keep all your progress safe.'}
                </p>
              </div>

              <div className="bg-accent/10 border-2 border-accent/40 rounded-2xl p-4 mb-5 flex items-start gap-3">
                <Gift size={20} className="text-accent-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="font-black text-foreground text-sm">
                    {reason === 'too_expensive' ? '1 month free — on us' : 'Your progress is always saved'}
                  </p>
                  <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">
                    {reason === 'too_expensive'
                      ? 'We\'ll apply a free month to your account right now. Contact us at sodafom.uk@gmail.com to claim it.'
                      : 'All stars, streaks, and certificates are stored safely. You can reactivate any time.'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-sm hover:opacity-90 transition-opacity"
                >
                  {reason === 'too_expensive' ? 'Claim free month' : 'Keep my account'}
                </button>
                <button
                  onClick={() => setStep('confirm')}
                  className="flex-1 py-2.5 rounded-xl border-2 border-border text-muted-foreground font-bold text-sm hover:bg-muted transition-colors"
                >
                  Still cancel
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Final confirm ──────────────────────────────────────── */}
          {step === 'confirm' && (
            <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4 mb-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={18} className="text-destructive mt-0.5 shrink-0" />
                  <div>
                    <p className="font-black text-foreground text-sm mb-1">What happens when you cancel</p>
                    <ul className="text-muted-foreground text-xs space-y-1 leading-relaxed">
                      <li>• Your subscription stays active until the end of the current billing period</li>
                      <li>• All children's progress, stars, and certificates are saved</li>
                      <li>• You can reactivate at any time from the Subscribe page</li>
                    </ul>
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-destructive text-sm font-bold mb-3">{error}</p>
              )}

              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border-2 border-border text-muted-foreground font-bold text-sm hover:bg-muted transition-colors">
                  Keep subscription
                </button>
                <button
                  onClick={doCancel}
                  disabled={cancelling}
                  className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-black text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {cancelling ? 'Cancelling…' : 'Yes, cancel'}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 4: Done ──────────────────────────────────────────────── */}
          {step === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-2">
              <CheckCircle size={44} className="text-green-500 mx-auto mb-3" />
              <h2 className="font-black text-foreground text-lg mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                Subscription cancelled
              </h2>
              <p className="text-muted-foreground text-sm mb-5 leading-relaxed">
                Your access continues until the end of your billing period. All progress is saved — you're welcome back any time.
              </p>
              <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-sm hover:opacity-90 transition-opacity">
                Close
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
