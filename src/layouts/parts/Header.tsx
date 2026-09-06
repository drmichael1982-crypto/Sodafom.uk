import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Menu, X, ShoppingCart, LogIn, UserPlus, Search, Zap, User, LogOut, Trophy, Star as StarIcon, ShieldCheck } from 'lucide-react';
import { useStarCount } from '@/hooks/useStarCount';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '@/contexts/use-cart';
import { SiteSearch, SearchButton } from '@/components/SiteSearch';
import { useSubscription } from '@/hooks/useSubscription';
import { useSession, signOut } from '@/lib/auth/auth-client';
import { ArchieCharacter } from '../../components/ArchieCharacter';
import { OPEN_TESTING_MODE } from '@/lib/testing-mode';

// ── Archie voice helper ────────────────────────────────────────────────────────
const ARCHIE_GREETINGS = [
  "Hi there! I'm Archie! Ready to learn something amazing today? Ask me anything!",
  "Hey! Archie here! I love helping kids learn. What shall we explore together?",
  "Hello! It's me, Archie! I'm super excited to help you with maths, spelling, reading and science!",
  "Hello, friend! I'm Archie, your learning buddy. What would you like to know today?",
];

function archieSpeak(text: string): void {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const go = () => {
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 1.2;
    utt.pitch = 1.75;
    utt.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const pick =
      voices.find(v => /boy|junior|child.*male|male.*child/i.test(v.name)) ??
      voices.find(v => v.name === 'Google UK English Male') ??
      voices.find(v => v.name === 'Daniel') ??
      voices.find(v => v.name === 'Arthur') ??
      voices.find(v => v.lang === 'en-GB') ??
      voices.find(v => v.lang.startsWith('en-')) ??
      null;
    if (pick) utt.voice = pick;
    window.speechSynthesis.speak(utt);
  };
  if (window.speechSynthesis.getVoices().length > 0) go();
  else { window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.onvoiceschanged = null; go(); }; }
}

const navLinks = [
  { label: 'Home',            href: '/' },
  { label: '1-to-1 Tutor',    href: '/tutor' },
  { label: 'Games',           href: '/' },
  { label: 'Cartoons',        href: '/cartoons' },
  { label: 'Daily Challenge', href: '/daily-challenge' },
  { label: 'Leaderboard',     href: '/leaderboard' },
  { label: 'Blog',            href: '/blog' },
  { label: 'Pricing',         href: '/pricing' },
  { label: 'Hub',             href: '/hub' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [archieActive, setArchieActive] = useState(false);
  const [archieMsg, setArchieMsg] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const archieTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { subscribed, loading: subLoading } = useSubscription();

  const [researchMode, setResearchMode] = useState(() => {
    if (OPEN_TESTING_MODE) return true;
    if (typeof window === 'undefined') return false;
    const isFreeAccess = localStorage.getItem('sodafom_free_access') === 'true';
    return isFreeAccess || localStorage.getItem('sodafom_research_mode') === 'true';
  });

  React.useEffect(() => {
    const handleResearchChange = () => {
      const isFreeAccess = localStorage.getItem('sodafom_free_access') === 'true';
      setResearchMode(OPEN_TESTING_MODE || isFreeAccess || localStorage.getItem('sodafom_research_mode') === 'true');
    };
    window.addEventListener('sodafom_research_mode_change', handleResearchChange);
    return () => window.removeEventListener('sodafom_research_mode_change', handleResearchChange);
  }, []);

  const sessionData = useSession();
  const isLoggedIn = sessionData.isAuthenticated;
  const user = sessionData.user;
  const { stars } = useStarCount();

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleGlobalKey = useCallback((e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
      e.preventDefault();
      setSearchOpen(true);
    }
  }, []);

  React.useEffect(() => {
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [handleGlobalKey]);

  const handleArchieClick = useCallback(() => {
    if (archieActive) {
      window.speechSynthesis?.cancel();
      setArchieActive(false);
      if (archieTimerRef.current) clearTimeout(archieTimerRef.current);
      return;
    }
    const msg = ARCHIE_GREETINGS[Math.floor(Math.random() * ARCHIE_GREETINGS.length)];
    setArchieMsg(msg);
    setArchieActive(true);
    archieSpeak(msg);
    // Auto-dismiss bubble after 6 s
    archieTimerRef.current = setTimeout(() => setArchieActive(false), 6000);
  }, [archieActive]);

  // Stop speech when navigating away
  React.useEffect(() => {
    window.speechSynthesis?.cancel();
    setArchieActive(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    setProfileOpen(false);
    await signOut();
    navigate('/');
  };

  return (
    <header className={`sticky top-0 z-50 bg-primary transition-shadow duration-300 ${scrolled ? 'shadow-lg' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-3">

          {/* Logo */}
          <Link to="/" className="shrink-0 flex items-center min-w-0">
            <img
              src="/assets/uploads/airo-logo-shimmer-horizontal.svg"
              alt="Sodafom — Learn The Key To Success"
              className="block h-auto max-h-10 md:max-h-14 w-auto max-w-full object-contain self-center"
            />
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1 ml-auto">
            {navLinks.filter(link => {
              if (researchMode && (link.label === 'Pricing' || link.label === 'Subscribe')) return false;
              return true;
            }).map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-3 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-primary-foreground hover:bg-primary-foreground/20'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <SearchButton onClick={() => setSearchOpen(true)} variant="bar" />

            {/* Ask Archie button — speaks on click */}
            <div className="relative ml-1">
              <motion.button
                onClick={handleArchieClick}
                animate={archieActive ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                transition={archieActive ? { duration: 0.6, repeat: Infinity, ease: 'easeInOut' as const } : {}}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full font-black text-sm transition-all border ${
                  archieActive
                    ? 'bg-accent text-accent-foreground border-accent shadow-lg'
                    : 'bg-white/20 text-primary-foreground hover:bg-white/30 active:scale-95 border-white/30'
                }`}
                aria-label={archieActive ? 'Stop Archie talking' : 'Let Archie talk'}
              >
                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center overflow-hidden border border-amber-400">
                  <img src="/assets/images/sodafom-launcher-icon-v2.png" alt="" className="h-full w-full rounded-full object-cover" />
                </div>
                Ask Archie
              </motion.button>

              {/* Speech bubble */}
              <AnimatePresence>
                {archieActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 4 }}
                    transition={{ duration: 0.2, ease: "easeOut" as const }}
                    className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl p-3 z-50 border border-accent/30"
                  >
                    {/* Tail */}
                    <div className="absolute -top-2 right-6 w-4 h-4 bg-white rotate-45 border-l border-t border-accent/30" />
                    <div className="flex items-start gap-2">
                      <div className="shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden border border-amber-400">
                        <img src="/assets/images/sodafom-launcher-icon-v2.png" alt="" className="h-full w-full rounded-full object-cover" />
                      </div>
                      <p className="text-xs font-semibold text-gray-700 leading-snug">{archieMsg}</p>
                    </div>
                    <button
                      onClick={handleArchieClick}
                      className="mt-2 w-full text-center text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      Tap to stop
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Subscribe CTA — only shown to non-subscribers */}
            {!subLoading && !subscribed && !researchMode && (
              <motion.div
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
              >
                <Link
                  to="/subscribe"
                  className="ml-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-black text-sm bg-secondary text-white hover:scale-105 active:scale-95 transition-transform shadow-md"
                >
                  <Zap size={13} />
                  Free Trial
                </Link>
              </motion.div>
            )}

            {/* Auth buttons — sign in/up when logged out, profile avatar when logged in */}
            {!isLoggedIn ? (
              <>
                <Link
                  to="/hub/login"
                  className="ml-1 px-3 py-2 rounded-full font-bold text-sm text-primary-foreground border border-primary-foreground/40 hover:bg-primary-foreground/20 transition-all flex items-center gap-1.5"
                >
                  <LogIn size={14} />
                  Sign In
                </Link>
                <Link
                  to="/hub/signup"
                  className="ml-1 px-4 py-2 rounded-full font-bold text-sm bg-white text-primary hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <UserPlus size={14} />
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="relative ml-1">
                <button
                  onClick={() => setProfileOpen(p => !p)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors border border-white/30"
                  aria-label="Profile menu"
                >
                  <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-black text-sm">
                    {user?.name?.[0]?.toUpperCase() ?? <User size={14} />}
                  </div>
                  <span className="text-primary-foreground font-bold text-sm hidden lg:block max-w-[100px] truncate">
                    {user?.name?.split(' ')[0] ?? 'Profile'}
                  </span>
                  {/* Star count badge */}
                  {stars !== null && stars > 0 && (
                    <span className="flex items-center gap-0.5 bg-accent text-accent-foreground text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">
                      <StarIcon size={9} className="fill-current" />
                      {stars >= 1000 ? `${(stars / 1000).toFixed(1)}k` : stars}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 w-56 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden"
                    >
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-border bg-muted/40">
                        <p className="font-black text-foreground text-sm truncate">{user?.name}</p>
                        <p className="text-muted-foreground text-xs truncate">{user?.email}</p>
                      </div>
                      {/* Links */}
                      {[
                        { label: 'My Profile',        href: '/hub/profile',       icon: User },
                        { label: 'My Hub',             href: '/hub',               icon: User },
                        { label: 'Star Bank',          href: '/star-bank',         icon: StarIcon },
                        { label: 'Progress Dashboard', href: '/parent-dashboard',  icon: Trophy },
                        { label: 'Certificates',       href: '/certificates',      icon: Trophy },
                        { label: 'Daily Challenge',    href: '/daily-challenge',   icon: Trophy },
                        { label: 'My Subscription',    href: '/hub/subscription',  icon: Trophy },
                        { label: 'Notifications',      href: '/hub/notifications', icon: Trophy },
                      ].map(({ label, href, icon: Icon }) => (
                        <Link
                          key={href}
                          to={href}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-sm font-bold text-foreground"
                        >
                          <Icon size={14} className="text-muted-foreground" />
                          {label}
                        </Link>
                      ))}
                      <div className="border-t border-border">
                        {user?.isAdmin && (
                          <>
                            <Link
                              to="/admin-panel"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-sm font-bold text-foreground"
                            >
                              <ShieldCheck size={14} className="text-muted-foreground" />
                              Admin Stats
                            </Link>
                            <Link
                              to="/admin/sodafom-bot"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-sm font-bold text-foreground"
                            >
                              <ShieldCheck size={14} className="text-muted-foreground" />
                              Bot Control
                            </Link>
                          </>
                        )}
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-destructive/10 transition-colors text-sm font-bold text-destructive"
                        >
                          <LogOut size={14} />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {!researchMode && (
              <Link
                to="/cart"
                className="relative ml-2 p-2 rounded-full text-primary-foreground hover:bg-primary-foreground/20 transition-colors"
                aria-label="Shopping cart"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-black">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
          </nav>

          {/* Mobile: search + cart + hamburger */}
          <div className="md:hidden flex items-center gap-2 ml-auto">
            <SearchButton onClick={() => setSearchOpen(true)} variant="icon" />
            {!researchMode && (
              <Link
                to="/cart"
                className="relative p-2 rounded-full text-primary-foreground hover:bg-primary-foreground/20 transition-colors"
                aria-label="Shopping cart"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-black">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
            <button
              className="p-2 rounded-lg text-primary-foreground hover:bg-primary-foreground/20 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' as const }}
            className="md:hidden overflow-hidden bg-primary/95"
          >
            <nav aria-label="Mobile navigation" className="px-4 py-4 flex flex-col gap-2">
              {navLinks.filter(link => {
                if (researchMode && (link.label === 'Pricing' || link.label === 'Subscribe')) return false;
                return true;
              }).map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`px-4 py-3 rounded-xl font-bold text-base transition-all ${
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-primary-foreground hover:bg-primary-foreground/20'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <button
                onClick={() => { setMenuOpen(false); setSearchOpen(true); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-base text-primary-foreground hover:bg-primary-foreground/20 transition-all w-full text-left"
              >
                <Search size={18} />
                Search games &amp; pages
              </button>

              {/* Ask Archie — mobile */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  const msg = ARCHIE_GREETINGS[Math.floor(Math.random() * ARCHIE_GREETINGS.length)];
                  setArchieMsg(msg);
                  setArchieActive(true);
                  archieSpeak(msg);
                  if (archieTimerRef.current) clearTimeout(archieTimerRef.current);
                  archieTimerRef.current = setTimeout(() => setArchieActive(false), 6000);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-black text-base text-primary-foreground bg-white/20 hover:bg-white/30 transition-all border border-white/30 w-full text-left"
              >
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center overflow-hidden border border-amber-400">
                  <img src="/assets/images/sodafom-launcher-icon-v2.png" alt="" className="h-full w-full rounded-full object-cover" />
                </div>
                Ask Archie
              </button>

              {/* Free Trial — mobile, non-subscribers only */}
              {!subLoading && !subscribed && !researchMode && (
                <Link
                  to="/subscribe"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black text-base bg-secondary text-white hover:scale-105 active:scale-95 transition-transform shadow-md"
                >
                  <Zap size={16} />
                  Start Free Trial
                </Link>
              )}

              {/* Admin Panel — mobile, logged-in admin only */}
              {isLoggedIn && user?.isAdmin && (
                <Link
                  to="/admin-panel"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-base text-primary-foreground hover:bg-primary-foreground/20 transition-all"
                >
                  <ShieldCheck size={18} />
                  Admin Stats
                </Link>
              )}
              {isLoggedIn && user?.isAdmin && (
                <Link
                  to="/admin/sodafom-bot"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-base text-primary-foreground hover:bg-primary-foreground/20 transition-all"
                >
                  <ShieldCheck size={18} />
                  Bot Control
                </Link>
              )}

              <div className="flex gap-2 mt-2">
                {!isLoggedIn ? (
                  <>
                    <Link
                      to="/hub/login"
                      className="flex-1 px-4 py-3 rounded-xl font-bold text-base text-center text-primary-foreground border border-primary-foreground/40 hover:bg-primary-foreground/20 transition-all flex items-center justify-center gap-2"
                    >
                      <LogIn size={16} /> Sign In
                    </Link>
                    <Link
                      to="/hub/signup"
                      className="flex-1 px-4 py-3 rounded-xl font-bold text-base text-center bg-white text-primary transition-all hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <UserPlus size={16} /> Sign Up
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/star-bank"
                      className="flex-1 px-4 py-3 rounded-xl font-bold text-base text-center bg-accent text-accent-foreground hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                      <StarIcon size={16} className="fill-current" />
                      {stars !== null && stars > 0 ? `${stars} ⭐` : 'Star Bank'}
                    </Link>
                    <Link
                      to="/hub/profile"
                      className="flex-1 px-4 py-3 rounded-xl font-bold text-base text-center text-primary-foreground border border-primary-foreground/40 hover:bg-primary-foreground/20 transition-all flex items-center justify-center gap-2"
                    >
                      <User size={16} /> My Profile
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex-1 px-4 py-3 rounded-xl font-bold text-base text-center bg-white/20 text-primary-foreground hover:bg-white/30 transition-all flex items-center justify-center gap-2"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <SiteSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
