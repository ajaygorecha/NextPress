'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils/slugify'

export async function createPost(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const status = formData.get('status') as string
  const category_id = formData.get('category_id') as string || null
  const meta_title = formData.get('meta_title') as string || null
  const meta_description = formData.get('meta_description') as string || null
  const featured_image = formData.get('featured_image') as string || null
  const tagsRaw = formData.get('tags') as string

  const slug = slugify(title)

  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      title,
      slug,
      content,
      status,
      category_id: category_id || null,
      meta_title,
      meta_description,
      featured_image,
      author_id: user.id,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  if (tagsRaw) {
    const tagIds = tagsRaw.split(',').filter(Boolean)
    if (tagIds.length > 0) {
      await supabase.from('post_tags').insert(
        tagIds.map((tag_id) => ({ post_id: post.id, tag_id }))
      )
    }
  }

  revalidatePath('/admin/posts')
  revalidatePath('/blog')
  redirect('/admin/posts')
}

export async function updatePost(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const status = formData.get('status') as string
  const category_id = formData.get('category_id') as string || null
  const meta_title = formData.get('meta_title') as string || null
  const meta_description = formData.get('meta_description') as string || null
  const featured_image = formData.get('featured_image') as string || null
  const tagsRaw = formData.get('tags') as string

  const slug = slugify(title)

  const { error } = await supabase
    .from('posts')
    .update({
      title,
      slug,
      content,
      status,
      category_id: category_id || null,
      meta_title,
      meta_description,
      featured_image,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  await supabase.from('post_tags').delete().eq('post_id', id)

  if (tagsRaw) {
    const tagIds = tagsRaw.split(',').filter(Boolean)
    if (tagIds.length > 0) {
      await supabase.from('post_tags').insert(
        tagIds.map((tag_id) => ({ post_id: id, tag_id }))
      )
    }
  }

  revalidatePath('/admin/posts')
  revalidatePath(`/blog/${slug}`)
  revalidatePath('/blog')
  redirect('/admin/posts')
}

export async function deletePost(id: string) {
  const supabase = await createClient()
  await supabase.from('post_tags').delete().eq('post_id', id)
  await supabase.from('posts').delete().eq('id', id)
  revalidatePath('/admin/posts')
  revalidatePath('/blog')
}
