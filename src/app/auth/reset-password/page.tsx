'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Check your email for the password reset link.')
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card card p-4 p-md-5 mx-3">
        <div className="text-center mb-4">
          <div className="auth-brand mb-1">
            <i className="ri-quill-pen-fill me-2" />
            NextPress
          </div>
          <p className="text-muted small">Reset your password</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 small">
            <i className="ri-error-warning-line me-1" />
            {error}
          </div>
        )}

        {message && (
          <div className="alert alert-success py-2 small">
            <i className="ri-checkbox-circle-line me-1" />
            {message}
          </div>
        )}

        <form onSubmit={handleReset}>
          <div className="mb-4">
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

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Sending link...
              </>
            ) : (
              'Send reset link'
            )}
          </button>
        </form>

        <p className="text-center mt-4 mb-0 small text-muted">
          <Link href="/auth/login" className="text-decoration-none">
            <i className="ri-arrow-left-line me-1" />
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
