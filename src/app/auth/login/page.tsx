'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

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
          <p className="text-muted small">Sign in to your account</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 small" role="alert">
            <i className="ri-error-warning-line me-1" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
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
            <label className="form-label d-flex justify-content-between">
              Password
              <Link href="/auth/reset-password" className="small text-decoration-none">
                Forgot password?
              </Link>
            </label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <p className="text-center mt-4 mb-0 small text-muted">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-decoration-none fw-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
