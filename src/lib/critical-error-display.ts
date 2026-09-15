/** Render the existing recovery screen without interpreting error text as HTML. */
export interface CriticalErrorDetails {
  message: unknown;
  url?: string;
  line?: number;
  column?: number;
  error?: Error | null;
}

const PANEL_ID = 'sodafom-critical-error';

function safeText(value: unknown, fallback = ''): string {
  try { return value == null ? fallback : String(value); } catch { return fallback; }
}

export function showCriticalError(
  doc: Document,
  reload: () => void,
  details: CriticalErrorDetails,
): void {
  // Reporting an early error must not throw a second error before the body exists.
  if (!doc.body) return;

  let stack = 'No stack';
  try { stack = safeText(details.error?.stack, 'No stack') || 'No stack'; } catch { /* Host error object may have an inaccessible stack. */ }

  // Reuse our own screen: repeated errors must not stack full-screen overlays.
  let panel = doc.getElementById(PANEL_ID);
  const isNew = !panel;
  if (!panel) panel = doc.createElement('div');
  panel.id = PANEL_ID;
  panel.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:white;color:black;padding:20px;z-index:9999;overflow:auto;font-family:sans-serif;';

  const heading = doc.createElement('h1');
  heading.style.cssText = 'color:red;font-size:20px;';
  heading.textContent = 'Sodafom Critical Error';

  const description = doc.createElement('pre');
  description.style.cssText = 'white-space:pre-wrap;font-size:12px;margin-top:10px;';
  description.textContent = `${safeText(details.message, 'Unknown error')}\n\nURL: ${safeText(details.url)}\nLine: ${safeText(details.line)}\nCol: ${safeText(details.column)}\n\nStack: ${stack}`;

  const button = doc.createElement('button');
  button.type = 'button';
  button.style.cssText = 'margin-top:20px;padding:10px 20px;background:#0ea5e9;color:white;border:none;border-radius:8px;font-weight:bold;';
  button.textContent = 'Reload App';
  button.onclick = reload;

  panel.replaceChildren(heading, description, button);
  if (isNew) doc.body.appendChild(panel);
}
