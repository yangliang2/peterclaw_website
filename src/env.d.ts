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

interface ImportMetaEnv {
  readonly OPENAI_API_KEY?: string;
  readonly DEEPSEEK_API_KEY?: string;
  readonly PLAUSIBLE_DOMAIN?: string;
  readonly PLAUSIBLE_SCRIPT_URL?: string;
  readonly PLAUSIBLE_SITE_ID?: string;
  readonly PLAUSIBLE_STATS_API_KEY?: string;
  readonly PLAUSIBLE_STATS_API_URL?: string;
  readonly PLAUSIBLE_STATS_DATE_RANGE?: string;
  readonly UMAMI_WEBSITE_ID?: string;
  readonly UMAMI_SCRIPT_URL?: string;
}
