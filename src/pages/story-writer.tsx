import { story_writer } from 'virtual:content';
/**
 * /story-writer — children write and illustrate their own stories.
 *
 * Features:
 *  - Multi-page story (up to 8 pages)
 *  - Each page has a drawing canvas (colours, brush sizes, eraser, fill, undo)
 *  - Each page has a text area for the story text
 *  - Cover page with title + author name
 *  - "Read my story" mode — flips through pages with TTS read-aloud
 *  - Save to localStorage; load back on return
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft, ChevronRight, Plus, Trash2,
  Pencil, Eraser, Undo2, Save,
  Play, Square, RotateCcw, Type,
  PaintBucket,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface StoryPage {
  id: string;
  canvasData: string;
  text: string;
}

interface Story {
  id: string;
  title: string;
  author: string;
  pages: StoryPage[];
  createdAt: number;
  updatedAt: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'sodafom_story_writer';
const MAX_PAGES = 8;
const CANVAS_W = 600;
const CANVAS_H = 380;

const COLOURS = [
  '#1a1a1a', '#f5f5f5', '#CC0000', '#FF6B35', '#FFD700',
  '#2D6A4F', '#4ECDC4', '#45B7D1', '#9B59B6', '#E91E63',
  '#FF9800', '#8BC34A', '#795548', '#607D8B', '#F5F5DC',
];

type Tool = 'brush' | 'eraser' | 'fill';

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function blankPage(): StoryPage {
  return { id: makeId(), canvasData: '', text: '' };
}

function blankStory(): Story {
  return {
    id: makeId(),
    title: 'My Amazing Story',
    author: '',
    pages: [blankPage()],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function loadStory(): Story {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Story;
  } catch { /* ignore */ }
  return blankStory();
}

function saveStory(story: Story) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...story, updatedAt: Date.now() }));
  } catch { /* ignore */ }
}

// ── Flood fill ────────────────────────────────────────────────────────────────
function floodFill(ctx: CanvasRenderingContext2D, x: number, y: number, fillColour: string) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  const idx = (px: number, py: number) => (py * w + px) * 4;
  const target = Array.from(data.slice(idx(x, y), idx(x, y) + 4));

  const tmp = document.createElement('canvas');
  tmp.width = tmp.height = 1;
  const tc = tmp.getContext('2d')!;
  tc.fillStyle = fillColour;
  tc.fillRect(0, 0, 1, 1);
  const fill = tc.getImageData(0, 0, 1, 1).data;

  if (
    target[0] === fill[0] && target[1] === fill[1] &&
    target[2] === fill[2] && target[3] === fill[3]
  ) return;

  const match = (px: number, py: number) => {
    const i = idx(px, py);
    return data.at(i) === target.at(0) && data.at(i+1) === target.at(1) &&
           data.at(i+2) === target.at(2) && data.at(i+3) === target.at(3);
  };

  const stack: number[][] = [[x, y]];
  while (stack.length) {
    const point = stack.pop()!;
    const cx = point.at(0)!;
    const cy = point.at(1)!;
    if (cx < 0 || cx >= w || cy < 0 || cy >= h) continue;
    if (!match(cx, cy)) continue;
    const i = idx(cx, cy);
    // ImageDataArray is a Uint8ClampedArray — direct index assignment is safe here
    // eslint-disable-next-line security/detect-object-injection
    data[i] = fill.at(0)!; data[i+1] = fill.at(1)!; data[i+2] = fill.at(2)!; data[i+3] = fill.at(3)!;
    stack.push([cx+1, cy], [cx-1, cy], [cx, cy+1], [cx, cy-1]);
  }
  ctx.putImageData(imageData, 0, 0);
}

// ── Drawing Canvas ────────────────────────────────────────────────────────────
interface CanvasProps {
  initialData: string;
  colour: string;
  brushSize: number;
  tool: Tool;
  onSave: (data: string) => void;
  undoTrigger: number;
}

function DrawingCanvas({ initialData, colour, brushSize, tool, onSave, undoTrigger }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const history = useRef<ImageData[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    // White background via CSS variable resolved value
    ctx.fillStyle = 'hsl(var(--background))';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    // Override with actual white for drawing surface
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    if (initialData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        pushHistory(ctx);
      };
      img.src = initialData;
    } else {
      pushHistory(ctx);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  useEffect(() => {
    if (undoTrigger === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    if (history.current.length > 1) {
      history.current.pop();
      ctx.putImageData(history.current[history.current.length - 1], 0, 0);
      onSave(canvas.toDataURL());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undoTrigger]);

  const pushHistory = (ctx: CanvasRenderingContext2D) => {
    history.current.push(ctx.getImageData(0, 0, CANVAS_W, CANVAS_H));
    if (history.current.length > 30) history.current.shift();
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    if ('touches' in e) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e);

    if (tool === 'fill') {
      floodFill(ctx, Math.floor(pos.x), Math.floor(pos.y), colour);
      pushHistory(ctx);
      onSave(canvas.toDataURL());
      return;
    }

    drawing.current = true;
    lastPos.current = pos;

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, (tool === 'eraser' ? brushSize * 2 : brushSize) / 2, 0, Math.PI * 2);
    ctx.fillStyle = tool === 'eraser' ? '#ffffff' : colour;
    ctx.fill();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!drawing.current || !lastPos.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e);
    const size = tool === 'eraser' ? brushSize * 2 : brushSize;

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : colour;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    lastPos.current = pos;
  };

  const endDraw = () => {
    if (!drawing.current) return;
    drawing.current = false;
    lastPos.current = null;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    pushHistory(ctx);
    onSave(canvas.toDataURL());
  };

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      className="w-full rounded-xl border-2 border-border touch-none bg-white"
      style={{ cursor: 'crosshair' }}
      onMouseDown={startDraw}
      onMouseMove={draw}
      onMouseUp={endDraw}
      onMouseLeave={endDraw}
      onTouchStart={startDraw}
      onTouchMove={draw}
      onTouchEnd={endDraw}
    />
  );
}

// ── Read Mode ─────────────────────────────────────────────────────────────────
interface ReadModeProps {
  story: Story;
  onClose: () => void;
}

function ReadMode({ story, onClose }: ReadModeProps) {
  const [page, setPage] = useState(0);
  const total = story.pages.length;
  const isCover = page === 0;
  const currentPage = isCover ? null : story.pages[page - 1];

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'en-GB';
    utt.rate = 0.85;
    utt.pitch = 1.3;
    window.speechSynthesis.speak(utt);
  };

  useEffect(() => {
    if (isCover) {
      speak(`${story.title}. By ${story.author || 'a young author'}.`);
    } else if (currentPage?.text) {
      speak(currentPage.text);
    }
    return () => { window.speechSynthesis?.cancel(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-primary/5">
          <p className="font-black text-foreground text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
            📖 {story.title}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs">
              {isCover ? 'Cover' : `Page ${page} of ${total}`}
            </span>
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-muted transition-colors text-muted-foreground">
              <Square size={14} />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="p-6"
          >
            {isCover ? (
              <div className="text-center py-8 space-y-4">
                <div className="text-7xl">📚</div>
                <h1 className="text-3xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                  {story.title}
                </h1>
                {story.author && (
                  <p className="text-muted-foreground text-lg">by {story.author}</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {currentPage?.canvasData && (
                  <img
                    src={currentPage.canvasData}
                    alt={`Illustration for page ${page}`}
                    className="w-full rounded-xl border border-border"
                  />
                )}
                {currentPage?.text && (
                  <p className="text-foreground text-base leading-relaxed font-bold text-center px-4"
                     style={{ fontFamily: 'var(--font-heading)' }}>
                    {currentPage.text}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between px-5 py-4 border-t border-border">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-border font-bold text-sm disabled:opacity-30 hover:bg-muted transition-colors"
          >
            <ChevronLeft size={14} /> Back
          </button>
          <div className="flex gap-1.5">
            {Array.from({ length: total + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-2 h-2 rounded-full transition-colors ${i === page ? 'bg-primary' : 'bg-muted-foreground/30'}`}
              />
            ))}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(total, p + 1))}
            disabled={page === total}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-30 hover:opacity-90 transition-opacity"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function StoryWriterPage() {
  const [story, setStory] = useState<Story>(loadStory);
  const [pageIdx, setPageIdx] = useState(0);
  const [colour, setColour] = useState(COLOURS[0]);
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState<Tool>('brush');
  const [undoTrigger, setUndoTrigger] = useState(0);
  const [readMode, setReadMode] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'draw' | 'write'>('draw');
  const [showColours, setShowColours] = useState(false);

  const currentPage = story.pages.at(pageIdx);

  const updatePage = useCallback((patch: Partial<StoryPage>) => {
    setStory((s) => {
      const pages = s.pages.map((p, i) => i === pageIdx ? { ...p, ...patch } : p);
      return { ...s, pages };
    });
  }, [pageIdx]);

  const handleSave = useCallback(() => {
    saveStory(story);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [story]);

  useEffect(() => {
    const t = setInterval(() => saveStory(story), 30_000);
    return () => clearInterval(t);
  }, [story]);

  const addPage = () => {
    if (story.pages.length >= MAX_PAGES) return;
    const newPages = [...story.pages, blankPage()];
    setStory((s) => ({ ...s, pages: newPages }));
    setPageIdx(newPages.length - 1);
  };

  const deletePage = () => {
    if (story.pages.length <= 1) return;
    const newPages = story.pages.filter((_, i) => i !== pageIdx);
    setStory((s) => ({ ...s, pages: newPages }));
    setPageIdx((i) => Math.max(0, i - 1));
  };

  const clearCanvas = () => {
    updatePage({ canvasData: '' });
    setUndoTrigger((n) => n + 1);
  };

  const newStory = () => {
    if (!confirm('Start a new story? Your current story will be saved first.')) return;
    saveStory(story);
    setStory(blankStory());
    setPageIdx(0);
  };

  return (
    <main className="min-h-screen bg-background pb-20">
      <Helmet>
        <title>Story Writer — Sodafom</title>
        <meta name="description" content="Write and illustrate your own stories with Sodafom's Story Writer! Draw pictures and type your story." />
        <link rel="canonical" href="https://sodafom.uk/story-writer" />
        <meta property="og:title" content="Story Writer — Sodafom" />
        <meta property="og:description" content="Write and illustrate your own stories!" />
        <meta property="og:url" content="https://sodafom.uk/story-writer" />
        <meta property="og:type" content="website" />
      </Helmet>

      <AnimatePresence>
        {readMode && <ReadMode story={story} onClose={() => setReadMode(false)} />}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-gradient-to-br from-accent/10 via-primary/5 to-secondary/5 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-5">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
            <Link to="/games" className="hover:text-foreground transition-colors">Games</Link>
            <ChevronRight size={14} />
            <span className="text-foreground font-bold">Story Writer</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-2xl">✍️</div>
              <div>
                <h1 className="text-2xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                  Story Writer
                </h1>
                <p className="text-muted-foreground text-xs">Draw pictures and write your own story!</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleSave}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-sm transition-all ${
                  saved ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-primary/10'
                }`}
              >
                <Save size={14} /> {saved ? 'Saved!' : 'Save'}
              </button>
              <button
                onClick={() => setReadMode(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-secondary-foreground font-bold text-sm hover:opacity-90 transition-opacity"
              >
                <Play size={14} /> Read my story
              </button>
              <button
                onClick={newStory}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-border text-foreground font-bold text-sm hover:bg-muted transition-colors"
              >
                <RotateCcw size={14} /> New story
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

          {/* Left panel */}
          <div className="space-y-4">
            {/* Story info */}
            <div className="bg-card border-2 border-border rounded-2xl p-4 space-y-3">
              <h2 className="font-black text-foreground text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
                📚 My Story
              </h2>
              <div>
                <label className="text-xs text-muted-foreground font-bold block mb-1">Story title</label>
                <input
                  value={story.title}
                  onChange={(e) => setStory((s) => ({ ...s, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border-2 border-border bg-background text-foreground text-sm font-bold focus:outline-none focus:border-primary"
                  placeholder="My Amazing Story"
                  maxLength={60}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-bold block mb-1">Author name</label>
                <input
                  value={story.author}
                  onChange={(e) => setStory((s) => ({ ...s, author: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border-2 border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary"
                  placeholder="Your name"
                  maxLength={40}
                />
              </div>
            </div>

            {/* Page list */}
            <div className="bg-card border-2 border-border rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-black text-foreground text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
                  Pages ({story.pages.length}/{MAX_PAGES})
                </h2>
                <button
                  onClick={addPage}
                  disabled={story.pages.length >= MAX_PAGES}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 transition-colors disabled:opacity-40"
                >
                  <Plus size={12} /> Add
                </button>
              </div>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {story.pages.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => setPageIdx(i)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all ${
                      i === pageIdx
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-primary/10 text-foreground'
                    }`}
                  >
                    {p.canvasData ? (
                      <img src={p.canvasData} alt="" className="w-10 h-7 rounded object-cover border border-border/50 shrink-0" />
                    ) : (
                      <div className="w-10 h-7 rounded bg-background/50 border border-border/50 flex items-center justify-center shrink-0">
                        <Pencil size={10} className="opacity-40" />
                      </div>
                    )}
                    <span className="text-xs font-bold truncate">
                      {p.text ? p.text.slice(0, 24) + (p.text.length > 24 ? '…' : '') : `Page ${i + 1}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-accent/5 border-2 border-accent/20 rounded-2xl p-4 space-y-1.5 text-xs text-muted-foreground">
              <p className="font-black text-foreground text-sm">💡 Tips</p>
              <p>🎨 Draw your picture first, then write your story below</p>
              <p>📖 Tap "Read my story" to hear it read aloud</p>
              <p>➕ Add up to 8 pages to your story</p>
              <p>💾 Your story saves automatically every 30 seconds</p>
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-4">
            {/* Page navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPageIdx((i) => Math.max(0, i - 1))}
                  disabled={pageIdx === 0}
                  className="w-8 h-8 rounded-xl border-2 border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="font-black text-foreground text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
                  Page {pageIdx + 1} of {story.pages.length}
                </span>
                <button
                  onClick={() => setPageIdx((i) => Math.min(story.pages.length - 1, i + 1))}
                  disabled={pageIdx === story.pages.length - 1}
                  className="w-8 h-8 rounded-xl border-2 border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
              <button
                onClick={deletePage}
                disabled={story.pages.length <= 1}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-muted-foreground hover:text-secondary hover:bg-secondary/10 text-xs font-bold transition-colors disabled:opacity-30"
              >
                <Trash2 size={12} /> Delete page
              </button>
            </div>

            {/* Tab switcher */}
            <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
              {([
                { id: 'draw' as const, icon: <Pencil size={14} />, label: 'Draw' },
                { id: 'write' as const, icon: <Type size={14} />, label: 'Write' },
              ]).map(({ id, icon, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    activeTab === id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>

            {/* Draw tab */}
            {activeTab === 'draw' && (
              <div className="space-y-3">
                {/* Toolbar */}
                <div className="bg-card border-2 border-border rounded-2xl p-3 flex flex-wrap items-center gap-3">
                  {/* Tools */}
                  <div className="flex items-center gap-1">
                    {([
                      { t: 'brush' as Tool, icon: <Pencil size={15} />, label: 'Brush' },
                      { t: 'eraser' as Tool, icon: <Eraser size={15} />, label: 'Eraser' },
                      { t: 'fill' as Tool, icon: <PaintBucket size={15} />, label: 'Fill' },
                    ]).map(({ t, icon, label }) => (
                      <button
                        key={t}
                        onClick={() => setTool(t)}
                        title={label}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                          tool === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-primary/10'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>

                  <div className="w-px h-6 bg-border" />

                  {/* Brush sizes */}
                  <div className="flex items-center gap-2">
                    {story_writer.BRUSH_SIZES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setBrushSize(s)}
                        title={`Size ${s}`}
                        className={`flex items-center justify-center rounded-full transition-all ${
                          brushSize === s ? 'ring-2 ring-primary ring-offset-1' : ''
                        }`}
                        style={{ width: Math.max(s, 10) + 8, height: Math.max(s, 10) + 8 }}
                      >
                        <div
                          className="rounded-full bg-foreground"
                          style={{ width: Math.max(s, 4), height: Math.max(s, 4) }}
                        />
                      </button>
                    ))}
                  </div>

                  <div className="w-px h-6 bg-border" />

                  {/* Colour picker */}
                  <div className="relative">
                    <button
                      onClick={() => setShowColours((v) => !v)}
                      className="w-9 h-9 rounded-xl border-2 border-border flex items-center justify-center hover:border-primary transition-colors"
                      title="Colours"
                    >
                      <div
                        className="w-5 h-5 rounded-full border border-border"
                        style={{ background: colour }}
                      />
                    </button>
                    {showColours && (
                      <div className="absolute top-11 left-0 z-20 bg-card border-2 border-border rounded-2xl p-3 shadow-xl">
                        <div className="grid grid-cols-5 gap-1.5">
                          {COLOURS.map((c) => (
                            <button
                              key={c}
                              onClick={() => { setColour(c); setShowColours(false); }}
                              className={`w-7 h-7 rounded-lg border-2 transition-transform hover:scale-110 ${
                                colour === c ? 'border-primary scale-110' : 'border-border'
                              }`}
                              style={{ background: c }}
                              title={c}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ml-auto flex items-center gap-1">
                    <button
                      onClick={() => setUndoTrigger((n) => n + 1)}
                      title="Undo"
                      className="w-9 h-9 rounded-xl bg-muted text-foreground flex items-center justify-center hover:bg-primary/10 transition-colors"
                    >
                      <Undo2 size={15} />
                    </button>
                    <button
                      onClick={clearCanvas}
                      title="Clear canvas"
                      className="w-9 h-9 rounded-xl bg-muted text-muted-foreground flex items-center justify-center hover:bg-secondary/10 hover:text-secondary transition-colors"
                    >
                      <RotateCcw size={15} />
                    </button>
                  </div>
                </div>

                {/* Canvas */}
                {currentPage && (
                <DrawingCanvas
                  key={`${currentPage.id}-canvas`}
                  initialData={currentPage.canvasData}
                  colour={colour}
                  brushSize={brushSize}
                  tool={tool}
                  onSave={(data) => updatePage({ canvasData: data })}
                  undoTrigger={undoTrigger}
                />
                )}
              </div>
            )}

            {/* Write tab */}
            {activeTab === 'write' && currentPage && (
              <div className="space-y-3">
                {currentPage.canvasData ? (
                  <div className="rounded-2xl overflow-hidden border-2 border-border">
                    <img src={currentPage.canvasData} alt="Your drawing" className="w-full" />
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveTab('draw')}
                    className="w-full py-8 rounded-2xl border-2 border-dashed border-border text-muted-foreground text-sm font-bold hover:border-primary hover:text-primary transition-colors flex flex-col items-center gap-2"
                  >
                    <Pencil size={24} />
                    Tap to draw a picture for this page
                  </button>
                )}
                <div>
                  <label className="text-xs text-muted-foreground font-bold block mb-2">
                    What happens on this page?
                  </label>
                  <textarea
                    value={currentPage.text}
                    onChange={(e) => updatePage({ text: e.target.value })}
                    placeholder="Once upon a time…"
                    rows={6}
                    maxLength={300}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-border bg-background text-foreground text-base leading-relaxed focus:outline-none focus:border-primary resize-none"
                    style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}
                  />
                  <p className="text-xs text-muted-foreground text-right mt-1">
                    {currentPage.text.length}/300 characters
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
