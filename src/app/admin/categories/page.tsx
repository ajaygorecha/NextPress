import { createClient } from '@/lib/supabase/server'
import Topbar from '@/components/ui/Topbar'
import CategoryManager from './CategoryManager'

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return (
    <>
      <Topbar title="Categories" />
      <div className="page-content">
        <CategoryManager categories={categories || []} />
      </div>
    </>
  )
}
