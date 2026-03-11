import { createClient } from '@/lib/supabase/server'
import Topbar from '@/components/ui/Topbar'
import TagManager from './TagManager'

export default async function TagsPage() {
  const supabase = await createClient()
  const { data: tags } = await supabase.from('tags').select('*').order('name')

  return (
    <>
      <Topbar title="Tags" />
      <div className="page-content">
        <TagManager tags={tags || []} />
      </div>
    </>
  )
}
