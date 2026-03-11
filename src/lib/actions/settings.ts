'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateSidebarWidgets(settings: Record<string, boolean>) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('settings')
    .upsert({ key: 'sidebar_widgets', value: settings })
  if (error) throw new Error(error.message)
  revalidatePath('/blog/[slug]', 'page')
}
