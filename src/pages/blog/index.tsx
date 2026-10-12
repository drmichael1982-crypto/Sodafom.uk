import { Link } from 'react-router';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import { Calendar, Clock, ChevronRight, BookOpen } from 'lucide-react';
import { blog_posts } from 'virtual:content';

const siteUrl = 'https://sodafom.uk';
const ogImage = `${siteUrl}/og-image.png`;

const CATEGORY_COLORS: Record<string, string> = {
  'Learning Science': 'bg-primary/10 text-primary border-primary/20',
  'Parent Tips':      'bg-accent/20 text-yellow-800 border-accent/30',
  'Teacher Tips':     'bg-secondary/10 text-secondary border-secondary/20',
};

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
} as const;

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1 } },
} as const;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function BlogIndexPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${siteUrl}/blog#blog`,
    name: 'Sodafom Blog',
    url: `${siteUrl}/blog`,
    description: 'Learning tips, parent guides, and educational insights from the Sodafom team.',
    isPartOf: { '@id': `${siteUrl}/#website` },
  };

  return (
    <>
      <Helmet>
        <title>Blog — Learning Tips & Parent Guides | Sodafom</title>
        <meta name="description" content="Expert tips on supporting your child's maths, spelling, and reading at home. Guides for parents and teachers from the Sodafom team." />
        <link rel="canonical" href={`${siteUrl}/blog`} />
        <meta property="og:title" content="Blog — Learning Tips & Parent Guides | Sodafom" />
        <meta property="og:description" content="Expert tips on supporting your child's maths, spelling, and reading at home." />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={`${siteUrl}/blog`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImage} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <main>
        {/* ── Hero ── */}
        <section className="bg-primary py-16 sm:py-20 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-accent/10" />
            <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-primary-foreground/5" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent-foreground px-4 py-1.5 rounded-full text-sm font-bold mb-5">
                <BookOpen size={15} />
                Sodafom Blog
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-primary-foreground mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                Learning tips & parent guides
              </h1>
              <p className="text-primary-foreground/70 text-lg max-w-xl mx-auto">
                Practical advice on supporting your child's maths, spelling, and reading — from the Sodafom team.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Posts grid ── */}
        <section className="py-16 sm:py-20 bg-background">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {blog_posts.map((post) => {
                const catColor = CATEGORY_COLORS[post.category] ?? 'bg-muted text-muted-foreground border-border';
                return (
                  <motion.article key={post.id} variants={fadeUp}>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="group flex flex-col h-full bg-card rounded-3xl border-2 border-border hover:border-primary/40 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                    >
                      {/* Emoji header */}
                      <div className="bg-primary/5 flex items-center justify-center py-10 text-6xl group-hover:bg-primary/10 transition-colors">
                        <span>{post.emoji}</span>
                      </div>

                      <div className="flex flex-col flex-1 p-6 gap-3">
                        {/* Category + read time */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${catColor}`}>
                            {post.category}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock size={11} />
                            {post.readTime}
                          </span>
                        </div>

                        {/* Title */}
                        <h2 className="font-black text-foreground text-lg leading-snug group-hover:text-primary transition-colors" style={{ fontFamily: 'var(--font-heading)' }}>
                          {post.title}
                        </h2>

                        {/* Excerpt */}
                        <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                          {post.excerpt}
                        </p>

                        {/* Date + CTA */}
                        <div className="flex items-center justify-between pt-2 border-t border-border mt-auto">
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar size={11} />
                            {formatDate(post.publishedAt)}
                          </span>
                          <span className="flex items-center gap-1 text-xs font-bold text-primary group-hover:gap-2 transition-all">
                            Read more <ChevronRight size={13} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-16 bg-muted">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
              <div className="text-4xl mb-4">🔑</div>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                Ready to put these tips into practice?
              </h2>
              <p className="text-muted-foreground mb-7">
                Start your child's 7-day free trial today — no card required.
              </p>
              <Link
                to="/subscribe"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-black text-base hover:scale-105 active:scale-95 transition-transform shadow-lg"
              >
                Start free trial <ChevronRight size={18} />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}
