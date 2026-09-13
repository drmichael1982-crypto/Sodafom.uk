import { FEATURES, STATUS_LABELS, type FeatureDefinition, type FeatureId, type FeatureSnapshot } from './feature-controls-model';
import { FeatureRequestError, requestFeatureSnapshot } from './feature-controls-client';

const GROUPS: { label: string; features: readonly FeatureId[] }[] = [
  { label: 'Learning and practice', features: ['learning', 'games', 'reading', 'homework'] },
  { label: 'Archie and accessibility', features: ['ask_archie', 'voice'] },
  { label: 'Play and achievements', features: ['cinema', 'sticker_books', 'rewards'] },
  { label: 'Family and school', features: ['parent', 'teacher'] },
  { label: 'Shop and reminders', features: ['shop', 'notifications'] },
];

/** A scoped, dependency-free view, mounted only inside the existing authenticated Admin Hub. */
export function mountFeatureControls(host: HTMLElement, apiPrefix: string): () => void {
  const lifetime = new AbortController();
  let alive = true;
  let snapshot: FeatureSnapshot | undefined;
  let busy = false;
  let needsReload = true;
  let message = '';
  let failed = false;
  let confirming = false;
  let dialog: HTMLDialogElement | undefined;
  const doc = host.ownerDocument;
  const element = <K extends keyof HTMLElementTagNameMap>(tag: K, text?: string, className?: string) => {
    const node = doc.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  const focusControl = (id: FeatureId) => {
    host.querySelector<HTMLButtonElement>(`[data-feature="${id}"]`)?.focus();
  };

  function render(focus?: FeatureId) {
    if (!alive) return;
    host.classList.add('sodafom-feature-controls');
    const panel = element('div', undefined, 'sfc-panel');
    const heading = element('h2', 'Feature control panel');
    const intro = element('p', 'Manage opening existing pages. These are page-access controls, not global service kill switches.');
    const scope = element('p', 'Saved work, already-open activities, backend services, payments and account controls are not changed. Other devices check on their next page visit; offline visits use their last known settings or the original defaults.', 'sfc-note');
    const legend = element('p', 'On / Off: connected page control. Testing: control integration is unfinished, not a test pass. Coming soon: no connected control yet.', 'sfc-note');
    const toolbar = element('div', undefined, 'sfc-toolbar');
    const summary = snapshot
      ? `${Object.values(snapshot.states).filter(state => state === 'on').length} on · ${Object.values(snapshot.states).filter(state => state === 'off').length} off · ${Object.values(snapshot.states).filter(state => state === 'testing').length} testing · ${Object.values(snapshot.states).filter(state => state === 'coming_soon').length} coming soon · Saved revision ${snapshot.revision}`
      : 'No settings loaded yet';
    toolbar.append(element('p', summary));
    const reload = element('button', busy ? 'Working…' : 'Reload settings');
    reload.type = 'button';
    reload.disabled = busy;
    reload.addEventListener('click', () => { void load(); });
    toolbar.append(reload);
    panel.append(heading, intro, scope, legend, toolbar);
    const notice = element('p', message || (busy ? 'Loading feature settings…' : 'Changes are saved individually.'), failed ? 'sfc-error' : 'sfc-message');
    notice.setAttribute('role', failed ? 'alert' : 'status');
    notice.setAttribute('aria-live', failed ? 'assertive' : 'polite');
    panel.append(notice);
    if (needsReload && snapshot) panel.append(element('p', 'The badges below are last-known values. Reload before making another change.', 'sfc-note'));
    for (const group of GROUPS) {
      const section = element('section', undefined, 'sfc-group');
      const title = element('h3', group.label);
      section.append(title);
      const grid = element('div', undefined, 'sfc-grid');
      for (const id of group.features) {
        const feature = FEATURES.find(item => item.id === id)!;
        const card = element('article', undefined, 'sfc-card');
        const label = element('h4', feature.label);
        const description = element('p', feature.description);
        description.id = `sfc-description-${feature.id}`;
        card.append(label, description);
        const state = snapshot?.states[id];
        const badge = element('span', state ? STATUS_LABELS[state] : 'Not loaded', `sfc-badge sfc-${state ?? 'unloaded'}`);
        card.append(badge);
        if (feature.connected) {
          const control = element('button', state === 'on' ? 'Turn off page access' : state === 'off' ? 'Turn on page access' : 'Load settings to control');
          control.type = 'button';
          control.dataset.feature = id;
          control.setAttribute('role', 'switch');
          control.setAttribute('aria-checked', String(state === 'on'));
          control.setAttribute('aria-label', `${feature.label} page access`);
          control.setAttribute('aria-describedby', description.id);
          control.disabled = busy || needsReload || !state;
          control.addEventListener('click', () => { void toggle(feature); });
          card.append(control);
        } else {
          card.append(element('p', 'Read only — not connected', 'sfc-note'));
        }
        grid.append(card);
      }
      section.append(grid);
      panel.append(section);
    }
    host.replaceChildren(panel);
    if (focus) focusControl(focus);
  }

  async function load() {
    if (busy || !alive) return;
    busy = true;
    failed = false;
    message = 'Loading feature settings…';
    render();
    try {
      const loaded = await requestFeatureSnapshot(apiPrefix, { signal: lifetime.signal });
      if (!alive) return;
      snapshot = loaded;
      needsReload = false;
      message = 'Settings loaded. Choose one feature to change.';
    } catch (error) {
      if (!alive) return;
      needsReload = true;
      failed = true;
      message = error instanceof FeatureRequestError && [401, 403].includes(error.status)
        ? 'Owner access has expired or is unavailable. Sign in to Admin again, then reload.'
        : 'Could not load settings. Check your connection and reload. No controls have been changed here.';
    } finally {
      busy = false;
      render();
    }
  }

  function confirmDisable(feature: FeatureDefinition): Promise<boolean> {
    confirming = true;
    return new Promise(resolve => {
      dialog = element('dialog', undefined, 'sfc-dialog');
      const activeDialog = dialog;
      const title = element('h3', `Turn off ${feature.label} page access?`);
      title.id = 'sfc-confirm-title';
      const detail = element('p', 'People opening these pages will see a friendly unavailable message. Saved work will not be deleted. Already-open or offline activities may continue.');
      detail.id = 'sfc-confirm-detail';
      activeDialog.setAttribute('aria-labelledby', title.id);
      activeDialog.setAttribute('aria-describedby', detail.id);
      const buttons = element('div', undefined, 'sfc-toolbar');
      const cancel = element('button', 'Keep it on');
      cancel.type = 'button';
      cancel.autofocus = true;
      const confirm = element('button', 'Confirm turn off');
      confirm.type = 'button';
      let confirmed = false;
      cancel.addEventListener('click', () => activeDialog.close());
      confirm.addEventListener('click', () => { confirmed = true; activeDialog.close(); });
      activeDialog.addEventListener('close', () => {
        confirming = false;
        activeDialog.remove();
        dialog = undefined;
        if (alive) focusControl(feature.id);
        resolve(confirmed && alive);
      }, { once: true });
      buttons.append(cancel, confirm);
      activeDialog.append(title, detail, buttons);
      host.append(activeDialog);
      if (typeof activeDialog.showModal !== 'function') {
        // Do not silently skip confirmation on older browsers.
        confirming = false;
        activeDialog.remove();
        dialog = undefined;
        message = 'This browser cannot show the secure confirmation. Use a current browser to disable this key feature.';
        render(feature.id);
        resolve(false);
        return;
      }
      activeDialog.showModal();
      cancel.focus();
    });
  }

  async function toggle(feature: FeatureDefinition) {
    if (!alive || busy || confirming || needsReload || !snapshot || !feature.connected) return;
    const enabled = snapshot.states[feature.id] !== 'on';
    const confirmed = !enabled && feature.critical ? await confirmDisable(feature) : false;
    if ((!enabled && feature.critical && !confirmed) || !alive) return;
    busy = true;
    failed = false;
    message = `Saving ${feature.label}…`;
    const change = { action: 'set-feature-control' as const, key: feature.id, enabled, revision: snapshot.revision, confirmed };
    render();
    try {
      const saved = await requestFeatureSnapshot(apiPrefix, { change, signal: lifetime.signal });
      if (!alive) return;
      if (saved.states[feature.id] !== (enabled ? 'on' : 'off')) throw new FeatureRequestError(502);
      snapshot = saved;
      message = `${feature.label} page access is ${enabled ? 'on' : 'off'}. Saved.`;
    } catch (error) {
      if (!alive) return;
      needsReload = true;
      failed = true;
      message = error instanceof FeatureRequestError && error.status === 409
        ? 'Settings changed in another window. Reload before trying again.'
        : error instanceof FeatureRequestError && [401, 403].includes(error.status)
          ? 'Owner access has expired or this address is not trusted. Sign in to Admin again, then reload.'
          : 'The save could not be confirmed. It may have reached the server. Reload to check before making another change.';
    } finally {
      busy = false;
      render(feature.id);
    }
  }

  void load();
  return () => {
    alive = false;
    lifetime.abort();
    if (dialog?.open) dialog.close();
    dialog?.remove();
    host.replaceChildren();
    host.classList.remove('sodafom-feature-controls');
  };
}
