/**
 * Checkout Success Page — Sodafom branded
 *
 * Displayed after Stripe redirects back on payment completion.
 * Verifies the session server-side before showing success.
 *
 * URL: /checkout/success?session_id=cs_xxx
 */
import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { API_PREFIX } from '@/lib/config';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import { CheckCircle, AlertCircle, Loader2, ArrowRight, Star, Shield } from 'lucide-react';

const siteUrl = 'https://sodafom.uk';

type VerificationState = 'verifying' | 'verified' | 'failed' | 'no_session';

interface SessionDetails {
  customerName?: string;
  amountTotal?: number;
  currency?: string;
  paymentStatus?: string;
  status?: string;
}

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount / 100);
}

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [details, setDetails] = useState<SessionDetails | null>(null);
  const [verification, setVerification] = useState<VerificationState>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;

    if (!sessionId) {
      firedRef.current = true;
      setVerification('no_session');
      setErrorMessage('No payment session found. Please try again.');
      return;
    }

    if (!sessionId.startsWith('cs_')) {
      firedRef.current = true;
      setVerification('failed');
      setErrorMessage('Invalid session format.');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`${API_PREFIX}/stripe/session/${sessionId}`);
        if (!res.ok) {
          firedRef.current = true;
          setVerification('failed');
          setErrorMessage('Unable to verify payment. Please contact us if you were charged.');
          return;
        }
        const data = await res.json() as { success: boolean; session?: SessionDetails };
        if (!data?.success || !data?.session) {
          firedRef.current = true;
          setVerification('failed');
          setErrorMessage('Unable to verify payment. Please contact us if you were charged.');
          return;
        }
        const session = data.session;
        setDetails(session);

        if (session.status === 'complete' && session.paymentStatus === 'paid') {
          firedRef.current = true;
          // Activate subscription in DB (idempotent)
          try {
            await fetch(`${API_PREFIX}/subscription/activate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ sessionId }),
            });
          } catch { /* non-blocking */ }
          setVerification('verified');
        } else if (session.paymentStatus === 'unpaid') {
          firedRef.current = true;
          setVerification('failed');
          setErrorMessage('Payment was not completed. Please try again.');
        } else if (session.status === 'expired') {
          firedRef.current = true;
          setVerification('failed');
          setErrorMessage('Payment session expired. Please try again.');
        } else {
          firedRef.current = true;
          setVerification('failed');
          setErrorMessage('Unable to verify payment. Please contact us if you were charged.');
        }
      } catch {
        firedRef.current = true;
        setVerification('failed');
        setErrorMessage('Network error. Please contact us if you were charged.');
      }
    };
    verify();
  }, [sessionId]);

  // ── VERIFYING ──────────────────────────────────────────────────────────────
  if (verification === 'verifying') {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <Helmet>
          <title>Verifying Payment — Sodafom</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
            Confirming your payment…
          </p>
          <p className="text-muted-foreground text-sm mt-1">Just a moment, please don't close this page.</p>
        </div>
      </main>
    );
  }

  // ── FAILED ─────────────────────────────────────────────────────────────────
  if (verification === 'failed' || verification === 'no_session') {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <Helmet>
          <title>Payment Issue — Sodafom</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' as const }}
          className="w-full max-w-md bg-card rounded-3xl border-2 border-border shadow-lg p-8 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-5">
            <AlertCircle size={32} className="text-secondary" />
          </div>
          <h1 className="text-2xl font-black text-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Payment issue
          </h1>
          <p className="text-muted-foreground text-sm mb-6">{errorMessage}</p>
          <div className="flex flex-col gap-3">
            <Link
              to="/subscribe"
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-black text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              Try again <ArrowRight size={16} />
            </Link>
            <Link
              to="/"
              className="w-full py-3 rounded-xl bg-muted text-muted-foreground font-bold text-sm hover:bg-muted/80 transition-colors"
            >
              Back to home
            </Link>
          </div>
          {sessionId && (
            <p className="mt-5 text-xs text-muted-foreground">
              Reference: {sessionId.slice(0, 24)}…
            </p>
          )}
        </motion.div>
      </main>
    );
  }

  // ── VERIFIED ───────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Helmet>
        <title>Welcome to Sodafom! 🎉</title>
        <meta name="description" content="Your Sodafom subscription is now active. Start learning!" />
        <link rel="canonical" href={`${siteUrl}/checkout/success`} />
        <meta name="robots" content="noindex" />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' as const }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/">
            <img
              src="/assets/uploads/airo-logo-shimmer-horizontal.svg"
              alt="Sodafom"
              className="h-10 w-auto mx-auto object-contain"
            />
          </Link>
        </div>

        <div className="bg-card rounded-3xl border-2 border-primary/20 shadow-lg overflow-hidden">
          {/* Green header */}
          <div className="bg-primary text-primary-foreground p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.15 }}
              className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle size={40} className="text-white" />
            </motion.div>
            <h1 className="text-3xl font-black mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
              You're in! 🎉
            </h1>
            <p className="text-primary-foreground/80 text-sm">
              Your 7-day free trial has started. Enjoy full access to every game.
            </p>
          </div>

          {/* Body */}
          <div className="p-7 flex flex-col gap-5">
            {/* Order summary */}
            {details && (
              <div className="bg-muted rounded-2xl p-4 flex flex-col gap-2 text-sm">
                {details.customerName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-bold">Name</span>
                    <span className="font-bold text-foreground">{details.customerName}</span>
                  </div>
                )}
                {details.amountTotal != null && details.currency && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-bold">Amount</span>
                    <span className="font-bold text-foreground">
                      {details.amountTotal === 0
                        ? 'Free trial — no charge today'
                        : formatPrice(details.amountTotal, details.currency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-bold">Status</span>
                  <span className="font-black text-primary flex items-center gap-1">
                    <CheckCircle size={13} /> Active
                  </span>
                </div>
              </div>
            )}

            {/* What's next */}
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">What's next</p>
              <ul className="flex flex-col gap-2.5">
                {[
                  { emoji: '👶', text: "Add your child's profile in the hub" },
                  { emoji: '🎮', text: 'Play all 19+ games across Maths, Reading & Spelling' },
                  { emoji: '⭐', text: 'Earn stars and unlock rewards' },
                  { emoji: '📊', text: 'Track progress and streaks' },
                ].map(item => (
                  <li key={item.text} className="flex items-center gap-3 text-sm font-bold text-foreground">
                    <span className="text-lg">{item.emoji}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <Link
              to="/onboarding"
              className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black text-base flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md"
            >
              <Star size={18} className="fill-current" />
              Set up your child's profile
              <ArrowRight size={16} />
            </Link>

            {/* Trust */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-bold">
              <Shield size={12} />
              <span>Cancel anytime — no charge for 7 days</span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-5">
          <Link to="/" className="hover:underline">← Back to Sodafom</Link>
        </p>
      </motion.div>
    </main>
  );
}
