'use client'

import React, { useEffect, useMemo, useState } from 'react'

function round(n: number) { return Math.round(n) }

type Props = { selectedDate: string }

type Profile = {
  targetCalories?: number | null
}

type Entry = { totalCalories: number }

export function DailyProgress({ selectedDate }: Props) {
  const [target, setTarget] = useState<number | null>(null)
  const [intake, setIntake] = useState(0)

  useEffect(() => {
    const load = async () => {
      const [profileRes, entriesRes] = await Promise.all([
        fetch('/api/profile'),
        fetch(`/api/food-entries?date=${selectedDate}`),
      ])
      const profile: Profile | null = await profileRes.json()
      const entries: Entry[] = await entriesRes.json()
      setTarget(profile?.targetCalories ?? null)
      setIntake(entries.reduce((s, e) => s + (e.totalCalories || 0), 0))
    }
    load()
  }, [selectedDate])

  const remaining = useMemo(() => target != null ? target - intake : null, [target, intake])
  const pct = useMemo(() => target && target > 0 ? Math.min(100, Math.max(0, (intake / target) * 100)) : 0, [target, intake])

  return (
    <div className="card">
      <div className="font-semibold mb-4">Daily Progress</div>
      {target == null ? (
        <div className="text-sm text-gray-500">Set up your profile to get a daily target.</div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <div className="text-2xl font-bold text-primary-600">{round(target)}</div>
              <div className="text-sm text-gray-600">Target</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{round(intake)}</div>
              <div className="text-sm text-gray-600">Consumed</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${remaining! >= 0 ? 'text-success-600' : 'text-danger-600'}`}>{round(Math.abs(remaining!))}</div>
              <div className="text-sm text-gray-600">{remaining! >= 0 ? 'Remaining' : 'Over'}</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div className="bg-primary-600 h-3" style={{ width: pct + '%' }} />
          </div>
        </>
      )}
    </div>
  )
} 