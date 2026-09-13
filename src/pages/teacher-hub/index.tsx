import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Helmet } from '@dr.pogodin/react-helmet';
import { teacherRequest, TeacherApiError, exportTeacherCsv } from '@/lib/teacher-api';
import { clearTeacherSession, getTeacherToken, type TeacherProfile } from '@/lib/teacher-auth';

interface Pupil {
  id: number;
  name: string;
  ageGroup: string;
  studentCode: string;
  avatarEmoji: string;
  totalStars: number;
  stats: { gamesPlayed: number; avgScore: number | null };
  pendingReviews: number;
  reviewsLimited: boolean;
}

export default function TeacherHubDashboard() {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
  const [pupils, setPupils] = useState<Pupil[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('5-7');

  const showError = useCallback((reason: unknown) => {
    if (reason instanceof TeacherApiError && reason.status === 401) {
      setPupils([]);
      setTeacher(null);
      navigate('/teacher-hub/login', { replace: true });
    } else {
      setError(reason instanceof Error ? reason.message : 'The school service is unavailable.');
    }
  }, [navigate]);

  const load = useCallback(async () => {
    if (!getTeacherToken()) {
      navigate('/teacher-hub/login', { replace: true });
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [profile, list] = await Promise.all([
        teacherRequest<TeacherProfile>('/me'),
        teacherRequest<Pupil[]>('/students'),
      ]);
      setTeacher(profile);
      setPupils(list);
    } catch (reason) {
      setPupils([]);
      showError(reason);
    } finally {
      setLoading(false);
    }
  }, [navigate, showError]);

  useEffect(() => { void load(); }, [load]);

  async function addPupil(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await teacherRequest('/students', {
        method: 'POST',
        body: JSON.stringify({ name, ageGroup: age }),
      });
      setName('');
      await load();
    } catch (reason) {
      showError(reason);
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    try {
      await teacherRequest('/login', { method: 'POST', body: JSON.stringify({ action: 'logout' }) });
    } catch {
      window.alert('Signed out on this device. Server sign-out could not be confirmed; close this browser on a shared device.');
    } finally {
      clearTeacherSession();
      setPupils([]);
      setTeacher(null);
      navigate('/teacher-hub/login', { replace: true });
    }
  }

  const visible = pupils.filter((pupil) => pupil.name.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <main className="min-h-screen bg-muted/30 p-4 sm:p-8">
      <Helmet>
        <title>Teacher class list | Sodafom</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">{teacher?.className ?? 'Your class'}</h1>
            <p>{teacher?.name} · Private teacher workspace</p>
          </div>
          <button disabled={busy} className="rounded-xl border bg-card p-3" onClick={() => void signOut()}>Sign out</button>
        </header>

        <p className="rounded-2xl bg-primary/10 p-4">
          Only pupils added to your teacher account are shown here. Use a display name rather than unnecessary personal details. Keep pupil access codes private.
        </p>
        {error && <p role="alert" className="rounded-xl bg-destructive/10 p-4 text-destructive">{error}</p>}

        <section className="rounded-2xl border bg-card p-5">
          <h2 className="mb-4 text-xl font-bold">Add a pupil</h2>
          <form onSubmit={addPupil} className="flex flex-wrap items-end gap-4">
            <label className="min-w-0 flex-1">Pupil display name
              <input required maxLength={255} value={name} onChange={(event) => setName(event.target.value)} className="block w-full rounded-xl border bg-background p-3" />
            </label>
            <label>Age group
              <select value={age} onChange={(event) => setAge(event.target.value)} className="block rounded-xl border bg-background p-3">
                {['5-7', '8-10', '11-13'].map((value) => <option key={value}>{value}</option>)}
              </select>
            </label>
            <button disabled={busy || loading} className="rounded-xl bg-primary p-3 font-bold text-primary-foreground disabled:opacity-50">
              {busy ? 'Saving…' : 'Add pupil'}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border bg-card p-5">
          <div className="mb-4 flex flex-wrap items-end gap-4">
            <label className="flex-1">Find a pupil
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} className="block w-full rounded-xl border bg-background p-3" />
            </label>
            <button disabled={loading} className="rounded-xl border p-3" onClick={() => void load()}>Refresh</button>
            <button
              disabled={loading || !visible.length}
              className="rounded-xl border p-3"
              onClick={() => exportTeacherCsv('class-report.csv', [
                ['Pupil', 'Age group', 'Recorded activities', 'Activity mean % (excludes teacher work reviews)', 'Pending reviews (latest 500 notes)'],
                ...visible.map((pupil) => [pupil.name, pupil.ageGroup, pupil.stats.gamesPlayed, pupil.stats.avgScore, pupil.pendingReviews]),
              ])}
            >
              Export class report
            </button>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Open a pupil to see lessons, games, homework, reading, subject scores, comments and photo reviews. The class average below covers recorded activities only, not teacher-marked work.
          </p>
          {loading ? <p role="status">Loading your class…</p> : !visible.length ? <p>No pupils to show.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <caption className="sr-only">Your class list</caption>
                <thead><tr><th className="p-3">Pupil</th><th className="p-3">Activities</th><th className="p-3">Average</th><th className="p-3">Needs review</th><th className="p-3">Private code</th></tr></thead>
                <tbody>{visible.map((pupil) => (
                  <tr key={pupil.id} className="border-t">
                    <td className="p-3"><Link className="font-bold underline" to={`/teacher-hub/student/${pupil.id}`}>{pupil.name}</Link><p className="text-sm">Ages {pupil.ageGroup}</p></td>
                    <td className="p-3">{pupil.stats.gamesPlayed}</td>
                    <td className="p-3">{pupil.stats.avgScore === null ? 'Not assessed' : `${Math.round(pupil.stats.avgScore)}%`}</td>
                    <td className="p-3">{pupil.pendingReviews}{pupil.reviewsLimited ? ' (latest 500 notes)' : ''}</td>
                    <td className="p-3"><details><summary className="cursor-pointer">Show code for {pupil.name}</summary><code className="break-all">{pupil.studentCode}</code></details></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </section>
        <Link to="/" className="inline-block underline">Back to Sodafom</Link>
      </div>
    </main>
  );
}
