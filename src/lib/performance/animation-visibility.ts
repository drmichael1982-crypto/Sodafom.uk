/**
 * Shared, event-driven visibility for decorative animation work.
 * No polling, network requests, global timer overrides or game-clock changes.
 * Call the returned cleanup when an element unmounts.
 */
export type AnimationVisibilityListener = (active: boolean) => void;

type Subscriber = { listener: AnimationVisibilityListener };
type Target = {
  inViewport: boolean;
  active: boolean;
  subscribers: Set<Subscriber>;
};
type VisibilityPool = {
  subscribe: (element: Element, listener: AnimationVisibilityListener) => () => void;
};

const pools = new WeakMap<Document, VisibilityPool>();

function createPool(doc: Document): VisibilityPool {
  const view = doc.defaultView as (Window & typeof globalThis) | null;
  const targets = new Map<Element, Target>();
  let suspended = false;
  const Observer = view?.IntersectionObserver;

  const update = (target: Target) => {
    const active = target.inViewport && !doc.hidden && !suspended;
    if (target.active === active) return;
    target.active = active;
    for (const { listener } of [...target.subscribers]) listener(active);
  };

  // On old WebViews without IntersectionObserver, keep content functional;
  // page/tab visibility still pauses work. Do not add scroll polling.
  const observer = Observer ? new Observer((entries) => {
    for (const entry of entries) {
      const target = targets.get(entry.target);
      if (!target) continue;
      target.inViewport = entry.isIntersecting;
      update(target);
    }
  }, { rootMargin: '0px', threshold: 0 }) : null;

  const updateAll = () => targets.forEach(update);
  const onPageHide = () => { suspended = true; updateAll(); };
  const onPageShow = () => { suspended = false; updateAll(); };
  doc.addEventListener('visibilitychange', updateAll);
  view?.addEventListener('pagehide', onPageHide);
  view?.addEventListener('pageshow', onPageShow);

  return {
    subscribe(element, listener) {
      let target = targets.get(element);
      if (!target) {
        target = {
          inViewport: !observer,
          active: !observer && !doc.hidden && !suspended,
          subscribers: new Set(),
        };
        targets.set(element, target);
        observer?.observe(element);
      }
      const subscriber = { listener };
      target.subscribers.add(subscriber);
      listener(target.active);
      let disposed = false;

      return () => {
        if (disposed) return;
        disposed = true;
        target.subscribers.delete(subscriber);
        if (target.subscribers.size === 0) {
          targets.delete(element);
          observer?.unobserve(element);
        }
        if (targets.size === 0) {
          observer?.disconnect();
          doc.removeEventListener('visibilitychange', updateAll);
          view?.removeEventListener('pagehide', onPageHide);
          view?.removeEventListener('pageshow', onPageShow);
          pools.delete(doc);
        }
      };
    },
  };
}

export function observeAnimationVisibility(
  element: Element,
  listener: AnimationVisibilityListener,
): () => void {
  const doc = element.ownerDocument;
  // Safe to import during SSR; browser setup is deferred until subscription.
  if (!doc?.defaultView) {
    listener(false);
    return () => {};
  }
  let pool = pools.get(doc);
  if (!pool) {
    pool = createPool(doc);
    pools.set(doc, pool);
  }
  return pool.subscribe(element, listener);
}
