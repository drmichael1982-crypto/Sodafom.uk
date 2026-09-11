import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, ChevronDown, ChevronRight, Shield, KeyRound } from 'lucide-react';
import { useState, useEffect } from 'react';
import { pricing } from 'virtual:content';
import PromoCodeBox from '@/components/PromoCodeBox';
import { useNavigate } from 'react-router';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

export default function PricingPage() {
  const navigate = useNavigate();
  const [annual, setAnnual] = useState(false);

  useEffect(() => {
    const isResearch = localStorage.getItem('sodafom_research_mode') === 'true';
    if (isResearch) navigate('/', { replace: true });
  }, [navigate]);

  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [showDiscount, setShowDiscount] = useState(false);
  const [discountDismissed, setDiscountDismissed] = useState(false);

  // Exit-intent: show 10% off banner after 30s on page
  useEffect(() => {
    if (discountDismissed) return;
    const t = setTimeout(() => setShowDiscount(true), 30000);
    return () => clearTimeout(t);
  }, [discountDismissed]);

  return (
    <>
      <Helmet>
        <title>Pricing — Simple, Honest Plans | Sodafom</title>
        <meta name="description" content="One subscription unlocks all 118 Sodafom games for up to 4 children. Start with a 7-day free trial. No hidden fees, cancel any time." />
        <link rel="canonical" href="https://sodafom.uk/pricing" />
        <meta property="og:title" content="Sodafom Pricing — All 118 Games, One Price" />
        <meta property="og:description" content="Family plan from £3.33/month. 7-day free trial. Cancel any time." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sodafom.uk/pricing" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': 'https://sodafom.uk/pricing#webpage',
          name: 'Sodafom Pricing',
          url: 'https://sodafom.uk/pricing',
          isPartOf: { '@id': 'https://sodafom.uk/#website' },
        })}</script>
      </Helmet>

      <main>
        {/* ── EXIT-INTENT DISCOUNT BANNER ── */}
        <AnimatePresence>
          {showDiscount && !discountDismissed && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
            >
              <div className="bg-primary text-primary-foreground rounded-2xl shadow-2xl px-5 py-4 flex items-center gap-4">
                <div className="text-2xl shrink-0">🎉</div>
                <div className="flex-1">
                  <p className="font-black text-sm leading-tight">Still thinking? Get 10% off annual!</p>
                  <p className="text-primary-foreground/75 text-xs mt-0.5">Use code <strong>SAVE10</strong> at checkout · Limited time</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => { setAnnual(true); setDiscountDismissed(true); setShowDiscount(false); }}
                    className="px-3 py-1.5 rounded-xl bg-white text-primary font-black text-xs hover:bg-white/90 transition-colors"
                  >
                    Claim
                  </button>
                  <button
                    onClick={() => { setDiscountDismissed(true); setShowDiscount(false); }}
                    className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-xs font-black transition-colors"
                    aria-label="Dismiss"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── HERO ── */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background border-b border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.p variants={fadeUp} className="text-primary font-bold text-sm mb-3">
                {pricing.hero.eyebrow}
              </motion.p>
              <motion.h1
                variants={fadeUp}
                className="text-4xl sm:text-5xl font-black text-foreground mb-4 leading-tight"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {pricing.hero.headline}
              </motion.h1>
              <motion.p variants={fadeUp} className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
                {pricing.hero.subtext}
              </motion.p>

              {/* Monthly / Annual toggle */}
              <motion.div variants={fadeUp} className="inline-flex items-center gap-1 p-1.5 rounded-full bg-muted border border-border">
                <button
                  onClick={() => setAnnual(false)}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${!annual ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {pricing.toggle.monthly}
                </button>
                <button
                  onClick={() => setAnnual(true)}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${annual ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {pricing.toggle.annual}
                  <span className="px-2 py-0.5 rounded-full bg-secondary text-white text-[10px] font-black">
                    {pricing.toggle.saveBadge}
                  </span>
                </button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── PLANS ── */}
        <section className="py-16 bg-background">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start"
            >
              {pricing.plans.map((plan) => {
                const isHighlight = plan.highlight;
                const badge = (plan as typeof plan & { badge?: string }).badge;
                return (
                  <motion.div
                    key={plan.id}
                    variants={fadeUp}
                    className={`relative rounded-3xl border-2 p-7 flex flex-col ${
                      isHighlight
                        ? 'border-primary bg-primary text-primary-foreground shadow-2xl md:scale-105'
                        : 'border-border bg-card'
                    }`}
                  >
                    {isHighlight && badge && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-accent text-accent-foreground text-xs font-black shadow whitespace-nowrap">
                        {badge}
                      </div>
                    )}

                    <div className="text-4xl mb-3">{plan.emoji}</div>
                    <div className={`text-lg font-black mb-1 ${isHighlight ? 'text-primary-foreground' : 'text-foreground'}`}>
                      {plan.name}
                    </div>
                    <div className="flex items-end gap-1 mb-1">
                      <span className={`text-4xl font-black ${isHighlight ? 'text-primary-foreground' : 'text-foreground'}`}>
                        {annual ? plan.annualPrice : plan.monthlyPrice}
                      </span>
                      <span className={`text-sm mb-1.5 ${isHighlight ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {plan.period}
                      </span>
                    </div>
                    {annual && plan.id !== 'plan-free' && (
                      <div className={`text-xs mb-3 ${isHighlight ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        Billed annually
                      </div>
                    )}
                    <p className={`text-sm leading-relaxed mb-6 ${isHighlight ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      {plan.description}
                    </p>

                    <ul className="space-y-2.5 mb-8 flex-1">
                      {plan.features.map((f) => (
                        <li key={f.id} className="flex items-start gap-2.5 text-sm">
                          {f.included ? (
                            <Check size={16} className={`mt-0.5 shrink-0 ${isHighlight ? 'text-accent' : 'text-primary'}`} />
                          ) : (
                            <X size={16} className={`mt-0.5 shrink-0 ${isHighlight ? 'text-primary-foreground/30' : 'text-muted-foreground/40'}`} />
                          )}
                          <span className={f.included ? (isHighlight ? 'text-primary-foreground' : 'text-foreground') : (isHighlight ? 'text-primary-foreground/50' : 'text-muted-foreground')}>
                            {f.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      to={plan.id === 'plan-free' ? '/auth' : plan.id === 'plan-school' ? '/contact' : '/subscribe'}
                      className={`block text-center py-3.5 rounded-2xl font-black text-sm transition-all hover:scale-105 active:scale-95 ${
                        isHighlight
                          ? 'bg-accent text-accent-foreground shadow-lg'
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* ── PROMO CODE BOX ── */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="mt-12 max-w-2xl mx-auto"
            >
              <div className="text-center mb-6">
                <h2 className="text-xl font-black text-foreground mb-1">Have an access or promotional code?</h2>
                <p className="text-muted-foreground text-sm">Enter your code below to unlock Sodafom instantly.</p>
              </div>
              <PromoCodeBox />
            </motion.div>
          </div>
        </section>

        {/* ── GUARANTEE ── */}
        <section className="py-10 bg-muted border-y border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="flex items-center gap-4 p-6 rounded-2xl bg-card border border-border"
            >
              <Shield size={40} className="text-primary shrink-0" />
              <div>
                <div className="font-black text-foreground mb-1">{pricing.guarantee.headline}</div>
                <p className="text-muted-foreground text-sm leading-relaxed">{pricing.guarantee.text}</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── COMPARISON TABLE ── */}
        <section className="py-20 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                {pricing.comparison.headline}
              </h2>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <div className="overflow-x-auto rounded-2xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted border-b border-border">
                      <th className="text-left p-4 font-black text-foreground">Feature</th>
                      <th className="text-center p-4 font-black text-foreground">Free</th>
                      <th className="text-center p-4 font-black text-primary">Family</th>
                      <th className="text-center p-4 font-black text-foreground">School</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricing.comparison.rows.map((row, i) => (
                      <tr key={row.id} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/50'}>
                        <td className="p-4 text-foreground font-semibold">{row.feature}</td>
                        <td className="p-4 text-center text-muted-foreground">{row.free}</td>
                        <td className="p-4 text-center font-bold text-primary">{row.family}</td>
                        <td className="p-4 text-center text-muted-foreground">{row.school}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── FAQs ── */}
        <section className="py-20 bg-muted">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                Frequently asked questions
              </h2>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="space-y-3">
              {pricing.faqs.map((faq) => (
                <motion.div key={faq.id} variants={fadeUp} className="rounded-2xl bg-card border border-border overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                    className="w-full flex items-center justify-between p-5 text-left font-black text-foreground hover:text-primary transition-colors"
                    aria-expanded={openFaq === faq.id}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 transition-transform ${openFaq === faq.id ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <AnimatePresence>
                    {openFaq === faq.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' as const }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="py-20 bg-primary">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-black text-primary-foreground mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                Start your free trial today
              </motion.h2>
              <motion.p variants={fadeUp} className="text-primary-foreground/80 text-lg mb-8">
                7 days free. No credit card required. Cancel any time.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/subscribe"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-accent text-accent-foreground font-black text-lg hover:scale-105 active:scale-95 transition-transform shadow-xl"
                >
                  Start free trial
                  <ChevronRight size={20} />
                </Link>
                <Link
                  to="/games"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/15 text-primary-foreground font-bold text-lg hover:bg-white/25 transition-all"
                >
                  Try 10 games free
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}
