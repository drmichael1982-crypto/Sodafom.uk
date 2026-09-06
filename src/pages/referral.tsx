/**
 * /referral — Share Sodafom and earn rewards
 * Shows the user's unique referral link, stats, and reward tiers.
 */
import { useEffect, useState } from 'react';
import { API_PREFIX } from '@/lib/config';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Copy, Check, Share2, Gift, Users, Star, ChevronRight, Trophy } from 'lucide-react';
import { useSession } from '@/lib/auth/auth-client';
import ShareButtons from '@/components/ShareButtons';

const siteUrl = 'https://sodafom.uk';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
} as const;

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
} as const;

interface ReferralData {
  code: string;
  shareUrl: string;
  totalReferred: number;
  totalConverted: number;
  rewardsEarned: number;
}

// ── Reward tiers ──────────────────────────────────────────────────────────────
const TIERS = [
  { threshold: 1,  emoji: '🌱', label: '1 friend joins',   reward: '500 bonus stars' },
  { threshold: 3,  emoji: '🎁', label: '3 friends convert', reward: '1 free month credit' },
  { threshold: 6,  emoji: '🚀', label: '6 friends convert', reward: '2 free month credits' },
  { threshold: 10, emoji: '🏆', label: '10 friends convert',reward: '3 months free + VIP badge' },
] as const;

export default function ReferralPage() {
  const { isAuthenticated } = useSession();
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    fetch(`${API_PREFIX}/referral`, { credentials: 'include' })
      .then(r => r.json())
      .then((d: ReferralData) => setData(d))
      .catch(() => setError('Could not load your referral data.'))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleCopy = () => {
    if (!data?.shareUrl) return;
    void navigator.clipboard.writeText(data.shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = () => {
    if (!data?.shareUrl) return;
    const text = `My child loves learning on Sodafom — fun maths, spelling & reading games for kids aged 5–13! Try it free 🎮`;
    if (navigator.share) {
      void navigator.share({ title: 'Sodafom — Fun Learning for Kids', text, url: data.shareUrl });
    } else {
      void navigator.clipboard.writeText(`${text}\n${data.shareUrl}`).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const nextTier = TIERS.find(t => t.threshold > (data?.totalConverted ?? 0));
  const progressToNext = nextTier
    ? Math.min(100, ((data?.totalConverted ?? 0) / nextTier.threshold) * 100)
    : 100;

  return (
    <>
      <Helmet>
        <title>Refer a Friend — Sodafom | Earn Rewards</title>
        <meta name="description" content="Share Sodafom with friends and earn bonus stars and free months. Every friend who joins earns you rewards!" />
        <link rel="canonical" href={`${siteUrl}/referral`} />
        <meta property="og:title" content="Refer a Friend — Sodafom" />
        <meta property="og:description" content="Share Sodafom and earn bonus stars and free months for every friend who joins." />
        <meta property="og:url" content={`${siteUrl}/referral`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${siteUrl}/og-image.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`${siteUrl}/og-image.png`} />
      </Helmet>

      <main>
        {/* Hero */}
        <section className="bg-primary py-16 text-center relative overflow-hidden">
          {['🎁', '⭐', '🎉', '🌟', '🎊', '💫'].map((em, i) => (
            <motion.span
              key={i}
              className="absolute text-2xl pointer-events-none select-none"
              style={{ top: `${8 + i * 14}%`, left: i % 2 === 0 ? `${3 + i * 4}%` : undefined, right: i % 2 !== 0 ? `${3 + i * 4}%` : undefined }}
              animate={{ y: [0, -10, 0], rotate: [0, 12, -12, 0] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' as const, delay: i * 0.3 }}
            >{em}</motion.span>
          ))}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="relative z-10 max-w-2xl mx-auto px-4">
            <div className="text-5xl mb-4">🎁</div>
            <h1 className="text-4xl sm:text-5xl font-black text-primary-foreground mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
              Refer a friend, earn rewards
            </h1>
            <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto">
              Share Sodafom with other parents and earn bonus stars and free months for every friend who subscribes.
            </p>
          </motion.div>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">

          {/* Not logged in */}
          {!isAuthenticated && (
            <motion.div variants={fadeUp} initial="hidden" animate="visible" className="text-center py-16">
              <div className="text-5xl mb-4">🔒</div>
              <h2 className="text-2xl font-black text-foreground mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                Sign in to get your referral link
              </h2>
              <p className="text-muted-foreground mb-6">You need a Sodafom account to refer friends and earn rewards.</p>
              <div className="flex gap-3 justify-center">
                <Link to="/hub/login" className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-black hover:opacity-90 transition-opacity">
                  Sign in
                </Link>
                <Link to="/hub/signup" className="px-6 py-3 rounded-xl border-2 border-border text-foreground font-bold hover:border-primary transition-colors">
                  Create account
                </Link>
              </div>
            </motion.div>
          )}

          {/* Loading */}
          {isAuthenticated && loading && (
            <div className="text-center py-16">
              <div className="text-4xl animate-bounce mb-3">⭐</div>
              <p className="text-muted-foreground font-bold">Loading your referral dashboard…</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-center py-10">
              <p className="text-destructive font-bold">{error}</p>
            </div>
          )}

          {/* Dashboard */}
          {isAuthenticated && !loading && data && (
            <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-8">

              {/* Share link card */}
              <motion.div variants={fadeUp} className="bg-card rounded-3xl border-2 border-primary/20 p-6 sm:p-8 shadow-lg">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Share2 size={20} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="font-black text-foreground text-lg" style={{ fontFamily: 'var(--font-heading)' }}>Your referral link</h2>
                    <p className="text-muted-foreground text-sm">Share this link — when friends sign up, you both benefit!</p>
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  <div className="flex-1 px-4 py-3 rounded-xl bg-muted border border-border font-mono text-sm text-foreground truncate select-all">
                    {data.shareUrl}
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                      copied ? 'bg-primary text-primary-foreground' : 'bg-muted border border-border text-foreground hover:border-primary hover:text-primary'
                    }`}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-black hover:opacity-90 transition-opacity"
                  >
                    <Share2 size={16} /> Share now
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`My child loves Sodafom — fun learning games for kids! Try it free: ${data.shareUrl}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-accent text-accent-foreground font-black hover:opacity-90 transition-opacity"
                  >
                    💬 WhatsApp
                  </a>
                </div>

                {/* Follow on social */}
                <div className="pt-2 border-t border-border">
                  <ShareButtons showHeading={true} shareText={`My child loves Sodafom — fun educational games for ages 5–13! Try it free: ${data.shareUrl}`} />
                </div>
              </motion.div>

              {/* Stats row */}
              <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: Users, label: 'Friends referred', value: data.totalReferred, color: 'text-primary' },
                  { icon: Star,  label: 'Subscribed',        value: data.totalConverted, color: 'text-yellow-500' },
                  { icon: Gift,  label: 'Rewards earned',    value: data.rewardsEarned, color: 'text-secondary' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="bg-card rounded-2xl border border-border p-5 text-center">
                    <Icon size={24} className={`${color} mx-auto mb-2`} />
                    <div className="text-3xl font-black text-foreground">{value}</div>
                    <div className="text-sm text-muted-foreground font-bold">{label}</div>
                  </div>
                ))}
              </motion.div>

              {/* Progress to next reward */}
              {nextTier && (
                <motion.div variants={fadeUp} className="bg-card rounded-2xl border border-border p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-black text-foreground text-sm">Progress to next reward</span>
                    <span className="text-sm font-bold text-muted-foreground">
                      {data.totalConverted} / {nextTier.threshold} conversions
                    </span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressToNext}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' as const }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    <span className="text-xl mr-1">{nextTier.emoji}</span>
                    Next reward: <strong className="text-foreground">{nextTier.reward}</strong> at {nextTier.threshold} conversions
                  </p>
                </motion.div>
              )}

              {/* Reward tiers */}
              <motion.div variants={fadeUp}>
                <h2 className="text-xl font-black text-foreground mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                  Reward tiers 🎁
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TIERS.map(tier => {
                    const achieved = data.totalConverted >= tier.threshold;
                    return (
                      <div
                        key={tier.threshold}
                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                          achieved ? 'border-primary bg-primary/5' : 'border-border bg-card'
                        }`}
                      >
                        <span className="text-3xl">{tier.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-black text-foreground text-sm">{tier.label}</div>
                          <div className="text-muted-foreground text-xs">{tier.reward}</div>
                        </div>
                        {achieved ? (
                          <span className="text-primary font-black text-xs bg-primary/10 px-2 py-1 rounded-full">Earned ✓</span>
                        ) : (
                          <Trophy size={16} className="text-muted-foreground shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* How it works */}
              <motion.div variants={fadeUp} className="bg-muted/50 rounded-2xl p-6">
                <h2 className="text-lg font-black text-foreground mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                  How it works
                </h2>
                <div className="space-y-3">
                  {[
                    { step: '1', text: 'Copy your unique referral link above' },
                    { step: '2', text: 'Share it with friends, family, or in parent groups' },
                    { step: '3', text: 'When they sign up using your link, they get a 7-day free trial' },
                    { step: '4', text: 'When they subscribe, you earn rewards — stars, free months, and more!' },
                  ].map(({ step, text }) => (
                    <div key={step} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground font-black text-sm flex items-center justify-center shrink-0 mt-0.5">
                        {step}
                      </div>
                      <p className="text-foreground text-sm font-bold leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

            </motion.div>
          )}

          {/* CTA for non-subscribers */}
          {!isAuthenticated && (
            <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mt-12 text-center">
              <p className="text-muted-foreground mb-4">Not a Sodafom member yet?</p>
              <Link
                to="/hub/signup"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-black text-lg hover:opacity-90 transition-opacity shadow-lg"
              >
                Start free trial <ChevronRight size={20} />
              </Link>
            </motion.div>
          )}
        </div>
      </main>
    </>
  );
}
