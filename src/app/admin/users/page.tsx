import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Topbar from '@/components/ui/Topbar'

export default async function UsersPage() {
  const supabase = await createClient()

  // Check current user is admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: currentProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (currentProfile?.role !== 'admin') {
    return (
      <>
        <Topbar title="Users" />
        <div className="page-content">
          <div className="alert alert-warning">
            <i className="ri-shield-line me-2" />
            Only admins can manage users.
          </div>
        </div>
      </>
    )
  }

  const { data: users } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <>
      <Topbar title="Users" />
      <div className="page-content">
        <div className="card table-card">
          <div className="card-header bg-white py-3">
            <h6 className="mb-0 fw-semibold">All Users ({users?.length ?? 0})</h6>
          </div>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((u) => (
                  <tr key={u.id}>
                    <td className="fw-medium">{u.name || '—'}</td>
                    <td className="text-muted small">{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'bg-danger' : 'bg-secondary'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="text-muted small">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {(!users || users.length === 0) && (
                  <tr>
                    <td colSpan={4} className="text-center text-muted py-4">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
