/**
 * Floating accessibility toolbar — high in the header, clear of game back arrows.
 * Toggles: dyslexia-friendly font, high contrast, large text.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAccessibility } from '@/lib/accessibility';
import { Settings, Type, Sun, BookOpen, X } from 'lucide-react';

export default function AccessibilityBar({ gameMode = false }: { gameMode?: boolean }) {
  const { settings, toggle } = useAccessibility();
  const [open, setOpen] = useState(false);

  const anyActive = settings.dyslexia || settings.highContrast || settings.largeText;

  return (
    <div className="fixed left-2 top-2 z-50 flex flex-col items-start gap-2" aria-label="Reading and display settings">
      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
            className="bg-card border-2 border-border rounded-2xl shadow-xl p-4 w-64"
            role="dialog"
            aria-label="Accessibility settings"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="font-black text-foreground text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
                Accessibility
              </p>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                aria-label="Close accessibility panel"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-2">
              {/* Dyslexia-friendly */}
              <button
                onClick={() => toggle('dyslexia')}
                aria-pressed={settings.dyslexia}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${
                  settings.dyslexia
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-muted/50 text-foreground hover:border-primary/40'
                }`}
              >
                <BookOpen size={16} className="shrink-0" />
                <div>
                  <p className="font-bold text-xs">Dyslexia-friendly font</p>
                  <p className="text-muted-foreground text-xs">Easier-to-read lettering</p>
                </div>
                <div className={`ml-auto w-4 h-4 rounded-full border-2 shrink-0 ${settings.dyslexia ? 'bg-primary border-primary' : 'border-muted-foreground'}`} />
              </button>

              {/* High contrast */}
              <button
                onClick={() => toggle('highContrast')}
                aria-pressed={settings.highContrast}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${
                  settings.highContrast
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-muted/50 text-foreground hover:border-primary/40'
                }`}
              >
                <Sun size={16} className="shrink-0" />
                <div>
                  <p className="font-bold text-xs">High contrast</p>
                  <p className="text-muted-foreground text-xs">Stronger colour difference</p>
                </div>
                <div className={`ml-auto w-4 h-4 rounded-full border-2 shrink-0 ${settings.highContrast ? 'bg-primary border-primary' : 'border-muted-foreground'}`} />
              </button>

              {/* Large text */}
              <button
                onClick={() => toggle('largeText')}
                aria-pressed={settings.largeText}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${
                  settings.largeText
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-muted/50 text-foreground hover:border-primary/40'
                }`}
              >
                <Type size={16} className="shrink-0" />
                <div>
                  <p className="font-bold text-xs">Large text</p>
                  <p className="text-muted-foreground text-xs">Bigger font size everywhere</p>
                </div>
                <div className={`ml-auto w-4 h-4 rounded-full border-2 shrink-0 ${settings.largeText ? 'bg-primary border-primary' : 'border-muted-foreground'}`} />
              </button>
            </div>

            <p className="text-xs text-muted-foreground mt-3 text-center">
              Settings saved automatically
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open reading and display settings"
        aria-expanded={open}
        className={`w-11 h-11 rounded-2xl shadow-lg flex items-center justify-center transition-colors relative ${
          anyActive
            ? 'bg-primary text-primary-foreground'
            : 'bg-card border-2 border-border text-muted-foreground hover:text-primary hover:border-primary'
        }`}
      >
        <Settings size={20} />
        {anyActive && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-background" />
        )}
      </motion.button>
    </div>
  );
}
