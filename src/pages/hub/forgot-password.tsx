/**
 * /hub/forgot-password — Request a password reset link
 */
import { useState } from 'react';
import { API_PREFIX } from '@/lib/config';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await fetch(`${API_PREFIX}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Forgot Password — Sodafom</title>
        <meta name="description" content="Reset your Sodafom account password. Enter your email to receive a reset link." />
        <link rel="canonical" href="https://sodafom.uk/hub/forgot-password" />
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' as const }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/">
              <img src="/assets/uploads/airo-logo-shimmer-horizontal.svg" alt="Sodafom" className="h-12 w-auto mx-auto object-contain" />
            </Link>
          </div>

          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card rounded-3xl border-2 border-border p-8 shadow-sm text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-primary" />
                </div>
                <h1 className="text-2xl font-black text-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  Check your email
                </h1>
                <p className="text-muted-foreground text-sm mb-6">
                  If an account exists for <strong>{email}</strong>, we've sent a password reset link. Check your inbox (and spam folder).
                </p>
                <Link
                  to="/hub/login"
                  className="inline-flex items-center gap-2 text-primary font-bold hover:underline text-sm"
                >
                  <ArrowLeft size={14} /> Back to sign in
                </Link>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                    Forgot your password?
                  </h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    Enter your email and we'll send you a reset link.
                  </p>
                </div>

                <div className="bg-card rounded-3xl border-2 border-border p-8 shadow-sm">
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

                    {error && (
                      <p className="text-destructive text-sm font-bold bg-destructive/5 border border-destructive/20 rounded-xl px-3 py-2.5">
                        ⚠️ {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-black text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                    >
                      {loading ? 'Sending…' : 'Send reset link'}
                    </button>
                  </form>

                  <p className="text-center text-sm text-muted-foreground mt-6">
                    Remembered it?{' '}
                    <Link to="/hub/login" className="text-primary font-bold hover:underline">
                      Sign in
                    </Link>
                  </p>
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
