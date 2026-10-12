import { useParams, Link } from 'react-router';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import { Calendar, Clock, ChevronRight, ArrowLeft } from 'lucide-react';
import { blog_posts } from 'virtual:content';

const siteUrl = 'https://sodafom.uk';
const ogImage = `${siteUrl}/og-image.png`;

const CATEGORY_COLORS: Record<string, string> = {
  'Learning Science': 'bg-primary/10 text-primary border-primary/20',
  'Parent Tips':      'bg-accent/20 text-yellow-800 border-accent/30',
  'Teacher Tips':     'bg-secondary/10 text-secondary border-secondary/20',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = blog_posts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">📭</div>
          <h1 className="text-2xl font-black text-foreground mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
            Article not found
          </h1>
          <Link to="/blog" className="text-primary font-bold hover:underline flex items-center gap-1 justify-center">
            <ArrowLeft size={15} /> Back to blog
          </Link>
        </div>
      </main>
    );
  }

  const url = `${siteUrl}/blog/${post.slug}`;
  const catColor = CATEGORY_COLORS[post.category] ?? 'bg-muted text-muted-foreground border-border';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: post.title,
    description: post.excerpt,
    url,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { '@type': 'Organization', name: 'Sodafom', url: siteUrl },
    publisher: { '@type': 'Organization', name: 'Sodafom', url: siteUrl },
    isPartOf: { '@id': `${siteUrl}/blog#blog` },
  };

  // Related posts (others, up to 2)
  const related = blog_posts.filter((p) => p.id !== post.id).slice(0, 2);

  return (
    <>
      <Helmet>
        <title>{post.title} | Sodafom Blog</title>
        <meta name="description" content={post.excerpt} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImage} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <main>
        {/* ── Article header ── */}
        <section className="bg-primary py-14 sm:py-18 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-accent/10" />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Link to="/blog" className="inline-flex items-center gap-1.5 text-primary-foreground/60 hover:text-primary-foreground text-sm font-bold mb-6 transition-colors">
                <ArrowLeft size={14} /> Back to blog
              </Link>

              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${catColor}`}>
                  {post.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-primary-foreground/60">
                  <Clock size={11} /> {post.readTime}
                </span>
                <span className="flex items-center gap-1 text-xs text-primary-foreground/60">
                  <Calendar size={11} /> {formatDate(post.publishedAt)}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary-foreground leading-tight mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                {post.title}
              </h1>
              <p className="text-primary-foreground/70 text-lg leading-relaxed">
                {post.excerpt}
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Article body ── */}
        <section className="py-14 bg-background">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="prose prose-lg max-w-none"
            >
              {/* Emoji pull-quote */}
              <div className="flex items-center justify-center text-7xl mb-10 select-none">
                {post.emoji}
              </div>

              <div className="flex flex-col gap-5">
                {post.body.map((para) => (
                  <p key={para.id} className="text-foreground leading-relaxed text-base sm:text-lg">
                    {para.text}
                  </p>
                ))}
              </div>
            </motion.div>

            {/* Author / attribution */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mt-12 pt-8 border-t border-border flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-2xl shrink-0">
                🔑
              </div>
              <div>
                <p className="font-black text-foreground text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
                  The Sodafom Team
                </p>
                <p className="text-muted-foreground text-xs">
                  Making maths, spelling &amp; reading fun for ages 5–13
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Related posts ── */}
        {related.length > 0 && (
          <section className="py-14 bg-muted/40">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
              <h2 className="text-xl font-black text-foreground mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
                More from the blog
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {related.map((rel) => (
                  <Link
                    key={rel.id}
                    to={`/blog/${rel.slug}`}
                    className="group flex gap-4 bg-card rounded-2xl border-2 border-border hover:border-primary/40 p-5 transition-all hover:shadow-sm"
                  >
                    <span className="text-3xl shrink-0">{rel.emoji}</span>
                    <div className="min-w-0">
                      <p className="font-black text-foreground text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2" style={{ fontFamily: 'var(--font-heading)' }}>
                        {rel.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock size={10} /> {rel.readTime}
                      </p>
                    </div>
                    <ChevronRight size={16} className="shrink-0 text-muted-foreground group-hover:text-primary transition-colors self-center ml-auto" />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── CTA ── */}
        <section className="py-14 bg-primary text-center">
          <div className="max-w-xl mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
              <div className="text-4xl mb-3">🎮</div>
              <h2 className="text-2xl font-black text-primary-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                Try Sodafom free for 7 days
              </h2>
              <p className="text-primary-foreground/70 mb-6 text-sm">
                No card required. Cancel anytime.
              </p>
              <Link
                to="/subscribe"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-accent text-accent-foreground font-black text-base hover:scale-105 active:scale-95 transition-transform shadow-lg"
              >
                Start free trial <ChevronRight size={17} />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}
