# Event Tracking Specification

This document defines the user behavior events tracked on the PeterClaw website to drive data-informed decisions.

## Implementation Details

- **Provider**: Umami (Primary) / Plausible (Secondary)
- **Privacy**: No personal data (PII) is collected. No third-party cookies are used.
- **Global Function**: `window.trackEvent(name, props)` handles both providers.

## Core Events

### 1. Newsletter Subscription
- **Event Name**: `newsletter_subscribe`
- **Trigger**: Submission of the newsletter form in the footer.
- **Attributes**: `location: 'footer'`

### 2. Search Usage
- **Event Name**: `search`
- **Trigger**: Search query entered (debounced 1s, min 3 chars).
- **Attributes**: `query`

- **Event Name**: `search_result_click`
- **Trigger**: Click on a result in the Pagefind UI.
- **Attributes**: `query`, `title`, `url`

### 3. RSS Engagement
- **Event Name**: `rss_click`
- **Trigger**: Click on any link ending in `rss.xml`.
- **Attributes**: `location: 'footer' | 'navbar'`, `url`

### 4. External Link Clicks
- **Event Name**: `external_link_click`
- **Trigger**: Click on any link starting with `http` that doesn't match the current hostname.
- **Attributes**: `url`, `text` (truncated)

### 5. Code Block Copy
- **Event Name**: `code_copy`
- **Trigger**: Copying text from within a `<pre>` element.
- **Attributes**: `language` (extracted from `language-*` class)

### 6. Social Sharing
- **Event Name**: `social_share`
- **Trigger**: Click on X or LinkedIn share buttons.
- **Attributes**: `platform`, `url`

### 7. Affiliate Shortlink Redirect
- **Event Name**: `affiliate_link_click`
- **Trigger**: Click on any `/go/*` link from the toolbox page.
- **Attributes**: `slug`, `label`, `source`

- **Event Name**: `affiliate_click`
- **Trigger**: A visit to any `/go/*` shortlink page.
- **Attributes**: `slug`, `destination`

## Verification
- Use Browser DevTools (Network tab) to verify requests to `https://analytics.eu.umami.is/api/send` or the configured Plausible endpoint.
- In development, analytics are disabled by default (`import.meta.env.PROD` check).
