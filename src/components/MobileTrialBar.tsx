/**
 * MobileTrialBar — sticky bottom CTA bar shown only on mobile/tablet.
 * Appears after the user scrolls 300px. Hides on game pages and hub pages.
 * Dismissible for the session.
 */
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles } from 'lucide-react';
import { OPEN_TESTING_MODE } from '@/lib/testing-mode';

// Pages where the bar should never appear
const HIDDEN_PATHS = ['/hub', '/teacher-hub', '/admin-panel', '/subscribe', '/checkout'];

export default function MobileTrialBar() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const location = useLocation();

  const isHidden =
    OPEN_TESTING_MODE ||
    dismissed ||
    HIDDEN_PATHS.some((p) => location.pathname.startsWith(p)) ||
    location.pathname.startsWith('/games/'); // individual game pages

  React.useEffect(() => {
    if (isHidden) { setVisible(false); return; }
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHidden]);

  return (
    <AnimatePresence>
      {visible && !isHidden && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
          role="complementary"
          aria-label="Start free trial"
        >
          <div className="bg-primary border-t-2 border-accent/40 shadow-2xl px-4 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-primary-foreground font-black text-sm leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                7-day free trial
              </p>
              <p className="text-primary-foreground/60 text-xs">
                No card required · Cancel anytime
              </p>
            </div>
            <Link
              to="/subscribe"
              className="shrink-0 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-accent text-accent-foreground font-black text-sm hover:scale-105 active:scale-95 transition-transform shadow-lg"
            >
              <Sparkles size={14} />
              Start free
            </Link>
            <button
              onClick={() => setDismissed(true)}
              aria-label="Dismiss"
              className="shrink-0 w-7 h-7 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center text-primary-foreground/60 hover:text-primary-foreground transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
