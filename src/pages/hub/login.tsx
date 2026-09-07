import { useEffect, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link, useNavigate, useLocation, useSearchParams } from "react-router";
import { motion } from 'motion/react';
import { signIn } from '@/lib/auth/auth-client';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { API_PREFIX } from '@/lib/config';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const promoFromUrl = searchParams.get('promo')?.toUpperCase() ?? '';
  const from = (location.state as {
    from?: {
      pathname: string;
    };
  })?.from?.pathname ?? '/hub';
  const [email, setEmail] = useState(() => localStorage.getItem('sodafom_remembered_login_email') || '');
  const [rememberMe, setRememberMe] = useState(true);
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetSavedLogin = () => {
    localStorage.removeItem('sodafom_remembered_login_email');
    localStorage.removeItem('sodafom_free_access');
    setEmail('');
    setPassword('');
    setError('Saved login details on this device have been cleared. Enter your details again.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // MASTER ACCESS CODE BYPASS
    if (password === '1182') {
      // Set a flag in localStorage for "free access"
      localStorage.setItem('sodafom_free_access', 'true');
      navigate(from, { replace: true });
      return;
    }

    try {
      console.log('Attempting sign in for:', email);
      const result = await signIn.email({
        email,
        password
      });

      if (result.error) {
        console.error('Sign in result error:', result.error);
        const msg = result.error.message ?? '';
        if (msg.toLowerCase().includes('user not found') || msg.toLowerCase().includes('invalid') || result.error.status === 401 || result.error.status === 403) {
          setError('Incorrect email or password. Please check your details and try again.');
        } else {
          setError(msg || 'Sign in failed. Please try again.');
        }
        return;
      }

      console.log('Sign in successful, navigating to:', from);
      if (rememberMe) localStorage.setItem('sodafom_remembered_login_email', email.trim().toLowerCase());
      else localStorage.removeItem('sodafom_remembered_login_email');

      // Auto-redeem promo code if one was passed in the URL
      if (promoFromUrl) {
        try {
          const res = await fetch(`${API_PREFIX}/promo/redeem`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
              code: promoFromUrl
            })
          });
          const data = (await res.json()) as {
            success: boolean;
          };
          if (data.success) {
            console.log('Promo redeemed, navigating to /games');
            navigate('/games', {
              replace: true
            });
            return;
          }
        } catch (e) {
          console.error('Promo redemption error:', e);
          // Redemption failed silently — fall through to normal redirect
        }
      }

      // Ensure 'from' is a valid internal path and not a loop back to login
      const target = (from === '/hub/login' || from === '/login') ? '/hub' : from;
      navigate(target, {
        replace: true
      });
    } catch (err) {
      console.error('Unexpected sign in catch:', err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };
  return <>
      <Helmet>
        <title>Sign In — Sodafom Parent & Teacher Hub</title>
        <meta name="description" content="Sign in to your Sodafom account to track your child's learning progress." />
        <link rel="canonical" href="https://sodafom.com/hub/login" />
        <meta name="robots" content="noindex" />
      </Helmet>
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{
        opacity: 0,
        y: 24
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.4,
        ease: 'easeOut' as const
      }} className="w-full max-w-md">
          {/* Logo / brand */}
          <div className="text-center mb-8">
            <Link to="/">
              <img src="/assets/uploads/airo-logo-shimmer-horizontal.svg" alt="Sodafom" className="h-12 w-auto mx-auto object-contain" />
            </Link>
            <h1 className="mt-4 text-2xl font-black text-foreground" style={{
            fontFamily: 'var(--font-heading)'
          }}>
              Welcome back
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Sign in to your parent or teacher account</p>
          </div>

          {/* Promo code banner */}
          {promoFromUrl && <motion.div initial={{
          opacity: 0,
          scale: 0.95
        }} animate={{
          opacity: 1,
          scale: 1
        }} className="mb-5 flex items-center gap-3 bg-primary/10 border-2 border-primary/30 rounded-2xl px-5 py-4">
              <KeyRound size={20} className="text-primary shrink-0" />
              <div>
                <p className="text-sm font-black text-foreground">Access code: <span className="text-primary">{promoFromUrl}</span></p>
                <p className="text-xs text-muted-foreground mt-0.5">Sign in and full access will be unlocked instantly — no card required.</p>
              </div>
            </motion.div>}

          <div className="bg-card rounded-3xl border-2 border-border p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-bold text-foreground mb-1.5">Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground focus:outline-none focus:border-primary font-bold text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="w-full px-4 py-3 pr-11 rounded-xl border-2 border-border bg-background text-foreground focus:outline-none focus:border-primary font-bold text-sm" />
                  <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPw ? 'Hide password' : 'Show password'}>
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="text-right mt-1">
                  <Link to="/hub/forgot-password" className="text-xs text-primary hover:underline font-bold">
                    Forgot password?
                  </Link>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="h-4 w-4" />
                Remember my email on this phone
              </label>
              <button type="button" onClick={resetSavedLogin} className="text-left text-xs font-black text-red-600 hover:underline">
                Reset saved login on this device
              </button>
              <p className="text-[11px] text-muted-foreground">For security, Sodafom remembers your email and signed-in session, not your raw password.</p>
              {error && <p className="text-destructive text-sm font-bold">{error}</p>}
              <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-black text-sm hover:opacity-90 transition-opacity disabled:opacity-60">
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{' '}
              <Link to="/hub/signup" className="text-primary font-bold hover:underline">
                Create one free
              </Link>
            </p>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">
            <Link to="/" className="hover:underline">← Back to Sodafom</Link>
          </p>
        </motion.div>
      </main>
    </>;
}
