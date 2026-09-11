/**
 * /teacher-hub — Teacher dashboard
 * Shows class overview, student list with activity stats, notes, and game recommendations.
 * Protected: redirects to /teacher-hub/login if no valid session.
 */
import { useState, useEffect, useCallback } from 'react';
import { API_PREFIX } from '@/lib/config';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, Users, Star, BookOpen, Calculator, PenLine, LogOut, Plus, X, ChevronRight, Search, RefreshCw, Trophy, Clock, Gamepad2, TrendingUp, AlertCircle, StickyNote, Lightbulb, BarChart3, Download, Medal } from 'lucide-react';
import {
  getTeacherProfile, getTeacherToken, clearTeacherSession,
  teacherAuthHeaders, type TeacherProfile,
} from '@/lib/teacher-auth';

// ── Types ─────────────────────────────────────────────────────────────────────
interface StudentNote {
  id: number;
  noteText: string;
  needsHelp: string | null;
  createdAt: string | null;
}

interface StudentStats {
  gamesPlayed: number;
  totalStarsEarned: number;
  avgScore: number;
}

interface LastGame {
  gameTitle: string;
  playedAt: string | null;
}

interface Student {
  id: number;
  studentCode: string;
  name: string;
  ageGroup: string;
  avatarEmoji: string;
  totalStars: number;
  stats: StudentStats;
  lastGame: LastGame | null;
  notes: StudentNote[];
}

interface NewStudentForm {
  name: string;
  ageGroup: string;
  avatarEmoji: string;
}

const AGE_GROUPS = ['5–7', '8–10', '11–13'];
const AVATARS = ['🦁', '🐯', '🐻', '🦊', '🐼', '🐸', '🦄', '🐙', '🦋', '🐬', '🦅', '🐲'];

const ageColour: Record<string, string> = {
  '5–7':   'bg-yellow-100 text-yellow-800 border-yellow-300',
  '8–10':  'bg-blue-100 text-blue-800 border-blue-300',
  '11–13': 'bg-purple-100 text-purple-800 border-purple-300',
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

// ── Add student modal ─────────────────────────────────────────────────────────
function AddStudentModal({
  onClose, onAdded,
}: { onClose: () => void; onAdded: (s: Student) => void }) {
  const [form, setForm] = useState<NewStudentForm>({ name: '', ageGroup: '5–7', avatarEmoji: '🦁' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_PREFIX}/teacher/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...teacherAuthHeaders() },
        body: JSON.stringify(form),
      });
      const data = await res.json() as Student & { error?: string };
      if (!res.ok) { setError(data.error ?? 'Failed to add student'); return; }
      onAdded(data);
      onClose();
    } catch { setError('Network error'); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-foreground">Add new student</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name */}
          <div>
            <label className="text-sm font-bold text-foreground mb-1.5 block">Student name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Emma Johnson"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:border-primary transition-colors"
              autoFocus
            />
          </div>
          {/* Age group */}
          <div>
            <label className="text-sm font-bold text-foreground mb-1.5 block">Age group</label>
            <div className="flex gap-2">
              {AGE_GROUPS.map((ag) => (
                <button
                  key={ag}
                  type="button"
                  onClick={() => setForm({ ...form, ageGroup: ag })}
                  className={`flex-1 py-2 rounded-xl border text-sm font-bold transition-all ${
                    form.ageGroup === ag
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {ag}
                </button>
              ))}
            </div>
          </div>
          {/* Avatar */}
          <div>
            <label className="text-sm font-bold text-foreground mb-1.5 block">Avatar</label>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setForm({ ...form, avatarEmoji: emoji })}
                  className={`text-2xl py-1.5 rounded-xl border transition-all ${
                    form.avatarEmoji === emoji
                      ? 'border-primary bg-primary/10 scale-110'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-black text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add student'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ── Student card ──────────────────────────────────────────────────────────────
function StudentCard({ student }: { student: Student }) {
  const latestNote = student.notes[0];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-4 hover:border-primary/40 hover:shadow-md transition-all group"
    >
      <Link to={`/teacher-hub/student/${student.id}`} className="block">
        {/* Header row */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-2xl flex-shrink-0">
            {student.avatarEmoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-foreground truncate">{student.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${ageColour[student.ageGroup] ?? 'bg-muted text-muted-foreground border-border'}`}>
                Age {student.ageGroup}
              </span>
              <span className="text-xs text-muted-foreground font-mono">{student.studentCode}</span>
            </div>
          </div>
          <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { icon: Star,     value: student.totalStars,          label: 'Stars',  colour: 'text-yellow-500' },
            { icon: Gamepad2, value: student.stats.gamesPlayed,   label: 'Games',  colour: 'text-primary' },
            { icon: TrendingUp, value: Math.round(student.stats.avgScore), label: 'Avg %', colour: 'text-secondary' },
          ].map(({ icon: Icon, value, label, colour }) => (
            <div key={label} className="bg-muted/50 rounded-xl p-2 text-center">
              <Icon size={13} className={`${colour} mx-auto mb-0.5`} />
              <p className="font-black text-foreground text-sm leading-none">{value}</p>
              <p className="text-muted-foreground text-xs">{label}</p>
            </div>
          ))}
        </div>

        {/* Last game */}
        {student.lastGame && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Clock size={11} />
            <span className="truncate">Last: <span className="text-foreground font-bold">{student.lastGame.gameTitle}</span></span>
            <span className="flex-shrink-0">{timeAgo(student.lastGame.playedAt)}</span>
          </div>
        )}

        {/* Latest note snippet */}
        {latestNote && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            <StickyNote size={12} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-amber-800 text-xs line-clamp-2">{latestNote.noteText}</p>
          </div>
        )}
      </Link>
    </motion.div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────
export default function TeacherHubDashboard() {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [ageFilter, setAgeFilter] = useState<string>('all');

  // Auth guard
  useEffect(() => {
    const profile = getTeacherProfile();
    const token = getTeacherToken();
    if (!profile || !token) { navigate('/teacher-hub/login'); return; }
    setTeacher(profile);
  }, [navigate]);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_PREFIX}/teacher/students`, { headers: teacherAuthHeaders() });
      if (res.status === 401) { navigate('/teacher-hub/login'); return; }
      const data = await res.json() as Student[];
      setStudents(data);
    } catch { setError('Could not load students'); }
    finally { setLoading(false); }
  }, [navigate]);

  useEffect(() => { if (teacher) fetchStudents(); }, [teacher, fetchStudents]);

  function handleLogout() {
    clearTeacherSession();
    navigate('/teacher-hub/login');
  }

  // Filtered list
  const filtered = students.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.studentCode.toLowerCase().includes(search.toLowerCase());
    const matchAge = ageFilter === 'all' || s.ageGroup === ageFilter;
    return matchSearch && matchAge;
  });

  // Class stats
  const totalStars   = students.reduce((sum, s) => sum + s.totalStars, 0);
  const totalGames   = students.reduce((sum, s) => sum + s.stats.gamesPlayed, 0);
  const avgScore     = students.length
    ? Math.round(students.reduce((sum, s) => sum + s.stats.avgScore, 0) / students.length)
    : 0;
  const studentsWithNotes = students.filter((s) => s.notes.length > 0).length;

  return (
    <>
      <Helmet>
        <title>Teacher Hub — {teacher?.className ?? 'Dashboard'} | Sodafom</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Sodafom Teacher Hub — manage your class, track student progress, and view game activity." />
        <link rel="canonical" href="https://sodafom.uk/teacher-hub" />
      </Helmet>

      <main className="min-h-screen bg-muted/30 pb-16">
        {/* ── Top bar ──────────────────────────────────────────────────────── */}
        <div className="bg-primary shadow-md">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                <GraduationCap size={18} className="text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-primary-foreground font-black text-sm leading-none">Teacher Hub</h1>
                {teacher && (
                  <p className="text-primary-foreground/70 text-xs mt-0.5">{teacher.name} · {teacher.className}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchStudents}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-foreground/15 text-primary-foreground text-sm font-bold hover:bg-primary-foreground/25 transition-colors"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-foreground/15 text-primary-foreground text-sm font-bold hover:bg-primary-foreground/25 transition-colors"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">

          {/* ── Class overview stats ─────────────────────────────────────── */}
          <section>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
              <BarChart3 size={13} /> Class overview
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Users,      label: 'Students',    value: students.length, colour: 'bg-primary',   sub: 'in your class' },
                { icon: Star,       label: 'Total stars', value: totalStars,      colour: 'bg-yellow-500', sub: 'earned by class' },
                { icon: Gamepad2,   label: 'Games played',value: totalGames,      colour: 'bg-secondary',  sub: 'all time' },
                { icon: TrendingUp, label: 'Avg score',   value: `${avgScore}%`,  colour: 'bg-accent',     sub: 'across all games' },
              ].map(({ icon: Icon, label, value, colour, sub }) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-1.5 shadow-sm"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colour}`}>
                    <Icon size={16} className="text-white" />
                  </div>
                  <p className="text-muted-foreground text-xs font-bold">{label}</p>
                  <p className="text-2xl font-black text-foreground leading-none">{value}</p>
                  <p className="text-muted-foreground text-xs">{sub}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── Quick subject links ──────────────────────────────────────── */}
          <section>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
              <Lightbulb size={13} /> Quick links
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Reading games',  icon: BookOpen,    href: '/games/reading',  colour: 'bg-blue-500' },
                { label: 'Maths games',    icon: Calculator,  href: '/games/maths',    colour: 'bg-green-500' },
                { label: 'Spelling games', icon: PenLine,     href: '/games/spelling', colour: 'bg-orange-500' },
              ].map(({ label, icon: Icon, href, colour }) => (
                <Link
                  key={label}
                  to={href}
                  className="flex items-center gap-3 bg-card border border-border rounded-2xl p-4 hover:border-primary/40 hover:shadow-sm transition-all group"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colour}`}>
                    <Icon size={16} className="text-white" />
                  </div>
                  <span className="font-bold text-foreground text-sm">{label}</span>
                  <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors ml-auto" />
                </Link>
              ))}
            </div>
          </section>

          {/* ── Class leaderboard ────────────────────────────────────────── */}
          {students.length > 0 && (
            <section>
              <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Trophy size={13} /> Class leaderboard
                </h2>
                <button
                  onClick={() => {
                    const sorted = [...students].sort((a, b) => b.totalStars - a.totalStars);
                    const rows = [
                      ['Rank', 'Name', 'Age Group', 'Total Stars', 'Games Played', 'Avg Score %', 'Student Code'],
                      ...sorted.map((s, i) => [
                        i + 1,
                        s.name,
                        s.ageGroup,
                        s.totalStars,
                        s.stats.gamesPlayed,
                        Math.round(s.stats.avgScore),
                        s.studentCode,
                      ]),
                    ];
                    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${teacher?.className ?? 'class'}-leaderboard.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-border text-sm font-bold text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all"
                >
                  <Download size={13} /> Export CSV
                </button>
              </div>

              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground w-12">Rank</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Student</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground">Stars</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground hidden sm:table-cell">Games</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground hidden md:table-cell">Avg %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...students]
                      .sort((a, b) => b.totalStars - a.totalStars)
                      .slice(0, 10)
                      .map((s, i) => (
                        <motion.tr
                          key={s.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-3">
                            {i === 0 ? <Medal size={16} className="text-yellow-500" /> :
                             i === 1 ? <Medal size={16} className="text-gray-400" /> :
                             i === 2 ? <Medal size={16} className="text-amber-600" /> :
                             <span className="text-xs font-bold text-muted-foreground">{i + 1}</span>}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{s.avatarEmoji || '🦁'}</span>
                              <div>
                                <p className="font-bold text-foreground text-sm">{s.name}</p>
                                <p className="text-muted-foreground text-xs">{s.ageGroup}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-black text-yellow-600">⭐ {Number(s.totalStars ?? 0).toLocaleString()}</span>
                          </td>
                          <td className="px-4 py-3 text-right hidden sm:table-cell">
                            <span className="font-bold text-foreground">{s.stats.gamesPlayed}</span>
                          </td>
                          <td className="px-4 py-3 text-right hidden md:table-cell">
                            <span className={`font-bold ${s.stats.avgScore >= 80 ? 'text-primary' : s.stats.avgScore >= 60 ? 'text-accent' : 'text-muted-foreground'}`}>
                              {Math.round(s.stats.avgScore)}%
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                  </tbody>
                </table>
                {students.length > 10 && (
                  <div className="px-4 py-2 bg-muted/30 border-t border-border text-xs text-muted-foreground text-center">
                    Showing top 10 of {students.length} students
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── Students section ─────────────────────────────────────────── */}
          <section>
            {/* Header row */}
            <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Users size={13} /> Students ({filtered.length}{filtered.length !== students.length ? ` of ${students.length}` : ''})
              </h2>
              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-black hover:opacity-90 active:scale-95 transition-all shadow-sm"
              >
                <Plus size={14} /> Add student
              </button>
            </div>

            {/* Search + age filter */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <div className="relative flex-1 min-w-48">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or code..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="flex gap-1">
                {['all', ...AGE_GROUPS].map((ag) => (
                  <button
                    key={ag}
                    onClick={() => setAgeFilter(ag)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                      ageFilter === ag
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:border-primary/50 bg-card'
                    }`}
                  >
                    {ag === 'all' ? 'All ages' : ag}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-4 text-destructive text-sm">
                <AlertCircle size={15} /> {error}
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card border border-border rounded-2xl p-4 animate-pulse">
                    <div className="flex gap-3 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-muted" />
                      <div className="flex-1 flex flex-col gap-2 pt-1">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((j) => <div key={j} className="h-14 bg-muted rounded-xl" />)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && filtered.length === 0 && (
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                {students.length === 0 ? (
                  <>
                    <div className="text-5xl mb-4">🎓</div>
                    <p className="font-black text-foreground text-lg mb-2">No students yet</p>
                    <p className="text-muted-foreground text-sm mb-5">Add your first student to start tracking their progress.</p>
                    <button
                      onClick={() => setShowAdd(true)}
                      className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-black text-sm hover:opacity-90 transition-all"
                    >
                      Add first student
                    </button>
                  </>
                ) : (
                  <>
                    <Search size={32} className="text-muted-foreground mx-auto mb-3" />
                    <p className="font-bold text-foreground mb-1">No students match your search</p>
                    <p className="text-muted-foreground text-sm">Try a different name or clear the filters.</p>
                  </>
                )}
              </div>
            )}

            {/* Student grid */}
            {!loading && filtered.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((s) => <StudentCard key={s.id} student={s} />)}
              </div>
            )}
          </section>

          {/* ── Notes summary ────────────────────────────────────────────── */}
          {studentsWithNotes > 0 && (
            <section>
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                <StickyNote size={13} /> Students with notes ({studentsWithNotes})
              </h2>
              <div className="flex flex-col gap-2">
                {students.filter((s) => s.notes.length > 0).map((s) => (
                  <Link
                    key={s.id}
                    to={`/teacher-hub/student/${s.id}`}
                    className="bg-card border border-amber-200 rounded-2xl p-4 flex items-start gap-3 hover:border-amber-400 transition-colors group"
                  >
                    <span className="text-xl flex-shrink-0">{s.avatarEmoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground text-sm">{s.name}</p>
                      <p className="text-muted-foreground text-xs line-clamp-1 mt-0.5">{s.notes[0].noteText}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        {s.notes.length} note{s.notes.length !== 1 ? 's' : ''}
                      </span>
                      <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ── Top performers ───────────────────────────────────────────── */}
          {students.length >= 3 && (
            <section>
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                <Trophy size={13} /> Top performers
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[...students].sort((a, b) => b.totalStars - a.totalStars).slice(0, 3).map((s, i) => (
                  <Link
                    key={s.id}
                    to={`/teacher-hub/student/${s.id}`}
                    className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 hover:border-primary/40 hover:shadow-sm transition-all"
                  >
                    <span className="text-2xl">{(['🥇', '🥈', '🥉'] as const).at(i) ?? '🏅'}</span>
                    <span className="text-xl">{s.avatarEmoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground text-sm truncate">{s.name}</p>
                      <p className="text-yellow-600 text-xs font-bold">⭐ {s.totalStars} stars</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </div>
      </main>

      {/* Add student modal */}
      <AnimatePresence>
        {showAdd && (
          <AddStudentModal
            onClose={() => setShowAdd(false)}
            onAdded={(s) => setStudents((prev) => [...prev, s as Student])}
          />
        )}
      </AnimatePresence>
    </>
  );
}
