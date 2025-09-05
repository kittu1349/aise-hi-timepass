'use client'

import React, { useEffect, useMemo, useState } from 'react'

type WorkoutType = {
  id: string
  name: string
  category: string
  caloriesPerMin: number
}

export function WorkoutDatabase() {
  const [types, setTypes] = useState<WorkoutType[]>([])
  const [q, setQ] = useState('')
  const [form, setForm] = useState({ name: '', category: 'CARDIO', caloriesPerMin: '' })
  const [loading, setLoading] = useState(false)

  const fetchTypes = async (query = '') => {
    const res = await fetch(`/api/workout-types${query ? `?q=${encodeURIComponent(query)}` : ''}`)
    const data = await res.json()
    setTypes(data)
  }

  useEffect(() => { fetchTypes() }, [])

  const totalShown = useMemo(() => types.length, [types])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category,
        caloriesPerMin: Number(form.caloriesPerMin),
      }
      const res = await fetch('/api/workout-types', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed')
      setForm({ name: '', category: 'CARDIO', caloriesPerMin: '' })
      await fetchTypes(q)
    } finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    setLoading(true)
    try {
      await fetch(`/api/workout-types/${id}`, { method: 'DELETE' })
      await fetchTypes(q)
    } finally { setLoading(false) }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleAdd} className="card grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div>
          <label className="label">Name</label>
          <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="label">Category</label>
          <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            <option value="CARDIO">Cardio</option>
            <option value="STRENGTH">Strength</option>
            <option value="FLEXIBILITY">Flexibility</option>
            <option value="SPORTS">Sports</option>
            <option value="DAILY_ACTIVITIES">Daily Activities</option>
          </select>
        </div>
        <div>
          <label className="label">Calories/min</label>
          <input className="input-field" type="number" step="0.1" value={form.caloriesPerMin} onChange={e => setForm({ ...form, caloriesPerMin: e.target.value })} required />
        </div>
        <div className="md:col-span-4">
          <button className="btn-primary w-full" disabled={loading}>Add Exercise</button>
        </div>
      </form>

      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-gray-500">{totalShown} types</div>
          <input placeholder="Search exercises..." className="input-field sm:max-w-xs" value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') fetchTypes(q) }} />
        </div>
        <div className="mt-4 divide-y">
          {types.map(t => (
            <div key={t.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{t.name}</div>
                <div className="text-sm text-gray-500">{t.category} · {t.caloriesPerMin} cal/min</div>
              </div>
              <button className="text-danger-600 hover:underline" onClick={() => handleDelete(t.id)} disabled={loading}>Delete</button>
            </div>
          ))}
          {types.length === 0 && (
            <div className="text-sm text-gray-500 py-6">No exercises found.</div>
          )}
        </div>
      </div>
    </div>
  )
} 