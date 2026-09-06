/**
 * CancelSubscriptionButton
 * Shows a cancel button for active subscribers. Handles both Stripe and promo plans.
 * Includes a confirmation dialog before cancelling.
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { API_PREFIX } from '@/lib/config';

type CancelState = 'idle' | 'confirming' | 'loading' | 'done' | 'error';

interface Props {
  plan: string | null;
  /** Called after successful cancellation so parent can refresh state */
  onCancelled?: () => void;
  /** Visual variant — 'button' (default) shows a small text link, 'card' shows a full card */
  variant?: 'button' | 'card';
}

export default function CancelSubscriptionButton({ plan, onCancelled, variant = 'button' }: Props) {
  const [state, setState] = useState<CancelState>('idle');
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isPromo = plan === 'promo';

  const handleCancel = useCallback(async () => {
    setState('loading');
    try {
      const res = await fetch(`${API_PREFIX}/subscription/cancel`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason || 'User requested cancellation' }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? 'Cancellation failed');
      setState('done');
      setTimeout(() => onCancelled?.(), 2000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
      setState('error');
    }
  }, [reason, onCancelled]);

  if (state === 'done') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 text-green-600 font-bold text-sm"
      >
        <CheckCircle size={16} />
        {isPromo ? 'Access removed.' : 'Subscription cancelled — access continues until the end of your billing period.'}
      </motion.div>
    );
  }

  if (variant === 'card') {
    return (
      <>
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-black text-sm text-foreground">
                {isPromo ? 'Promo access' : 'Active subscription'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isPromo
                  ? 'You have full access via a promo code.'
                  : 'You have full access to all games.'}
              </p>
            </div>
            <button
              onClick={() => setState('confirming')}
              className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-destructive hover:text-destructive/80 border border-destructive/30 hover:border-destructive/60 px-3 py-1.5 rounded-xl transition-all"
            >
              <X size={12} />
              Cancel
            </button>
          </div>
        </div>

        {/* Confirmation dialog */}
        <AnimatePresence>
          {(state === 'confirming' || state === 'loading' || state === 'error') && (
            <CancelDialog
              isPromo={isPromo}
              reason={reason}
              onReasonChange={setReason}
              onConfirm={handleCancel}
              onClose={() => { setState('idle'); setErrorMsg(''); }}
              loading={state === 'loading'}
              error={state === 'error' ? errorMsg : null}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  // Default: small text link
  return (
    <>
      <button
        onClick={() => setState('confirming')}
        className="text-xs text-muted-foreground hover:text-destructive underline underline-offset-2 transition-colors font-semibold"
      >
        Cancel subscription
      </button>

      <AnimatePresence>
        {(state === 'confirming' || state === 'loading' || state === 'error') && (
          <CancelDialog
            isPromo={isPromo}
            reason={reason}
            onReasonChange={setReason}
            onConfirm={handleCancel}
            onClose={() => { setState('idle'); setErrorMsg(''); }}
            loading={state === 'loading'}
            error={state === 'error' ? errorMsg : null}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Confirmation dialog ──────────────────────────────────────────────────────
interface DialogProps {
  isPromo: boolean;
  reason: string;
  onReasonChange: (v: string) => void;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
  error: string | null;
}

const REASONS = [
  'Too expensive',
  'My child finished using it',
  'Not enough games',
  'Technical problems',
  'Just taking a break',
  'Other',
];

function CancelDialog({ isPromo, reason, onReasonChange, onConfirm, onClose, loading, error }: DialogProps) {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={!loading ? onClose : undefined}
      />

      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 32 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
      >
        <div className="bg-card rounded-3xl shadow-2xl border-2 border-border w-full max-w-sm pointer-events-auto overflow-hidden">
          {/* Header */}
          <div className="bg-destructive/10 border-b border-destructive/20 px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/15 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} className="text-destructive" />
            </div>
            <div>
              <p className="font-black text-foreground text-sm">
                {isPromo ? 'Remove promo access?' : 'Cancel subscription?'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isPromo
                  ? 'Games will be locked immediately.'
                  : 'You keep access until the end of your billing period.'}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-4">
            {/* Reason picker */}
            <div>
              <p className="text-xs font-black text-muted-foreground uppercase tracking-wide mb-2">
                Why are you leaving? (optional)
              </p>
              <div className="flex flex-wrap gap-2">
                {REASONS.map(r => (
                  <button
                    key={r}
                    onClick={() => onReasonChange(reason === r ? '' : r)}
                    className={`text-xs px-3 py-1.5 rounded-full border font-bold transition-all ${
                      reason === r
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted text-muted-foreground border-border hover:border-primary/50'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-xs text-destructive font-bold bg-destructive/10 px-3 py-2 rounded-xl">
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-3 rounded-2xl border-2 border-border font-bold text-sm text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                Keep access
              </button>
              <motion.button
                onClick={onConfirm}
                disabled={loading}
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.97 } : {}}
                className="flex-1 py-3 rounded-2xl bg-destructive text-white font-black text-sm shadow hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 size={14} className="animate-spin" /> Cancelling…</>
                ) : (
                  'Yes, cancel'
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
