import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { supabaseAdmin } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const skillId = request.nextUrl.searchParams.get('skillId')

  if (!skillId) {
    return NextResponse.json({ error: 'Missing skillId' }, { status: 400 })
  }

  // Verify auth
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  // Look up skill
  const { data: skill } = await supabaseAdmin
    .from('skills')
    .select('id, file_url, is_free, status')
    .eq('id', skillId)
    .single()

  if (!skill || skill.status !== 'approved') {
    return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
  }

  if (!skill.file_url) {
    return NextResponse.json({ error: 'No file attached to this skill' }, { status: 404 })
  }

  // Verify purchase (or free skill)
  if (!skill.is_free) {
    const { data: purchase } = await supabaseAdmin
      .from('purchases')
      .select('id')
      .eq('buyer_id', session.user.id)
      .eq('skill_id', skillId)
      .single()

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase required' }, { status: 403 })
    }
  }

  // Extract storage path from the public URL
  // Public URLs look like: https://xxx.supabase.co/storage/v1/object/public/skills/user_id/filename.md
  const urlObj = new URL(skill.file_url)
  const pathParts = urlObj.pathname.split('/object/public/skills/')
  if (pathParts.length < 2) {
    return NextResponse.json({ error: 'Invalid file path' }, { status: 500 })
  }

  const storagePath = pathParts[1]

  // Generate signed URL (1 hour)
  const { data, error } = await supabaseAdmin.storage
    .from('skills')
    .createSignedUrl(storagePath, 3600)

  if (error || !data?.signedUrl) {
    console.error('[download] Signed URL error:', error)
    return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 })
  }

  return NextResponse.json({ url: data.signedUrl })
}
