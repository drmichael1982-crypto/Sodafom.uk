import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import { ExternalLink, ShoppingBag, Star, ChevronRight, BookOpen, Backpack, Shirt } from 'lucide-react';
import { Link } from 'react-router';
import { back_to_school_shop } from 'virtual:content';
import { ArchieCharacter } from '@/components/ArchieCharacter';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const categories = [
  {
    id: 'books',
    icon: BookOpen,
    emoji: '📚',
    title: 'School Books',
    subtitle: 'Workbooks, reading books & revision guides',
    description: 'Everything your child needs to read, learn and revise — from phonics readers and story books to maths workbooks and science revision guides.',
    colour: 'from-blue-500 to-blue-600',
    lightBg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'Ages 5–13',
    items: [
      'Phonics & early readers',
      'Maths & English workbooks',
      'Science & topic books',
      'Revision guides & flash cards',
      'Dictionaries & thesauruses',
    ],
    shopUrl: 'https://www.amazon.co.uk/s?k=school+books+children+uk',
    shopLabel: 'Shop School Books',
    renderImage: () => <div className="w-full h-64 sm:h-80 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center"><ArchieCharacter size={180} /></div>,
  },
  {
    id: 'accessories',
    icon: Backpack,
    emoji: '🎒',
    title: 'School Accessories',
    subtitle: 'Bags, stationery & everything in between',
    description: 'Get your child fully kitted out with quality bags, pencil cases, stationery sets and all the little extras that make the school day run smoothly.',
    colour: 'from-green-500 to-green-600',
    lightBg: 'bg-green-50',
    border: 'border-green-200',
    badge: 'Best sellers',
    items: [
      'School bags & backpacks',
      'Pencil cases & stationery sets',
      'Rulers, compasses & geometry sets',
      'Water bottles & lunch boxes',
      'Calculators & tech accessories',
    ],
    shopUrl: 'https://www.amazon.co.uk/s?k=school+accessories+children+uk',
    shopLabel: 'Shop Accessories',
    renderImage: () => <div className="w-full h-64 sm:h-80 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center"><ArchieCharacter size={180} /></div>,
  },
  {
    id: 'uniform',
    icon: Shirt,
    emoji: '👕',
    title: 'School Uniform',
    subtitle: 'Smart, durable & great value',
    description: 'Quality school uniform that lasts the whole year — shirts, trousers, skirts, jumpers, ties and PE kits for primary and secondary school children.',
    colour: 'from-purple-500 to-purple-600',
    lightBg: 'bg-purple-50',
    border: 'border-purple-200',
    badge: 'Great value',
    items: [
      'Shirts, blouses & polo tops',
      'Trousers, skirts & pinafores',
      'School jumpers & cardigans',
      'Ties, socks & accessories',
      'PE kits & sports wear',
    ],
    shopUrl: 'https://www.amazon.co.uk/s?k=school+uniform+children+uk',
    shopLabel: 'Shop Uniform',
    renderImage: () => <div className="w-full h-64 sm:h-80 bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center"><ArchieCharacter size={180} /></div>,
  },
];

const tips = [
  { emoji: '✅', tip: 'Label everything — name tags save so much stress!' },
  { emoji: '📅', tip: 'Order uniform early — sizes sell out fast in August.' },
  { emoji: '💰', tip: 'Buy a size up for jumpers — kids grow fast!' },
  { emoji: '🎒', tip: 'Ergonomic bags protect little backs on long school days.' },
];

export default function BackToSchoolShopPage() {
  return (
    <>
      <Helmet>
        <title>Back to School Shop — Books, Accessories & Uniform | Sodafom</title>
        <meta name="description" content="Everything you need for back to school — school books, bags, stationery, accessories and uniform for children aged 5–13. Shop the best deals now." />
        <link rel="canonical" href="https://sodafom.uk/shop/back-to-school" />
        <meta property="og:title" content="Back to School Shop | Sodafom" />
        <meta property="og:description" content="School books, accessories and uniform for children aged 5–13. Get ready for the new term!" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta property="og:url" content="https://sodafom.uk/shop/back-to-school" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Back to School Shop | Sodafom" />
        <meta name="twitter:description" content="School books, accessories and uniform for children aged 5–13." />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>

      <main>
        {/* ── HERO BANNER ── */}
        <section className="relative overflow-hidden bg-primary py-16 sm:py-20">
          {/* Decorative floating emojis */}
          {['📚', '🎒', '✏️', '📐', '🏫', '⭐', '📏', '🖊️'].map((em, i) => (
            <motion.div
              key={i}
              className="absolute pointer-events-none select-none text-2xl opacity-20"
              style={{
                top: `${10 + (i * 11) % 75}%`,
                left: i % 2 === 0 ? `${3 + i * 5}%` : undefined,
                right: i % 2 !== 0 ? `${3 + i * 4}%` : undefined,
              }}
              animate={{ y: [0, -10, 0], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' as const, delay: i * 0.3 }}
            >
              {em}
            </motion.div>
          ))}

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/20 border border-accent/40 mb-6">
                <Star size={14} className="text-accent fill-accent" />
                <span className="text-accent font-black text-sm">{back_to_school_shop.hero.badge}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-primary-foreground mb-4 leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                {back_to_school_shop.hero.headline}
              </h1>
              <p className="text-primary-foreground/80 text-lg sm:text-xl max-w-2xl mx-auto mb-8">
                {back_to_school_shop.hero.subtext}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {categories.map(cat => (
                  <a
                    key={cat.id}
                    href={`#${cat.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 border border-white/30 text-primary-foreground font-bold text-sm hover:bg-white/30 transition-all"
                  >
                    <span>{cat.emoji}</span>
                    {cat.title}
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── AFFILIATE NOTICE ── */}
        <div className="bg-muted border-b border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 text-center">
            <p className="text-muted-foreground text-xs">
              <strong>Heads up:</strong> <span>{back_to_school_shop.affiliateNotice}</span>
            </p>
          </div>
        </div>

        {/* ── CATEGORY SECTIONS ── */}
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          const isEven = idx % 2 === 0;
          return (
            <section
              key={cat.id}
              id={cat.id}
              className={`py-16 sm:py-20 ${isEven ? 'bg-background' : 'bg-muted/40'}`}
            >
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                  variants={stagger}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center ${!isEven ? 'lg:flex-row-reverse' : ''}`}
                >
                  {/* Image */}
                  <motion.div
                    variants={fadeUp}
                    className={`relative rounded-3xl overflow-hidden shadow-2xl ${!isEven ? 'lg:order-2' : ''}`}
                  >
                    {cat.renderImage()}
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${cat.colour} opacity-30 pointer-events-none`} />
                    {/* Badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 text-xs font-black text-foreground shadow`}>
                        <span>{cat.emoji}</span>
                        {cat.badge}
                      </span>
                    </div>
                  </motion.div>

                  {/* Content */}
                  <motion.div variants={fadeUp} className={`flex flex-col gap-5 ${!isEven ? 'lg:order-1' : ''}`}>
                    <div className={`inline-flex items-center gap-3 w-fit px-4 py-2 rounded-2xl ${cat.lightBg} border ${cat.border}`}>
                      <Icon size={20} className="text-foreground/70" />
                      <span className="font-black text-sm text-foreground">{cat.subtitle}</span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                      <span className="mr-2">{cat.emoji}</span>
                      {cat.title}
                    </h2>

                    <p className="text-muted-foreground text-base leading-relaxed">
                      {cat.description}
                    </p>

                    {/* Item list */}
                    <ul className="flex flex-col gap-2">
                      {cat.items.map(item => (
                        <li key={item} className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
                          <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <ChevronRight size={12} className="text-primary" />
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <a
                      href={cat.shopUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-black text-base bg-gradient-to-r ${cat.colour} text-white shadow-lg hover:scale-105 active:scale-95 transition-transform w-fit`}
                    >
                      <ShoppingBag size={18} />
                      {cat.shopLabel}
                      <ExternalLink size={14} className="opacity-70" />
                    </a>
                  </motion.div>
                </motion.div>
              </div>
            </section>
          );
        })}

        {/* ── TIPS STRIP ── */}
        <section className="py-12 bg-primary">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.h2
                variants={fadeUp}
                className="text-center text-2xl font-black text-primary-foreground mb-8"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {back_to_school_shop.tipsHeadline}
              </motion.h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {tips.map(t => (
                  <motion.div
                    key={t.tip}
                    variants={fadeUp}
                    className="bg-white/10 border border-white/20 rounded-2xl p-4 flex items-start gap-3"
                  >
                    <span className="text-2xl shrink-0">{t.emoji}</span>
                    <p className="text-primary-foreground/90 text-sm font-semibold leading-snug">{t.tip}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── SODAFOM CTA ── */}
        <section className="py-16 bg-background">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <div className="text-5xl mb-4">🎮</div>
              <h2 className="text-3xl font-black text-foreground mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                {back_to_school_shop.sodafomCta.headline}
              </h2>
              <p className="text-muted-foreground mb-6">
                {back_to_school_shop.sodafomCta.body}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/subscribe"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-black text-base bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-transform shadow-lg"
                >
                  {back_to_school_shop.sodafomCta.primaryBtn}
                  <ChevronRight size={18} />
                </Link>
                <Link
                  to="/games"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-base border-2 border-border text-foreground hover:bg-muted transition-all"
                >
                  {back_to_school_shop.sodafomCta.secondaryBtn}
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}
