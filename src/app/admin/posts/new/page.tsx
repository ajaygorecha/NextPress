import { createClient } from '@/lib/supabase/server'
import Topbar from '@/components/ui/Topbar'
import PostForm from '@/components/forms/PostForm'

export default async function NewPostPage() {
  const supabase = await createClient()

  const [{ data: categories }, { data: tags }] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('tags').select('*').order('name'),
  ])

  return (
    <>
      <Topbar title="Add New Post" />
      <div className="page-content">
        <PostForm categories={categories || []} tags={tags || []} />
      </div>
    </>
  )
}
