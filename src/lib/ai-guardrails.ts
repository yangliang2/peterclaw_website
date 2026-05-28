const MINUTE_LIMIT = 10;
const DAILY_LIMIT = 50;
const WINDOW_MS = 60_000;
export const AI_REQUEST_TIMEOUT_MS = 30_000;

type Bucket = { count: number; resetAt: number };
type RateStore = {
  minute: Map<string, Bucket>;
  daily: Map<string, Bucket>;
};

type RateLimitResult =
  | { allowed: true }
  | { allowed: false; scope: 'minute' | 'daily'; resetAt: number };

type ProviderErrorKind = 'quota' | 'timeout' | 'upstream';

export class ProviderError extends Error {
  kind: ProviderErrorKind;
  status?: number;

  constructor(kind: ProviderErrorKind, message: string, status?: number) {
    super(message);
    this.name = 'ProviderError';
    this.kind = kind;
    this.status = status;
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __peterclawAiRateStore: RateStore | undefined;
}

const store =
  globalThis.__peterclawAiRateStore ??
  (globalThis.__peterclawAiRateStore = {
    minute: new Map<string, Bucket>(),
    daily: new Map<string, Bucket>(),
  });

function nextUtcMidnight(now: number) {
  const tomorrow = new Date(now);
  tomorrow.setUTCHours(24, 0, 0, 0);
  return tomorrow.getTime();
}

function touchBucket(bucket: Map<string, Bucket>, key: string, limit: number, resetAt: number, now: number) {
  const entry = bucket.get(key);
  if (!entry || now >= entry.resetAt) {
    bucket.set(key, { count: 1, resetAt });
    return true;
  }

  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

export function getClientIp(request: Request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export function checkAiRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const minuteResetAt = now + WINDOW_MS;
  const dailyResetAt = nextUtcMidnight(now);

  if (!touchBucket(store.minute, ip, MINUTE_LIMIT, minuteResetAt, now)) {
    return { allowed: false, scope: 'minute', resetAt: store.minute.get(ip)?.resetAt ?? minuteResetAt };
  }

  if (!touchBucket(store.daily, ip, DAILY_LIMIT, dailyResetAt, now)) {
    return { allowed: false, scope: 'daily', resetAt: store.daily.get(ip)?.resetAt ?? dailyResetAt };
  }

  return { allowed: true };
}

export function jsonError(payload: object, status: number, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...headers,
    },
  });
}

export async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, timeoutMs = AI_REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ProviderError('timeout', 'AI provider request timed out');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function classifyProviderStatus(status: number) {
  if (status === 429 || status === 402) return new ProviderError('quota', `AI provider quota/rate limit: ${status}`, status);
  return new ProviderError('upstream', `AI provider error: ${status}`, status);
}

export function userFacingStreamError(locale: 'en' | 'zh', kind: ProviderErrorKind | 'generic') {
  if (locale === 'en') {
    if (kind === 'timeout') return 'The AI service timed out. Please try again in a moment.';
    if (kind === 'quota') return 'The AI quota is temporarily exhausted. Please try again later.';
    return 'The AI service is temporarily unavailable. Please try again later.';
  }

  if (kind === 'timeout') return 'AI 服务响应超时，请稍后再试。';
  if (kind === 'quota') return 'AI 配额暂时用尽，请稍后再试。';
  return 'AI 服务暂时不可用，请稍后再试。';
}
