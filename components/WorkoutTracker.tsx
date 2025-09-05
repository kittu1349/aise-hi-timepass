'use client'

import React, { useEffect, useMemo, useState } from 'react'

type WorkoutType = {
  id: string
  name: string
  caloriesPerMin: number
}

type Workout = {
  id: string
  date: string
  duration: number
  caloriesBurned: number
  workoutType: WorkoutType
}

type Props = { selectedDate: string }

export function WorkoutTracker({ selectedDate }: Props) {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [types, setTypes] = useState<WorkoutType[]>([])
  const [q, setQ] = useState('')
  const [selectedType, setSelectedType] = useState<WorkoutType | null>(null)
  const [minutes, setMinutes] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchWorkouts = async () => {
    const res = await fetch(`/api/workouts?date=${selectedDate}`)
    const data = await res.json()
    setWorkouts(data)
  }

  useEffect(() => {
    fetchWorkouts()
  }, [selectedDate])

  useEffect(() => {
    let active = true
    const run = async () => {
      const res = await fetch(`/api/workout-types?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      if (active) setTypes(data)
    }
    if (q.length >= 1) run()
    else setTypes([])
    return () => { active = false }
  }, [q])

  const totalBurned = useMemo(() => workouts.reduce((sum, w) => sum + w.caloriesBurned, 0), [workouts])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedType || !minutes) return
    setLoading(true)
    try {
      const estCalories = Math.round(Number(minutes) * selectedType.caloriesPerMin)
      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, workoutTypeId: selectedType.id, duration: Number(minutes), caloriesBurned: estCalories })
      })
      if (!res.ok) throw new Error('Failed')
      setQ('')
      setSelectedType(null)
      setMinutes('')
      await fetchWorkouts()
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setLoading(true)
    try {
      await fetch(`/api/workouts/${id}`, { method: 'DELETE' })
      await fetchWorkouts()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleAdd} className="card grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div className="relative">
          <label className="label">Exercise</label>
          <input
            className="input-field"
            placeholder="Search exercise..."
            value={selectedType ? selectedType.name : q}
            onChange={e => { setSelectedType(null); setQ(e.target.value) }}
            autoComplete="off"
          />
          {types.length > 0 && !selectedType && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-sm max-h-56 overflow-auto">
              {types.map(t => (
                <button type="button" key={t.id} className="w-full text-left px-3 py-2 hover:bg-gray-50" onClick={() => { setSelectedType(t); setQ('') }}>
                  <div className="font-medium">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.caloriesPerMin} cal/min</div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="label">Duration (min)</label>
          <input className="input-field" type="number" step="1" value={minutes} onChange={e => setMinutes(e.target.value)} required />
        </div>
        <div>
          <button className="btn-primary w-full" disabled={loading || !selectedType}>Add Workout</button>
        </div>
      </form>

      <div className="card">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Workouts</div>
          <div className="text-sm text-gray-500">Total burned: {Math.round(totalBurned)} kcal</div>
        </div>
        <div className="mt-3 divide-y">
          {workouts.map(w => (
            <div key={w.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{w.workoutType.name}</div>
                <div className="text-sm text-gray-500">{w.duration} min · {Math.round(w.caloriesBurned)} kcal</div>
              </div>
              <button className="text-danger-600 hover:underline" onClick={() => handleDelete(w.id)} disabled={loading}>Delete</button>
            </div>
          ))}
          {workouts.length === 0 && (
            <div className="text-sm text-gray-500 py-6">No workouts for this date.</div>
          )}
        </div>
      </div>
    </div>
  )
} 