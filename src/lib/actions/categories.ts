'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils/slugify'

export async function createCategory(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const description = formData.get('description') as string || null
  const slug = slugify(name)

  const { error } = await supabase.from('categories').insert({ name, slug, description })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/categories')
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const description = formData.get('description') as string || null
  const slug = slugify(name)

  const { error } = await supabase.from('categories').update({ name, slug, description }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/categories')
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()
  await supabase.from('categories').delete().eq('id', id)
  revalidatePath('/admin/categories')
  revalidatePath('/', 'layout')
}

export async function toggleCategoryMenu(id: string, show_in_menu: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('categories').update({ show_in_menu }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/categories')
  revalidatePath('/', 'layout')
}
