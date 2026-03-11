export type Role = 'admin' | 'editor'
export type PostStatus = 'draft' | 'published'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
}

export interface Tag {
  id: string
  name: string
  slug: string
}

export interface Post {
  id: string
  title: string
  slug: string
  content: string
  featured_image: string | null
  author_id: string
  status: PostStatus
  category_id: string | null
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
  author?: User
  category?: Category
  tags?: Tag[]
}

export interface MediaItem {
  name: string
  id: string
  created_at: string
  updated_at: string
  last_accessed_at: string
  metadata: {
    size: number
    mimetype: string
  }
}
