/**
 * Theme bootstrap: FOUC-safe init + light / dark / system preference API.
 * Loaded synchronously from <head> (no defer/async).
 */
(function () {
  const STORAGE_KEY = 'peterclaw-theme';
  const PREFERENCES = ['light', 'dark', 'system'];
  const root = document.documentElement;
  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  let themeTransitionPending = false;

  function isPreference(value) {
    return value === 'light' || value === 'dark' || value === 'system';
  }

  function getStoredPreference() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return isPreference(stored) ? stored : 'system';
    } catch {
      return 'system';
    }
  }

  function resolveTheme(preference) {
    if (preference === 'light' || preference === 'dark') {
      return preference;
    }
    return darkQuery.matches ? 'dark' : 'light';
  }

  function applyPreference(preference, persist) {
    const update = () => {
      const resolved = resolveTheme(preference);
      root.dataset.theme = resolved;
      root.dataset.themePreference = preference;

      if (persist) {
        try {
          localStorage.setItem(STORAGE_KEY, preference);
        } catch {
          // Theme still applies when storage is unavailable.
        }
      }

      root.dispatchEvent(
        new CustomEvent('peterclaw-theme-change', {
          detail: { preference, resolved },
        })
      );
    };

    if (!persist || typeof document.startViewTransition !== 'function') {
      update();
      return;
    }

    if (themeTransitionPending) return;

    themeTransitionPending = true;
    root.classList.add('theme-view-transition');
    const transition = document.startViewTransition(update);
    transition.finished.finally(() => {
      themeTransitionPending = false;
      root.classList.remove('theme-view-transition');
    });
  }

  function nextPreference(current) {
    const index = PREFERENCES.indexOf(current);
    return PREFERENCES[(index + 1) % PREFERENCES.length];
  }

  function cyclePreference() {
    if (themeTransitionPending) {
      return root.dataset.themePreference ?? 'system';
    }

    const current = root.dataset.themePreference;
    const resolved = root.dataset.theme === 'dark' ? 'dark' : 'light';

    // UX: if user is in "system" mode, first click should visibly change theme.
    // Otherwise, cycling from system -> light can be a no-op on light systems.
    const preference =
      current === 'system'
        ? resolved === 'dark'
          ? 'light'
          : 'dark'
        : isPreference(current)
          ? nextPreference(current)
          : 'dark';
    applyPreference(preference, true);
    return preference;
  }

  function init() {
    applyPreference(getStoredPreference(), false);
  }

  darkQuery.addEventListener('change', () => {
    if (root.dataset.themePreference === 'system') {
      applyPreference('system', false);
    }
  });

  init();

  window.peterclawTheme = {
    cyclePreference,
    getPreference() {
      return root.dataset.themePreference ?? 'system';
    },
    getResolved() {
      return root.dataset.theme === 'dark' ? 'dark' : 'light';
    },
  };
})();
