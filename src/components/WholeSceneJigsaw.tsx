import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { jigsawOutline } from "./PagePictureJigsaw";
import "./whole-scene-jigsaw.css";

function size() {
  return window.innerWidth >= 760 && window.innerHeight >= 500 ? 4 : 3;
}
function loadPieces(key: string, total: number) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value)
      ? [
          ...new Set(
            value.filter(
              (n): n is number => Number.isInteger(n) && n >= 0 && n < total,
            ),
          ),
        ]
      : [];
  } catch {
    return [];
  }
}

/** Sample the same frozen scene into every interlocking piece, then animate it. */
export default function WholeSceneJigsaw({
  renderScene,
  renderFacts,
  reducedMotion = false,
}: {
  reducedMotion?: boolean;
  renderScene: (moving: boolean) => ReactNode;
  renderFacts?: () => ReactNode;
}) {
  const [grid, setGrid] = useState(size);
  const total = grid * grid;
  const key = `sodafom:space-picture:v2:${grid}`;
  const [placed, setPlaced] = useState(() => loadPieces(key, total));
  const [selected, setSelected] = useState<number | null>(null);
  const [moving, setMoving] = useState(true);
  const [full, setFull] = useState(false);
  const [notice, setNotice] = useState(
    "Choose a picture piece, then tap its matching space.",
  );
  const returnFocus = useRef(false);
  const close = useRef<HTMLButtonElement>(null);
  const expand = useRef<HTMLButtonElement>(null);
  const tray = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, "");
  const complete = placed.length === total;
  useEffect(() => {
    const resize = () => setGrid(size());
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  useEffect(() => {
    const restored = loadPieces(key, total);
    setPlaced(restored);
    setSelected(null);
    setNotice(
      restored.length === total
        ? "Your whole space picture is ready to explore."
        : "Choose a picture piece, then tap its matching space.",
    );
    setMoving(true);
  }, [key, total]);
  useEffect(() => {
    if (!full) {
      if (returnFocus.current) {
        expand.current?.focus();
        returnFocus.current = false;
      }
      return;
    }
    returnFocus.current = true;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    close.current?.focus();
    const keys = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFull(false);
      if (event.key === "Tab") {
        const buttons = Array.from(
          document.querySelectorAll<HTMLElement>(
            ".whole-space-full button:not(:disabled),.whole-space-full select,.whole-space-full summary",
          ),
        );
        const first = buttons[0],
          last = buttons.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", keys);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", keys);
      if (previous?.isConnected) previous.focus();
      else expand.current?.focus();
    };
  }, [full]);
  const loose = Array.from({ length: total }, (_, i) => i)
    .filter((i) => !placed.includes(i))
    .sort((a, b) => ((a * 7 + 2) % 23) - ((b * 7 + 2) % 23));
  function fit(target: number, piece = selected) {
    if (piece === null) {
      setNotice("Choose a loose picture piece first.");
      return;
    }
    if (piece !== target) {
      setNotice("Those stars and colours do not join here. Try another space.");
      return;
    }
    if (placed.includes(target)) return;
    const next = [...placed, target];
    setPlaced(next);
    setSelected(null);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {}
    setNotice(
      next.length === total
        ? reducedMotion
          ? "Brilliant! The whole picture fits. Explore the still space scene."
          : "Brilliant! The whole picture fits. Watch the planets, Moon and shooting stars move."
        : `It fits! ${next.length} of ${total} picture pieces placed.`,
    );
    requestAnimationFrame(() =>
      tray.current?.querySelector<HTMLButtonElement>("button")?.focus(),
    );
  }
  function tile(piece: number, loosePiece = false) {
    const row = Math.floor(piece / grid),
      col = piece % grid;
    const clip = `${id}-${loosePiece ? "tray" : "board"}-${piece}`;
    return (
      <svg
        className="whole-space-tile-art"
        viewBox="-14 -14 128 128"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <clipPath id={clip}>
            <path d={jigsawOutline(row, col, grid, grid)} />
          </clipPath>
        </defs>
        <foreignObject
          x={-col * 100}
          y={-row * 100}
          width={grid * 100}
          height={grid * 100}
          clipPath={`url(#${clip})`}
        >
          <div className="whole-space-picture">{renderScene(false)}</div>
        </foreignObject>
        <path
          d={jigsawOutline(row, col, grid, grid)}
          fill="none"
          stroke="#c6eaff"
          strokeWidth="1.5"
        />
      </svg>
    );
  }
  const content = (
    <section
      className={`whole-space-jigsaw ${full ? "whole-space-full" : ""} ${complete ? "whole-space-complete" : ""}`}
      {...(full ? { role: "dialog", "aria-modal": true as const } : {})}
      aria-label={
        full
          ? "Full-screen whole-picture space jigsaw"
          : "Whole-picture space jigsaw"
      }
    >
      <header className="whole-space-heading">
        <div>
          <span>Archie’s space adventure</span>
          <h2>
            {complete
              ? "Your space picture is alive!"
              : "Build the whole space picture"}
          </h2>
        </div>
        <button
          ref={full ? close : expand}
          type="button"
          onClick={() => setFull((v) => !v)}
        >
          {full ? "Back to app" : "Full screen"}
        </button>
      </header>
      <div className="whole-space-progress">
        <span>
          {placed.length} / {total} picture pieces
        </span>
        <progress
          aria-label="Space picture progress"
          value={placed.length}
          max={total}
        />
      </div>
      <div className="whole-space-play">
        <div
          className="whole-space-board"
          style={{ gridTemplateColumns: `repeat(${grid},1fr)` }}
          aria-label="Whole space picture puzzle spaces"
        >
          {complete ? (
            <div className="whole-space-picture whole-space-reward">
              {renderScene(moving)}
            </div>
          ) : (
            <>
              <div className="whole-space-guide whole-space-picture">
                {renderScene(false)}
              </div>
              {Array.from({ length: total }, (_, piece) => (
                <button
                  key={piece}
                  type="button"
                  className={`whole-space-cell ${placed.includes(piece) ? "space-cell-fitted" : "space-cell-empty"}`}
                  aria-label={`${placed.includes(piece) ? "Fitted" : "Place"} space picture piece ${piece + 1}`}
                  disabled={placed.includes(piece)}
                  onClick={() => fit(piece)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    const value = event.dataTransfer.getData(
                      "application/x-space-picture",
                    );
                    if (/^\d+$/.test(value)) fit(piece, Number(value));
                  }}
                >
                  {placed.includes(piece) ? (
                    tile(piece)
                  ) : (
                    <svg
                      className="whole-space-tile-art"
                      viewBox="-14 -14 128 128"
                      aria-hidden="true"
                    >
                      <path
                        d={jigsawOutline(
                          Math.floor(piece / grid),
                          piece % grid,
                          grid,
                          grid,
                        )}
                        fill="#071f3da0"
                        stroke="#badfff"
                        strokeWidth="1.5"
                      />
                      <text
                        x="50"
                        y="55"
                        textAnchor="middle"
                        fill="#dcefff"
                        fontSize="13"
                      >
                        {piece + 1}
                      </text>
                    </svg>
                  )}
                </button>
              ))}
            </>
          )}
        </div>
        <div
          ref={tray}
          className="whole-space-tray"
          aria-label="Loose space picture pieces"
        >
          {!complete && (
            <>
              <strong>Fit the stars, Sun, planets and Archie</strong>
              <div className="whole-space-loose">
                {loose.map((piece) => (
                  <button
                    key={piece}
                    type="button"
                    className={selected === piece ? "space-piece-selected" : ""}
                    aria-label={`Pick space picture piece ${piece + 1}`}
                    aria-pressed={selected === piece}
                    draggable
                    onDragStart={(event) => {
                      setSelected(piece);
                      event.dataTransfer.setData(
                        "application/x-space-picture",
                        String(piece),
                      );
                    }}
                    onClick={() => {
                      setSelected(piece);
                      setNotice(
                        `Picture piece ${piece + 1} selected. Find where the colours join.`,
                      );
                    }}
                  >
                    {tile(piece, true)}
                    <span>{piece + 1}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          <p role="status">{notice}</p>
          {complete && (
            <>
              <button
                type="button"
                disabled={reducedMotion}
                aria-pressed={moving && !reducedMotion}
                onClick={() => setMoving((v) => !v)}
              >
                {reducedMotion
                  ? "Still space scene"
                  : moving
                    ? "Pause space scene"
                    : "Move space scene"}
              </button>
              {renderFacts && (
                <details>
                  <summary>Discover the planets</summary>
                  {renderFacts()}
                </details>
              )}
            </>
          )}
          <button
            type="button"
            onClick={() => {
              setPlaced([]);
              setSelected(null);
              setMoving(true);
              setNotice("Picture reset. Build the whole scene again.");
              try {
                localStorage.removeItem(key);
              } catch {}
            }}
          >
            Start the picture again
          </button>
        </div>
      </div>
    </section>
  );
  return full ? createPortal(content, document.body) : content;
}
