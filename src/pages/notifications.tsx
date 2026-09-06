/**
 * /notifications — Notification preferences page
 * Lets users manage their push subscription and see what they'll receive.
 */
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import { Bell, BellOff, CheckCircle, XCircle, AlertTriangle, Flame, Star, Sparkles, BookOpen } from 'lucide-react';
import { ProtectedRoute } from '@/lib/auth/auth-client';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Link } from 'react-router';

const NOTIFICATION_TYPES = [
  { icon: <Flame size={18} className="text-orange-500" />, title: 'Daily streak reminder', desc: "We'll nudge you if you haven't played today so your streak stays alive.", bg: 'bg-orange-50 border-orange-200' },
  { icon: <Star size={18} className="text-yellow-500" />, title: 'New games & activities', desc: 'Be first to know when a new game drops on Sodafom.', bg: 'bg-yellow-50 border-yellow-200' },
  { icon: <Sparkles size={18} className="text-purple-500" />, title: 'Rewards & milestones', desc: "Celebrate when your child earns a new character or hits a star milestone.", bg: 'bg-purple-50 border-purple-200' },
  { icon: <BookOpen size={18} className="text-green-600" />, title: 'Weekly progress digest', desc: "A quick summary of how your learners did this week.", bg: 'bg-green-50 border-green-200' },
];

function NotificationSettings() {
  const { state, error, subscribe, unsubscribe } = usePushNotifications();

  const statusInfo = {
    loading:      { icon: <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />, label: 'Checking…',        color: 'text-muted-foreground' },
    subscribed:   { icon: <CheckCircle size={20} className="text-green-600" />,   label: 'Notifications on',  color: 'text-green-700' },
    unsubscribed: { icon: <BellOff size={20} className="text-muted-foreground" />, label: 'Notifications off', color: 'text-muted-foreground' },
    denied:       { icon: <XCircle size={20} className="text-destructive" />,      label: 'Blocked by browser', color: 'text-destructive' },
    unsupported:  { icon: <AlertTriangle size={20} className="text-amber-500" />,  label: 'Not supported',     color: 'text-amber-600' },
  }[state];

  return (
    <>
      <Helmet>
        <title>Notification Settings — Sodafom</title>
        <meta name="description" content="Manage your Sodafom push notification preferences — streak reminders, new games, and weekly progress updates." />
        <link rel="canonical" href="https://sodafom.uk/notifications" />
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          {/* Back */}
          <Link to="/hub" className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-8">
            ← Back to Hub
          </Link>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Bell size={24} className="text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                  Notification settings
                </h1>
                <div className={`flex items-center gap-1.5 text-sm font-bold ${statusInfo.color}`}>
                  {statusInfo.icon}
                  <span>{statusInfo.label}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border-2 border-border rounded-3xl p-6 mb-6">
            {state === 'unsupported' && (
              <div className="text-center py-4">
                <AlertTriangle size={32} className="text-amber-400 mx-auto mb-3" />
                <p className="font-black text-foreground mb-1">Browser not supported</p>
                <p className="text-muted-foreground text-sm">Push notifications aren't available in this browser. Try Chrome or Firefox on Android or desktop.</p>
              </div>
            )}

            {state === 'denied' && (
              <div className="text-center py-4">
                <XCircle size={32} className="text-destructive mx-auto mb-3" />
                <p className="font-black text-foreground mb-1">Notifications blocked</p>
                <p className="text-muted-foreground text-sm mb-4">You've blocked notifications for Sodafom. To re-enable, click the lock icon in your browser's address bar and allow notifications.</p>
                <div className="bg-muted rounded-xl p-3 text-xs text-muted-foreground font-bold text-left">
                  <p>Chrome: Address bar → 🔒 → Site settings → Notifications → Allow</p>
                  <p className="mt-1">Safari: Settings → Websites → Notifications → Allow</p>
                </div>
              </div>
            )}

            {(state === 'unsubscribed' || state === 'loading') && (
              <div className="text-center py-2">
                <div className="text-4xl mb-3">🔔</div>
                <h2 className="font-black text-foreground text-lg mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                  Never miss a learning moment
                </h2>
                <p className="text-muted-foreground text-sm mb-5">
                  Turn on push notifications to keep streaks alive, celebrate milestones, and be first to hear about new games.
                </p>
                {error && <p className="text-destructive text-sm font-bold mb-3">{error}</p>}
                <button
                  onClick={subscribe}
                  disabled={state === 'loading'}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-black hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  <Bell size={16} />
                  {state === 'loading' ? 'Enabling…' : 'Enable notifications'}
                </button>
              </div>
            )}

            {state === 'subscribed' && (
              <div className="text-center py-2">
                <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
                <h2 className="font-black text-foreground text-lg mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                  You're all set!
                </h2>
                <p className="text-muted-foreground text-sm mb-5">
                  Push notifications are active on this device. We'll send you helpful reminders and updates.
                </p>
                <button
                  onClick={unsubscribe}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-border text-muted-foreground font-bold text-sm hover:border-destructive hover:text-destructive transition-colors"
                >
                  <BellOff size={14} />
                  Turn off notifications
                </button>
              </div>
            )}
          </motion.div>

          {/* What you'll receive */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="font-black text-foreground text-lg mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              What you'll receive
            </h2>
            <div className="space-y-3">
              {NOTIFICATION_TYPES.map(({ icon, title, desc, bg }) => (
                <div key={title} className={`flex items-start gap-3 p-4 rounded-2xl border ${bg}`}>
                  <div className="mt-0.5 shrink-0">{icon}</div>
                  <div>
                    <p className="font-black text-foreground text-sm">{title}</p>
                    <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationSettings />
    </ProtectedRoute>
  );
}
