import { createClient } from '@/lib/supabase/server'
import Topbar from '@/components/ui/Topbar'
import MediaLibrary from './MediaLibrary'

export default async function MediaPage() {
  const supabase = await createClient()
  const { data: files } = await supabase.storage.from('media').list('', {
    sortBy: { column: 'created_at', order: 'desc' },
    limit: 100,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

  return (
    <>
      <Topbar title="Media Library" />
      <div className="page-content">
        <MediaLibrary files={(files || []) as any[]} supabaseUrl={supabaseUrl} />
      </div>
    </>
  )
}
