/**
 * /hub/reset-password — Set a new password via BetterAuth reset token
 */
import { useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link, useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import { Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react';
import { authClient } from '@/lib/auth/auth-client';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (!token) { setError('Invalid or expired reset link. Please request a new one.'); return; }

    setLoading(true);
    try {
      const result = await authClient.resetPassword({ newPassword: password, token });
      if (result.error) {
        setError(result.error.message ?? 'Reset failed. The link may have expired.');
        return;
      }
      setDone(true);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset Password — Sodafom</title>
        <meta name="description" content="Set a new password for your Sodafom account." />
        <link rel="canonical" href="https://sodafom.uk/hub/reset-password" />
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' as const }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Link to="/">
              <img src="/assets/uploads/airo-logo-shimmer-horizontal.svg" alt="Sodafom" className="h-12 w-auto mx-auto object-contain" />
            </Link>
          </div>

          {done ? (
            <div className="bg-card rounded-3xl border-2 border-border p-8 shadow-sm text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-primary" />
              </div>
              <h1 className="text-2xl font-black text-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                Password updated!
              </h1>
              <p className="text-muted-foreground text-sm mb-6">
                Your password has been changed. You can now sign in with your new password.
              </p>
              <Link
                to="/hub/login"
                className="inline-block w-full py-3 rounded-xl bg-primary text-primary-foreground font-black text-sm hover:opacity-90 transition-opacity text-center"
              >
                Sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                  Set a new password
                </h1>
                <p className="text-muted-foreground text-sm mt-1">Choose a strong password for your account.</p>
              </div>

              <div className="bg-card rounded-3xl border-2 border-border p-8 shadow-sm">
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                      <Lock size={14} className="text-muted-foreground" /> New password
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
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                      <Lock size={14} className="text-muted-foreground" /> Confirm password
                    </label>
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      placeholder="Repeat your new password"
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
                    disabled={loading || !token}
                    className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-black text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                  >
                    {loading ? 'Updating…' : 'Update password'}
                  </button>
                </form>
              </div>
            </>
          )}

          <p className="text-center text-xs text-muted-foreground mt-6">
            <Link to="/" className="hover:underline">← Back to Sodafom</Link>
          </p>
        </motion.div>
      </main>
    </>
  );
}
