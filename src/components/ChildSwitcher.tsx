/**
 * ChildSwitcher — compact dropdown in the hub header to quick-switch active child
 * Shows avatar + name of active child; opens a popover listing all children.
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Plus, Star } from 'lucide-react';
import { setActiveChild, type AgeGroup } from '@/hooks/useChildAge';

interface Child {
  id: number;
  name: string;
  ageGroup: string;
  avatarEmoji: string;
  totalStars: number;
}

interface ChildSwitcherProps {
  children: Child[];
  activeChildId: number | null;
  onAddChild: () => void;
}

export default function ChildSwitcher({ children, activeChildId, onAddChild }: ChildSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const active = children.find(c => c.id === activeChildId) ?? children[0] ?? null;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (children.length === 0) return null;

  function switchTo(child: Child) {
    setActiveChild({
      id: child.id,
      name: child.name,
      ageGroup: child.ageGroup as AgeGroup,
      avatarEmoji: child.avatarEmoji,
    });
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="text-xl">{active?.avatarEmoji ?? '⭐'}</span>
        <span className="font-black text-foreground text-sm max-w-[80px] truncate">
          {active?.name ?? 'Select'}
        </span>
        <ChevronDown
          size={14}
          className={`text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' as const }}
            className="absolute top-full mt-2 left-0 z-50 min-w-[200px] bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
            role="listbox"
            aria-label="Switch child"
          >
            <div className="p-2 space-y-1">
              {children.map(child => (
                <button
                  key={child.id}
                  role="option"
                  aria-selected={child.id === activeChildId}
                  onClick={() => switchTo(child)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                    child.id === activeChildId
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <span className="text-2xl">{child.avatarEmoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`font-black text-sm truncate ${child.id === activeChildId ? 'text-primary-foreground' : 'text-foreground'}`}>
                      {child.name}
                    </div>
                    <div className={`flex items-center gap-1 text-xs ${child.id === activeChildId ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      <Star size={10} className="fill-current" />
                      {child.totalStars} stars
                    </div>
                  </div>
                  {child.id === activeChildId && (
                    <div className="w-2 h-2 rounded-full bg-accent shrink-0" />
                  )}
                </button>
              ))}
            </div>
            <div className="border-t border-border p-2">
              <button
                onClick={() => { setOpen(false); onAddChild(); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-primary font-bold text-sm hover:bg-primary/10 transition-colors"
              >
                <Plus size={16} />
                Add another child
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
