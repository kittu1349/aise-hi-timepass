'use client'

import React, { useEffect, useMemo, useState } from 'react'

type FoodItem = {
  id: string
  name: string
  caloriesPer100g: number
  protein: number
  carbs: number
  fat: number
}

type EditState = {
  id: string | null
  name: string
  caloriesPer100g: string
  protein: string
  carbs: string
  fat: string
}

export function FoodDatabase() {
  const [items, setItems] = useState<FoodItem[]>([])
  const [q, setQ] = useState('')
  const [form, setForm] = useState({ name: '', caloriesPer100g: '', protein: '', carbs: '', fat: '' })
  const [edit, setEdit] = useState<EditState>({ id: null, name: '', caloriesPer100g: '', protein: '', carbs: '', fat: '' })
  const [loading, setLoading] = useState(false)

  const fetchItems = async (query = '') => {
    const res = await fetch(`/api/food-items${query ? `?q=${encodeURIComponent(query)}` : ''}`)
    const data = await res.json()
    setItems(data)
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const totalShown = useMemo(() => items.length, [items])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        name: form.name.trim(),
        caloriesPer100g: Number(form.caloriesPer100g),
        protein: Number(form.protein || 0),
        carbs: Number(form.carbs || 0),
        fat: Number(form.fat || 0),
      }
      const res = await fetch('/api/food-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed')
      setForm({ name: '', caloriesPer100g: '', protein: '', carbs: '', fat: '' })
      await fetchItems(q)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setLoading(true)
    try {
      await fetch(`/api/food-items/${id}`, { method: 'DELETE' })
      await fetchItems(q)
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (item: FoodItem) => {
    setEdit({
      id: item.id,
      name: item.name,
      caloriesPer100g: String(item.caloriesPer100g),
      protein: String(item.protein),
      carbs: String(item.carbs),
      fat: String(item.fat),
    })
  }

  const cancelEdit = () => setEdit({ id: null, name: '', caloriesPer100g: '', protein: '', carbs: '', fat: '' })

  const saveEdit = async () => {
    if (!edit.id) return
    setLoading(true)
    try {
      const payload = {
        name: edit.name.trim(),
        caloriesPer100g: Number(edit.caloriesPer100g),
        protein: Number(edit.protein || 0),
        carbs: Number(edit.carbs || 0),
        fat: Number(edit.fat || 0),
      }
      const res = await fetch(`/api/food-items/${edit.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed')
      cancelEdit()
      await fetchItems(q)
    } finally { setLoading(false) }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleAdd} className="card grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
        <div>
          <label className="label">Name</label>
          <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="label">Calories/100g</label>
          <input className="input-field" type="number" step="0.1" value={form.caloriesPer100g} onChange={e => setForm({ ...form, caloriesPer100g: e.target.value })} required />
        </div>
        <div>
          <label className="label">Protein</label>
          <input className="input-field" type="number" step="0.1" value={form.protein} onChange={e => setForm({ ...form, protein: e.target.value })} />
        </div>
        <div>
          <label className="label">Carbs</label>
          <input className="input-field" type="number" step="0.1" value={form.carbs} onChange={e => setForm({ ...form, carbs: e.target.value })} />
        </div>
        <div>
          <label className="label">Fat</label>
          <input className="input-field" type="number" step="0.1" value={form.fat} onChange={e => setForm({ ...form, fat: e.target.value })} />
        </div>
        <div className="md:col-span-5">
          <button className="btn-primary w-full" disabled={loading}>Add Food</button>
        </div>
      </form>

      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-gray-500">{totalShown} items</div>
          <input placeholder="Search foods..." className="input-field sm:max-w-xs" value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') fetchItems(q) }} />
        </div>
        <div className="mt-4 divide-y">
          {items.map(item => (
            <div key={item.id} className="py-3">
              {edit.id === item.id ? (
                <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
                  <input className="input-field" value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value })} />
                  <input className="input-field" type="number" step="0.1" value={edit.caloriesPer100g} onChange={e => setEdit({ ...edit, caloriesPer100g: e.target.value })} />
                  <input className="input-field" type="number" step="0.1" value={edit.protein} onChange={e => setEdit({ ...edit, protein: e.target.value })} />
                  <input className="input-field" type="number" step="0.1" value={edit.carbs} onChange={e => setEdit({ ...edit, carbs: e.target.value })} />
                  <input className="input-field" type="number" step="0.1" value={edit.fat} onChange={e => setEdit({ ...edit, fat: e.target.value })} />
                  <div className="flex gap-2">
                    <button type="button" className="btn-primary" onClick={saveEdit} disabled={loading}>Save</button>
                    <button type="button" className="btn-secondary" onClick={cancelEdit} disabled={loading}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.caloriesPer100g} kcal / 100g · P {item.protein} · C {item.carbs} · F {item.fat}</div>
                  </div>
                  <div className="flex gap-3">
                    <button className="text-primary-600 hover:underline" onClick={() => startEdit(item)} disabled={loading}>Edit</button>
                    <button className="text-danger-600 hover:underline" onClick={() => handleDelete(item.id)} disabled={loading}>Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-sm text-gray-500 py-6">No foods found.</div>
          )}
        </div>
      </div>
    </div>
  )
} 