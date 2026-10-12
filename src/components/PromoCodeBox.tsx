/**
 * PromoCodeBox
 *
 * When a visitor enters a promo code and clicks Apply:
 * - If they are NOT signed in → send them straight to /hub/signup?promo=CODE
 *   so they fill in their details first; the code is auto-redeemed on arrival.
 * - If they ARE signed in → redeem the code immediately via the API.
 *
 * The "not signed in" path no longer makes a server round-trip — it goes
 * directly to signup so the user sees the details form instantly.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, CheckCircle, AlertCircle, ChevronDown, KeyRound, ArrowRight } from 'lucide-react';
import { useSession } from '@/lib/auth/auth-client.tsx';
import { API_PREFIX } from '@/lib/config';

export default function PromoCodeBox() {
  const { user, isPending } = useSession();
  const isSignedIn = !isPending && !!user?.id;

  const [open, setOpen]       = useState(false);
  const [code, setCode]       = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<{ ok: boolean; message: string } | null>(null);

  const handleApply = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    // ── Not signed in: go straight to signup with the code pre-filled ─────────
    if (!isSignedIn) {
      window.location.href = `/hub/signup?promo=${encodeURIComponent(trimmed)}`;
      return;
    }

    // ── Signed in: redeem immediately ─────────────────────────────────────────
    setLoading(true);
    setResult(null);
    try {
      const res  = await fetch(`${API_PREFIX}/promo/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: trimmed }),
      });
      const data = await res.json() as {
        success: boolean;
        message?: string;
        error?: string;
        requiresAuth?: boolean;
        validCode?: string;
      };

      if (data.success) {
        setResult({ ok: true, message: '🎉 Code accepted! You now have full access to Sodafom.' });
        setTimeout(() => { window.location.href = '/games'; }, 1800);
      } else if (data.requiresAuth) {
        // Shouldn't normally reach here (we already checked isSignedIn), but
        // handle gracefully just in case the session expired mid-request.
        window.location.href = `/hub/signup?promo=${encodeURIComponent(data.validCode ?? trimmed)}`;
      } else {
        setResult({ ok: false, message: data.error ?? 'Invalid code. Please check and try again.' });
        setLoading(false);
      }
    } catch {
      setResult({ ok: false, message: 'Network error. Please check your connection.' });
      setLoading(false);
    }
  };

  return (
    <div className="border-2 border-primary/30 rounded-2xl overflow-hidden bg-primary/5">
      {/* Toggle header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-primary/10 transition-colors text-sm font-bold text-foreground"
      >
        <span className="flex items-center gap-2">
          <KeyRound size={16} className="text-primary" />
          Have an access code? Enter it here — no card needed
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} className="text-muted-foreground" />
        </motion.span>
      </button>

      {/* Expandable body */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="promo-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' as const }}
            className="overflow-hidden"
          >
            <div className="px-5 py-4 flex flex-col gap-3 bg-card border-t border-primary/20">
              <p className="text-xs text-muted-foreground font-semibold">
                {isSignedIn
                  ? <>Enter your code below to get <strong className="text-primary">free full access</strong> — no payment required.</>
                  : <>Enter your code and we'll take you to sign up — <strong className="text-primary">no card required</strong>.</>
                }
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleApply()}
                  placeholder="Enter access or promotional code"
                  maxLength={32}
                  disabled={loading || result?.ok}
                  className="flex-1 px-4 py-2.5 rounded-xl border-2 border-border bg-background text-sm font-bold placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors disabled:opacity-50 uppercase tracking-widest"
                />
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleApply}
                  disabled={loading || !code.trim() || result?.ok}
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 shrink-0"
                >
                  {loading
                    ? <Loader2 size={16} className="animate-spin" />
                    : isSignedIn
                      ? 'Apply'
                      : <><span>Sign up</span><ArrowRight size={14} /></>
                  }
                </motion.button>
              </div>

              {/* Result message (signed-in path only) */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${
                      result.ok
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-secondary/10 border border-secondary/30 text-secondary'
                    }`}
                  >
                    {result.ok
                      ? <CheckCircle size={16} className="shrink-0 mt-0.5 text-green-600" />
                      : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
                    {result.message}
                    {result.ok && (
                      <span className="ml-auto text-xs text-green-600 font-bold animate-pulse">
                        Taking you to games…
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
