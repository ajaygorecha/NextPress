import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Topbar from '@/components/ui/Topbar'
import PostForm from '@/components/forms/PostForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: post },
    { data: categories },
    { data: tags },
    { data: postTagRows },
  ] = await Promise.all([
    supabase.from('posts').select('*').eq('id', id).single(),
    supabase.from('categories').select('*').order('name'),
    supabase.from('tags').select('*').order('name'),
    supabase.from('post_tags').select('tag_id').eq('post_id', id),
  ])

  if (!post) notFound()

  const postTagIds = postTagRows?.map((r) => r.tag_id) || []
  const postTags = (tags || []).filter((t) => postTagIds.includes(t.id))

  return (
    <>
      <Topbar title="Edit Post" />
      <div className="page-content">
        <PostForm
          post={post}
          categories={categories || []}
          tags={tags || []}
          postTags={postTags}
        />
      </div>
    </>
  )
}
