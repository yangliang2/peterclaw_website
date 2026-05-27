import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * Buttondown webhook event types we care about.
 * Full list: https://docs.buttondown.com/api-webhooks
 */
type ButtondownEvent =
  | 'subscriber.created'
  | 'subscriber.updated'
  | 'subscriber.unsubscribed'
  | 'subscriber.tag_added'
  | 'email.delivered'
  | 'email.opened'
  | 'email.clicked';

interface ButtondownWebhookPayload {
  event: ButtondownEvent;
  subscriber?: {
    id: string;
    email_address: string;
    notes?: string;
    metadata?: Record<string, unknown>;
    tags?: string[];
    creation_date?: string;
  };
  email?: {
    id: string;
    subject?: string;
    creation_date?: string;
  };
}

export const POST: APIRoute = async ({ request }) => {
  const secret = import.meta.env.BUTTONDOWN_WEBHOOK_SECRET;

  // If a secret is configured, verify it via a simple x-webhook-secret header check.
  // Buttondown does not natively sign payloads, but you can set a custom secret
  // in your webhook configuration and validate it here.
  if (secret) {
    const providedSecret = request.headers.get('x-webhook-secret');
    if (providedSecret !== secret) {
      console.error('Buttondown webhook secret mismatch');
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  let payload: ButtondownWebhookPayload;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const event = payload.event;
  const subscriber = payload.subscriber;

  // Log all events for observability.
  console.log('[Buttondown Webhook]', event, {
    email: subscriber?.email_address,
    tags: subscriber?.tags,
    metadata: subscriber?.metadata,
    emailSubject: payload.email?.subject,
  });

  // Handle specific events.
  switch (event) {
    case 'subscriber.created': {
      // A new subscriber was added (either via the site or Buttondown directly).
      // You can extend this block to:
      // - Send a welcome SMS via Twilio
      // - Add the user to a CRM (e.g., HubSpot, Notion database)
      // - Trigger an internal analytics event
      // - Start a custom automation not covered by Buttondown Sequences
      const locale = subscriber?.metadata?.locale ?? 'zh';
      const source = subscriber?.metadata?.subscribed_from ?? 'unknown';
      console.log(
        `[Buttondown] New subscriber: ${subscriber?.email_address}, locale=${locale}, source=${source}`
      );
      break;
    }

    case 'subscriber.unsubscribed': {
      console.log(`[Buttondown] Unsubscribed: ${subscriber?.email_address}`);
      break;
    }

    case 'email.opened': {
      console.log(`[Buttondown] Email opened by: ${subscriber?.email_address}, subject=${payload.email?.subject}`);
      break;
    }

    case 'email.clicked': {
      console.log(`[Buttondown] Email clicked by: ${subscriber?.email_address}, subject=${payload.email?.subject}`);
      break;
    }

    default:
      // Explicitly ignore events we do not need to act on.
      break;
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
