/**
 * StreakFreezeButton
 * Shows the child's current streak, star balance, and lets them buy a freeze.
 * Drop inside any authenticated page that has an active child in localStorage.
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Snowflake, Flame, Star, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { API_PREFIX } from '@/lib/config';

interface StreakData {
  currentStreak: number;
  maxStreak: number;
  freezeActive: boolean;
  totalStars: number;
  freezeCost: number;
}

interface StreakFreezeButtonProps {
  childId: string;
  compact?: boolean; // show as small badge vs full card
}

export default function StreakFreezeButton({ childId, compact = false }: StreakFreezeButtonProps) {
  const [data, setData] = useState<StreakData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [buying, setBuying] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const [errMsg, setErrMsg] = useState('');

  const load = useCallback(() => {
    fetch(`${API_PREFIX}/streak?childId=${childId}`, { credentials: 'include' })
      .then(r => r.json())
      .then((d: StreakData) => setData(d))
      .catch(() => {});
  }, [childId]);

  useEffect(() => { load(); }, [load]);

  async function buyFreeze() {
    setBuying(true); setResult(null); setErrMsg('');
    try {
      const res = await fetch(`${API_PREFIX}/streak/freeze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ childId }),
      });
      const json = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) { setErrMsg(json.error ?? 'Failed'); setResult('error'); }
      else { setResult('success'); load(); }
    } catch { setResult('error'); setErrMsg('Network error'); }
    finally { setBuying(false); }
  }

  if (!data) return null;

  const canAfford = data.totalStars >= data.freezeCost;

  if (compact) {
    return (
      <button
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition-colors
          ${data.freezeActive
            ? 'bg-blue-50 border-blue-300 text-blue-700'
            : 'bg-card border-border text-muted-foreground hover:border-primary/50'}`}
        title={data.freezeActive ? 'Streak freeze active' : 'Buy a streak freeze'}
      >
        {data.freezeActive ? <Snowflake size={12} className="text-blue-500" /> : <Flame size={12} className="text-orange-500" />}
        {data.currentStreak}d
        {data.freezeActive && <Snowflake size={10} className="text-blue-400" />}
      </button>
    );
  }

  return (
    <>
      {/* Card */}
      <div className={`rounded-2xl border-2 p-5 ${data.freezeActive ? 'bg-blue-50 border-blue-300' : 'bg-card border-border'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame size={20} className="text-orange-500" />
            <span className="font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
              Streak Freeze
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm font-black text-yellow-600">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            {data.totalStars.toLocaleString()} stars
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="text-center">
            <p className="text-3xl font-black text-foreground">{data.currentStreak}</p>
            <p className="text-xs text-muted-foreground font-bold">day streak</p>
          </div>
          <div className="flex-1 text-sm text-muted-foreground leading-relaxed">
            {data.freezeActive
              ? '❄️ Freeze active — your streak is protected for 1 missed day.'
              : `Spend ${data.freezeCost} ⭐ to protect your streak if you miss a day.`}
          </div>
        </div>

        {data.freezeActive ? (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-100 border border-blue-300 text-blue-700 font-black text-sm">
            <Snowflake size={16} />
            Freeze active
          </div>
        ) : (
          <button
            onClick={() => setShowModal(true)}
            disabled={!canAfford}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Snowflake size={16} />
            {canAfford ? `Buy freeze for ${data.freezeCost} ⭐` : `Need ${data.freezeCost} ⭐ (have ${data.totalStars})`}
          </button>
        )}
      </div>

      {/* Confirm modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => { if (!buying) setShowModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-card border-2 border-border rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 border-2 border-blue-300 flex items-center justify-center text-2xl">
                  ❄️
                </div>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground">
                  <X size={16} />
                </button>
              </div>

              {result === 'success' ? (
                <div className="text-center py-2">
                  <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
                  <p className="font-black text-foreground text-lg mb-1">Freeze activated!</p>
                  <p className="text-muted-foreground text-sm">Your streak is protected for 1 missed day. Keep it up!</p>
                  <button onClick={() => setShowModal(false)} className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-sm">
                    Got it
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="font-black text-foreground text-lg mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                    Buy a Streak Freeze?
                  </h2>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    Spend <strong>{data.freezeCost} stars</strong> to protect your {data.currentStreak}-day streak for 1 missed day. The freeze is used automatically if you miss a day.
                  </p>

                  <div className="bg-muted rounded-xl p-3 flex justify-between text-sm font-bold mb-4">
                    <span className="text-muted-foreground">Your stars</span>
                    <span className="text-foreground">{data.totalStars} ⭐</span>
                  </div>
                  <div className="bg-muted rounded-xl p-3 flex justify-between text-sm font-bold mb-5">
                    <span className="text-muted-foreground">After purchase</span>
                    <span className="text-foreground">{data.totalStars - data.freezeCost} ⭐</span>
                  </div>

                  {result === 'error' && (
                    <div className="flex items-center gap-2 text-destructive text-sm font-bold mb-3">
                      <AlertTriangle size={14} />
                      {errMsg}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border-2 border-border text-muted-foreground font-bold text-sm hover:bg-muted transition-colors">
                      Cancel
                    </button>
                    <button
                      onClick={buyFreeze}
                      disabled={buying || !canAfford}
                      className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                    >
                      {buying ? 'Buying…' : `Confirm (${data.freezeCost} ⭐)`}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
