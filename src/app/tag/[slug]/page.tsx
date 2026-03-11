import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BlogNav from '@/components/ui/BlogNav'
import PostCard from '@/components/ui/PostCard'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: tag } = await supabase.from('tags').select('name').eq('slug', slug).single()
  if (!tag) return { title: 'Tag not found' }
  return { title: `#${tag.name} | NextPress` }
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: tag } = await supabase
    .from('tags')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!tag) notFound()

  const { data: postTagRows } = await supabase
    .from('post_tags')
    .select('post_id')
    .eq('tag_id', tag.id)

  const postIds = postTagRows?.map((r) => r.post_id) || []

  const { data: posts } = postIds.length > 0
    ? await supabase
        .from('posts')
        .select('*, author:users(name), category:categories(name, slug)')
        .eq('status', 'published')
        .in('id', postIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  return (
    <>
      <BlogNav />
      <div className="blog-hero text-center">
        <div className="container">
          <p className="small opacity-75 mb-1">Tag</p>
          <h1 className="display-6 fw-bold">#{tag.name}</h1>
        </div>
      </div>

      <div className="container py-5">
        {posts && posts.length > 0 ? (
          <div className="row g-4">
            {posts.map((post: any) => (
              <div key={post.id} className="col-sm-6 col-xl-4">
                <PostCard post={post} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5 text-muted">
            <i className="ri-price-tag-3-line" style={{ fontSize: '3rem' }} />
            <p className="mt-2">No posts with this tag.</p>
          </div>
        )}
      </div>

      <footer className="py-4 border-top text-center text-muted small">
        © {new Date().getFullYear()} NextPress. Powered by Next.js & Supabase.
      </footer>
    </>
  )
}
