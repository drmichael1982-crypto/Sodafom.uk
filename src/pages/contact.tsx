import { contact } from 'virtual:content';
import { useState, type FormEvent } from 'react';
import { API_PREFIX } from '@/lib/config';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import { Mail, MessageSquare, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

// ── Animation helpers ─────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
} as const;
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } } as const;

type FormStatus = 'idle' | 'sending' | 'success' | 'error';

const CONTACT_INFO = [
  {
    icon: <Mail size={20} />,
    title: 'Email us directly',
    detail: 'sodafom.uk@gmail.com',
    sub: 'We reply within 5 working days',
    href: 'mailto:sodafom.uk@gmail.com',
  },
  {
    icon: <MessageSquare size={20} />,
    title: 'Privacy & data',
    detail: 'sodafom.uk@gmail.com',
    sub: 'GDPR & data protection requests',
    href: 'mailto:sodafom.uk@gmail.com',
  },
  {
    icon: <Clock size={20} />,
    title: 'Response time',
    detail: 'Within 5 working days',
    sub: 'Mon–Fri, 9am–5pm GMT',
    href: null,
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left bg-card hover:bg-muted/40 transition-colors"
        aria-expanded={open}
      >
        <span className="font-bold text-foreground text-sm leading-snug">{q}</span>
        <span className={`text-muted-foreground text-lg shrink-0 transition-transform duration-200 ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {open && (
        <div className="px-5 pb-4 pt-1 bg-card border-t border-border">
          <p className="text-muted-foreground text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function ContactPage() {
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Honeypot check
    if (formData.get('_gotcha')) return;

    const name = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const enquiryType = String(formData.get('enquiry_type') ?? '').trim();
    const message = String(formData.get('message') ?? '').trim();

    setStatus('sending');
    setErrorMsg('');

    try {
      // Send to Inbox (primary channel)
      const res = await fetch(`${API_PREFIX}/contact/contact-us`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation: {
            messages_attributes: [{ body: message || 'New contact form submission' }],
            data: {
              __gd_contact_form_title: 'Contact Sodafom',
              'Enquiry type': enquiryType,
            },
          },
          user: { email, name },
        }),
      });

      // Also attempt email notification (best-effort)
      fetch(`${API_PREFIX}/notify/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject: enquiryType || 'General enquiry', message }),
      }).catch(() => {/* silent — inbox is the primary channel */});

      const json = await res.json();
      if (json.success) {
        setStatus('success');
        form.reset();
      } else {
        throw new Error(json.error || 'Something went wrong.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  const site = 'https://sodafom.uk';
  const url = `${site}/contact`;
  const ogImage = `${site}/og-image.png`;

  return (
    <>
      <Helmet>
        <title>Contact Us — Sodafom</title>
        <meta name="description" content="Get in touch with the Sodafom team. Support, billing, data requests, school enquiries — we're here to help." />
        <link rel="canonical" href={url} />
        <meta property="og:title" content="Contact Sodafom" />
        <meta property="og:description" content="Get in touch with the Sodafom team. We reply within 5 working days." />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Contact Sodafom" />
        <meta name="twitter:description" content="Get in touch with the Sodafom team. We reply within 5 working days." />
        <meta name="twitter:image" content={ogImage} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          '@id': `${url}#webpage`,
          name: 'Contact Sodafom',
          url,
          description: 'Get in touch with the Sodafom team. Support, billing, data requests, and school enquiries.',
          isPartOf: { '@id': `${site}/#website` },
          about: { '@id': `${site}/#organization` },
        })}</script>
      </Helmet>

      <main>
        {/* ── Hero ── */}
        <section className="bg-primary text-primary-foreground py-14 sm:py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div variants={stagger} initial="hidden" animate="visible">
              <motion.div variants={fadeUp} className="text-5xl mb-4">💬</motion.div>
              <motion.h1
                variants={fadeUp}
                className="text-3xl sm:text-5xl font-black mb-4"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Get in touch
              </motion.h1>
              <motion.p variants={fadeUp} className="text-primary-foreground/80 text-lg max-w-xl mx-auto">
                Have a question, need help, or want to work with us? We'd love to hear from you.
              </motion.p>
              <motion.div variants={fadeUp} className="mt-6">
                <a
                  href="mailto:sodafom.uk@gmail.com"
                  className="inline-flex items-center gap-2 bg-accent text-primary font-black px-6 py-3 rounded-full text-base hover:scale-105 transition-transform shadow-lg"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  <Mail size={18} />
                  Email us: sodafom.uk@gmail.com
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── Contact info cards ── */}
        <section className="py-10 px-4 bg-muted/30 border-b border-border">
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CONTACT_INFO.map(c => (
              <div key={c.title} className="bg-card border border-border rounded-2xl p-5 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  {c.icon}
                </div>
                <div>
                  <p className="font-black text-foreground text-sm mb-0.5" style={{ fontFamily: 'var(--font-heading)' }}>{c.title}</p>
                  {c.href ? (
                    <a href={c.href} className="text-primary text-sm font-bold hover:underline">{c.detail}</a>
                  ) : (
                    <p className="text-foreground text-sm font-bold">{c.detail}</p>
                  )}
                  <p className="text-muted-foreground text-xs mt-0.5">{c.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Form + FAQs ── */}
        <section className="py-14 px-4 bg-background">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Contact form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.45 }}
            >
              <h2 className="text-2xl font-black text-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                Send us a message
              </h2>
              <p className="text-muted-foreground text-sm mb-6">Fill in the form and we'll get back to you within 5 working days.</p>

              {status === 'success' ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                  <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3" />
                  <h3 className="font-black text-foreground text-lg mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Message sent!</h3>
                  <p className="text-muted-foreground text-sm">Thanks for reaching out. We'll reply within 5 working days.</p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-5 text-primary text-sm font-bold hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                  {/* Honeypot */}
                  <input
                    type="text"
                    name="_gotcha"
                    tabIndex={-1}
                    autoComplete="off"
                    style={{ position: 'absolute', left: '-9999px' }}
                    aria-hidden="true"
                  />

                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="contact-name" className="text-sm font-bold text-foreground">
                      Your name <span className="text-secondary">*</span>
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      placeholder="Jane Smith"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="contact-email" className="text-sm font-bold text-foreground">
                      Email address <span className="text-secondary">*</span>
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      placeholder="jane@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                    />
                  </div>

                  {/* Enquiry type */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="contact-type" className="text-sm font-bold text-foreground">
                      What's your enquiry about? <span className="text-secondary">*</span>
                    </label>
                    <select
                      id="contact-type"
                      name="enquiry_type"
                      required
                      defaultValue=""
                      className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                    >
                      <option value="" disabled>Select a topic…</option>
                      {(contact as any).ENQUIRY_TYPES.map((t: any) => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="contact-message" className="text-sm font-bold text-foreground">
                      Message <span className="text-secondary">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={5}
                      placeholder="Tell us how we can help…"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition resize-none"
                    />
                  </div>

                  {/* Error */}
                  {status === 'error' && (
                    <div role="alert" className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Privacy note */}
                  <p className="text-muted-foreground text-xs">
                    By submitting this form you agree to our{' '}
                    <a href="/legal#privacy" className="text-primary hover:underline font-bold">Privacy Policy</a>.
                    We'll only use your details to respond to your enquiry.
                  </p>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-black px-6 py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {status === 'sending' ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Sending…</span>
                      </>
                    ) : (
                      'Send message →'
                    )}
                  </button>
                </form>
              )}
            </motion.div>

            {/* FAQs */}
            <motion.div
              initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.45 }}
            >
              <h2 className="text-2xl font-black text-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                Frequently asked questions
              </h2>
              <p className="text-muted-foreground text-sm mb-6">Quick answers to the most common questions.</p>
              <div className="flex flex-col gap-3">
                {(contact as any).FAQS.map((f: any) => (
                  <FaqItem key={f.q} q={f.q} a={f.a} />
                ))}
              </div>
              <div className="mt-6 bg-primary/5 border border-primary/20 rounded-2xl p-5">
                <p className="text-sm text-foreground font-bold mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                  🔒 Data or privacy request?
                </p>
                <p className="text-muted-foreground text-sm">
                  For GDPR requests, data deletion, or children's privacy concerns, email{' '}
                  <a href="mailto:sodafom.uk@gmail.com" className="text-primary font-bold hover:underline">sodafom.uk@gmail.com</a>{' '}
                  directly. See our{' '}
                  <a href="/legal" className="text-primary font-bold hover:underline">Legal & Privacy page</a>{' '}
                  for full details.
                </p>
              </div>
            </motion.div>

          </div>
        </section>

      </main>
    </>
  );
}
