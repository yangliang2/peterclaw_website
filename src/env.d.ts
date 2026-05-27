type ThemePreference = 'light' | 'dark' | 'system';

interface PeterclawThemeApi {
  cyclePreference(): ThemePreference;
  getPreference(): ThemePreference;
  getResolved(): 'light' | 'dark';
}

interface Window {
  peterclawTheme?: PeterclawThemeApi;
  umami?: {
    track: (name: string, props?: Record<string, unknown>) => void;
  };
  plausible?: (name: string, options?: { props?: Record<string, unknown> }) => void;
  trackEvent: (name: string, props?: Record<string, unknown>) => void;
}

interface DocumentEventMap {
  'peterclaw-theme-change': CustomEvent<{
    preference: ThemePreference;
    resolved: 'light' | 'dark';
  }>;
}
