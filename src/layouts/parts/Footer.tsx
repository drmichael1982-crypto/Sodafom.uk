import { Link, useNavigate } from "react-router";
import { Youtube, Lock, Instagram } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { API_PREFIX } from '@/lib/config';

// Hidden admin access logic (triggered by clicking the bottom copyright year)

function AdminUnlock() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  function handleOpen() {
    setOpen(true);
    setValue('');
    setTimeout(() => inputRef.current?.focus(), 60);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const response = await fetch(`${API_PREFIX}/admin/verify`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: value }),
    }).catch(() => null);
    if (response?.ok) {
      setOpen(false);
      navigate('/admin-panel');
    } else {
      setShake(true);
      setValue('');
      setTimeout(() => setShake(false), 600);
      inputRef.current?.focus();
    }
  }

  return (
    <>
      {/* Tiny lock icon — barely visible, only for the owner */}
      <button
        onClick={handleOpen}
        aria-label="Admin access"
        className="text-primary-foreground/20 hover:text-primary-foreground/50 transition-colors focus:outline-none"
      >
        <Lock size={12} />
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-2xl p-6 w-72 text-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Lock size={18} className="text-primary" />
            </div>
            <p className="font-black text-foreground text-sm mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
              Admin Access
            </p>
            <p className="text-muted-foreground text-xs mb-4">Enter your access code to continue</p>
            <form onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="password"
                inputMode="numeric"
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder="••••••"
                maxLength={10}
                className={`w-full text-center border-2 rounded-xl px-4 py-2.5 text-sm font-bold bg-background text-foreground outline-none transition-all mb-3
                  ${shake ? 'border-destructive' : 'border-border focus:border-primary'}`}
                style={shake ? { animation: 'shake 0.5s ease-in-out' } : undefined}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 py-2 rounded-xl text-sm font-bold bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shake keyframe injected via globals.css */}
    </>
  );
}


function TikTokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
    </svg>
  );
}


const footerLinks = {
  Learn: [
    { label: 'All Games',          href: '/' },
    { label: '⭐ Game of the Week', href: '/game-of-the-week' },
    { label: 'Maths Games',        href: '/subjects/maths' },
    { label: 'Spelling Games',     href: '/subjects/spelling' },
    { label: 'Reading Games',      href: '/subjects/reading' },
    { label: 'Science Games',      href: '/subjects/science' },
    { label: 'Ages 5–7',           href: '/games?age=5-7' },
    { label: 'Ages 8–10',          href: '/games?age=8-10' },
    { label: 'Ages 11–13',         href: '/games?age=11-13' },
    { label: 'Daily Challenge',    href: '/daily-challenge' },
  ],
  Support: [
    { label: 'For Parents',        href: '/parents' },
    { label: 'Progress Dashboard', href: '/parent-dashboard' },
    { label: 'Parent & Child Hub', href: '/hub' },
    { label: 'Teacher Hub',        href: '/teacher-hub' },
    { label: 'Certificates',       href: '/certificates' },
    { label: 'Contact Us',         href: '/contact' },
    { label: 'FAQs',               href: '/contact#faqs' },
    { label: 'Download App',       href: '/download' },
  ],
  Company: [
    { label: 'About Us',           href: '/about' },
    { label: 'Blog',               href: '/blog' },
    { label: 'Leaderboard',        href: '/leaderboard' },
    { label: 'Reviews',            href: '/reviews' },
    { label: '🎁 Refer a Friend',  href: '/referral' },
  ],
  Legal: [
    { label: 'Terms of Service',   href: '/legal#terms' },
    { label: 'Privacy Policy',     href: '/legal#privacy' },
    { label: "Children's Privacy", href: '/legal#children' },
    { label: 'Cookie Policy',      href: '/legal#cookies' },
  ],
};

const socialLinks = [
  { icon: TikTokIcon, label: 'TikTok',     href: 'https://www.tiktok.com/@sodafom' },
  { icon: Youtube,    label: 'YouTube',    href: 'https://www.youtube.com/@sodafom' },
  { icon: Instagram,  label: 'Instagram',  href: 'https://www.instagram.com/sodafom' },
];

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch(`${API_PREFIX}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json() as { ok?: boolean; message?: string; error?: string };
      if (data.ok) {
        setStatus('success');
        setMsg(data.message ?? "You're on the list!");
        setEmail('');
      } else {
        setStatus('error');
        setMsg(data.error ?? 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMsg('Something went wrong. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent/20 text-accent font-bold text-sm">
        <span>🎉</span>
        <span>{msg}</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 text-sm font-bold focus:outline-none focus:border-accent transition-colors"
          aria-label="Email address for newsletter"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-4 py-2.5 rounded-xl bg-accent text-accent-foreground font-black text-sm hover:opacity-90 transition-opacity disabled:opacity-60 shrink-0"
        >
          {status === 'loading' ? '…' : 'Join'}
        </button>
      </div>
      {status === 'error' && (
        <p className="text-xs text-red-300 font-bold">{msg}</p>
      )}
    </form>
  );
}

export default function Footer() {
  const [researchMode, setResearchMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isFreeAccess = localStorage.getItem('sodafom_free_access') === 'true';
    return isFreeAccess || localStorage.getItem('sodafom_research_mode') === 'true';
  });

  React.useEffect(() => {
    const handleResearchChange = () => {
      const isFreeAccess = localStorage.getItem('sodafom_free_access') === 'true';
      setResearchMode(isFreeAccess || localStorage.getItem('sodafom_research_mode') === 'true');
    };
    window.addEventListener('sodafom_research_mode_change', handleResearchChange);
    return () => window.removeEventListener('sodafom_research_mode_change', handleResearchChange);
  }, []);

  const filteredFooterLinks = {
    ...footerLinks,
    Company: footerLinks.Company.filter(l => !researchMode || l.label !== 'Pricing')
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Social proof strip */}
      <div className="bg-primary/90 border-b border-primary-foreground/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center justify-center gap-6 text-primary-foreground/80 text-sm font-bold">
            <span className="flex items-center gap-1.5"><span className="text-accent">🎮</span> 118 learning games</span>
            <span className="hidden sm:block w-px h-4 bg-primary-foreground/20" />
            <span className="flex items-center gap-1.5"><span className="text-accent">👧</span> Ages 5–13</span>
            <span className="hidden sm:block w-px h-4 bg-primary-foreground/20" />
            <span className="flex items-center gap-1.5"><span className="text-accent">⭐</span> Millions of stars earned</span>
            <span className="hidden sm:block w-px h-4 bg-primary-foreground/20" />
            <span className="flex items-center gap-1.5"><span className="text-accent">🇬🇧</span> UK curriculum aligned</span>
          </div>
        </div>
      </div>

      {/* Newsletter strip */}
      <div className="border-b border-primary-foreground/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between">
            <div>
              <p className="font-black text-primary-foreground text-lg" style={{ fontFamily: 'var(--font-heading)' }}>
                🔔 Stay in the loop
              </p>
              <p className="text-primary-foreground/70 text-sm mt-1">
                New games, tips for parents, and special offers — straight to your inbox.
              </p>
            </div>
            <div className="w-full sm:w-80 shrink-0">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <img
                src="/assets/uploads/airo-logo-shimmer-horizontal.svg"
                alt="Sodafom"
                className="block h-auto max-h-12 w-auto max-w-[180px] object-contain self-center"
              />
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed max-w-xs">
              Making maths, spelling and reading fun for children aged 5–13. Learn through play and unlock your child's full potential.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target={href.startsWith('mailto') ? undefined : '_blank'}
                  rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-accent/20 hover:bg-accent transition-all duration-200 hover:scale-110 group"
                >
                  <Icon size={16} className="text-accent group-hover:text-accent-foreground transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(filteredFooterLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="font-bold text-accent text-sm uppercase tracking-wide mb-4">{heading}</h3>
              <ul className="flex flex-col gap-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link to={href} className="text-primary-foreground/70 text-sm hover:text-accent transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-primary-foreground/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-primary-foreground/50 text-xs">
            © {new Date().getFullYear()} Sodafom. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <p className="text-primary-foreground/50 text-xs">
              Learn The Key To Success 🔑
            </p>
            <AdminUnlock />
          </div>
        </div>
      </div>
    </footer>
  );
}
