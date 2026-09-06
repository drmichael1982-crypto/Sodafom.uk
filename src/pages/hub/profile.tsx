/**
 * /hub/profile — User profile page
 * Shows sign-in details, subscription status, children + their stars,
 * rewards summary, and 1000-star milestone promo code auto-link.
 */
import { useState, useEffect } from 'react';
import { API_PREFIX } from '@/lib/config';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useSession, ProtectedRoute, signOut } from '@/lib/auth/auth-client';
import { useSubscription } from '@/hooks/useSubscription';
import { User, Mail, CreditCard, Star, Gift, Copy, Check, ChevronRight, Trophy, Sparkles, Crown, Calendar, ArrowRight, Shield, XCircle, Lock, Eye, EyeOff, CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import CancelSubscriptionFlow from '@/components/CancelSubscriptionFlow';

// ── Types ─────────────────────────────────────────────────────────────────────

// ── Types ─────────────────────────────────────────────────────────────────────
interface Child {
  id: number;
  name: string;
  ageGroup: string;
  avatarEmoji: string;
  totalStars: number;
}

interface Milestone {
  milestone: number;
  promoCode: string | null;
  claimedAt: string;
}

interface SubData {
  plan: string | null;
  status: string | null;
  trialEnd: string | null;
  currentPeriodEnd: string | null;
}

const PLAN_LABELS: Record<string, string> = {
  monthly: 'Monthly — £1/month',
  annual:  'Annual — £10/year',
  school:  'School licence',
  promo:   'Promo (free)',
  trial:   '7-day free trial',
};

const PLAN_COLOURS: Record<string, string> = {
  monthly: 'bg-blue-100 text-blue-800 border-blue-300',
  annual:  'bg-green-100 text-green-800 border-green-300',
  school:  'bg-purple-100 text-purple-800 border-purple-300',
  promo:   'bg-yellow-100 text-yellow-800 border-yellow-300',
  trial:   'bg-orange-100 text-orange-800 border-orange-300',
};

const MILESTONE_REWARDS = [1000, 2000, 3000, 5000];

// ── Avatar emoji picker ───────────────────────────────────────────────────────
const AVATAR_EMOJIS = [
  '🦁','🐯','🐻','🦊','🐼','🐨','🐸','🐙','🦋','🐬',
  '🦄','🐲','🦅','🦜','🐧','🦔','🐺','🦝','🐮','🐷',
  '🌟','⭐','🚀','🎮','🎨','🎵','🏆','💎','🌈','🔥',
];

function ChildCard({
  child,
  onEmojiChange,
}: {
  child: { id: number; name: string; ageGroup: string; avatarEmoji: string; totalStars: number };
  onEmojiChange: (id: number, emoji: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function pickEmoji(emoji: string) {
    setSaving(true);
    try {
      await fetch(`${API_PREFIX}/children/${child.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ avatarEmoji: emoji }),
      });
      onEmojiChange(child.id, emoji);
    } catch { /* silent */ }
    setSaving(false);
    setPickerOpen(false);
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setPickerOpen(o => !o)}
          className="text-3xl w-12 h-12 rounded-xl bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors relative group"
          title="Change avatar"
          aria-label="Change avatar emoji"
        >
          {child.avatarEmoji || '🦁'}
          <span className="absolute -bottom-1 -right-1 text-xs bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✏️</span>
        </button>
        <div className="flex-1">
          <p className="font-black text-foreground">{child.name}</p>
          <p className="text-muted-foreground text-xs">Age {child.ageGroup}</p>
        </div>
        <div className="text-right">
          <p className="font-black text-yellow-600 text-lg leading-none">⭐ {child.totalStars.toLocaleString()}</p>
          <p className="text-muted-foreground text-xs">total stars</p>
        </div>
      </div>

      {/* Emoji picker */}
      <AnimatePresence>
        {pickerOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-xs font-bold text-muted-foreground mb-2">Pick an avatar:</p>
            <div className="flex flex-wrap gap-2">
              {AVATAR_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => pickEmoji(emoji)}
                  disabled={saving}
                  className={`text-2xl w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 ${
                    child.avatarEmoji === emoji
                      ? 'bg-primary/20 ring-2 ring-primary'
                      : 'bg-muted hover:bg-primary/10'
                  }`}
                  aria-label={`Set avatar to ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <StarProgress stars={child.totalStars} />
      <Link
        to={`/hub/child/${child.id}`}
        className="flex items-center justify-between text-sm font-bold text-primary hover:underline"
      >
        View full progress <ChevronRight size={14} />
      </Link>
    </div>
  );
}

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* silent */ }
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

// ── Star progress bar ─────────────────────────────────────────────────────────
function StarProgress({ stars }: { stars: number }) {
  const nextMilestone = MILESTONE_REWARDS.find((m) => stars < m) ?? MILESTONE_REWARDS[MILESTONE_REWARDS.length - 1];
  const prevMilestone = MILESTONE_REWARDS[MILESTONE_REWARDS.indexOf(nextMilestone) - 1] ?? 0;
  const pct = Math.min(((stars - prevMilestone) / (nextMilestone - prevMilestone)) * 100, 100);
  const starsLeft = Math.max(nextMilestone - stars, 0);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-xs font-bold text-muted-foreground">
        <span>⭐ {stars.toLocaleString()} stars</span>
        <span>{starsLeft > 0 ? `${starsLeft.toLocaleString()} to next reward` : 'Milestone reached!'}</span>
      </div>
      <div className="h-3 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500"
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{prevMilestone.toLocaleString()}</span>
        <span>{nextMilestone.toLocaleString()}</span>
      </div>
    </div>
  );
}

// ── Profile inner (rendered once auth confirmed) ──────────────────────────────
function ProfileInner() {
  const sessionData = useSession();
  const { subscribed } = useSubscription();

  const [children, setChildren] = useState<Child[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [subData, setSubData] = useState<SubData | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit name state
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameMsg, setNameMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Change password state
  const [showPwForm, setShowPwForm] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const user = sessionData.user;

  useEffect(() => {
    if (user?.name) setNameInput(user.name);
  }, [user?.name]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [childRes, subRes] = await Promise.all([
          fetch(`${API_PREFIX}/children`),
          fetch(`${API_PREFIX}/subscription`),
        ]);
        const childData = await childRes.json() as { children?: Child[] };
        setChildren(childData.children ?? []);

        const sd = await subRes.json() as SubData;
        setSubData(sd);

        // Load milestones for each child
        const allMilestones: Milestone[] = [];
        for (const child of childData.children ?? []) {
          const mRes = await fetch(`${API_PREFIX}/rewards/milestones?childId=${child.id}`);
          const mData = await mRes.json() as { milestones?: Milestone[] };
          allMilestones.push(...(mData.milestones ?? []));
        }
        setMilestones(allMilestones);
      } catch { /* silent */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const totalStars = children.reduce((sum, c) => sum + c.totalStars, 0);
  const promoMilestones = milestones.filter((m) => m.promoCode);

  const [showCancel, setShowCancel] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const planKey = subData?.plan ?? '';
  const planLabel = Object.hasOwn(PLAN_LABELS, planKey) ? PLAN_LABELS[planKey as keyof typeof PLAN_LABELS] : (subscribed ? 'Active subscription' : 'No active plan');
  const planColour = Object.hasOwn(PLAN_COLOURS, planKey) ? PLAN_COLOURS[planKey as keyof typeof PLAN_COLOURS] : 'bg-muted text-muted-foreground border-border';

  const trialEndDate = subData?.trialEnd
    ? new Date(subData.trialEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;
  const renewDate = subData?.currentPeriodEnd
    ? new Date(subData.currentPeriodEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  // ── Save name ────────────────────────────────────────────────────────────────
  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setNameSaving(true);
    setNameMsg(null);
    try {
      const res = await fetch(`${API_PREFIX}/auth/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: nameInput.trim() }),
      });
      if (res.ok) {
        setNameMsg({ type: 'success', text: 'Name updated successfully!' });
        setEditingName(false);
        setTimeout(() => setNameMsg(null), 3000);
      } else {
        const d = await res.json() as { error?: string };
        setNameMsg({ type: 'error', text: d.error ?? 'Could not update name' });
      }
    } catch {
      setNameMsg({ type: 'error', text: 'Something went wrong' });
    } finally {
      setNameSaving(false);
    }
  };

  // ── Change password ──────────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) {
      setPwMsg({ type: 'error', text: 'Please fill in all fields' });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (newPw.length < 8) {
      setPwMsg({ type: 'error', text: 'New password must be at least 8 characters' });
      return;
    }
    setPwSaving(true);
    setPwMsg(null);
    try {
      const res = await fetch(`${API_PREFIX}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      if (res.ok) {
        setPwMsg({ type: 'success', text: 'Password changed successfully!' });
        setCurrentPw(''); setNewPw(''); setConfirmPw('');
        setShowPwForm(false);
        setTimeout(() => setPwMsg(null), 4000);
      } else {
        const d = await res.json() as { error?: string };
        setPwMsg({ type: 'error', text: d.error ?? 'Could not change password' });
      }
    } catch {
      setPwMsg({ type: 'error', text: 'Something went wrong' });
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-muted/30 pb-16">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-primary shadow-md">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-accent-foreground font-black text-xl">
              {user?.name?.[0]?.toUpperCase() ?? '👤'}
            </div>
              <div>
                <h1 className="text-primary-foreground font-black text-base leading-none">{user?.name ?? 'My Profile'}</h1>
                <p className="text-primary-foreground/70 text-xs mt-0.5">{user?.email}</p>
              </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/hub"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-foreground/15 text-primary-foreground text-sm font-bold hover:bg-primary-foreground/25 transition-colors"
            >
              <ChevronRight size={13} className="rotate-180" /> Hub
            </Link>
            <button
              onClick={() => signOut().then(() => window.location.href = '/')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-foreground/10 text-primary-foreground/80 text-sm font-bold hover:bg-primary-foreground/20 transition-colors"
              title="Sign out"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">

        {/* ── Account details (editable) ───────────────────────────────────── */}
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
            <User size={13} /> Account details
          </h2>
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">

            {/* Email — read-only */}
            <div className="flex items-center gap-4 px-5 py-4 border-b border-border">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Mail size={14} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-bold">Email address</p>
                <p className="font-bold text-foreground text-sm truncate">{user?.email ?? '—'}</p>
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full font-semibold">Read-only</span>
            </div>

            {/* Name — editable */}
            <div className="px-5 py-4 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <User size={14} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-bold mb-1">Full name</p>
                  {editingName ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={nameInput}
                        onChange={e => setNameInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                        className="flex-1 px-3 py-1.5 rounded-xl border-2 border-primary bg-background text-foreground text-sm font-bold focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveName}
                        disabled={nameSaving}
                        className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-black disabled:opacity-50"
                      >
                        {nameSaving ? '...' : 'Save'}
                      </button>
                      <button
                        onClick={() => { setEditingName(false); setNameInput(user?.name ?? ''); }}
                        className="px-3 py-1.5 rounded-xl border border-border text-muted-foreground text-xs font-bold hover:bg-muted"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-foreground text-sm">{user?.name ?? '—'}</p>
                      <button
                        onClick={() => setEditingName(true)}
                        className="text-xs text-primary font-bold hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <AnimatePresence>
                {nameMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className={`mt-2 flex items-center gap-1.5 text-xs font-bold ml-12 ${nameMsg.type === 'success' ? 'text-green-700' : 'text-destructive'}`}
                  >
                    {nameMsg.type === 'success' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                    {nameMsg.text}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Password change */}
            <div className="px-5 py-4">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Lock size={14} className="text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground font-bold">Password</p>
                  <p className="font-bold text-foreground text-sm">••••••••</p>
                </div>
                <button
                  onClick={() => { setShowPwForm(p => !p); setPwMsg(null); }}
                  className="text-xs text-primary font-bold hover:underline"
                >
                  {showPwForm ? 'Cancel' : 'Change'}
                </button>
              </div>

              <AnimatePresence>
                {showPwForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 ml-12 flex flex-col gap-3">
                      {/* Current password */}
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1">Current password</label>
                        <div className="relative">
                          <input
                            type={showCurrentPw ? 'text' : 'password'}
                            value={currentPw}
                            onChange={e => setCurrentPw(e.target.value)}
                            placeholder="Enter current password"
                            className="w-full px-3 py-2 pr-10 rounded-xl border-2 border-border bg-background text-foreground text-sm font-semibold focus:outline-none focus:border-primary transition-colors"
                          />
                          <button type="button" onClick={() => setShowCurrentPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            {showCurrentPw ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>
                      {/* New password */}
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1">New password</label>
                        <div className="relative">
                          <input
                            type={showNewPw ? 'text' : 'password'}
                            value={newPw}
                            onChange={e => setNewPw(e.target.value)}
                            placeholder="Min. 8 characters"
                            className="w-full px-3 py-2 pr-10 rounded-xl border-2 border-border bg-background text-foreground text-sm font-semibold focus:outline-none focus:border-primary transition-colors"
                          />
                          <button type="button" onClick={() => setShowNewPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>
                      {/* Confirm password */}
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1">Confirm new password</label>
                        <input
                          type="password"
                          value={confirmPw}
                          onChange={e => setConfirmPw(e.target.value)}
                          placeholder="Repeat new password"
                          className="w-full px-3 py-2 rounded-xl border-2 border-border bg-background text-foreground text-sm font-semibold focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>

                      <AnimatePresence>
                        {pwMsg && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className={`flex items-center gap-1.5 text-xs font-bold ${pwMsg.type === 'success' ? 'text-green-700' : 'text-destructive'}`}
                          >
                            {pwMsg.type === 'success' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                            {pwMsg.text}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <button
                        onClick={handleChangePassword}
                        disabled={pwSaving}
                        className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-sm disabled:opacity-50 hover:opacity-90 transition-opacity self-start"
                      >
                        {pwSaving ? 'Saving...' : 'Update password'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {pwMsg && !showPwForm && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className={`mt-2 flex items-center gap-1.5 text-xs font-bold ml-12 ${pwMsg.type === 'success' ? 'text-green-700' : 'text-destructive'}`}
                  >
                    <CheckCircle size={12} /> {pwMsg.text}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.section>

        {/* ── Subscription ────────────────────────────────────────────────── */}
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
            <CreditCard size={13} /> Subscription
          </h2>
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Crown size={16} className="text-yellow-500" />
                <span className="font-black text-foreground">{planLabel}</span>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${planColour}`}>
                {subscribed ? 'Active' : 'Inactive'}
              </span>
            </div>
            {trialEndDate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar size={13} />
                <span>Trial ends <strong className="text-foreground">{trialEndDate}</strong></span>
              </div>
            )}
            {renewDate && !trialEndDate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar size={13} />
                <span>Renews <strong className="text-foreground">{renewDate}</strong></span>
              </div>
            )}
            {!subscribed && (
              <Link
                to="/subscribe"
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-black text-sm hover:opacity-90 active:scale-95 transition-all"
              >
                <Sparkles size={14} /> Upgrade to full access <ArrowRight size={14} />
              </Link>
            )}
            {subscribed && !cancelled && (
              <button
                onClick={() => setShowCancel(true)}
                className="flex items-center justify-center gap-2 py-2 rounded-xl border border-border text-muted-foreground font-bold text-xs hover:border-destructive hover:text-destructive transition-colors"
              >
                <XCircle size={13} /> Cancel subscription
              </button>
            )}
            {cancelled && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-bold">
                <XCircle size={14} className="text-destructive" />
                Cancellation scheduled — access continues until period end
              </div>
            )}
          </div>
        </motion.section>

        {/* ── Children & stars ────────────────────────────────────────────── */}
        {!loading && children.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
              <Star size={13} /> Stars &amp; progress
            </h2>
            <div className="flex flex-col gap-3">
              {children.map((child) => (
                <ChildCard
                  key={child.id}
                  child={child}
                  onEmojiChange={(id, emoji) =>
                    setChildren(prev => prev.map(c => c.id === id ? { ...c, avatarEmoji: emoji } : c))
                  }
                />
              ))}

              {/* Total stars across all children */}
              {children.length > 1 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center gap-3">
                  <Trophy size={20} className="text-yellow-600 flex-shrink-0" />
                  <div>
                    <p className="font-black text-yellow-900">Total family stars: {totalStars.toLocaleString()}</p>
                    <p className="text-yellow-700 text-xs">Combined across all children</p>
                  </div>
                </div>
              )}
            </div>
          </motion.section>
        )}

        {/* ── Milestone promo codes ────────────────────────────────────────── */}
        {promoMilestones.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
              <Gift size={13} /> Your reward codes
            </h2>
            <div className="flex flex-col gap-3">
              {promoMilestones.map((m) => (
                <div key={m.milestone} className="bg-card border border-yellow-300 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy size={16} className="text-yellow-600" />
                    <p className="font-black text-foreground">{m.milestone.toLocaleString()} star milestone!</p>
                    <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full border border-yellow-300 ml-auto">
                      1 month free
                    </span>
                  </div>
                  <div className="flex items-center gap-3 bg-muted rounded-xl px-4 py-3">
                    <span className="font-mono font-black text-foreground tracking-widest flex-1 text-lg">
                      {m.promoCode}
                    </span>
                    <CopyButton text={m.promoCode!} />
                  </div>
                  <p className="text-muted-foreground text-xs mt-2">
                    Share this code or use it at{' '}
                    <Link to={`/hub/signup?promo=${m.promoCode}`} className="text-primary font-bold hover:underline">
                      sodafom.uk/hub/signup?promo={m.promoCode}
                    </Link>
                  </p>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── Milestone progress (if no codes yet) ────────────────────────── */}
        {promoMilestones.length === 0 && children.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
              <Gift size={13} /> Earn reward codes
            </h2>
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <Trophy size={18} className="text-yellow-600" />
                </div>
                <div>
                  <p className="font-black text-foreground">Reach 1,000 stars</p>
                  <p className="text-muted-foreground text-sm">Get a free 1-month promo code automatically</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {MILESTONE_REWARDS.map((milestone) => {
                  const reached = totalStars >= milestone;
                  return (
                    <div key={milestone} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${reached ? 'bg-green-50 border-green-200' : 'bg-muted/50 border-border'}`}>
                      <span className={`text-lg ${reached ? '' : 'grayscale opacity-50'}`}>
                        {reached ? '✅' : '🏆'}
                      </span>
                      <span className={`font-bold text-sm flex-1 ${reached ? 'text-green-800' : 'text-muted-foreground'}`}>
                        {milestone.toLocaleString()} stars
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${reached ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                        {reached ? 'Reached!' : '1 month free'}
                      </span>
                    </div>
                  );
                })}
              </div>
              <Link
                to="/rewards"
                className="flex items-center justify-center gap-2 py-3 rounded-xl border border-primary text-primary font-black text-sm hover:bg-primary/5 transition-colors"
              >
                <Star size={14} /> View rewards &amp; characters <ChevronRight size={14} />
              </Link>
            </div>
          </motion.section>
        )}

        {/* ── Quick links ──────────────────────────────────────────────────── */}
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
            <Shield size={13} /> Quick links
          </h2>
          <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden shadow-sm">
            {[
              { label: 'My Hub',          href: '/hub',      icon: User },
              { label: 'All games',       href: '/games',    icon: Star },
              { label: 'Rewards',         href: '/rewards',  icon: Gift },
              { label: 'Subscription',    href: '/subscribe',icon: CreditCard },
            ].map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                to={href}
                className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-muted-foreground" />
                </div>
                <span className="font-bold text-foreground text-sm flex-1">{label}</span>
                <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
        </motion.section>

      </div>
      {showCancel && (
        <CancelSubscriptionFlow
          onClose={() => setShowCancel(false)}
          onCancelled={() => { setCancelled(true); setShowCancel(false); }}
        />
      )}
    </main>
  );
}

// ── Page export (wrapped in auth guard) ───────────────────────────────────────
export default function ProfilePage() {
  return (
    <>
      <Helmet>
        <title>My Profile — Sodafom</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Manage your Sodafom account, subscription, children's progress and reward codes." />
        <link rel="canonical" href="https://sodafom.uk/hub/profile" />
      </Helmet>
      <ProtectedRoute redirectTo="/hub/login">
        <ProfileInner />
      </ProtectedRoute>
    </>
  );
}
