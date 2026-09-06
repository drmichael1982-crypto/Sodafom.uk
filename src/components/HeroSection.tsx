import { Link } from "react-router";
import { motion } from 'motion/react';
import { Star, Zap, ChevronRight, ExternalLink } from 'lucide-react';
import ShareBar from '@/components/ShareBar';
const features = [{
  icon: '📖',
  label: 'Reading games',
  sub: 'Comprehension and fluency',
  cls: 'hero-pill-blue',
  href: '/games?cat=reading'
}, {
  icon: '🔢',
  label: 'Maths games',
  sub: 'Number, times tables and logic',
  cls: 'hero-pill-green',
  href: '/games?cat=maths'
}, {
  icon: '🔤',
  label: 'Spelling activities',
  sub: 'Words, phonics and vocabulary',
  cls: 'hero-pill-orange',
  href: '/games?cat=spelling'
}, {
  icon: '⭐',
  label: 'Stars and rewards',
  sub: 'Earn stars and unlock rewards',
  cls: 'hero-pill-gold',
  href: '/subscribe'
}, {
  icon: '🔬',
  label: 'Science games',
  sub: 'Nature, experiments and facts',
  cls: 'hero-pill-teal',
  href: '/games?cat=science'
}];
const appIcons = [{
  icon: '📚',
  label: 'Reading',
  cls: 'hero-pill-blue',
  href: '/games?cat=reading'
}, {
  icon: '🔢',
  label: 'Maths',
  cls: 'hero-pill-green',
  href: '/games?cat=maths'
}, {
  icon: '🔤',
  label: 'Spelling',
  cls: 'hero-pill-orange',
  href: '/games?cat=spelling'
}, {
  icon: '🔬',
  label: 'Science',
  cls: 'hero-pill-teal',
  href: '/games?cat=science'
}, {
  icon: '🏆',
  label: 'Rewards',
  cls: 'hero-pill-red',
  href: '/subscribe'
}, {
  icon: '😊',
  label: 'Profile',
  cls: 'hero-pill-teal',
  href: '/login'
}];
const trustBadges = [{
  icon: '🛡️',
  title: 'Safe & secure environment',
  sub: "Your child's safety is our priority"
}, {
  icon: '💪',
  title: 'Encourages confidence',
  sub: 'Builds self-belief and motivation'
}, {
  icon: '👥',
  title: 'Supports every level',
  sub: 'From beginners to confident learners'
}, {
  icon: '🏆',
  title: 'Rewards progress & achievement',
  sub: 'Celebrate success every step of the way'
}];
const sparkles = [{
  top: '8%',
  left: '3%',
  size: 22,
  delay: 0
}, {
  top: '15%',
  left: '20%',
  size: 16,
  delay: 0.3
}, {
  top: '5%',
  right: '22%',
  size: 20,
  delay: 0.6
}, {
  top: '28%',
  right: '6%',
  size: 14,
  delay: 0.9
}, {
  top: '55%',
  left: '2%',
  size: 18,
  delay: 0.2
}, {
  top: '72%',
  right: '4%',
  size: 16,
  delay: 0.5
}];
const rainbowBands = [{
  r: 340,
  cls: 'rb-red'
}, {
  r: 318,
  cls: 'rb-orange'
}, {
  r: 296,
  cls: 'rb-yellow'
}, {
  r: 274,
  cls: 'rb-green'
}, {
  r: 252,
  cls: 'rb-blue'
}, {
  r: 230,
  cls: 'rb-purple'
}];
export default function HeroSection() {
  return <section className="hero-bg relative overflow-hidden">

      {/* ── Decorative sky layer ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Cloud left */}
        <svg className="absolute top-6 left-6 opacity-75" width="130" height="55" viewBox="0 0 130 55" fill="white">
          <ellipse cx="65" cy="38" rx="58" ry="20" />
          <ellipse cx="38" cy="30" rx="30" ry="20" />
          <ellipse cx="92" cy="27" rx="32" ry="20" />
        </svg>
        {/* Cloud right */}
        <svg className="absolute top-8 right-10 opacity-65" width="100" height="44" viewBox="0 0 100 44" fill="white">
          <ellipse cx="50" cy="30" rx="44" ry="16" />
          <ellipse cx="28" cy="24" rx="24" ry="16" />
          <ellipse cx="72" cy="22" rx="26" ry="16" />
        </svg>

        {/* Rainbow arc — top-right corner */}
        <svg className="absolute top-0 right-0 pointer-events-none" style={{
        width: '55%',
        height: '320px'
      }} viewBox="0 0 500 320" preserveAspectRatio="xMaxYMin meet">
          {rainbowBands.map(b => <circle key={b.r} cx="500" cy="320" r={b.r} fill="none" className={b.cls} strokeWidth="20" opacity="0.85" />)}
        </svg>

        {/* Grass strip */}
        <svg className="absolute bottom-0 left-0 right-0 w-full" style={{
        height: '64px'
      }} viewBox="0 0 1200 64" preserveAspectRatio="none">
          <path className="hero-grass-a" d="M0,40 Q150,10 300,35 Q450,55 600,30 Q750,10 900,38 Q1050,55 1200,32 L1200,64 L0,64 Z" opacity="0.6" />
          <path className="hero-grass-b" d="M0,50 Q200,25 400,45 Q600,60 800,40 Q1000,20 1200,48 L1200,64 L0,64 Z" opacity="0.85" />
        </svg>
      </div>

      {/* ── Floating stars ── */}
      {sparkles.map((s, i) => <motion.div key={i} className="absolute pointer-events-none z-10" style={{
      top: s.top,
      left: (s as {
        left?: string;
      }).left,
      right: (s as {
        right?: string;
      }).right
    }} animate={{
      y: [0, -10, 0],
      rotate: [0, 20, -20, 0]
    }} transition={{
      duration: 3 + i * 0.4,
      repeat: Infinity,
      delay: s.delay,
      ease: 'easeInOut' as const
    }}>
          <Star size={s.size} className="fill-accent text-accent drop-shadow-md" />
        </motion.div>)}

      {/* ── Ages badge ── */}
      <motion.div initial={{
      opacity: 0,
      scale: 0.8
    }} animate={{
      opacity: 1,
      scale: 1
    }} transition={{
      duration: 0.5,
      delay: 0.2
    }} className="absolute top-4 right-4 z-20 w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-lg border-4 border-white bg-accent">
        <span className="text-accent-foreground font-black text-xs leading-none">Ages</span>
        <span className="text-accent-foreground font-black text-sm leading-none">5–13</span>
      </motion.div>

      {/* ── Main content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">

        {/* Title */}
        <motion.div initial={{
        opacity: 0,
        y: -20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }} className="text-center mb-8">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight text-accent hero-title-shadow" style={{
          fontFamily: 'var(--font-heading)'
        }}>
            Sodafom.uk
          </h1>
          <p className="text-xl sm:text-2xl font-black text-white mt-1 hero-sub-shadow">
            Where learning becomes fun!
          </p>
        </motion.div>

        {/* Three-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">

          {/* ── LEFT: Feature pills ── */}
          <motion.div initial={{
          opacity: 0,
          x: -30
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.6,
          delay: 0.2
        }} className="flex flex-col gap-2.5">
            {features.map((f, i) => <motion.div key={f.label} initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.4,
            delay: 0.3 + i * 0.08
          }}>
              <Link to={f.href} className={`flex items-center gap-3 rounded-2xl px-4 py-3 shadow-md ${f.cls} hover:scale-105 hover:shadow-lg active:scale-95 transition-all cursor-pointer group`}>
                <span className="text-2xl shrink-0">{f.icon}</span>
                <div className="flex-1">
                  <p className="text-white font-black text-sm leading-tight">{f.label}</p>
                  <p className="text-white/80 text-xs leading-tight">{f.sub}</p>
                </div>
                <ExternalLink size={13} className="text-white/60 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </motion.div>)}

            <div className="mt-1 rounded-2xl px-4 py-3 backdrop-blur-sm border border-white/30 hero-glass">
              <p className="text-white text-xs leading-relaxed font-semibold">
                Engaging, interactive and educational content for kids{' '}
                <span className="text-accent font-black">aged 5–13</span>{' '}
                to help them learn, grow and shine!
              </p>
            </div>
          </motion.div>

          {/* ── CENTRE: Phone mockup + CTAs ── */}
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.3
        }} className="flex flex-col items-center gap-4">
            {/* Phone */}
            <motion.div animate={{
            y: [0, -8, 0]
          }} transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'easeInOut' as const
          }}>
              <div className="hero-phone-bg rounded-[2.5rem] shadow-2xl border-4 border-white overflow-hidden" style={{
              width: '200px'
            }}>
                {/* Status bar */}
                <div className="hero-bar flex items-center justify-between px-4 py-2">
                  <div className="flex items-center gap-1">
                    <Star size={10} className="fill-accent text-accent" />
                    <span className="text-white text-xs font-bold">250</span>
                  </div>
                  <span className="text-white text-xs font-bold">Sodafom</span>
                </div>
                {/* App icon grid */}
                <div className="grid grid-cols-2 gap-2 p-3">
                  {appIcons.map(icon => <Link key={icon.label} to={icon.href} className={`${icon.cls} rounded-2xl flex flex-col items-center justify-center py-3 gap-1 shadow-sm hover:scale-105 active:scale-95 transition-transform cursor-pointer`}>
                      <span className="text-2xl">{icon.icon}</span>
                      <span className="text-white text-xs font-black">{icon.label}</span>
                    </Link>)}
                </div>
                {/* Bottom nav */}
                <div className="hero-bar flex justify-around px-3 py-2 border-t border-white/20">
                  {['🏠', '📊', '⭐', '👤'].map((ic, i) => <span key={i} className="text-sm">{ic}</span>)}
                </div>
              </div>
            </motion.div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <Link to="/subscribe" className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-black text-base shadow-lg hover:scale-105 active:scale-95 transition-transform bg-accent text-accent-foreground">
                <Zap size={18} />
                Start 7-Day Free Trial
              </Link>
              <Link to="/demo" className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-base text-white border-2 border-white/50 hover:bg-white/20 transition-all">
                <Star size={16} className="fill-accent text-accent" />
                Try Free Demo
                <ChevronRight size={18} />
              </Link>
              <p className="text-white/70 text-xs text-center">
                7 days free · then £1/month · cancel anytime
              </p>
            </div>

            {/* Share bar */}
            <div className="hero-glass rounded-2xl px-4 py-2 backdrop-blur-sm w-full max-w-xs border border-white/20">
              <ShareBar url="https://sodafom.uk" text="Sodafom — fun learning games for kids! Maths, spelling & reading for ages 5–13 🎮" label="Share Sodafom" compact={true} />
            </div>
          </motion.div>

          {/* ── RIGHT: Character + store badges ── */}
          <motion.div initial={{
          opacity: 0,
          x: 30
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.6,
          delay: 0.4
        }} className="flex flex-col items-center gap-4">
            {/* The Sodafom mascot character */}
            <motion.div animate={{
            y: [0, -6, 0]
          }} transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut' as const
          }} className="relative">
              <img src="/assets/images/can-you-make-the-graphics-like-this-pict-JaZSZQ.png" alt="Archie holding the golden heart key" className="w-64 h-auto object-contain rounded-3xl drop-shadow-2xl" loading="eager" fetchPriority="high" width={256} height={256} />
              {/* Gold glow */}
              <div className="absolute -inset-6 rounded-full pointer-events-none -z-10 blur-3xl opacity-60 bg-accent" />
            </motion.div>

            {/* Google badge */}
            <div className="bg-white rounded-2xl shadow-lg px-5 py-4 w-full max-w-xs text-center border-2 border-border">
              <p className="hero-google-label font-black text-xs uppercase tracking-wide mb-1">
                Available now on
              </p>
              <p className="hero-google-title font-black text-sm mb-2">
                Google Search Engines!
              </p>
              <div className="flex items-center justify-center gap-2">
                {/* Google G — brand-mandated SVG colours */}
                <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="text-muted-foreground text-xs">
                  Search <strong className="text-primary">sodafom.uk</strong>
                </span>
              </div>
            </div>

            {/* App Store coming soon */}
            <div className="bg-foreground rounded-2xl shadow-lg px-5 py-4 w-full max-w-xs text-center border-2 border-border">
              <p className="text-accent font-black text-xs uppercase tracking-wide mb-1">
                Coming soon on the
              </p>
              <p className="text-background font-black text-sm mb-2">App Store!</p>
              <div className="flex items-center justify-center gap-2">
                {/* Apple logo — brand-mandated SVG */}
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-background" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <span className="text-muted-foreground text-xs font-semibold">Coming soon on the App Store</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Trust badges strip ── */}
      <div className="hero-dark-strip relative z-10 border-t border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {trustBadges.map(b => <div key={b.title} className="flex items-start gap-3">
                <span className="text-2xl shrink-0 mt-0.5">{b.icon}</span>
                <div>
                  <p className="text-white font-black text-xs leading-tight">{b.title}</p>
                  <p className="text-white/65 text-xs leading-tight mt-0.5">{b.sub}</p>
                </div>
              </div>)}
          </div>
        </div>
      </div>
    </section>;
}
