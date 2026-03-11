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
  const { data: cat } = await supabase.from('categories').select('name, description').eq('slug', slug).single()
  if (!cat) return { title: 'Category not found' }
  return {
    title: `${cat.name} | NextPress`,
    description: cat.description,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!category) notFound()

  const { data: posts } = await supabase
    .from('posts')
    .select('*, author:users(name), category:categories(name, slug)')
    .eq('status', 'published')
    .eq('category_id', category.id)
    .order('created_at', { ascending: false })

  return (
    <>
      <BlogNav />
      <div className="blog-hero text-center">
        <div className="container">
          <p className="small opacity-75 mb-1">Category</p>
          <h1 className="display-6 fw-bold">{category.name}</h1>
          {category.description && (
            <p className="lead opacity-75 mt-2">{category.description}</p>
          )}
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
            <i className="ri-file-text-line" style={{ fontSize: '3rem' }} />
            <p className="mt-2">No posts in this category.</p>
          </div>
        )}
      </div>

      <footer className="py-4 border-top text-center text-muted small">
        © {new Date().getFullYear()} NextPress. Powered by Next.js & Supabase.
      </footer>
    </>
  )
}
