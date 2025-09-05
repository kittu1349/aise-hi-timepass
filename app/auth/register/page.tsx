'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/profile'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed')
      router.replace(next)
    } catch (err: any) {
      setError(err.message || 'Failed to register')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Create account</h1>
        <form onSubmit={onSubmit} className="card grid gap-3">
          {error && <div className="text-sm text-danger-600">{error}</div>}
          <div>
            <label className="label">Name</label>
            <input className="input-field" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input-field" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="btn-primary" disabled={loading}>Register</button>
          <button type="button" className="btn-secondary" onClick={() => router.push(`/auth/login?next=${encodeURIComponent(next)}`)}>Already have an account? Login</button>
        </form>
      </div>
    </div>
  )
} 