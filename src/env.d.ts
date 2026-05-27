type ThemePreference = 'light' | 'dark' | 'system';

interface PeterclawThemeApi {
  cyclePreference(): ThemePreference;
  getPreference(): ThemePreference;
  getResolved(): 'light' | 'dark';
}

interface Window {
  peterclawTheme?: PeterclawThemeApi;
}

interface DocumentEventMap {
  'peterclaw-theme-change': CustomEvent<{
    preference: ThemePreference;
    resolved: 'light' | 'dark';
  }>;
}
