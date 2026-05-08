import { createClient } from '@supabase/supabase-js'

// Service-role client — bypasses RLS so audit writes always land
const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type AuditAction =
  | 'skill_uploaded'
  | 'skill_approved'
  | 'skill_rejected'
  | 'skill_deleted'
  | 'purchase_completed'
  | 'subscription_created'
  | 'subscription_cancelled'
  | 'user_signup'
  | 'admin_action'
  | 'failed_checkout'
  | 'rate_limit_hit'

export async function auditLog(
  action: AuditAction,
  actorId: string | null,
  details: Record<string, unknown> = {}
): Promise<void> {
  try {
    await adminClient.from('audit_logs').insert({
      action,
      actor_id: actorId,
      details,
      created_at: new Date().toISOString(),
    })
  } catch {
    // Audit failure must never crash the main request
    console.error('[audit] failed to write:', action)
  }
}
