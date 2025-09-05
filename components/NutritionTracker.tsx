'use client'

import React, { useEffect, useMemo, useState } from 'react'

type FoodItem = {
  id: string
  name: string
  caloriesPer100g: number
}

type Entry = {
  id: string
  date: string
  quantity: number
  totalCalories: number
  foodItem: FoodItem
}

type Props = { selectedDate: string }

export function NutritionTracker({ selectedDate }: Props) {
  const [entries, setEntries] = useState<Entry[]>([])
  const [foods, setFoods] = useState<FoodItem[]>([])
  const [q, setQ] = useState('')
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [grams, setGrams] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchEntries = async () => {
    const res = await fetch(`/api/food-entries?date=${selectedDate}`)
    const data = await res.json()
    setEntries(data)
  }

  useEffect(() => {
    fetchEntries()
  }, [selectedDate])

  useEffect(() => {
    let active = true
    const run = async () => {
      const res = await fetch(`/api/food-items?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      if (active) setFoods(data)
    }
    if (q.length >= 1) run()
    else setFoods([])
    return () => { active = false }
  }, [q])

  const totalCalories = useMemo(() => entries.reduce((sum, e) => sum + e.totalCalories, 0), [entries])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFood || !grams) return
    setLoading(true)
    try {
      const res = await fetch('/api/food-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, foodItemId: selectedFood.id, quantity: Number(grams) })
      })
      if (!res.ok) throw new Error('Failed')
      setQ('')
      setSelectedFood(null)
      setGrams('')
      await fetchEntries()
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setLoading(true)
    try {
      await fetch(`/api/food-entries/${id}`, { method: 'DELETE' })
      await fetchEntries()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleAdd} className="card grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div className="relative">
          <label className="label">Food</label>
          <input
            className="input-field"
            placeholder="Search food..."
            value={selectedFood ? selectedFood.name : q}
            onChange={e => { setSelectedFood(null); setQ(e.target.value) }}
            autoComplete="off"
          />
          {foods.length > 0 && !selectedFood && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-sm max-h-56 overflow-auto">
              {foods.map(f => (
                <button type="button" key={f.id} className="w-full text-left px-3 py-2 hover:bg-gray-50" onClick={() => { setSelectedFood(f); setQ('') }}>
                  <div className="font-medium">{f.name}</div>
                  <div className="text-xs text-gray-500">{f.caloriesPer100g} kcal / 100g</div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="label">Quantity (g)</label>
          <input className="input-field" type="number" step="1" value={grams} onChange={e => setGrams(e.target.value)} required />
        </div>
        <div>
          <button className="btn-primary w-full" disabled={loading || !selectedFood}>Add Entry</button>
        </div>
      </form>

      <div className="card">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Entries</div>
          <div className="text-sm text-gray-500">Total: {Math.round(totalCalories)} kcal</div>
        </div>
        <div className="mt-3 divide-y">
          {entries.map(e => (
            <div key={e.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{e.foodItem.name}</div>
                <div className="text-sm text-gray-500">{e.quantity} g · {Math.round(e.totalCalories)} kcal</div>
              </div>
              <button className="text-danger-600 hover:underline" onClick={() => handleDelete(e.id)} disabled={loading}>Delete</button>
            </div>
          ))}
          {entries.length === 0 && (
            <div className="text-sm text-gray-500 py-6">No entries for this date.</div>
          )}
        </div>
      </div>
    </div>
  )
} 