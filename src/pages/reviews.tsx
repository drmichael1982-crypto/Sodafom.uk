import { useState, useEffect, useRef, useCallback } from 'react';
import { API_PREFIX } from '@/lib/config';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Mic, MicOff, Volume2, Send, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

const siteUrl = 'https://sodafom.uk';
const ogImage = `${siteUrl}/og-image.png`;

// Browser Speech Recognition types (not in lib.dom.d.ts by default)
interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechRecognitionResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
}
interface SpeechRecognitionResultEvent {
  results: ArrayLike<SpeechRecognitionResult>;
}

interface Review {
  id: number;
  authorName: string;
  authorRole: string;
  stars: number;
  body: string;
  createdAt: string;
}

const ROLES = ['Parent', 'Teacher', 'Child', 'Other'] as const;

// ── Star picker ──────────────────────────────────────────────────────────────
function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1" role="group" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
        >
          <Star
            size={32}
            className={`transition-colors ${
              n <= (hovered || value)
                ? 'text-accent fill-accent'
                : 'text-muted-foreground'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ── Star display (read-only) ─────────────────────────────────────────────────
function StarDisplay({ stars }: { stars: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${stars} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={14}
          className={n <= stars ? 'text-accent fill-accent' : 'text-muted-foreground'}
        />
      ))}
    </div>
  );
}

// ── Read-aloud button ────────────────────────────────────────────────────────
function ReadAloudBtn({ text, label }: { text: string; label?: string }) {
  const [speaking, setSpeaking] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    u.pitch = 1.1;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    utterRef.current = u;
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  }, [speaking, text]);

  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);

  return (
    <button
      type="button"
      onClick={speak}
      aria-label={speaking ? 'Stop reading' : (label ?? 'Read aloud')}
      title={speaking ? 'Stop reading' : (label ?? 'Read aloud')}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all
        ${speaking
          ? 'bg-secondary text-secondary-foreground animate-pulse'
          : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        }`}
    >
      <Volume2 size={13} />
      {speaking ? 'Stop' : 'Read aloud'}
    </button>
  );
}

// ── Mic dictation button ─────────────────────────────────────────────────────
function MicButton({ onResult, disabled }: { onResult: (t: string) => void; disabled?: boolean }) {
  const [listening, setListening] = useState(false);
  const recogRef = useRef<SpeechRecognitionInstance | null>(null);
  const supported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const toggle = useCallback(() => {
    if (!supported) return;
    if (listening) {
      recogRef.current?.stop();
      setListening(false);
      return;
    }
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = 'en-GB';
    r.continuous = false;
    r.interimResults = false;
    r.onresult = (e: SpeechRecognitionResultEvent) => {
      const transcript = Array.from(e.results as unknown as SpeechRecognitionResult[])
        .map((res) => res[0].transcript)
        .join(' ');
      onResult(transcript);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recogRef.current = r;
    r.start();
    setListening(true);
  }, [listening, onResult, supported]);

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      aria-label={listening ? 'Stop microphone' : 'Dictate your review'}
      title={listening ? 'Stop microphone' : 'Speak your review'}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all
        ${listening
          ? 'bg-secondary text-secondary-foreground animate-pulse shadow-lg'
          : 'bg-muted text-foreground hover:bg-primary hover:text-primary-foreground'
        } disabled:opacity-40`}
    >
      {listening ? <MicOff size={16} /> : <Mic size={16} />}
      {listening ? 'Listening… tap to stop' : 'Speak your review'}
    </button>
  );
}

// ── Review card ──────────────────────────────────────────────────────────────
function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.body.length > 220;
  const displayText = isLong && !expanded ? review.body.slice(0, 220) + '…' : review.body;
  const date = new Date(review.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-3xl p-6 shadow-sm border border-border flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-black text-foreground text-base">{review.authorName}</p>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full border border-primary/20">
              <CheckCircle size={9} /> Verified
            </span>
          </div>
          <p className="text-muted-foreground text-xs">{review.authorRole} · <time dateTime={review.createdAt}>{date}</time></p>
        </div>
        <StarDisplay stars={review.stars} />
      </div>

      <p className="text-foreground text-sm leading-relaxed">{displayText}</p>

      <div className="flex items-center gap-2 flex-wrap">
        <ReadAloudBtn text={`${review.authorName} says: ${review.body}`} label={`Read ${review.authorName}'s review aloud`} />
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            {expanded ? <><ChevronUp size={13} /> Show less</> : <><ChevronDown size={13} /> Read more</>}
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStars, setFilterStars] = useState(0);

  // Form state
  const [name, setName] = useState('');
  const [role, setRole] = useState<string>('Parent');
  const [stars, setStars] = useState(5);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_PREFIX}/reviews`);
      if (res.ok) setReviews(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !body.trim()) {
      setError('Please fill in your name and review.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_PREFIX}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorName: name, authorRole: role, stars, body }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong');
      setSubmitted(true);
      setName(''); setRole('Parent'); setStars(5); setBody('');
      fetchReviews();
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');

  const avgStars = reviews.length
    ? (reviews.reduce((s, r) => s + r.stars, 0) / reviews.length).toFixed(1)
    : null;

  const filtered = (filterStars > 0 ? reviews.filter((r) => r.stars === filterStars) : reviews)
    .slice()
    .sort((a, b) => {
      if (sortBy === 'highest') return b.stars - a.stars;
      if (sortBy === 'lowest') return a.stars - b.stars;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Star breakdown counts
  const starCounts = [5, 4, 3, 2, 1].map(n => ({
    n,
    count: reviews.filter(r => r.stars === n).length,
    pct: reviews.length ? Math.round((reviews.filter(r => r.stars === n).length / reviews.length) * 100) : 0,
  }));

  const allReviewsText = reviews.length
    ? `Here are ${reviews.length} reviews for Sodafom. Average rating: ${avgStars} out of 5 stars. ` +
      reviews.map((r) => `${r.authorName}, ${r.authorRole}, gave ${r.stars} stars and said: ${r.body}`).join('. ')
    : 'No reviews yet. Be the first to leave one!';

  return (
    <>
      <Helmet>
        <title>Reviews — Sodafom | What Parents & Teachers Say</title>
        <meta name="description" content="Read what parents, teachers and children say about Sodafom. Leave your own review and help other families discover fun learning." />
        <link rel="canonical" href={`${siteUrl}/reviews`} />
        <meta property="og:title" content="Reviews — Sodafom" />
        <meta property="og:description" content="Read and write reviews for Sodafom — fun learning games for children ages 5–13." />
        <meta property="og:url" content={`${siteUrl}/reviews`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Reviews — Sodafom" />
        <meta name="twitter:description" content="Read what parents, teachers and children say about Sodafom." />
        <meta name="twitter:image" content={ogImage} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${siteUrl}/reviews#webpage`,
          name: 'Reviews — Sodafom',
          url: `${siteUrl}/reviews`,
          description: 'Read what parents, teachers and children say about Sodafom educational games.',
          isPartOf: { '@id': `${siteUrl}/#website` },
        })}</script>
      </Helmet>

      <main>
        {/* ── Hero ── */}
        <section className="bg-primary py-16 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{ top: `${10 + i * 18}%`, left: i % 2 === 0 ? `${4 + i * 5}%` : undefined, right: i % 2 !== 0 ? `${4 + i * 5}%` : undefined }}
                animate={{ rotate: 360 }}
                transition={{ duration: 10 + i * 3, repeat: Infinity, ease: 'linear' as const }}
              >
                <Star size={14 + i * 4} className="text-accent/30 fill-accent/20" />
              </motion.div>
            ))}
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="text-5xl mb-4">⭐</div>
              <h1 className="text-4xl sm:text-5xl font-black text-primary-foreground mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                Reviews
              </h1>
              <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto">
                What parents, teachers and children say about Sodafom. Read them, hear them, and add yours!
              </p>
              {avgStars && (
                <div className="mt-5 inline-flex items-center gap-2 bg-white/15 rounded-full px-5 py-2">
                  <Star size={18} className="text-accent fill-accent" />
                  <span className="text-primary-foreground font-black text-lg">{avgStars}</span>
                  <span className="text-primary-foreground/70 text-sm">average · {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* ── LEFT: Write a review ── */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <div className="bg-card rounded-3xl p-7 shadow-sm border border-border sticky top-24">
                <h2 className="text-2xl font-black text-foreground mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                  Write a review
                </h2>
                <p className="text-muted-foreground text-sm mb-5">
                  Share your experience — type it or use the microphone!
                </p>

                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="thanks"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-3 py-8 text-center"
                    >
                      <CheckCircle size={48} className="text-primary" />
                      <p className="font-black text-foreground text-lg">Thank you!</p>
                      <p className="text-muted-foreground text-sm">Your review has been published.</p>
                      <button
                        type="button"
                        onClick={() => setSubmitted(false)}
                        className="mt-2 px-5 py-2 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:scale-105 transition-transform"
                      >
                        Write another
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                      className="flex flex-col gap-4"
                    >
                      {/* Name */}
                      <div>
                        <label htmlFor="rev-name" className="block text-sm font-bold text-foreground mb-1">Your name</label>
                        <input
                          id="rev-name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Sarah M."
                          maxLength={128}
                          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      {/* Role */}
                      <div>
                        <label htmlFor="rev-role" className="block text-sm font-bold text-foreground mb-1">I am a…</label>
                        <select
                          id="rev-role"
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>

                      {/* Stars */}
                      <div>
                        <p className="text-sm font-bold text-foreground mb-2">Your rating</p>
                        <StarPicker value={stars} onChange={setStars} />
                      </div>

                      {/* Body + mic */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label htmlFor="rev-body" className="text-sm font-bold text-foreground">Your review</label>
                          <MicButton
                            onResult={(t) => setBody((prev) => prev ? prev + ' ' + t : t)}
                            disabled={submitting}
                          />
                        </div>
                        <textarea
                          id="rev-body"
                          value={body}
                          onChange={(e) => setBody(e.target.value)}
                          placeholder="Tell us what you think about Sodafom…"
                          rows={5}
                          maxLength={2000}
                          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        />
                        <p className="text-xs text-muted-foreground text-right mt-0.5">{body.length}/2000</p>
                      </div>

                      {error && (
                        <p className="text-secondary text-sm font-bold rounded-xl bg-secondary/10 px-4 py-2">{error}</p>
                      )}

                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-black text-base bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
                      >
                        <Send size={16} />
                        {submitting ? 'Sending…' : 'Submit review'}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT: Read reviews ── */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h2 className="text-2xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                  All reviews
                </h2>
                <ReadAloudBtn text={allReviewsText} label="Read all reviews aloud" />
              </div>

              {/* Rating breakdown chart */}
              {reviews.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-4 mb-4 flex flex-col sm:flex-row gap-4 items-center">
                  {/* Big average */}
                  <div className="text-center shrink-0">
                    <div className="text-5xl font-black text-foreground">{avgStars}</div>
                    <div className="flex justify-center mt-1">
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} size={14} className={n <= Math.round(Number(avgStars)) ? 'text-accent fill-accent' : 'text-muted-foreground'} />
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</div>
                  </div>
                  {/* Bar chart */}
                  <div className="flex-1 w-full space-y-1.5">
                    {starCounts.map(({ n, count, pct }) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setFilterStars(filterStars === n ? 0 : n)}
                        className={`w-full flex items-center gap-2 group rounded-lg px-1 py-0.5 transition-colors ${filterStars === n ? 'bg-accent/10' : 'hover:bg-muted'}`}
                      >
                        <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">{n}</span>
                        <Star size={11} className="text-accent fill-accent shrink-0" />
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-accent rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, delay: (5 - n) * 0.05 }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-6 text-right shrink-0">{count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Filter + sort row */}
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by star rating">
                  <button
                    type="button"
                    onClick={() => setFilterStars(0)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filterStars === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-primary/20'}`}
                  >
                    All
                  </button>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setFilterStars(filterStars === n ? 0 : n)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filterStars === n ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground hover:bg-accent/20'}`}
                    >
                      <Star size={11} className={filterStars === n ? 'fill-accent-foreground text-accent-foreground' : 'fill-muted-foreground text-muted-foreground'} />
                      {n}
                    </button>
                  ))}
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground font-bold">Sort:</span>
                  {(['newest', 'highest', 'lowest'] as const).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSortBy(s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all capitalize ${sortBy === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-primary/20'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {loading ? (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card rounded-3xl p-6 border border-border animate-pulse">
                    <div className="h-4 bg-muted rounded w-1/3 mb-3" />
                    <div className="h-3 bg-muted rounded w-full mb-2" />
                    <div className="h-3 bg-muted rounded w-4/5" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">💬</div>
                <p className="text-muted-foreground font-bold">
                  {filterStars > 0 ? `No ${filterStars}-star reviews yet.` : 'No reviews yet — be the first!'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filtered.map((r) => <ReviewCard key={r.id} review={r} />)}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
