/**
 * /certificates — Printable achievement certificates for children
 * Multiple certificate types: General Achievement, Subject Master, Star Collector, Streak Champion
 */
import React, { useState, useEffect } from 'react';
import { API_PREFIX } from '@/lib/config';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ProtectedRoute, useSession } from '@/lib/auth/auth-client';
import {
  Printer, Trophy, ChevronRight,
  Calculator, BookOpen, Pencil, FlaskConical, Check,
} from 'lucide-react';

interface Child { id: number; name: string; age_group: string; total_stars: number; avatarEmoji?: string }
interface DashData {
  badgeCount: number;
  subjects: { subject: string; games_played: number; stars: number }[];
}
interface StreakData { currentStreak: number; maxStreak: number }

const CERT_TYPES = [
  { id: 'achievement',     label: 'Achievement',    emoji: '🏆', description: 'General learning achievement' },
  { id: 'star-collector',  label: 'Star Collector',  emoji: '⭐', description: 'Awarded for earning stars' },
  { id: 'streak-champion', label: 'Streak Champion', emoji: '🔥', description: 'Awarded for daily streaks' },
  { id: 'subject-master',  label: 'Subject Master',  emoji: '📚', description: 'Mastery in a specific subject' },
] as const;

type CertTypeId = typeof CERT_TYPES[number]['id'];

const SUBJECT_CONFIG: Record<string, { label: string; emoji: string; icon: React.ElementType }> = {
  maths:    { label: 'Maths',    emoji: '🔢', icon: Calculator },
  spelling: { label: 'Spelling', emoji: '✏️', icon: Pencil },
  reading:  { label: 'Reading',  emoji: '📖', icon: BookOpen },
  science:  { label: 'Science',  emoji: '🔬', icon: FlaskConical },
};

// ── Print helper ──────────────────────────────────────────────────────────────
function printCertificate(html: string, title: string) {
  const win = window.open('', '_blank');
  if (!win) return;

  // Build the print document safely — avoid document.write with user-supplied data
  const safeTitle = document.createElement('title');
  safeTitle.textContent = title; // textContent never executes scripts
  const titleHtml = safeTitle.outerHTML;

  const blob = new Blob([`<!DOCTYPE html><html><head>
    ${titleHtml}
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap" rel="stylesheet">
    <style>
      *{box-sizing:border-box;margin:0;padding:0;}
      body{font-family:'Nunito',sans-serif;background:white;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px;}
      @media print{body{padding:0;min-height:auto;}@page{size:A4 landscape;margin:10mm;}}
      .cert-wrap{width:100%;max-width:800px;}
    </style>
  </head><body><div class="cert-wrap">${html}</div></body></html>`], { type: 'text/html' });

  const url = URL.createObjectURL(blob);
  win.location.href = url;
  win.addEventListener('load', () => {
    setTimeout(() => {
      win.print();
      URL.revokeObjectURL(url);
    }, 600);
  }, { once: true });
}

// ── Shared footer ─────────────────────────────────────────────────────────────
function CertFooter({ date, ageGroup }: { date: string; ageGroup: string }) {
  return (
    <div className="w-full flex justify-between items-end text-xs text-muted-foreground mt-6 pt-4 border-t border-border/40">
      <div><strong className="text-foreground block">Date</strong>{date}</div>
      <div className="text-center">
        <div className="text-2xl mb-1">🏆</div>
        <strong className="text-foreground block">Sodafom</strong>Learning Platform
      </div>
      <div className="text-right"><strong className="text-foreground block">Age group</strong>{ageGroup}</div>
    </div>
  );
}

// ── Certificate variants ──────────────────────────────────────────────────────
function AchievementCert({ child, badgeCount, date }: { child: Child; badgeCount: number; date: string }) {
  return (
    <div className="relative rounded-2xl p-10 text-center overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 border-[6px] border-double border-primary" style={{ minHeight: '460px', fontFamily: 'var(--font-heading)' }}>
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-accent to-primary rounded-t-xl" />
      {['top-3 left-3','top-3 right-3','bottom-3 left-3','bottom-3 right-3'].map(p => <div key={p} className={`absolute ${p} text-2xl opacity-20 select-none`}>⭐</div>)}
      <img src="/assets/uploads/airo-logo-shimmer-horizontal.svg" alt="Sodafom" className="h-9 w-auto object-contain mx-auto mb-4" />
      <p className="text-xs font-black tracking-widest uppercase text-muted-foreground mb-2">Certificate of Achievement</p>
      <p className="text-sm text-foreground mb-1">This certifies that</p>
      <h2 className="text-4xl font-black text-primary my-3 leading-tight">
        {child.avatarEmoji && <span className="mr-2">{child.avatarEmoji}</span>}{child.name}
      </h2>
      <p className="text-sm text-foreground mb-6 max-w-md">
        has demonstrated outstanding dedication and achievement on the <strong>Sodafom</strong> learning platform
      </p>
      <div className="flex items-center gap-8 mb-2">
        <div className="text-center">
          <div className="text-3xl font-black text-foreground">⭐ {child.total_stars}</div>
          <div className="text-xs text-muted-foreground font-bold mt-1">Stars earned</div>
        </div>
        <div className="w-px h-12 bg-border" />
        <div className="text-center">
          <div className="text-3xl font-black text-foreground">🏅 {badgeCount}</div>
          <div className="text-xs text-muted-foreground font-bold mt-1">Badges earned</div>
        </div>
      </div>
      <CertFooter date={date} ageGroup={child.age_group} />
    </div>
  );
}

function StarCollectorCert({ child, date }: { child: Child; date: string }) {
  const milestoneLabel =
    child.total_stars >= 500 ? 'Gold Star Collector' :
    child.total_stars >= 200 ? 'Silver Star Collector' :
    child.total_stars >= 50  ? 'Bronze Star Collector' : 'Rising Star';
  return (
    <div className="relative rounded-2xl p-10 text-center overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-violet-50 border-[6px] border-double border-purple-500" style={{ minHeight: '460px', fontFamily: 'var(--font-heading)' }}>
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-yellow-400 to-purple-600 rounded-t-xl" />
      {['top-3 left-3','top-3 right-3','bottom-3 left-3','bottom-3 right-3'].map(p => <div key={p} className={`absolute ${p} text-2xl opacity-20 select-none`}>⭐</div>)}
      <img src="/assets/uploads/airo-logo-shimmer-horizontal.svg" alt="Sodafom" className="h-9 w-auto object-contain mx-auto mb-4" />
      <div className="text-5xl mb-3">⭐</div>
      <p className="text-xs font-black tracking-widest uppercase text-purple-600 mb-2">{milestoneLabel}</p>
      <p className="text-sm text-foreground mb-1">Awarded to</p>
      <h2 className="text-4xl font-black text-purple-700 my-3 leading-tight">
        {child.avatarEmoji && <span className="mr-2">{child.avatarEmoji}</span>}{child.name}
      </h2>
      <p className="text-sm text-foreground mb-4 max-w-md">
        for collecting an incredible <strong className="text-purple-700 text-lg">{Number(child.total_stars ?? 0).toLocaleString()} stars</strong> through dedicated learning and gameplay
      </p>
      <div className="flex justify-center gap-1 flex-wrap max-w-xs mb-2">
        {Array.from({ length: Math.min(child.total_stars, 15) }).map((_, i) => <span key={i} className="text-lg">⭐</span>)}
        {child.total_stars > 15 && <span className="text-xs text-muted-foreground font-bold self-center ml-1">+{child.total_stars - 15} more</span>}
      </div>
      <CertFooter date={date} ageGroup={child.age_group} />
    </div>
  );
}

function StreakChampionCert({ child, streak, date }: { child: Child; streak: number; date: string }) {
  return (
    <div className="relative rounded-2xl p-10 text-center overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 border-[6px] border-double border-orange-500" style={{ minHeight: '460px', fontFamily: 'var(--font-heading)' }}>
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-600 via-yellow-400 to-orange-600 rounded-t-xl" />
      {['top-3 left-3','top-3 right-3','bottom-3 left-3','bottom-3 right-3'].map(p => <div key={p} className={`absolute ${p} text-2xl opacity-20 select-none`}>🔥</div>)}
      <img src="/assets/uploads/airo-logo-shimmer-horizontal.svg" alt="Sodafom" className="h-9 w-auto object-contain mx-auto mb-4" />
      <div className="text-5xl mb-3">🔥</div>
      <p className="text-xs font-black tracking-widest uppercase text-orange-600 mb-2">Streak Champion</p>
      <p className="text-sm text-foreground mb-1">Awarded to</p>
      <h2 className="text-4xl font-black text-orange-700 my-3 leading-tight">
        {child.avatarEmoji && <span className="mr-2">{child.avatarEmoji}</span>}{child.name}
      </h2>
      <p className="text-sm text-foreground mb-4 max-w-md">
        for maintaining an incredible <strong className="text-orange-700 text-lg">{streak}-day learning streak</strong> — showing true dedication and consistency
      </p>
      <div className="flex justify-center gap-1 mb-2">
        {Array.from({ length: Math.min(streak, 10) }).map((_, i) => <span key={i} className="text-xl">🔥</span>)}
        {streak > 10 && <span className="text-xs text-muted-foreground font-bold self-center ml-1">+{streak - 10} days</span>}
      </div>
      <CertFooter date={date} ageGroup={child.age_group} />
    </div>
  );
}

function SubjectMasterCert({ child, subject, subjectStars, date }: { child: Child; subject: string; subjectStars: number; date: string }) {
  const cfg = SUBJECT_CONFIG[subject] ?? { label: subject, emoji: '📚', icon: BookOpen };
  const subjectStyle: Record<string, { wrap: string; border: string; title: string; band: string }> = {
    maths:    { wrap: 'bg-gradient-to-br from-blue-50 to-sky-50',   border: 'border-blue-500',   title: 'text-blue-700',   band: 'bg-gradient-to-r from-blue-600 via-yellow-400 to-blue-600' },
    spelling: { wrap: 'bg-gradient-to-br from-purple-50 to-violet-50', border: 'border-purple-500', title: 'text-purple-700', band: 'bg-gradient-to-r from-purple-600 via-yellow-400 to-purple-600' },
    reading:  { wrap: 'bg-gradient-to-br from-emerald-50 to-teal-50', border: 'border-emerald-500', title: 'text-emerald-700', band: 'bg-gradient-to-r from-emerald-600 via-yellow-400 to-emerald-600' },
    science:  { wrap: 'bg-gradient-to-br from-orange-50 to-amber-50', border: 'border-orange-500', title: 'text-orange-700', band: 'bg-gradient-to-r from-orange-600 via-yellow-400 to-orange-600' },
  };
  const sc = subjectStyle[subject] ?? subjectStyle.maths;
  return (
    <div className={`relative rounded-2xl p-10 text-center overflow-hidden flex flex-col items-center justify-center ${sc.wrap} border-[6px] border-double ${sc.border}`} style={{ minHeight: '460px', fontFamily: 'var(--font-heading)' }}>
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${sc.band} rounded-t-xl`} />
      {['top-3 left-3','top-3 right-3','bottom-3 left-3','bottom-3 right-3'].map(p => <div key={p} className={`absolute ${p} text-2xl opacity-20 select-none`}>{cfg.emoji}</div>)}
      <img src="/assets/uploads/airo-logo-shimmer-horizontal.svg" alt="Sodafom" className="h-9 w-auto object-contain mx-auto mb-4" />
      <div className="text-5xl mb-3">{cfg.emoji}</div>
      <p className={`text-xs font-black tracking-widest uppercase mb-2 ${sc.title}`}>{cfg.label} Master</p>
      <p className="text-sm text-foreground mb-1">Awarded to</p>
      <h2 className={`text-4xl font-black my-3 leading-tight ${sc.title}`}>
        {child.avatarEmoji && <span className="mr-2">{child.avatarEmoji}</span>}{child.name}
      </h2>
      <p className="text-sm text-foreground mb-6 max-w-md">
        for outstanding achievement in <strong className={sc.title}>{cfg.label}</strong>, earning{' '}
        <strong className={`${sc.title} text-lg`}>{subjectStars} stars</strong> through dedicated practice
      </p>
      <CertFooter date={date} ageGroup={child.age_group} />
    </div>
  );
}

// ── Main inner component ──────────────────────────────────────────────────────
function CertificatesInner() {
  useSession();
  const [children, setChildren] = useState<Child[]>([]);
  const [selected, setSelected] = useState<Child | null>(null);
  const [dashData, setDashData] = useState<DashData | null>(null);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [certType, setCertType] = useState<CertTypeId>('achievement');
  const [selectedSubject, setSelectedSubject] = useState<string>('maths');
  const [printed, setPrinted] = useState(false);

  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  React.useEffect(() => {
    fetch(`${API_PREFIX}/children`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        const kids = (d as { children?: Child[] }).children ?? [];
        setChildren(kids);
        if (kids.length) setSelected(kids[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    if (!selected) return;
    Promise.all([
      fetch(`${API_PREFIX}/parent/dashboard?childId=${selected.id}`, { credentials: 'include' }).then(r => r.json()),
      fetch(`${API_PREFIX}/streak?childId=${selected.id}`, { credentials: 'include' }).then(r => r.json()).catch(() => null),
    ]).then(([dash, streak]) => {
      setDashData(dash as DashData);
      if (streak) setStreakData(streak as StreakData);
      const subs = (dash as DashData).subjects ?? [];
      if (subs.length > 0) {
        const best = subs.reduce((a: any, b: any) =>
          Number(b.stars) > Number(a.stars) ? b : a
        );
        setSelectedSubject(best.subject);
      }
    }).catch(console.error);
  }, [selected]);

  const handlePrint = () => {
    if (!selected) return;
    const el = document.getElementById('cert-preview');
    if (!el) return;
    printCertificate(el.innerHTML, `${certType} Certificate — ${selected.name}`);
    setPrinted(true);
    setTimeout(() => setPrinted(false), 3000);
  };

  const streak = streakData?.maxStreak ?? streakData?.currentStreak ?? 0;
  const subjectStars = dashData?.subjects?.find(s => s.subject === selectedSubject)?.stars ?? 0;

  return (
    <>
      <Helmet>
        <title>Achievement Certificates — Sodafom</title>
        <meta name="description" content="Print or download personalised achievement certificates for your child. Celebrate stars, streaks, and subject mastery on Sodafom." />
        <link rel="canonical" href="https://sodafom.uk/certificates" />
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
              Achievement Certificates
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Print a personalised certificate to celebrate your child's learning milestones.
            </p>
          </div>
          <Link to="/hub" className="flex items-center gap-1 text-sm font-bold text-primary hover:underline shrink-0">
            ← Hub
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded-2xl animate-pulse" />)}
            </div>
            <div className="h-96 bg-muted rounded-3xl animate-pulse" />
          </div>
        ) : children.length === 0 ? (
          <div className="bg-card rounded-3xl border-2 border-border p-12 text-center">
            <Trophy size={48} className="text-primary mx-auto mb-4" />
            <h2 className="text-xl font-black text-foreground mb-2">No children added yet</h2>
            <p className="text-muted-foreground text-sm mb-6">Add a child profile to generate their certificate.</p>
            <Link to="/hub" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-black text-sm hover:opacity-90">
              Go to Hub <ChevronRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">
            {/* ── Left panel: controls ── */}
            <div className="flex flex-col gap-5">
              {/* Child selector */}
              {children.length > 1 && (
                <div className="bg-card rounded-2xl border border-border p-4">
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-wide mb-3">Select child</p>
                  <div className="flex flex-col gap-2">
                    {children.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelected(c)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all text-left ${
                          selected?.id === c.id
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border text-muted-foreground hover:border-primary/40'
                        }`}
                      >
                        <span className="text-xl">{c.avatarEmoji ?? '🦁'}</span>
                        <span className="font-black text-foreground">{c.name}</span>
                        {selected?.id === c.id && <Check size={14} className="ml-auto text-primary" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Certificate type */}
              <div className="bg-card rounded-2xl border border-border p-4">
                <p className="text-xs font-black text-muted-foreground uppercase tracking-wide mb-3">Certificate type</p>
                <div className="flex flex-col gap-2">
                  {CERT_TYPES.map((ct) => (
                    <button
                      key={ct.id}
                      onClick={() => setCertType(ct.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all text-left ${
                        certType === ct.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <span className="text-xl shrink-0">{ct.emoji}</span>
                      <div className="min-w-0">
                        <div className="font-black text-foreground text-sm">{ct.label}</div>
                        <div className="text-xs text-muted-foreground">{ct.description}</div>
                      </div>
                      {certType === ct.id && <Check size={14} className="ml-auto text-primary shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject selector (only for subject-master) */}
              <AnimatePresence>
                {certType === 'subject-master' && dashData && dashData.subjects.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-card rounded-2xl border border-border p-4 overflow-hidden"
                  >
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-wide mb-3">Subject</p>
                    <div className="flex flex-col gap-2">
                      {dashData.subjects.map((s) => {
                        const cfg = SUBJECT_CONFIG[s.subject] ?? { label: s.subject, emoji: '📚', icon: BookOpen };
                        return (
                          <button
                            key={s.subject}
                            onClick={() => setSelectedSubject(s.subject)}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 font-bold text-sm transition-all text-left ${
                              selectedSubject === s.subject
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-border text-muted-foreground hover:border-primary/40'
                            }`}
                          >
                            <span>{cfg.emoji}</span>
                            <span className="font-black text-foreground">{cfg.label}</span>
                            <span className="ml-auto text-xs text-muted-foreground">⭐ {s.stars}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Child stats summary */}
              {selected && (
                <div className="bg-muted/50 rounded-2xl border border-border p-4">
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-wide mb-3">
                    {selected.name}'s stats
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-card rounded-xl p-3 text-center">
                      <div className="text-xl font-black text-foreground">⭐ {selected.total_stars}</div>
                      <div className="text-xs text-muted-foreground">Total stars</div>
                    </div>
                    <div className="bg-card rounded-xl p-3 text-center">
                      <div className="text-xl font-black text-foreground">🏅 {dashData?.badgeCount ?? 0}</div>
                      <div className="text-xs text-muted-foreground">Badges</div>
                    </div>
                    {streak > 0 && (
                      <div className="bg-card rounded-xl p-3 text-center col-span-2">
                        <div className="text-xl font-black text-foreground">🔥 {streak}-day</div>
                        <div className="text-xs text-muted-foreground">Best streak</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── Right panel: preview + print ── */}
            <div className="flex flex-col gap-4">
              {selected && (
                <>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${certType}-${selected.id}-${selectedSubject}`}
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.25 }}
                      id="cert-preview"
                    >
                      {certType === 'achievement' && (
                        <AchievementCert child={selected} badgeCount={dashData?.badgeCount ?? 0} date={today} />
                      )}
                      {certType === 'star-collector' && (
                        <StarCollectorCert child={selected} date={today} />
                      )}
                      {certType === 'streak-champion' && (
                        <StreakChampionCert child={selected} streak={streak} date={today} />
                      )}
                      {certType === 'subject-master' && (
                        <SubjectMasterCert
                          child={selected}
                          subject={selectedSubject}
                          subjectStars={Number(subjectStars)}
                          date={today}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Print button */}
                  <motion.button
                    onClick={handlePrint}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-base shadow-lg transition-all ${
                      printed
                        ? 'bg-green-500 text-white'
                        : 'bg-primary text-primary-foreground hover:opacity-90'
                    }`}
                  >
                    {printed ? (
                      <><Check size={18} /> Print dialog opened!</>
                    ) : (
                      <><Printer size={18} /> Print / Save as PDF</>
                    )}
                  </motion.button>

                  <p className="text-xs text-muted-foreground text-center">
                    In the print dialog, choose <strong>Save as PDF</strong> to download. Landscape orientation recommended.
                  </p>

                  {/* Certificate type quick-switch pills */}
                  <div className="flex flex-wrap gap-2 justify-center pt-1">
                    {CERT_TYPES.map((ct) => (
                      <button
                        key={ct.id}
                        onClick={() => setCertType(ct.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          certType === ct.id
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border text-muted-foreground hover:border-primary/40'
                        }`}
                      >
                        {ct.emoji} {ct.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default function CertificatesPage() {
  return (
    <ProtectedRoute redirectTo="/hub/login">
      <CertificatesInner />
    </ProtectedRoute>
  );
}
