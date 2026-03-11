'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card p-4 p-md-5 mx-3">
        <div className="text-center mb-4">
          <div className="auth-brand mb-1">
            <i className="ri-quill-pen-fill me-2" />
            NextPress
          </div>
          <p className="text-muted small">Create your account</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 small">
            <i className="ri-error-warning-line me-1" />
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label">Full name</label>
            <input
              type="text"
              className="form-control"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input
              type="email"
              className="form-control"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <p className="text-center mt-4 mb-0 small text-muted">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-decoration-none fw-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
