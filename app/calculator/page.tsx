'use client'

import React, { useMemo, useState } from 'react'
import { calculateBMR, calculateTDEE, getDeficitCalories } from '@/lib/utils'

export default function CalculatorPage() {
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | ''>('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [activity, setActivity] = useState<'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'EXTRA_ACTIVE' | ''>('')
  const [deficit, setDeficit] = useState<'MAINTENANCE' | 'SLOW' | 'MODERATE' | 'FAST' | 'VERY_FAST' | ''>('')

  const result = useMemo(() => {
    if (!age || !gender || !height || !weight || !activity) return null
    const bmr = calculateBMR(Number(age), gender, Number(weight), Number(height))
    const tdee = calculateTDEE(bmr, activity)
    const target = getDeficitCalories(tdee, deficit || 'MODERATE')
    return { bmr, tdee, target }
  }, [age, gender, height, weight, activity, deficit])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Calorie Calculator</h1>
          <p className="text-gray-600">Estimate BMR, TDEE, and daily target based on your inputs</p>
        </div>

        <div className="card grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Age</label>
            <input className="input-field" type="number" value={age} onChange={e => setAge(e.target.value)} />
          </div>
          <div>
            <label className="label">Gender</label>
            <select className="input-field" value={gender} onChange={e => setGender(e.target.value as any)}>
              <option value="">Select gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
          <div>
            <label className="label">Height (cm)</label>
            <input className="input-field" type="number" step="0.1" value={height} onChange={e => setHeight(e.target.value)} />
          </div>
          <div>
            <label className="label">Weight (kg)</label>
            <input className="input-field" type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} />
          </div>
          <div>
            <label className="label">Activity Level</label>
            <select className="input-field" value={activity} onChange={e => setActivity(e.target.value as any)}>
              <option value="">Select activity</option>
              <option value="SEDENTARY">Sedentary</option>
              <option value="LIGHTLY_ACTIVE">Lightly Active</option>
              <option value="MODERATELY_ACTIVE">Moderately Active</option>
              <option value="VERY_ACTIVE">Very Active</option>
              <option value="EXTRA_ACTIVE">Extra Active</option>
            </select>
          </div>
          <div>
            <label className="label">Deficit Speed</label>
            <select className="input-field" value={deficit} onChange={e => setDeficit(e.target.value as any)}>
              <option value="">Select speed</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="SLOW">Slow (0.25 kg/week)</option>
              <option value="MODERATE">Moderate (0.5 kg/week)</option>
              <option value="FAST">Fast (0.75 kg/week)</option>
              <option value="VERY_FAST">Very Fast (1 kg/week)</option>
            </select>
          </div>
        </div>

        {result && (
          <div className="card mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary-600">{Math.round(result.bmr)}</div>
                <div className="text-sm text-gray-600">BMR</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-600">{Math.round(result.tdee)}</div>
                <div className="text-sm text-gray-600">TDEE</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-600">{Math.round(result.target)}</div>
                <div className="text-sm text-gray-600">Target</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 