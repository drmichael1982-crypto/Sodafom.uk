import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Helmet } from '@dr.pogodin/react-helmet';
import { teacherRequest } from '@/lib/teacher-api';
import { saveTeacherSession, type TeacherProfile } from '@/lib/teacher-auth';

export default function TeacherHubLoginPage() {
  const navigate = useNavigate();
  const [registering, setRegistering] = useState(false), [busy, setBusy] = useState(false), [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [name, setName] = useState(''), [className, setClassName] = useState(''), [licenceKey, setLicenceKey] = useState('');
  const [error, setError] = useState(''), [message, setMessage] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setMessage(''); setBusy(true);
    try {
      if (registering) {
        await teacherRequest('/register', { method: 'POST', body: JSON.stringify({ name, className, email, password, licenceKey }) });
        setRegistering(false); setMessage('Your free teacher account is ready. Sign in to open your own class.'); setPassword(''); return;
      }
      const result = await teacherRequest<{ token: string; teacher: TeacherProfile }>('/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      saveTeacherSession(result.token, result.teacher); setPassword(''); navigate('/teacher-hub', { replace: true });
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to sign in.'); }
    finally { setBusy(false); }
  }
  const input = 'w-full rounded-xl border border-border bg-background p-3 text-foreground';
  return <main className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 px-4 py-12">
    <Helmet><title>Teacher sign-in | Sodafom</title><meta name="robots" content="noindex,nofollow" /></Helmet>
    <div className="mx-auto max-w-lg rounded-3xl border border-border bg-card p-6 shadow-xl sm:p-8">
      <h1 className="text-3xl font-black">Schools and Teachers</h1>
      <p className="my-4">Free core in-school learning. School work stays local-first; this teacher hub never calls paid AI.</p>
      <p className="mb-6 text-sm text-muted-foreground">Your account opens only your own class. It does not give access to another teacher’s pupils or private family reports.</p>
      <div className="mb-6 flex gap-3"><button type="button" disabled={busy} className="rounded-xl border p-3" aria-pressed={!registering} onClick={() => { setRegistering(false); setError(''); }}>Sign in</button><button type="button" disabled={busy} className="rounded-xl border p-3" aria-pressed={registering} onClick={() => { setRegistering(true); setError(''); }}>Create free account</button></div>
      {error && <p role="alert" className="mb-4 rounded-xl bg-destructive/10 p-3 text-destructive">{error}</p>}
      {message && <p role="status" className="mb-4 rounded-xl bg-primary/10 p-3">{message}</p>}
      <form onSubmit={submit} className="space-y-4">
        {registering && <><label className="block">Your name<input className={input} autoComplete="name" required maxLength={255} value={name} onChange={e => setName(e.target.value)} /></label><label className="block">Class name<input className={input} required maxLength={128} value={className} onChange={e => setClassName(e.target.value)} placeholder="Year 3 Robins" /></label></>}
        <label className="block">Teacher email<input className={input} type="email" autoComplete="username" required maxLength={255} value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label className="block">Password<input className={input} type={showPassword ? 'text' : 'password'} autoComplete={registering ? 'new-password' : 'current-password'} required minLength={registering ? 12 : 1} maxLength={256} value={password} onChange={e => setPassword(e.target.value)} /></label>
        <button type="button" className="text-sm underline" aria-pressed={showPassword} onClick={() => setShowPassword(v => !v)}>{showPassword ? 'Hide password' : 'Show password'}</button>
        {registering && <><p className="text-sm">Use at least 12 characters. No payment or school access key is required for your own free class.</p><details><summary className="cursor-pointer">Existing school access key (optional)</summary><label className="mt-3 block">Access key<input className={input} maxLength={64} value={licenceKey} onChange={e => setLicenceKey(e.target.value)} /></label></details></>}
        <button disabled={busy} className="w-full rounded-xl bg-primary p-3 font-bold text-primary-foreground disabled:opacity-50">{busy ? 'Please wait…' : registering ? 'Create free teacher account' : 'Sign in'}</button>
      </form>
      <p className="mt-5 text-sm text-muted-foreground">On a shared school device, sign out when finished. Your teacher sign-in is kept only for this browser session.</p>
      <Link to="/" className="mt-6 inline-block underline">Back to Sodafom</Link>
    </div>
  </main>;
}
