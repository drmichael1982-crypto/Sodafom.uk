import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

// ── Animation helpers ─────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────
interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
}

// ── Sections ──────────────────────────────────────────────────────────────────
const SECTIONS: Section[] = [
  {
    id: 'overview',
    title: '1. Overview',
    content: (
      <>
        <p>Sodafom ("we", "us", "our") is an educational platform providing curriculum-aligned learning games and activities for children aged 5–13. These legal pages cover our Terms of Service, Privacy Policy, Cookie Policy, and Children's Privacy commitments.</p>
        <p>By accessing or using Sodafom — including our website and mobile application — you agree to these terms. If you do not agree, please do not use our services.</p>
        <p>Our services are intended for use by parents, guardians, and teachers on behalf of children. Children under 13 must not create accounts or submit personal data without verifiable parental consent.</p>
      </>
    ),
  },
  {
    id: 'terms',
    title: '2. Terms of Service',
    content: (
      <>
        <h3>2.1 Eligibility</h3>
        <p>You must be at least 18 years old to create an account. By registering, you confirm that you are a parent, legal guardian, or authorised educator acting on behalf of a child.</p>

        <h3>2.2 Account Responsibilities</h3>
        <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Notify us immediately at <a href="mailto:support@sodafom.com" className="text-primary hover:underline font-bold">support@sodafom.com</a> if you suspect unauthorised access.</p>

        <h3>2.3 Acceptable Use</h3>
        <p>You agree not to:</p>
        <ul>
          <li>Use the platform for any unlawful purpose or in violation of these terms</li>
          <li>Attempt to gain unauthorised access to any part of the platform or its systems</li>
          <li>Reproduce, distribute, or create derivative works from our content without written permission</li>
          <li>Upload or transmit any harmful, offensive, or inappropriate content</li>
          <li>Use automated tools, bots, or scrapers to access the platform</li>
        </ul>

        <h3>2.4 Subscriptions & Payments</h3>
        <p>Sodafom offers monthly and annual subscription plans. Subscriptions auto-renew at the end of each billing period. You may cancel at any time from your account settings; cancellation takes effect at the end of the current billing period. No refunds are issued for partial periods unless required by applicable law.</p>
        <p>Payments are processed securely by Stripe. We do not store your card details. All prices are displayed in GBP and include VAT where applicable.</p>

        <h3>2.5 Promo Codes</h3>
        <p>Promo codes grant free access for the period specified. They are non-transferable, cannot be exchanged for cash, and may be withdrawn at any time without notice.</p>

        <h3>2.6 Intellectual Property</h3>
        <p>All content on Sodafom — including text, graphics, games, audio, and software — is owned by or licensed to Sodafom and protected by UK and international copyright law. Your subscription grants you a limited, non-exclusive, non-transferable licence to access and use the platform for personal, non-commercial educational purposes only.</p>

        <h3>2.7 Termination</h3>
        <p>We reserve the right to suspend or terminate accounts that violate these terms, with or without notice. Upon termination, your right to access the platform ceases immediately.</p>

        <h3>2.8 Disclaimer of Warranties</h3>
        <p>The platform is provided "as is" without warranties of any kind, express or implied. We do not warrant that the service will be uninterrupted, error-free, or free of viruses or other harmful components.</p>

        <h3>2.9 Limitation of Liability</h3>
        <p>To the fullest extent permitted by law, Sodafom shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform. Our total liability shall not exceed the amount you paid in the 12 months preceding the claim.</p>

        <h3>2.10 Governing Law</h3>
        <p>These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
      </>
    ),
  },
  {
    id: 'privacy',
    title: '3. Privacy Policy',
    content: (
      <>
        <p>This Privacy Policy explains how Sodafom collects, uses, and protects personal data in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.</p>

        <h3>3.1 Data Controller</h3>
        <p>Sodafom is the data controller for personal data collected through this platform. For data protection enquiries, contact us at <a href="mailto:privacy@sodafom.com" className="text-primary hover:underline font-bold">privacy@sodafom.com</a>.</p>

        <h3>3.2 Data We Collect</h3>
        <p><strong>Account data:</strong> Name, email address, and password (hashed) when you register.</p>
        <p><strong>Child profiles:</strong> First name and age group added by the account holder. We do not collect children's email addresses or contact details.</p>
        <p><strong>Usage data:</strong> Activity sessions, scores, subjects accessed, and time spent — used to generate progress reports for parents and teachers.</p>
        <p><strong>Payment data:</strong> Billing information is processed by Stripe and not stored by us. We receive only a transaction reference.</p>
        <p><strong>Technical data:</strong> IP address, browser type, device type, and cookies (see Cookie Policy below).</p>

        <h3>3.3 Legal Basis for Processing</h3>
        <ul>
          <li><strong>Contract performance</strong> — to provide the subscription service you have purchased</li>
          <li><strong>Legitimate interests</strong> — to improve the platform, prevent fraud, and ensure security</li>
          <li><strong>Legal obligation</strong> — to comply with applicable laws and regulations</li>
          <li><strong>Consent</strong> — for optional analytics and marketing communications (you may withdraw consent at any time)</li>
        </ul>

        <h3>3.4 How We Use Your Data</h3>
        <ul>
          <li>To provide, maintain, and improve the platform</li>
          <li>To generate child progress reports visible to the account holder</li>
          <li>To process payments and manage subscriptions</li>
          <li>To send service-related communications (e.g. receipts, account alerts)</li>
          <li>To respond to support enquiries</li>
          <li>To comply with legal obligations</li>
        </ul>

        <h3>3.5 Data Sharing</h3>
        <p>We do not sell personal data. We share data only with:</p>
        <ul>
          <li><strong>Stripe</strong> — payment processing</li>
          <li><strong>Hosting providers</strong> — infrastructure and storage</li>
          <li><strong>Analytics providers</strong> — aggregated, anonymised usage statistics only</li>
          <li><strong>Law enforcement</strong> — where required by law</li>
        </ul>

        <h3>3.6 Data Retention</h3>
        <p>We retain account data for as long as your account is active. Child profile and activity data is deleted within 30 days of account closure. Payment records are retained for 7 years as required by HMRC.</p>

        <h3>3.7 Your Rights</h3>
        <p>Under UK GDPR, you have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Correct inaccurate data</li>
          <li>Request erasure ("right to be forgotten")</li>
          <li>Restrict or object to processing</li>
          <li>Data portability</li>
          <li>Withdraw consent at any time</li>
        </ul>
        <p>To exercise any of these rights, contact <a href="mailto:privacy@sodafom.com" className="text-primary hover:underline font-bold">privacy@sodafom.com</a>. You also have the right to lodge a complaint with the Information Commissioner's Office (ICO) at <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">ico.org.uk</a>.</p>

        <h3>3.8 International Transfers</h3>
        <p>Where data is transferred outside the UK, we ensure appropriate safeguards are in place in accordance with UK GDPR requirements, including Standard Contractual Clauses where applicable.</p>
      </>
    ),
  },
  {
    id: 'children',
    title: "4. Children's Privacy (COPPA & UK GDPR)",
    content: (
      <>
        <p>Protecting children's privacy is our highest priority. Sodafom is designed for children aged 5–13, and we take our obligations under the UK GDPR, the Children's Code (Age Appropriate Design Code), and the US Children's Online Privacy Protection Act (COPPA) seriously.</p>

        <h3>4.1 No Direct Collection from Children</h3>
        <p>Children do not create their own accounts. All accounts are created by parents, guardians, or teachers (aged 18+). Child profiles contain only a first name and age group — no email address, phone number, or other contact information is collected from children.</p>

        <h3>4.2 Parental Consent</h3>
        <p>By creating a child profile, the account holder confirms they are the parent or legal guardian of that child, or an authorised educator, and consents to the collection of activity data for progress tracking purposes.</p>

        <h3>4.3 Data Minimisation</h3>
        <p>We collect only the minimum data necessary to provide the educational service. Child activity data (subject, score, duration) is used solely to generate progress reports visible to the account holder.</p>

        <h3>4.4 No Advertising to Children</h3>
        <p>Sodafom is completely ad-free. We do not display advertising to children, do not build advertising profiles on children, and do not share children's data with advertising networks.</p>

        <h3>4.5 Age Appropriate Design Code</h3>
        <p>We comply with the ICO's Children's Code, including:</p>
        <ul>
          <li>High privacy settings applied by default for child profiles</li>
          <li>No nudge techniques or dark patterns targeting children</li>
          <li>No geolocation tracking of children</li>
          <li>No profiling of children for commercial purposes</li>
        </ul>

        <h3>4.6 Parental Access & Deletion</h3>
        <p>Parents and guardians may review, correct, or delete their child's profile and activity data at any time from the Parent & Teacher Hub, or by contacting <a href="mailto:privacy@sodafom.com" className="text-primary hover:underline font-bold">privacy@sodafom.com</a>.</p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: '5. Cookie Policy',
    content: (
      <>
        <p>We use cookies and similar technologies to operate and improve Sodafom. This policy explains what cookies we use and why.</p>

        <h3>5.1 What Are Cookies?</h3>
        <p>Cookies are small text files stored on your device when you visit a website. They help us recognise your browser, remember your preferences, and understand how you use our platform.</p>

        <h3>5.2 Cookies We Use</h3>
        <p><strong>Strictly necessary cookies</strong> — Required for the platform to function. These include session authentication cookies and security tokens. These cannot be disabled.</p>
        <p><strong>Functional cookies</strong> — Remember your preferences such as language and age group selection.</p>
        <p><strong>Analytics cookies</strong> — Help us understand how visitors use the platform so we can improve it. We use anonymised, aggregated data only. These are only set with your consent.</p>

        <h3>5.3 Managing Cookies</h3>
        <p>You can control cookies through your browser settings. Disabling strictly necessary cookies may prevent the platform from functioning correctly. You can withdraw consent for analytics cookies at any time via the cookie banner on our site.</p>

        <h3>5.4 Third-Party Cookies</h3>
        <p>Stripe may set cookies in connection with payment processing. These are subject to Stripe's own privacy policy at <a href="https://stripe.com/gb/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">stripe.com/gb/privacy</a>.</p>
      </>
    ),
  },
  {
    id: 'accessibility',
    title: '6. Accessibility',
    content: (
      <>
        <p>Sodafom is committed to making our platform accessible to all children and adults, including those with disabilities. We aim to meet WCAG 2.1 Level AA standards.</p>
        <p>If you experience any accessibility barriers, please contact us at <a href="mailto:support@sodafom.com" className="text-primary hover:underline font-bold">support@sodafom.com</a> and we will do our best to assist you.</p>
      </>
    ),
  },
  {
    id: 'changes',
    title: '7. Changes to These Policies',
    content: (
      <>
        <p>We may update these policies from time to time. When we make material changes, we will notify account holders by email and display a notice on the platform. The date of the most recent update is shown at the top of this page.</p>
        <p>Continued use of the platform after changes take effect constitutes acceptance of the updated policies.</p>
      </>
    ),
  },
  {
    id: 'contact-legal',
    title: '8. Contact Us',
    content: (
      <>
        <p>For any legal, privacy, or data protection enquiries:</p>
        <ul>
          <li><strong>General support:</strong> <a href="mailto:support@sodafom.com" className="text-primary hover:underline font-bold">support@sodafom.com</a></li>
          <li><strong>Privacy & data protection:</strong> <a href="mailto:privacy@sodafom.com" className="text-primary hover:underline font-bold">privacy@sodafom.com</a></li>
          <li><strong>Contact form:</strong> <a href="/contact" className="text-primary hover:underline font-bold">sodafom.com/contact</a></li>
        </ul>
        <p>We aim to respond to all enquiries within 5 working days.</p>
      </>
    ),
  },
];

// ── Accordion section ─────────────────────────────────────────────────────────
function LegalSection({ section, defaultOpen }: { section: Section; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-5 text-left bg-card hover:bg-muted/40 transition-colors"
        aria-expanded={open}
      >
        <span className="font-black text-foreground text-base sm:text-lg" style={{ fontFamily: 'var(--font-heading)' }}>
          {section.title}
        </span>
        <ChevronDown
          size={20}
          className={`text-muted-foreground shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-6 pt-2 bg-card border-t border-border prose-section">
          {section.content}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LegalPage() {
  const site = 'https://sodafom.uk';
  const url = `${site}/legal`;
  const ogImage = `${site}/og-image.png`;
  const lastUpdated = 'August 2026';

  return (
    <>
      <Helmet>
        <title>Legal, Privacy & Terms — Sodafom</title>
        <meta name="description" content="Sodafom's Terms of Service, Privacy Policy, Children's Privacy commitments, and Cookie Policy. UK GDPR compliant." />
        <link rel="canonical" href={url} />
        <meta property="og:title" content="Legal & Privacy — Sodafom" />
        <meta property="og:description" content="Terms of Service, Privacy Policy, and Children's Privacy for Sodafom." />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Legal & Privacy — Sodafom" />
        <meta name="twitter:description" content="Terms of Service, Privacy Policy, and Children's Privacy for Sodafom. UK GDPR compliant." />
        <meta name="twitter:image" content={ogImage} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          name: 'Legal, Privacy & Terms — Sodafom',
          url,
          description: "Sodafom's Terms of Service, Privacy Policy, Children's Privacy commitments, and Cookie Policy. UK GDPR compliant.",
          isPartOf: { '@id': `${site}/#website` },
          about: { '@id': `${site}/#organization` },
        })}</script>
      </Helmet>

      <main>
        {/* ── Hero ── */}
        <section className="bg-primary text-primary-foreground py-14 sm:py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <div className="text-5xl mb-4">⚖️</div>
              <h1 className="text-3xl sm:text-5xl font-black mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                Legal &amp; Privacy
              </h1>
              <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto">
                We believe in being open and honest about how we operate and how we protect your family's data.
              </p>
              <p className="text-primary-foreground/50 text-sm mt-4">Last updated: {lastUpdated}</p>
            </motion.div>
          </div>
        </section>

        {/* ── Quick nav pills ── */}
        <section className="bg-muted/30 border-b border-border py-4 px-4 overflow-x-auto">
          <div className="max-w-4xl mx-auto flex gap-2 flex-nowrap min-w-0">
            {SECTIONS.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold bg-card border border-border text-foreground hover:bg-primary hover:text-primary-foreground transition-colors whitespace-nowrap"
              >
                {s.title.replace(/^\d+\.\s/, '')}
              </a>
            ))}
          </div>
        </section>

        {/* ── Compliance badges ── */}
        <section className="py-8 px-4 bg-background">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { emoji: '🇬🇧', label: 'UK GDPR', sub: 'Compliant' },
                { emoji: '👶', label: "Children's Code", sub: 'ICO Age Appropriate Design' },
                { emoji: '🇺🇸', label: 'COPPA', sub: 'Compliant' },
                { emoji: '🔒', label: 'Stripe Payments', sub: 'PCI DSS Secure' },
              ].map(b => (
                <div key={b.label} className="bg-card border border-border rounded-2xl p-4 text-center">
                  <div className="text-2xl mb-1">{b.emoji}</div>
                  <p className="font-black text-foreground text-xs" style={{ fontFamily: 'var(--font-heading)' }}>{b.label}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{b.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Accordion sections ── */}
        <section className="py-8 px-4 pb-16 bg-background">
          <div className="max-w-4xl mx-auto flex flex-col gap-3">
            {SECTIONS.map((section, i) => (
              <div key={section.id} id={section.id}>
                <LegalSection section={section} defaultOpen={i === 0} />
              </div>
            ))}
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="py-12 px-4 bg-muted/30 text-center border-t border-border">
          <div className="max-w-xl mx-auto">
            <p className="text-muted-foreground text-sm mb-4">
              Have a question about our policies or your data?
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
            >
              Contact us →
            </a>
          </div>
        </section>
      </main>

      {/* ── Prose styles ── */}
      <style>{`
        .prose-section p { margin-bottom: 0.85rem; color: hsl(var(--foreground)); font-size: 0.9rem; line-height: 1.7; }
        .prose-section h3 { font-family: var(--font-heading); font-weight: 800; font-size: 0.95rem; color: hsl(var(--foreground)); margin-top: 1.25rem; margin-bottom: 0.4rem; }
        .prose-section ul { list-style: disc; padding-left: 1.4rem; margin-bottom: 0.85rem; }
        .prose-section ul li { font-size: 0.9rem; color: hsl(var(--foreground)); line-height: 1.6; margin-bottom: 0.25rem; }
        .prose-section strong { font-weight: 700; }
      `}</style>
    </>
  );
}
