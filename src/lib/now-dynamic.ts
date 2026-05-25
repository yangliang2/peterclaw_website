import { toolsCopy, type ToolItem } from '@/config/tools';
import type { Locale } from '@/lib/i18n';

/** AI assistants + core dev/deploy stack shown on /now (sourced from tools.ts). */
export function getNowToolStack(locale: Locale): ToolItem[] {
  const categories = toolsCopy[locale].categories;
  const aiTools = categories[0]?.items ?? [];
  const devTools = categories[1]?.items ?? [];
  return [...aiTools, ...devTools];
}
