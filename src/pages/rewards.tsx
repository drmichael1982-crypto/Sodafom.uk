import { useState, useEffect, useCallback } from 'react';
import { API_PREFIX } from '@/lib/config';
import { rewards } from 'virtual:content';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useSession } from '@/lib/auth/auth-client';
import { ProtectedRoute } from '@/lib/auth/auth-client';
import { Lock, Unlock, Trophy, Sparkles, ChevronRight, Gift, Zap, Banknote, Copy, Check, Heart, Mail, CheckCircle } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

// ── Types ────────────────────────────────────────────────────────────────────
interface Character {
  id: number;
  slug: string;
  name: string;
  emoji: string;
  description: string;
  starCost: number;
  category: string;
  sortOrder: number;
  unlocked: boolean;
  isActive: boolean;
}

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

// ── Constants ────────────────────────────────────────────────────────────────
const ALL_MILESTONES = [1000, 2000, 3000, 5000];
const CATEGORY_LABELS: Record<string, string> = {
  animal: '🐾 Animals',
  fantasy: '✨ Fantasy',
  hero: '🏆 Heroes',
};

// 100-star tier labels shown in the progress track


const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

// ── Copy-to-clipboard button ──────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      className="ml-2 p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
      title="Copy code"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

// ── Star Bank ─────────────────────────────────────────────────────────────────
function StarBank({ child, nextMilestone, milestones }: {
  child: Child;
  nextMilestone: number;
  milestones: Milestone[];
}) {
  const pct = Math.min((child.totalStars / nextMilestone) * 100, 100);
  const starsNeeded = Math.max(nextMilestone - child.totalStars, 0);
  const earnedCodes = milestones.filter((m) => m.promoCode);

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible">
      {/* Bank card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground p-6 shadow-xl">
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/5" />

        <div className="relative z-10">
          {/* Header row */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <Banknote size={20} />
              </div>
              <div>
                <p className="font-black text-base" style={{ fontFamily: 'var(--font-heading)' }}>
                  {rewards.starBank.title}
                </p>
                <p className="text-primary-foreground/70 text-xs">{child.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-primary-foreground/60 text-xs font-bold uppercase tracking-wide">{rewards.starBank.balanceLabel}</p>
              <p className="font-black text-4xl leading-none" style={{ fontFamily: 'var(--font-heading)' }}>
                {Number(child.totalStars ?? 0).toLocaleString()}
              </p>
              <p className="text-primary-foreground/70 text-xs">⭐ {rewards.starBank.starsUnit}</p>
            </div>
          </div>

          {/* Progress to next milestone */}
          <div className="mb-3">
            <div className="flex justify-between text-xs font-bold text-primary-foreground/70 mb-1.5">
              <span>Progress to {nextMilestone.toLocaleString()} star reward</span>
              <span>{Math.round(pct)}%</span>
            </div>
            <div className="h-3 rounded-full bg-white/20 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-accent"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>

          {starsNeeded > 0 ? (
            <p className="text-primary-foreground/70 text-xs text-center">
              <strong className="text-primary-foreground">{starsNeeded.toLocaleString()} more stars</strong> to earn 1 month free access
            </p>
          ) : (
            <p className="text-accent text-xs text-center font-bold">
              {rewards.starBank.milestoneReachedMsg}
            </p>
          )}
        </div>
      </div>

      {/* How stars are earned */}
      <div className="mt-4 bg-card border-2 border-border rounded-2xl p-4">
        <p className="font-black text-foreground text-sm mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
          {rewards.starBank.howToTitle}
        </p>
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          {[
            { emoji: '🥇', stars: '3 stars', desc: 'Score 90%+' },
            { emoji: '🥈', stars: '2 stars', desc: 'Score 75–89%' },
            { emoji: '🥉', stars: '1 star', desc: 'Score 50–74%' },
          ].map((item) => (
            <div key={item.stars} className="bg-muted rounded-xl p-2.5">
              <div className="text-2xl mb-1">{item.emoji}</div>
              <p className="font-black text-foreground">{item.stars}</p>
              <p className="text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 text-center">
          <Link
            to="/games"
            className="inline-flex items-center gap-1.5 text-primary font-bold text-xs hover:underline"
          >
            <span>{rewards.starBank.playGamesLabel}</span>
          </Link>
        </div>
      </div>

      {/* Thanks section — earned codes */}
      {earnedCodes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/40 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Heart size={18} className="text-secondary fill-secondary" />
            <h3 className="font-black text-foreground text-base" style={{ fontFamily: 'var(--font-heading)' }}>
              {rewards.starBank.thanksTitle}
            </h3>
          </div>
          <p className="text-muted-foreground text-xs mb-4 leading-relaxed">
            Amazing work! <strong className="text-foreground">{child.name}</strong> earned enough stars to unlock free access.
            Use the code below on the <Link to="/subscribe" className="text-primary underline">subscribe page</Link> — it gives 1 full month free.
          </p>
          <div className="space-y-2">
            {earnedCodes.map((m) => (
              <div key={m.milestone} className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
                <div>
                  <p className="text-xs text-muted-foreground font-bold mb-0.5">
                    🏆 {m.milestone.toLocaleString()} star milestone
                  </p>
                  <p className="font-mono font-black text-primary tracking-widest text-sm">
                    {m.promoCode}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(m.claimedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  {m.promoCode && <CopyButton text={m.promoCode} />}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            {rewards.starBank.codeFootnote}
          </p>
        </motion.div>
      )}

      {/* Teaser if no codes yet */}
      {earnedCodes.length === 0 && (
        <div className="mt-4 border-2 border-dashed border-border rounded-2xl p-5 text-center">
          <div className="text-3xl mb-2">🎁</div>
          <p className="font-black text-foreground text-sm mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
            {rewards.starBank.teaserTitle}
          </p>
          <p className="text-muted-foreground text-xs">
            A unique access code will appear here automatically once {child.name} hits the milestone.
          </p>
        </div>
      )}
    </motion.div>
  );
}

// ── Character card ────────────────────────────────────────────────────────────
function CharacterCard({
  character,
  childStars,
  onUnlock,
  onEquip,
  unlocking,
  equipping,
}: {
  character: Character;
  childStars: number;
  onUnlock: (id: number) => void;
  onEquip: (id: number) => void;
  unlocking: number | null;
  equipping: number | null;
}) {
  const canAfford = childStars >= character.starCost;
  const isUnlocking = unlocking === character.id;
  const isEquipping = equipping === character.id;

  return (
    <motion.div
      variants={cardVariants}
      whileHover={!character.unlocked ? { scale: 1.03 } : {}}
      className={`relative rounded-3xl border-2 p-5 flex flex-col items-center text-center transition-colors ${
        character.isActive
          ? 'border-accent bg-accent/10 ring-2 ring-accent/40'
          : character.unlocked
          ? 'border-primary/40 bg-primary/5'
          : canAfford
          ? 'border-accent/60 bg-accent/5 cursor-pointer'
          : 'border-border bg-card opacity-70'
      }`}
    >
      {/* Active badge */}
      {character.isActive && (
        <div className="absolute top-2 left-2 bg-accent text-accent-foreground rounded-full px-2 py-0.5 text-xs font-black">
          Active
        </div>
      )}

      {/* Unlocked tick */}
      {character.unlocked && !character.isActive && (
        <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full p-1">
          <Unlock size={11} />
        </div>
      )}

      {/* Star cost badge (locked) */}
      {!character.unlocked && (
        <div className="absolute top-3 right-3 bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-black flex items-center gap-0.5">
          <Lock size={9} />
          <span>{character.starCost}</span>
        </div>
      )}

      <motion.div
        className="text-5xl mb-2 select-none"
        animate={character.isActive ? { scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] } : {}}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
      >
        {character.emoji}
      </motion.div>

      <h3 className="font-black text-foreground text-sm mb-1 leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
        {character.name}
      </h3>

      <p className="text-muted-foreground text-xs leading-relaxed mb-3 flex-1">{character.description}</p>

      {character.unlocked ? (
        character.isActive ? (
          <div className="w-full py-2 rounded-2xl bg-accent/20 text-accent-foreground font-black text-xs flex items-center justify-center gap-1.5">
            <span>✨</span>
            <span>Currently active</span>
          </div>
        ) : (
          <button
            onClick={() => onEquip(character.id)}
            disabled={isEquipping}
            className="w-full py-2 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-all disabled:opacity-60"
          >
            {isEquipping ? (
              <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.6 }}>⭐</motion.span>
            ) : (
              <>
                <Unlock size={12} />
                <span>Use this character</span>
              </>
            )}
          </button>
        )
      ) : (
        <button
          onClick={() => canAfford && onUnlock(character.id)}
          disabled={!canAfford || isUnlocking}
          className={`w-full py-2 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
            canAfford
              ? 'bg-accent text-accent-foreground hover:scale-105 active:scale-95'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          {isUnlocking ? (
            <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.6 }}>
              ⭐
            </motion.span>
          ) : (
            <>
              {canAfford ? <Unlock size={12} /> : <Lock size={12} />}
              <span>{character.starCost.toLocaleString()} ⭐ to unlock</span>
            </>
          )}
        </button>
      )}
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function RewardsContent() {
  const sessionData = useSession();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [unlocking, setUnlocking] = useState<number | null>(null);
  const [equipping, setEquipping] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [rewardEmail, setRewardEmail] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);

  useEffect(() => {
    if (!sessionData?.user) return;
    fetch(`${API_PREFIX}/children`)
      .then((r) => r.json())
      .then((data: { children?: Child[] }) => {
        const kids = data.children ?? [];
        setChildren(kids);
        if (kids.length > 0) setSelectedChild(kids[0]);
      })
      .catch(console.error);
  }, [sessionData]);

  const fetchRewards = useCallback(async (child: Child) => {
    setLoading(true);
    try {
      const [charsRes, milesRes] = await Promise.all([
        fetch(`${API_PREFIX}/rewards/characters?childId=${child.id}`),
        fetch(`${API_PREFIX}/rewards/milestones?childId=${child.id}`),
      ]);
      const charsData = await charsRes.json() as { characters?: Character[] };
      const milesData = await milesRes.json() as { milestones?: Milestone[]; totalStars?: number };
      setCharacters(charsData.characters ?? []);
      setMilestones(milesData.milestones ?? []);
      if (milesData.totalStars !== undefined) {
        setSelectedChild((prev) => prev ? { ...prev, totalStars: milesData.totalStars! } : prev);
        setChildren((prev) => prev.map((c) => c.id === child.id ? { ...c, totalStars: milesData.totalStars! } : c));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedChild) fetchRewards(selectedChild);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChild?.id, fetchRewards]);

  // Load reward_email for selected child
  useEffect(() => {
    if (!selectedChild) return;
    fetch(`${API_PREFIX}/children/${selectedChild.id}/reward-email`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then((d: { rewardEmail?: string } | null) => {
        const email = d?.rewardEmail ?? '';
        setRewardEmail(email);
        setEmailInput(email);
      })
      .catch(() => {});
  }, [selectedChild?.id]);

  const handleSaveEmail = async () => {
    if (!selectedChild) return;
    setEmailSaving(true);
    setEmailSaved(false);
    try {
      const res = await fetch(`${API_PREFIX}/rewards/reward-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ childId: selectedChild.id, email: emailInput }),
      });
      if (res.ok) {
        setRewardEmail(emailInput);
        setEmailSaved(true);
        setTimeout(() => setEmailSaved(false), 3000);
      } else {
        const d = await res.json() as { error?: string };
        showToast(d.error ?? 'Could not save email', 'error');
      }
    } catch {
      showToast('Something went wrong', 'error');
    } finally {
      setEmailSaving(false);
    }
  };

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleUnlock = async (characterId: number) => {
    if (!selectedChild) return;
    setUnlocking(characterId);
    try {
      const res = await fetch(`${API_PREFIX}/rewards/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId: selectedChild.id, characterId }),
      });
      const data = await res.json() as {
        success?: boolean;
        error?: string;
        character?: { name: string; emoji: string };
        starsRemaining?: number;
      };
      if (data.success) {
        showToast(`${data.character?.emoji} ${data.character?.name} unlocked! Tap "Use this character" to equip it.`, 'success');
        setCharacters((prev) => prev.map((c) => c.id === characterId ? { ...c, unlocked: true } : c));
        setSelectedChild((prev) => prev ? { ...prev, totalStars: data.starsRemaining ?? prev.totalStars } : prev);
        setChildren((prev) => prev.map((c) => c.id === selectedChild.id ? { ...c, totalStars: data.starsRemaining ?? c.totalStars } : c));
      } else {
        showToast(data.error ?? 'Could not unlock character', 'error');
      }
    } catch {
      showToast('Something went wrong', 'error');
    } finally {
      setUnlocking(null);
    }
  };

  const handleEquip = async (characterId: number) => {
    if (!selectedChild) return;
    setEquipping(characterId);
    try {
      const res = await fetch(`${API_PREFIX}/rewards/set-character`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ childId: selectedChild.id, characterId }),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (data.success) {
        const equipped = characters.find((c) => c.id === characterId);
        showToast(`${equipped?.emoji ?? '⭐'} ${equipped?.name ?? 'Character'} is now active!`, 'success');
        setCharacters((prev) => prev.map((c) => ({ ...c, isActive: c.id === characterId })));
        // Update the child's avatarEmoji in local state
        if (equipped) {
          setSelectedChild((prev) => prev ? { ...prev, avatarEmoji: equipped.emoji } : prev);
          setChildren((prev) => prev.map((c) => c.id === selectedChild.id ? { ...c, avatarEmoji: equipped.emoji } : c));
        }
      } else {
        showToast(data.error ?? 'Could not equip character', 'error');
      }
    } catch {
      showToast('Something went wrong', 'error');
    } finally {
      setEquipping(null);
    }
  };

  const categories = ['all', ...Array.from(new Set(characters.map((c) => c.category)))];
  const filtered = activeCategory === 'all' ? characters : characters.filter((c) => c.category === activeCategory);
  const nextMilestone = ALL_MILESTONES.find((m) => (selectedChild?.totalStars ?? 0) < m) ?? ALL_MILESTONES[ALL_MILESTONES.length - 1];

  // 100-star character tiers
  const nextCharacterTier = characters.find((c) => !c.unlocked);
  const starsToNextChar = nextCharacterTier ? Math.max(nextCharacterTier.starCost - (selectedChild?.totalStars ?? 0), 0) : 0;
  const activeCharacter = characters.find((c) => c.isActive);

  return (
    <main className="min-h-screen bg-background pb-20">
      <Helmet>
        <title>{rewards.seo.title}</title>
        <meta name="description" content={rewards.seo.description} />
        <link rel="canonical" href="https://sodafom.uk/rewards" />
        <meta property="og:title" content={rewards.seo.title} />
        <meta property="og:description" content={rewards.seo.description} />
        <meta property="og:url" content="https://sodafom.uk/rewards" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={rewards.seo.title} />
        <meta name="twitter:description" content={rewards.seo.description} />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': 'https://sodafom.uk/rewards#webpage',
          name: 'Rewards & Star Bank — Sodafom',
          url: 'https://sodafom.uk/rewards',
          description: 'Earn stars, unlock characters and claim rewards on Sodafom. The more you learn, the more you earn!',
          isPartOf: { '@id': 'https://sodafom.uk/#website' },
          about: { '@id': 'https://sodafom.uk/#organization' },
        })}</script>
      </Helmet>

      {/* Page header */}
      <div className="bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/5 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
              <Link to="/hub" className="hover:text-foreground transition-colors">Dashboard</Link>
              <ChevronRight size={14} />
              <span className="text-foreground font-bold">Rewards</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center">
                <Sparkles size={24} className="text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                  {rewards.heading}
                </h1>
                <p className="text-muted-foreground text-sm">{rewards.subheading}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* Child selector */}
        {children.length > 1 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex gap-3 flex-wrap">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 font-bold text-sm transition-all ${
                  selectedChild?.id === child.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-foreground hover:border-primary/40'
                }`}
              >
                <span className="text-xl">{child.avatarEmoji}</span>
                <span>{child.name}</span>
                <span className="text-xs text-muted-foreground">⭐ {child.totalStars}</span>
              </button>
            ))}
          </motion.div>
        )}

        {/* No children */}
        {children.length === 0 && !loading && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="text-center py-16">
            <div className="text-6xl mb-4">👶</div>
            <h2 className="text-xl font-black text-foreground mb-2">{rewards.noChildren.heading}</h2>
            <p className="text-muted-foreground mb-6">{rewards.noChildren.body}</p>
            <Link to="/hub" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold hover:scale-105 transition-transform">
              {rewards.noChildren.cta}
            </Link>
          </motion.div>
        )}

        {selectedChild && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT — Star Bank + Reward Email + Thanks */}
            <div className="lg:col-span-1 space-y-0">
              <StarBank
                child={selectedChild}
                nextMilestone={nextMilestone}
                milestones={milestones}
              />

              {/* Reward email card */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mt-4">
                <div className="bg-card border-2 border-border rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Mail size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-black text-foreground text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
                        Reward notifications
                      </p>
                      <p className="text-muted-foreground text-xs">Get an email when {selectedChild.name} earns a badge</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="reward-email" className="block text-xs font-bold text-foreground">
                      Parent / guardian email
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="reward-email"
                        type="email"
                        value={emailInput}
                        onChange={e => setEmailInput(e.target.value)}
                        placeholder="parent@example.com"
                        className="flex-1 px-3 py-2 rounded-xl border-2 border-border bg-background text-foreground text-sm font-semibold placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                      />
                      <button
                        onClick={handleSaveEmail}
                        disabled={emailSaving || emailInput === rewardEmail}
                        className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-black text-xs disabled:opacity-50 hover:opacity-90 transition-opacity shrink-0"
                      >
                        {emailSaving ? '...' : 'Save'}
                      </button>
                    </div>
                    <AnimatePresence>
                      {emailSaved && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-1.5 text-green-700 text-xs font-bold"
                        >
                          <CheckCircle size={13} /> Saved! Badge emails will go to {rewardEmail}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="mt-3 bg-muted rounded-xl p-3 text-xs text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">How it works:</strong> When {selectedChild.name} earns a new badge, we automatically send a reward email with the badge details and a link to download their certificate. No action needed — it's fully automatic! 🎉
                  </div>
                </div>
              </motion.div>
            </div>

            {/* RIGHT — Character Shop */}
            <div className="lg:col-span-2 space-y-5">

              {/* Active character display */}
              {activeCharacter && (
                <motion.div variants={fadeUp} initial="hidden" animate="visible">
                  <div className="flex items-center gap-4 p-5 rounded-3xl bg-gradient-to-r from-accent/20 via-accent/10 to-transparent border-2 border-accent/40">
                    <motion.div
                      className="text-6xl select-none shrink-0"
                      animate={{ scale: [1, 1.08, 1], rotate: [0, -4, 4, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
                    >
                      {activeCharacter.emoji}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-0.5">
                        {selectedChild?.name}'s active character
                      </p>
                      <h3 className="font-black text-foreground text-lg leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                        {activeCharacter.name}
                      </h3>
                      <p className="text-muted-foreground text-xs mt-0.5">{activeCharacter.description}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-xs text-muted-foreground font-bold">Unlocked at</div>
                      <div className="font-black text-accent-foreground text-sm">{activeCharacter.starCost} ⭐</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 100-star progress track */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible">
                <div className="bg-card border-2 border-border rounded-3xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🎯</span>
                      <h2 className="font-black text-foreground text-base" style={{ fontFamily: 'var(--font-heading)' }}>
                        Character unlock track
                      </h2>
                    </div>
                    <div className="text-xs font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full">
                      ⭐ {Number(selectedChild?.totalStars ?? 0).toLocaleString()} stars
                    </div>
                  </div>

                  {/* Progress bar */}
                  {nextCharacterTier && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs font-bold text-muted-foreground mb-1.5">
                        <span>Next: {nextCharacterTier.emoji} {nextCharacterTier.name}</span>
                        <span>{starsToNextChar > 0 ? `${starsToNextChar} more stars` : 'Ready to unlock!'}</span>
                      </div>
                      <div className="h-4 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-accent to-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(((selectedChild?.totalStars ?? 0) / nextCharacterTier.starCost) * 100, 100)}%` }}
                          transition={{ duration: 1.2, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Tier dots */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1">
                    {characters.map((c, i) => (
                      <div key={c.id} className="flex flex-col items-center gap-1 shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-base border-2 transition-all ${
                          c.isActive ? 'border-accent bg-accent/20 scale-110' :
                          c.unlocked ? 'border-primary bg-primary/10' :
                          'border-border bg-muted opacity-50'
                        }`}>
                          {c.unlocked ? c.emoji : <Lock size={12} className="text-muted-foreground" />}
                        </div>
                        <span className="text-xs text-muted-foreground font-bold">{c.starCost}</span>
                        {i < characters.length - 1 && (
                          <div className={`absolute hidden`} />
                        )}
                      </div>
                    ))}
                  </div>

                  {nextCharacterTier && starsToNextChar === 0 && (
                    <div className="mt-3 text-center">
                      <p className="text-sm font-black text-accent-foreground">
                        🎉 You can unlock {nextCharacterTier.emoji} {nextCharacterTier.name} right now!
                      </p>
                    </div>
                  )}

                  {!nextCharacterTier && (
                    <div className="mt-3 text-center">
                      <p className="text-sm font-black text-primary">
                        🏆 All characters unlocked — {selectedChild?.name} is a true champion!
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* All milestones strip */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy size={16} className="text-primary" />
                  <h2 className="font-black text-foreground text-base" style={{ fontFamily: 'var(--font-heading)' }}>
                  {rewards.milestones.title}
                </h2>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_MILESTONES.map((threshold) => {
                    const claimed = milestones.some((m) => m.milestone === threshold);
                    const reached = (selectedChild.totalStars) >= threshold;
                    return (
                      <div
                        key={threshold}
                        className={`flex items-center gap-3 p-3 rounded-2xl border-2 ${
                          claimed ? 'border-primary/30 bg-primary/5' : reached ? 'border-accent/40 bg-accent/5' : 'border-border bg-card'
                        }`}
                      >
                        <span className="text-xl shrink-0">{claimed ? '🎁' : reached ? '🎉' : '🔒'}</span>
                        <div className="min-w-0">
                          <p className="font-black text-foreground text-xs">{threshold.toLocaleString()} ⭐</p>
                          <p className="text-muted-foreground text-xs truncate">
                            {claimed ? '1 month free — code issued' : reached ? 'Reached! Code ready' : `${(threshold - selectedChild.totalStars).toLocaleString()} to go`}
                          </p>
                        </div>
                        {claimed && <Gift size={14} className="text-primary shrink-0 ml-auto" />}
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Character shop */}
              <div>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-accent-foreground" />
                    <h2 className="font-black text-foreground text-base" style={{ fontFamily: 'var(--font-heading)' }}>
                      {rewards.shop.title}
                    </h2>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                          activeCategory === cat
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                        }`}
                      >
                        {cat === 'all' ? '🌟 All' : (Object.hasOwn(CATEGORY_LABELS, cat) ? CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] : undefined) ?? cat}
                      </button>
                    ))}
                  </div>
                </div>

                {loading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="rounded-3xl border-2 border-border bg-muted animate-pulse h-48" />
                    ))}
                  </div>
                ) : (
                  <motion.div
                    key={activeCategory}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                  >
                    {filtered.map((char) => (
                      <CharacterCard
                        key={char.id}
                        character={char}
                        childStars={selectedChild.totalStars}
                        onUnlock={handleUnlock}
                        onEquip={handleEquip}
                        unlocking={unlocking}
                        equipping={equipping}
                      />
                    ))}
                  </motion.div>
                )}

                {/* Copyright notice */}
                <p className="text-xs text-muted-foreground text-center mt-4 leading-relaxed">
                  All Sodafom characters are original creations owned by Sodafom Ltd. All rights reserved. &copy; {new Date().getFullYear()} Sodafom Ltd.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl font-bold text-sm shadow-lg z-50 ${
              toast.type === 'success' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
            }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function RewardsPage() {
  return (
    <ProtectedRoute>
      <RewardsContent />
    </ProtectedRoute>
  );
}
