/**
 * /hub/notifications — In-app notification centre
 * Shows badge awards, star milestones, daily challenge completions.
 */
import { useState, useEffect } from 'react';
import { API_PREFIX } from '@/lib/config';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, BellOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router';
import { ProtectedRoute } from '@/lib/auth/auth-client';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  emoji: string;
  createdAt: string;
  read: boolean;
  childName?: string;
  link?: string;
}



function NotificationItem({ n, isNew }: { n: Notification; isNew: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 p-4 rounded-2xl border transition-colors ${isNew ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'}`}
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">
        {n.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-bold text-sm text-foreground">{n.title}</p>
          {isNew && <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5" />}
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
          </span>
          {n.link && (
            <Link to={n.link} className="text-xs text-primary font-bold hover:underline">
              View →
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function NotificationCentre() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastReadAt, setLastReadAt] = useState<Date | null>(null);

  useEffect(() => {
    // Load last-read timestamp from localStorage
    try {
      const stored = localStorage.getItem('sodafom_notif_read_at');
      if (stored) setLastReadAt(new Date(stored));
    } catch { /* ignore */ }

    fetch(`${API_PREFIX}/notifications`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setNotifications(data.notifications ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const markAllRead = () => {
    const now = new Date();
    setLastReadAt(now);
    try {
      localStorage.setItem('sodafom_notif_read_at', now.toISOString());
    } catch { /* ignore */ }
    fetch(`${API_PREFIX}/notifications/read`, { method: 'POST', credentials: 'include' }).catch(() => {});
  };

  const unreadCount = notifications.filter(n =>
    !lastReadAt || new Date(n.createdAt) > lastReadAt
  ).length;

  return (
    <main className="min-h-screen bg-muted py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/hub" className="p-2 rounded-xl bg-card border border-border hover:bg-muted transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
              Notifications
            </h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity"
            >
              <CheckCircle size={14} />
              Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 rounded-2xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <BellOff size={28} className="text-muted-foreground" />
            </div>
            <h2 className="text-lg font-black text-foreground mb-2">No notifications yet</h2>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Play games, earn badges, and complete Daily Challenges — your achievements will appear here.
            </p>
            <Link
              to="/games"
              className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Play a game
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {notifications.map(n => (
                <NotificationItem
                  key={n.id}
                  n={n}
                  isNew={!lastReadAt || new Date(n.createdAt) > lastReadAt}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Push notification settings link */}
        <div className="mt-8 p-4 rounded-2xl bg-card border border-border flex items-center gap-3">
          <Bell size={20} className="text-primary flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">Push notifications</p>
            <p className="text-xs text-muted-foreground">Get notified even when you're not on the site</p>
          </div>
          <Link
            to="/notifications"
            className="text-xs text-primary font-bold hover:underline flex-shrink-0"
          >
            Manage →
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function NotificationsPage() {
  return (
    <>
      <Helmet>
        <title>Notifications — Sodafom</title>
        <meta name="description" content="Your Sodafom notification centre — badge awards, star milestones, and daily challenge updates." />
        <link rel="canonical" href="https://sodafom.uk/hub/notifications" />
        <meta name="robots" content="noindex" />
      </Helmet>
      <ProtectedRoute redirectTo="/login">
        <NotificationCentre />
      </ProtectedRoute>
    </>
  );
}
