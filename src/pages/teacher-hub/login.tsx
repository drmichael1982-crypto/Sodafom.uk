import { useState } from 'react';
import { API_PREFIX } from '@/lib/config';
import { useNavigate, Link } from 'react-router';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import { GraduationCap, Mail, Lock, Eye, EyeOff, School, ArrowRight, KeyRound } from 'lucide-react';
import { saveTeacherSession } from '@/lib/teacher-auth';

type Mode = 'login' | 'register';

export default function TeacherHubLoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regLicence, setRegLicence] = useState('');
  const [regClass, setRegClass] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_PREFIX}/teacher/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json() as { token?: string; teacher?: { id: number; name: string; email: string; className: string }; error?: string };
      if (!res.ok) { setError(data.error ?? 'Login failed'); return; }
      saveTeacherSession(data.token!, data.teacher!);
      navigate('/teacher-hub');
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_PREFIX}/teacher/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword, licenceKey: regLicence, className: regClass }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setError(data.error ?? 'Registration failed'); return; }
      // Auto-login after register
      const loginRes = await fetch(`${API_PREFIX}/teacher/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail, password: regPassword }),
      });
      const loginData = await loginRes.json() as { token?: string; teacher?: { id: number; name: string; email: string; className: string } };
      if (loginRes.ok) { saveTeacherSession(loginData.token!, loginData.teacher!); navigate('/teacher-hub'); }
      else setMode('login');
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Teacher Hub Login — Sodafom</title>
        <meta name="description" content="Log in to the Sodafom Teacher Hub to track your students' progress and get personalised game recommendations." />
        <link rel="canonical" href="https://sodafom.uk/teacher-hub/login" />
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' as const }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground text-3xl mb-4 shadow-lg">
              <GraduationCap size={32} />
            </div>
            <h1 className="text-3xl font-black text-foreground">Teacher Hub</h1>
            <p className="text-muted-foreground mt-1">Track your class's learning journey</p>
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-2xl bg-muted p-1 mb-6">
            {(['login', 'register'] as Mode[]).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2.5 rounded-xl font-black text-sm transition-all ${mode === m ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <div className="bg-card rounded-3xl shadow-xl border border-border p-8">
            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-destructive/10 text-destructive text-sm font-bold border border-destructive/20">
                {error}
              </div>
            )}

            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-black text-foreground mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      placeholder="teacher@school.co.uk"
                      className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-background text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-black text-foreground mb-1.5">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-3 rounded-xl border border-border bg-background text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary" />
                    <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
                  className="mt-2 w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-black text-base flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60">
                  {loading ? 'Signing in…' : <><span>Sign In</span><ArrowRight size={18} /></>}
                </motion.button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-black text-foreground mb-1.5">Your full name</label>
                  <input type="text" value={regName} onChange={e => setRegName(e.target.value)} required placeholder="Ms Smith"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-black text-foreground mb-1.5">Class name</label>
                  <div className="relative">
                    <School size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="text" value={regClass} onChange={e => setRegClass(e.target.value)} placeholder="Year 3 Robins"
                      className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-background text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-black text-foreground mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required placeholder="teacher@school.co.uk"
                      className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-background text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-black text-foreground mb-1.5">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type={showPw ? 'text' : 'password'} value={regPassword} onChange={e => setRegPassword(e.target.value)} required placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-3 rounded-xl border border-border bg-background text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary" />
                    <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-black text-foreground mb-1.5">School licence key</label>
                  <div className="relative">
                    <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="text" value={regLicence} onChange={e => setRegLicence(e.target.value)} required placeholder="SODA-XXXX-XXXX"
                      className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-background text-foreground font-bold font-mono focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Provided when your school purchased a Sodafom School plan</p>
                </div>
                <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
                  className="mt-2 w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-black text-base flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60">
                  {loading ? 'Creating account…' : <><span>Create Teacher Account</span><ArrowRight size={18} /></>}
                </motion.button>
              </form>
            )}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            <Link to="/" className="hover:text-primary font-bold transition-colors">← Back to Sodafom</Link>
          </p>
        </motion.div>
      </main>
    </>
  );
}
