'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { format } from 'date-fns'

function addDays(d: Date, n: number) { const dd = new Date(d); dd.setDate(dd.getDate() + n); return dd }

type DayData = { date: string; intake: number; target: number | null }

type Profile = { targetCalories?: number | null }

type Entry = { totalCalories: number; date: string }

async function fetchDayIntake(dateStr: string): Promise<number> {
  const res = await fetch(`/api/food-entries?date=${dateStr}`)
  if (!res.ok) return 0
  const entries: Entry[] = await res.json()
  return entries.reduce((s, e) => s + (e.totalCalories || 0), 0)
}

export default function AnalyticsPage() {
  const [week, setWeek] = useState<DayData[]>([])

  useEffect(() => {
    const load = async () => {
      const profileRes = await fetch('/api/profile')
      const profile: Profile | null = await profileRes.json()
      const target = profile?.targetCalories ?? null

      const today = new Date()
      const start = addDays(today, -6)

      const days = await Promise.all(
        Array.from({ length: 7 }).map(async (_, i) => {
          const day = addDays(start, i)
          const dateStr = day.toISOString().split('T')[0]
          const intake = await fetchDayIntake(dateStr)
          return { date: format(day, 'EEE'), intake, target }
        })
      )
      setWeek(days)
    }
    load()
  }, [])

  const chartData = useMemo(() => week, [week])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Weekly Analytics</h1>
          <p className="text-gray-600">Compare your actual intake vs your target over the past 7 days</p>
        </motion.div>

        <div className="card">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="intake" stroke="#2563eb" strokeWidth={2} name="Intake" />
                <Line type="monotone" dataKey="target" stroke="#16a34a" strokeWidth={2} name="Target" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
} 