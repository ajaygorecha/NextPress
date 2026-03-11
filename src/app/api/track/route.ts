import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { path, referrer } = await req.json()
    if (!path) return NextResponse.json({ ok: false }, { status: 400 })

    const supabase = await createClient()
    await supabase.from('page_views').insert({ path, referrer: referrer || null })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
