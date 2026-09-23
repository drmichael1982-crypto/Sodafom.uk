const approvedArtwork: Record<string, string> = {
  'Sodafom': '/assets/approved/home_app.jpg',
  'Archie’s Stories': '/assets/approved/stories_app.jpg',
  'Archie’s Lessons': '/assets/approved/lessons_app.jpg',
  'Ask Archie': '/assets/approved/ask_app.jpg',
  'Sodafom Game Islands': '/assets/approved/games_app.jpg',
  'Homework Helper': '/assets/approved/homework_app.jpg',
};

function insertApprovedPreview() {
  const main = document.querySelector('main');
  if (!main) return;

  const heading = main.querySelector('h1')?.textContent?.trim() || '';
  const key = Object.keys(approvedArtwork).find(k => heading.includes(k));
  if (!key) return;

  const src = approvedArtwork[key];
  const current = main.querySelector<HTMLElement>('[data-approved-artwork-preview]');
  if (current?.dataset.src === src) return;
  current?.remove();

  const wrap = document.createElement('section');
  wrap.dataset.approvedArtworkPreview = 'true';
  wrap.dataset.src = src;
  wrap.style.cssText = 'max-width:1120px;margin:16px auto;padding:0 16px;box-sizing:border-box;';

  const img = document.createElement('img');
  img.src = src;
  img.alt = `${key} approved Sodafom artwork preview`;
  img.style.cssText = 'display:block;width:100%;height:auto;max-height:680px;object-fit:contain;border-radius:24px;border:4px solid white;box-shadow:0 12px 30px rgba(15,23,42,.22);background:white;';

  const note = document.createElement('div');
  note.textContent = 'Approved design preview — live test controls are directly below.';
  note.style.cssText = 'margin-top:8px;text-align:center;font:700 12px/1.4 system-ui,sans-serif;color:#1e3a8a;';

  wrap.append(img, note);
  const first = main.firstElementChild;
  if (first?.nextSibling) main.insertBefore(wrap, first.nextSibling);
  else main.appendChild(wrap);
}

if (typeof window !== 'undefined') {
  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      insertApprovedPreview();
    });
  };
  const observer = new MutationObserver(schedule);
  const start = () => {
    observer.observe(document.body, { childList: true, subtree: true });
    schedule();
  };
  if (document.body) start();
  else window.addEventListener('DOMContentLoaded', start, { once: true });
}
