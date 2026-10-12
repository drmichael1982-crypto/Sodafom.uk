/**
 * CertificateModal — auto-pops when a child earns 3 stars on a game.
 * Shows a live certificate preview with Print and Download (PNG) options.
 */
import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Printer, Download, Award, Share2 } from 'lucide-react';
import { toPng } from 'html-to-image';

// ── Helpers ───────────────────────────────────────────────────────────────────
function todayLabel() {
  return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ── Certificate card ──────────────────────────────────────────────────────────
function CertCard({
  childName,
  gameTitle,
  subject,
  stars,
}: {
  childName: string;
  gameTitle: string;
  subject: string;
  stars: number;
}) {
  const subjectEmoji: Record<string, string> = { maths: '🔢', spelling: '✏️', reading: '📖' };
  const subjectLabel: Record<string, string> = { maths: 'Maths Champion', spelling: 'Spelling Star', reading: 'Reading Hero' };
  const emoji = subjectEmoji[subject] ?? '⭐';
  const label = subjectLabel[subject] ?? 'Superstar Learner';
  const starStr = stars === 3 ? '⭐⭐⭐' : stars === 2 ? '⭐⭐' : '⭐';

  return (
    <div
      id="auto-cert-print"
      className="bg-accent/10 border-4 border-primary rounded-2xl p-7 relative overflow-hidden"
      style={{ fontFamily: 'var(--font-heading), Georgia, serif' }}
    >
      {/* Corner decorations */}
      <span className="absolute top-2 left-2 text-lg opacity-20 pointer-events-none">⭐</span>
      <span className="absolute top-2 right-2 text-lg opacity-20 pointer-events-none">⭐</span>
      <span className="absolute bottom-2 left-2 text-lg opacity-20 pointer-events-none">⭐</span>
      <span className="absolute bottom-2 right-2 text-lg opacity-20 pointer-events-none">⭐</span>

      {/* Header */}
      <div className="text-center mb-5">
        <div className="text-5xl leading-none">{emoji}</div>
        <p className="text-xs font-bold tracking-widest uppercase mt-2 text-muted-foreground">
          Certificate of Achievement
        </p>
        <div className="w-14 h-0.5 bg-primary mx-auto mt-2" />
      </div>

      {/* Body */}
      <div className="text-center">
        <p className="text-muted-foreground text-sm mb-1">This certificate is proudly awarded to</p>
        <p className="text-3xl font-black text-primary mb-1 break-words leading-tight">
          {childName || 'Champion Learner'}
        </p>
        <div className="w-20 h-0.5 bg-primary mx-auto mb-2" />
        <p className="text-base font-black text-foreground mb-1">{label}</p>
        <p className="text-muted-foreground text-xs italic max-w-xs mx-auto leading-relaxed mb-2">
          For earning {starStr} on <strong className="text-foreground">{gameTitle}</strong> — outstanding achievement!
        </p>
        <div className="text-2xl">{starStr}</div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-end mt-5 pt-4 border-t-2 border-dashed border-primary">
        <div className="text-center">
          <div className="w-24 h-px bg-border mb-1" />
          <p className="text-muted-foreground text-xs">Awarded by</p>
          <p className="text-foreground text-xs font-bold">Sodafom</p>
        </div>
        <div className="text-2xl">🏆</div>
        <div className="text-center">
          <div className="w-24 h-px bg-border mb-1" />
          <p className="text-muted-foreground text-xs">Date</p>
          <p className="text-foreground text-xs font-bold">{todayLabel()}</p>
        </div>
      </div>

      {/* Branding */}
      <p className="text-center text-muted-foreground/40 text-xs mt-3">sodafom.uk — Learn The Key To Success</p>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
interface CertificateModalProps {
  open: boolean;
  onClose: () => void;
  gameTitle: string;
  subject: string;
  stars: number;
}

export default function CertificateModal({ open, onClose, gameTitle, subject, stars }: CertificateModalProps) {
  const childName = (() => {
    try {
      const raw = localStorage.getItem('sodafom_active_child');
      if (!raw) return '';
      const parsed = JSON.parse(raw) as { name?: string };
      return parsed.name ?? '';
    } catch {
      return '';
    }
  })();

  const certRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const createCertificatePng = async () => {
    const el = document.getElementById('auto-cert-print');
    if (!el) throw new Error('Certificate preview is not ready.');
    return toPng(el, { cacheBust: true, pixelRatio: 2 });
  };

  const handlePrint = () => {
    const el = document.getElementById('auto-cert-print');
    if (!el) return;
    const win = window.open('', '_blank');
    if (!win) {
      window.print();
      setActionMessage('Print window opened.');
      return;
    }
    const doc = win.document;
    doc.title = `Certificate — ${childName || 'Sodafom'}`;
    const style = doc.createElement('style');
    style.textContent = [
      "@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');",
      '* { margin: 0; padding: 0; box-sizing: border-box; }',
      "body { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: white; font-family: 'Nunito', sans-serif; padding: 20px; }",
      '@media print { body { margin: 0; padding: 0; } }',
    ].join('\n');
    doc.head.appendChild(style);
    const clone = el.cloneNode(true) as HTMLElement;
    doc.body.appendChild(clone);
    win.focus();
    setTimeout(() => { win.print(); }, 500);
  };

  const handleDownload = async () => {
    const el = document.getElementById('auto-cert-print');
    if (!el) return;
    setDownloading(true);
    try {
      const dataUrl = await createCertificatePng();
      const link = document.createElement('a');
      link.download = `sodafom-certificate-${(childName || 'learner').toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
      setActionMessage('Certificate saved as a picture.');
    } catch {
      setActionMessage('Save was blocked. Tap Share instead.');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    setDownloading(true);
    try {
      const dataUrl = await createCertificatePng();
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'sodafom-certificate.png', { type: 'image/png' });
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share({ title: 'My Sodafom Certificate', text: `I completed ${gameTitle} on Sodafom!`, files: [file] });
        setActionMessage('Certificate shared.');
      } else {
        await handleDownload();
      }
    } catch (error) {
      if ((error as Error)?.name !== 'AbortError') setActionMessage('Sharing is unavailable. Use Save PNG instead.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="bg-card rounded-3xl shadow-2xl border border-border w-full max-w-md overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award size={20} />
                <span className="font-black text-lg" style={{ fontFamily: 'var(--font-heading)' }}>
                  🎉 Certificate Earned!
                </span>
              </div>
              <button type="button" onClick={onClose} className="min-h-11 min-w-11 touch-manipulation opacity-70 hover:opacity-100 transition-opacity">
                <X size={20} />
              </button>
            </div>

            {/* Certificate preview */}
            <div className="p-5" ref={certRef}>
              <CertCard childName={childName} gameTitle={gameTitle} subject={subject} stars={stars} />
            </div>

            {/* Actions */}
            <div className="px-5 pb-3 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-black hover:opacity-90 transition-opacity"
              >
                <Printer size={16} /> Print
              </button>
              <button
                type="button"
                onClick={() => void handleDownload()}
                disabled={downloading}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-accent-foreground font-black hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Download size={16} /> {downloading ? 'Saving…' : 'Save PNG'}
              </button>
              <button
                type="button"
                onClick={() => void handleShare()}
                disabled={downloading}
                className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-emerald-600 text-white font-black hover:opacity-90 disabled:opacity-50"
              >
                <Share2 size={16} /> Share
              </button>
              <button
                onClick={onClose}
                className="col-span-3 px-4 py-2 rounded-xl border-2 border-border text-muted-foreground font-bold hover:border-primary hover:text-primary transition-colors"
              >
                Close
              </button>
            </div>

            {actionMessage && <p role="status" className="px-5 pb-2 text-center text-xs font-bold text-primary">{actionMessage}</p>}

            <p className="text-center text-xs text-muted-foreground pb-4">
              Create custom certificates at{' '}
              <a href="/certificates" className="text-primary font-bold hover:underline">sodafom.uk/certificates</a>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
