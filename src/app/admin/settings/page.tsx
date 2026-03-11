import { createClient } from '@/lib/supabase/server'
import Topbar from '@/components/ui/Topbar'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <>
      <Topbar title="Settings" />
      <div className="page-content">
        <div className="row g-4">
          <div className="col-md-6">
            <div className="card form-card p-4">
              <h6 className="fw-semibold mb-3">Account</h6>
              <div className="mb-2">
                <span className="text-muted small d-block">Email</span>
                <span>{user?.email}</span>
              </div>
              <div className="mb-2">
                <span className="text-muted small d-block">Name</span>
                <span>{user?.user_metadata?.name || '—'}</span>
              </div>
              <div className="mt-3">
                <a href="/auth/reset-password" className="btn btn-outline-secondary btn-sm">
                  <i className="ri-key-2-line me-1" />
                  Reset Password
                </a>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card form-card p-4">
              <h6 className="fw-semibold mb-3">Site Info</h6>
              <div className="mb-2">
                <span className="text-muted small d-block">Platform</span>
                <span>NextPress CMS</span>
              </div>
              <div className="mb-2">
                <span className="text-muted small d-block">Stack</span>
                <span>Next.js + Supabase</span>
              </div>
              <div className="mb-2">
                <span className="text-muted small d-block">Public Blog</span>
                <a href="/blog" className="text-decoration-none" target="_blank">
                  /blog <i className="ri-external-link-line" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
