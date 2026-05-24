/**
 * Utility for tracking custom events in Plausible and Umami.
 */
export function trackEvent(name: string, props?: Record<string, string | number | boolean>) {
  if (typeof window === 'undefined') return;

  // Plausible
  if ((window as any).plausible) {
    (window as any).plausible(name, { props });
  }

  // Umami
  if ((window as any).umami && typeof (window as any).umami.track === 'function') {
    (window as any).umami.track(name, props);
  }

  // Debugging in dev mode
  if (import.meta.env.DEV) {
    console.log(`[Analytics] Event: ${name}`, props);
  }
}

/**
 * Automatically attach tracking to links and buttons with data-track attribute.
 */
export function initAutoTracking() {
  if (typeof window === 'undefined') return;

  document.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest('[data-track]');
    if (target) {
      const eventName = target.getAttribute('data-track');
      if (eventName) {
        const props: Record<string, string> = {};
        for (const attr of target.attributes) {
          if (attr.name.startsWith('data-track-prop-')) {
            const propName = attr.name.slice(16);
            props[propName] = attr.value;
          }
        }
        trackEvent(eventName, props);
      }
    }
  });
}
