'use client'

import React from 'react'
import { FoodDatabase } from '@/components/FoodDatabase'

export default function FoodDatabasePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Food Database</h1>
          <p className="text-gray-600">Create and manage your custom foods</p>
        </div>
        <FoodDatabase />
      </div>
    </div>
  )
} 