'use client'

import React from 'react'

type Props = { selectedDate: string }

export function WorkoutProgress({ selectedDate }: Props) {
  return (
    <div className="card">
      <div className="font-semibold mb-2">Workout Progress</div>
      <div className="text-sm text-gray-500">Selected date: {selectedDate}</div>
      <div className="mt-4 text-gray-500">Charts and weekly summaries coming next.</div>
    </div>
  )
} 