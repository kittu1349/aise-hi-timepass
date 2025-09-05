'use client'

import React from 'react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Calendar, Dumbbell, TrendingUp } from 'lucide-react'
import { WorkoutTracker } from '@/components/WorkoutTracker'
import { WorkoutDatabase } from '@/components/WorkoutDatabase'
import { WorkoutProgress } from '@/components/WorkoutProgress'

export default function WorkoutsPage() {
  const [activeTab, setActiveTab] = useState<'tracker' | 'database' | 'progress'>('tracker')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const tabs = [
    { id: 'tracker', label: 'Workout Tracker', icon: Dumbbell },
    { id: 'database', label: 'Exercise Database', icon: Plus },
    { id: 'progress', label: 'Workout Progress', icon: TrendingUp },
  ] as const

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Workout Tracking</h1>
          <p className="text-gray-600">Track your exercises and calories burned to complete your fitness picture</p>
        </motion.div>

        {/* Date Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Calendar className="w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input-field max-w-xs"
              />
            </div>
            <div className="text-sm text-gray-500">
              Today: {new Date().toLocaleDateString()}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'tracker' && <WorkoutTracker selectedDate={selectedDate} />}
          {activeTab === 'database' && <WorkoutDatabase />}
          {activeTab === 'progress' && <WorkoutProgress selectedDate={selectedDate} />}
        </motion.div>
      </div>
    </div>
  )
} 