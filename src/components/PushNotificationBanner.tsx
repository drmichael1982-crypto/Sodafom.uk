/**
 * PushNotificationBanner
 * A dismissible opt-in prompt shown to logged-in users who haven't subscribed yet.
 * Renders as a floating bottom banner on mobile, a toast-style card on desktop.
 *
 * Usage: drop <PushNotificationBanner /> anywhere inside an authenticated layout.
 * It self-hides when dismissed, denied, or already subscribed.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, BellOff, X } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const DISMISS_KEY = 'sodafom_push_dismissed';

export default function PushNotificationBanner() {
  const { state, error, subscribe } = usePushNotifications();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show only if: supported, not yet subscribed, not previously dismissed
    if (state === 'unsubscribed') {
      const dismissed = localStorage.getItem(DISMISS_KEY);
      if (!dismissed) setVisible(true);
    }
    if (state === 'subscribed' || state === 'denied' || state === 'unsupported') {
      setVisible(false);
    }
  }, [state]);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  };

  const handleSubscribe = async () => {
    await subscribe();
    // Banner hides automatically via state change → 'subscribed'
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md"
          role="alertdialog"
          aria-label="Enable push notifications"
        >
          <div className="bg-card border-2 border-primary/30 rounded-2xl shadow-2xl p-4 flex items-start gap-3">
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Bell size={20} className="text-primary" />
            </div>

            {/* Copy */}
            <div className="flex-1 min-w-0">
              <p className="font-black text-foreground text-sm leading-snug" style={{ fontFamily: 'var(--font-heading)' }}>
                Stay on your streak! 🔥
              </p>
              <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">
                Get reminders when it's time to play, plus alerts for new games and rewards.
              </p>
              {error && (
                <p className="text-destructive text-xs mt-1 font-bold">{error}</p>
              )}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleSubscribe}
                  disabled={state === 'loading'}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-black text-xs hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  <Bell size={12} />
                  {state === 'loading' ? 'Enabling…' : 'Turn on'}
                </button>
                <button
                  onClick={handleDismiss}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-muted-foreground font-bold text-xs hover:bg-muted transition-colors"
                >
                  <BellOff size={12} />
                  Not now
                </button>
              </div>
            </div>

            {/* Close */}
            <button
              onClick={handleDismiss}
              className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors shrink-0"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
