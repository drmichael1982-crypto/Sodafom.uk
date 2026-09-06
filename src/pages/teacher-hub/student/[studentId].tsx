/**
 * /teacher-hub/student/:studentId — Student detail page
 * Shows full progress, stars, games played, notes, and recommendations.
 */
import { useState, useEffect, useCallback } from 'react';
import { API_PREFIX } from '@/lib/config';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link, useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Star, Gamepad2, TrendingUp, Clock, StickyNote, Plus, Lightbulb, ChevronRight, AlertCircle, CheckCircle2, BookOpen, Calculator, PenLine, BarChart3 } from 'lucide-react';
import { getTeacherToken, clearTeacherSession, teacherAuthHeaders } from '@/lib/teacher-auth';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Note {
  id: number;
  noteText: string;
  needsHelp: string | null;
  createdAt: string | null;
}

interface ActivityEntry {
  id: number;
  gameTitle: string;
  subject: string | null;
  score: number | null;
  starsEarned: number;
  timeSpentSeconds: number | null;
  difficulty: string | null;
  playedAt: string | null;
}

interface Recommendation {
  gameId: string;
  title: string;
  subject: string;
  reason: string;
  path: string;
}

interface StudentDetail {
  id: number;
  studentCode: string;
  name: string;
  ageGroup: string;
  avatarEmoji: string;
  totalStars: number;
  stats: { gamesPlayed: number; totalStarsEarned: number; avgScore: number };
  notes: Note[];
  recentActivity: ActivityEntry[];
  recommendations: Recommendation[];
}

const ageColour: Record<string, string> = {
  '5–7':   'bg-yellow-100 text-yellow-800 border-yellow-300',
  '8–10':  'bg-blue-100 text-blue-800 border-blue-300',
  '11–13': 'bg-purple-100 text-purple-800 border-purple-300',
};

const subjectIcon: Record<string, React.ElementType> = {
  reading: BookOpen,
  maths: Calculator,
  spelling: PenLine,
};

const subjectColour: Record<string, string> = {
  reading: 'text-blue-600 bg-blue-50',
  maths:   'text-green-600 bg-green-50',
  spelling:'text-orange-600 bg-orange-50',
};

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function fmtTime(secs: number | null): string {
  if (!secs) return '—';
  if (secs < 60) return `${secs}s`;
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function StudentDetailPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Note form
  const [noteText, setNoteText] = useState('');
  const [needsHelp, setNeedsHelp] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteError, setNoteError] = useState('');
  const [noteSuccess, setNoteSuccess] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!getTeacherToken()) { navigate('/teacher-hub/login'); }
  }, [navigate]);

  const fetchStudent = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_PREFIX}/teacher/students/${studentId}`, { headers: teacherAuthHeaders() });
      if (res.status === 401) { clearTeacherSession(); navigate('/teacher-hub/login'); return; }
      if (res.status === 404) { setError('Student not found'); return; }
      const data = await res.json() as {
        student: Omit<StudentDetail, 'recentActivity' | 'recommendations'>;
        activity: ActivityEntry[];
        notes: Note[];
        recommendations: Recommendation[];
      };
      setStudent({
        ...data.student,
        notes: data.notes,
        recentActivity: data.activity,
        recommendations: data.recommendations,
        stats: {
          gamesPlayed: data.activity.length,
          totalStarsEarned: data.activity.reduce((s, a) => s + a.starsEarned, 0),
          avgScore: data.activity.length
            ? data.activity.reduce((s, a) => s + (a.score ?? 0), 0) / data.activity.length
            : 0,
        },
      });
    } catch { setError('Could not load student data'); }
    finally { setLoading(false); }
  }, [studentId, navigate]);

  useEffect(() => { fetchStudent(); }, [fetchStudent]);

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteText.trim()) return;
    setNoteLoading(true);
    setNoteError('');
    setNoteSuccess(false);
    try {
      const res = await fetch(`${API_PREFIX}/teacher/students/${studentId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...teacherAuthHeaders() },
        body: JSON.stringify({ noteText, needsHelp }),
      });
      if (!res.ok) { setNoteError('Failed to save note'); return; }
      setNoteText('');
      setNeedsHelp('');
      setNoteSuccess(true);
      setTimeout(() => setNoteSuccess(false), 3000);
      await fetchStudent();
    } catch { setNoteError('Network error'); }
    finally { setNoteLoading(false); }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm">Loading student...</p>
        </div>
      </main>
    );
  }

  if (error || !student) {
    return (
      <main className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl p-8 text-center max-w-sm">
          <AlertCircle size={32} className="text-destructive mx-auto mb-3" />
          <p className="font-bold text-foreground mb-1">{error || 'Student not found'}</p>
          <Link to="/teacher-hub" className="text-primary text-sm font-bold hover:underline">← Back to dashboard</Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <Helmet>
        <title>{student.name} — Teacher Hub | Sodafom</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content={`Progress and activity for ${student.name} — Sodafom Teacher Hub.`} />
        <link rel="canonical" href={`https://sodafom.uk/teacher-hub/student/${student.id}`} />
      </Helmet>

      <main className="min-h-screen bg-muted/30 pb-16">
        {/* ── Top bar ──────────────────────────────────────────────────────── */}
        <div className="bg-primary shadow-md">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
            <Link
              to="/teacher-hub"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-foreground/15 text-primary-foreground text-sm font-bold hover:bg-primary-foreground/25 transition-colors"
            >
              <ArrowLeft size={14} /> Back
            </Link>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-3xl">{student.avatarEmoji}</span>
              <div className="min-w-0">
                <h1 className="text-primary-foreground font-black text-base leading-none truncate">{student.name}</h1>
                <p className="text-primary-foreground/70 text-xs mt-0.5 font-mono">{student.studentCode}</p>
              </div>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${ageColour[student.ageGroup] ?? 'bg-muted text-muted-foreground border-border'}`}>
              Age {student.ageGroup}
            </span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">

          {/* ── Stats ────────────────────────────────────────────────────── */}
          <section>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
              <BarChart3 size={13} /> Progress overview
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Star,       label: 'Total stars',  value: student.totalStars,                    colour: 'bg-yellow-500' },
                { icon: Gamepad2,   label: 'Games played', value: student.stats.gamesPlayed,             colour: 'bg-primary' },
                { icon: TrendingUp, label: 'Avg score',    value: `${Math.round(student.stats.avgScore)}%`, colour: 'bg-secondary' },
                { icon: Star,       label: 'Stars earned', value: student.stats.totalStarsEarned,        colour: 'bg-accent' },
              ].map(({ icon: Icon, label, value, colour }) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-1.5 shadow-sm"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colour}`}>
                    <Icon size={16} className="text-white" />
                  </div>
                  <p className="text-muted-foreground text-xs font-bold">{label}</p>
                  <p className="text-2xl font-black text-foreground leading-none">{value}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── Recommendations ──────────────────────────────────────────── */}
          {student.recommendations.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                <Lightbulb size={13} /> Recommended games
              </h2>
              <div className="flex flex-col gap-2">
                {student.recommendations.map((rec) => {
                  const SubIcon = subjectIcon[rec.subject] ?? Gamepad2;
                  return (
                    <Link
                      key={rec.gameId}
                      to={rec.path}
                      className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 hover:border-primary/40 hover:shadow-sm transition-all group"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${subjectColour[rec.subject] ?? 'bg-muted text-muted-foreground'}`}>
                        <SubIcon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-foreground text-sm truncate">{rec.title}</p>
                        <p className="text-muted-foreground text-xs">{rec.reason}</p>
                      </div>
                      <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── Recent activity ───────────────────────────────────────────── */}
          <section>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
              <Clock size={13} /> Recent activity
            </h2>
            {student.recentActivity.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground text-sm">
                No games played yet.
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left px-4 py-3 font-bold text-muted-foreground text-xs uppercase tracking-wide">Game</th>
                      <th className="text-right px-4 py-3 font-bold text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">Score</th>
                      <th className="text-right px-4 py-3 font-bold text-muted-foreground text-xs uppercase tracking-wide">Stars</th>
                      <th className="text-right px-4 py-3 font-bold text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">Time</th>
                      <th className="text-right px-4 py-3 font-bold text-muted-foreground text-xs uppercase tracking-wide">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.recentActivity.map((a) => {
                      const SubIcon = subjectIcon[a.subject ?? ''] ?? Gamepad2;
                      return (
                        <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <SubIcon size={13} className={`flex-shrink-0 ${a.subject ? (subjectColour[a.subject]?.split(' ')[0] ?? 'text-muted-foreground') : 'text-muted-foreground'}`} />
                              <span className="font-bold text-foreground text-xs truncate max-w-[120px] sm:max-w-none">{a.gameTitle}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-foreground text-xs hidden sm:table-cell">
                            {a.score !== null ? `${a.score}%` : '—'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-yellow-600 font-bold text-xs">⭐ {a.starsEarned}</span>
                          </td>
                          <td className="px-4 py-3 text-right text-muted-foreground text-xs hidden md:table-cell">
                            {fmtTime(a.timeSpentSeconds)}
                          </td>
                          <td className="px-4 py-3 text-right text-muted-foreground text-xs">
                            {timeAgo(a.playedAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* ── Notes ────────────────────────────────────────────────────── */}
          <section>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
              <StickyNote size={13} /> Teacher notes ({student.notes.length})
            </h2>

            {/* Add note form */}
            <form onSubmit={addNote} className="bg-card border border-border rounded-2xl p-4 mb-4 flex flex-col gap-3">
              <p className="font-bold text-foreground text-sm">Add a note</p>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="e.g. Struggling with long division, needs extra practice on fractions..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:border-primary transition-colors resize-none"
              />
              <input
                type="text"
                value={needsHelp}
                onChange={(e) => setNeedsHelp(e.target.value)}
                placeholder="Area needing help (optional, e.g. fractions, phonics)"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:border-primary transition-colors"
              />
              {noteError && <p className="text-destructive text-xs">{noteError}</p>}
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={noteLoading || !noteText.trim()}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-black hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Plus size={14} />
                  {noteLoading ? 'Saving...' : 'Save note'}
                </button>
                <AnimatePresence>
                  {noteSuccess && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1 text-green-600 text-sm font-bold"
                    >
                      <CheckCircle2 size={14} /> Saved!
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </form>

            {/* Existing notes */}
            {student.notes.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-6 text-center text-muted-foreground text-sm">
                No notes yet — add one above.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {student.notes.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3"
                  >
                    <StickyNote size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-amber-900 text-sm leading-relaxed">{note.noteText}</p>
                      {note.needsHelp && (
                        <span className="inline-block mt-2 text-xs font-bold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                          Needs help: {note.needsHelp}
                        </span>
                      )}
                      {note.createdAt && (
                        <p className="text-amber-600 text-xs mt-1.5">{timeAgo(note.createdAt)}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
    </>
  );
}
