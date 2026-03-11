'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils/slugify'

export async function createTag(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const slug = slugify(name)

  const { error } = await supabase.from('tags').insert({ name, slug })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/tags')
}

export async function deleteTag(id: string) {
  const supabase = await createClient()
  await supabase.from('post_tags').delete().eq('tag_id', id)
  await supabase.from('tags').delete().eq('id', id)
  revalidatePath('/admin/tags')
}
