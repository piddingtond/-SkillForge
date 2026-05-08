// Webhook security utilities

export interface WebhookSecurityConfig {
  requireSignature: boolean
  requireHTTPS: boolean
  checkUserAgent: boolean
  logAttempts: boolean
}

export const DEFAULT_WEBHOOK_SECURITY: WebhookSecurityConfig = {
  requireSignature: true,
  requireHTTPS: true,
  checkUserAgent: true,
  logAttempts: true,
}

export function validateWebhookRequest(
  request: Request,
  config: WebhookSecurityConfig = DEFAULT_WEBHOOK_SECURITY
): { valid: boolean; reason?: string } {
  
  // 1. Check HTTPS (production only)
  if (config.requireHTTPS && process.env.NODE_ENV === 'production') {
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    if (protocol !== 'https') {
      return { valid: false, reason: 'HTTPS required' }
    }
  }

  // 2. Check signature (CRITICAL)
  if (config.requireSignature) {
    const signature = request.headers.get('stripe-signature')
    if (!signature) {
      return { valid: false, reason: 'Missing stripe-signature' }
    }
  }

  // 3. Check User-Agent (Stripe-specific)
  if (config.checkUserAgent) {
    const userAgent = request.headers.get('user-agent') || ''
    if (!userAgent.includes('Stripe')) {
      return { valid: false, reason: 'Invalid User-Agent' }
    }
  }

  return { valid: true }
}

// Log webhook attempts for security monitoring
export async function logWebhookAttempt(
  event: 'success' | 'failure',
  details: {
    ip?: string
    signature?: string
    eventType?: string
    reason?: string
  }
) {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    event: event.toUpperCase(),
    ...details
  }
  
  console.log(`[WEBHOOK ${event.toUpperCase()}]`, logEntry)

  // TODO: Send to monitoring service (Sentry, DataDog, etc.)
  if (event === 'failure' && process.env.SENTRY_DSN) {
    // Report suspicious webhook attempt
  }
}
