'use client'

import React, { useEffect } from 'react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { User, Save, Target, Activity, Scale, Ruler } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { calculateBMR, calculateTDEE, getDeficitCalories } from '@/lib/utils'

interface ProfileForm {
  name: string
  email: string
  age: number
  gender: 'MALE' | 'FEMALE'
  height: number
  weight: number
  goalWeight: number
  activityLevel: 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'EXTRA_ACTIVE'
  deficitSpeed: 'MAINTENANCE' | 'SLOW' | 'MODERATE' | 'FAST' | 'VERY_FAST'
}

const activityLevels = [
  { value: 'SEDENTARY', label: 'Sedentary', description: 'Little/no exercise' },
  { value: 'LIGHTLY_ACTIVE', label: 'Lightly Active', description: 'Light exercise 1-3 days/week' },
  { value: 'MODERATELY_ACTIVE', label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week' },
  { value: 'VERY_ACTIVE', label: 'Very Active', description: 'Hard exercise 6-7 days/week' },
  { value: 'EXTRA_ACTIVE', label: 'Extra Active', description: 'Very hard exercise & physical job' },
]

const deficitSpeeds = [
  { value: 'MAINTENANCE', label: 'Maintenance', description: 'Maintain current weight', deficit: 0, rate: '0 kg/week' },
  { value: 'SLOW', label: 'Slow Loss', description: 'Gentle weight loss', deficit: 250, rate: '0.25 kg/week' },
  { value: 'MODERATE', label: 'Moderate Loss', description: 'Steady weight loss', deficit: 500, rate: '0.5 kg/week' },
  { value: 'FAST', label: 'Fast Loss', description: 'Aggressive weight loss', deficit: 750, rate: '0.75 kg/week' },
  { value: 'VERY_FAST', label: 'Very Fast Loss', description: 'Maximum weight loss', deficit: 1000, rate: '1 kg/week' },
]

export default function ProfilePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [calculatedValues, setCalculatedValues] = useState<{
    bmr: number
    tdee: number
    targetCalories: number
  } | null>(null)

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<ProfileForm>()

  const watchedValues = watch()

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/profile')
      if (!res.ok) return
      const data = await res.json()
      if (data) {
        reset({
          name: data.name || '',
          email: data.email || '',
          age: data.age || undefined,
          gender: data.gender || undefined,
          height: data.height || undefined,
          weight: data.weight || undefined,
          goalWeight: data.goalWeight || undefined,
          activityLevel: data.activityLevel || undefined,
          deficitSpeed: data.deficitSpeed || undefined,
        })
        if (data.bmr && data.tdee && data.targetCalories) {
          setCalculatedValues({ bmr: data.bmr, tdee: data.tdee, targetCalories: data.targetCalories })
        }
      }
    }
    load()
  }, [reset])

  const handleCalculate = () => {
    if (watchedValues.age && watchedValues.gender && watchedValues.weight && watchedValues.height && watchedValues.activityLevel) {
      const bmr = calculateBMR(watchedValues.age, watchedValues.gender, watchedValues.weight, watchedValues.height)
      const tdee = calculateTDEE(bmr, watchedValues.activityLevel)
      const targetCalories = getDeficitCalories(tdee, watchedValues.deficitSpeed || 'MODERATE')
      
      setCalculatedValues({ bmr, tdee, targetCalories })
    }
  }

  const onSubmit = async (data: ProfileForm) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success('Profile saved successfully!')
      handleCalculate()
    } catch (error) {
      toast.error('Failed to save profile')
    }
  }

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Personal details' },
    { number: 2, title: 'Body Metrics', description: 'Physical measurements' },
    { number: 3, title: 'Goals & Activity', description: 'Fitness preferences' },
    { number: 4, title: 'Review', description: 'Confirm your settings' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600">
            Let's set up your account to provide personalized recommendations
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex justify-center">
            <div className="flex items-center space-x-4 overflow-x-auto pb-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center min-w-[120px]">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-200 ${
                        currentStep >= step.number
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {step.number}
                    </div>
                    <div className="text-center mt-2">
                      <div className="text-sm font-medium text-gray-900">{step.title}</div>
                      <div className="text-xs text-gray-500">{step.description}</div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-16 h-0.5 transition-colors duration-200 ${
                        currentStep > step.number ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="card max-w-2xl mx-auto"
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                
                <div>
                  <label className="label">Full Name</label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    className="input-field"
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="label">Email</label>
                  <input
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className="input-field"
                    type="email"
                    placeholder="Enter your email"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Age</label>
                    <input
                      {...register('age', { 
                        required: 'Age is required',
                        min: { value: 18, message: 'Must be at least 18 years old' },
                        max: { value: 100, message: 'Must be less than 100 years old' }
                      })}
                      className="input-field"
                      type="number"
                      placeholder="25"
                    />
                    {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age.message}</p>}
                  </div>

                  <div>
                    <label className="label">Gender</label>
                    <select
                      {...register('gender', { required: 'Gender is required' })}
                      className="input-field"
                    >
                      <option value="">Select gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                    {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Body Metrics */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Body Measurements</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label flex items-center space-x-2">
                      <Ruler className="w-4 h-4" />
                      <span>Height (cm)</span>
                    </label>
                    <input
                      {...register('height', { 
                        required: 'Height is required',
                        min: { value: 120, message: 'Height must be at least 120 cm' },
                        max: { value: 250, message: 'Height must be less than 250 cm' }
                      })}
                      className="input-field"
                      type="number"
                      step="0.1"
                      placeholder="175"
                    />
                    {errors.height && <p className="text-red-500 text-sm mt-1">{errors.height.message}</p>}
                  </div>

                  <div>
                    <label className="label flex items-center space-x-2">
                      <Scale className="w-4 h-4" />
                      <span>Current Weight (kg)</span>
                    </label>
                    <input
                      {...register('weight', { 
                        required: 'Weight is required',
                        min: { value: 30, message: 'Weight must be at least 30 kg' },
                        max: { value: 300, message: 'Weight must be less than 300 kg' }
                      })}
                      className="input-field"
                      type="number"
                      step="0.1"
                      placeholder="70"
                    />
                    {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="label flex items-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>Goal Weight (kg)</span>
                  </label>
                  <input
                    {...register('goalWeight', { 
                      required: 'Goal weight is required',
                      min: { value: 30, message: 'Goal weight must be at least 30 kg' },
                      max: { value: 300, message: 'Goal weight must be less than 300 kg' }
                    })}
                    className="input-field"
                    type="number"
                    step="0.1"
                    placeholder="65"
                  />
                  {errors.goalWeight && <p className="text-red-500 text-sm mt-1">{errors.goalWeight.message}</p>}
                </div>
              </div>
            )}

            {/* Step 3: Goals & Activity */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Activity & Goals</h2>
                
                <div>
                  <label className="label flex items-center space-x-2">
                    <Activity className="w-4 h-4" />
                    <span>Activity Level</span>
                  </label>
                  <div className="grid gap-3">
                    {activityLevels.map((level) => (
                      <label key={level.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          {...register('activityLevel', { required: 'Activity level is required' })}
                          type="radio"
                          value={level.value}
                          className="mr-3 text-primary-600"
                        />
                        <div>
                          <div className="font-medium">{level.label}</div>
                          <div className="text-sm text-gray-500">{level.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.activityLevel && <p className="text-red-500 text-sm mt-1">{errors.activityLevel.message}</p>}
                </div>

                <div>
                  <label className="label">Weight Loss Speed</label>
                  <div className="grid gap-3">
                    {deficitSpeeds.map((speed) => (
                      <label key={speed.value} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center">
                          <input
                            {...register('deficitSpeed', { required: 'Deficit speed is required' })}
                            type="radio"
                            value={speed.value}
                            className="mr-3 text-primary-600"
                          />
                          <div>
                            <div className="font-medium">{speed.label}</div>
                            <div className="text-sm text-gray-500">{speed.description}</div>
                          </div>
                        </div>
                        <div className="text-sm text-primary-600 font-medium">
                          {speed.rate}
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.deficitSpeed && <p className="text-red-500 text-sm mt-1">{errors.deficitSpeed.message}</p>}
                </div>

                <button
                  type="button"
                  onClick={handleCalculate}
                  className="w-full btn-primary"
                >
                  Calculate My Targets
                </button>

                {calculatedValues && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-200"
                  >
                    <h3 className="font-semibold text-primary-900 mb-3">Your Calculated Targets</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary-600">{Math.round(calculatedValues.bmr)}</div>
                        <div className="text-sm text-gray-600">BMR</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary-600">{Math.round(calculatedValues.tdee)}</div>
                        <div className="text-sm text-gray-600">TDEE</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary-600">{Math.round(calculatedValues.targetCalories)}</div>
                        <div className="text-sm text-gray-600">Target Calories</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Review Your Profile</h2>
                
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Name</div>
                      <div className="font-medium">{watchedValues.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="font-medium">{watchedValues.email}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Age</div>
                      <div className="font-medium">{watchedValues.age} years</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Gender</div>
                      <div className="font-medium">{watchedValues.gender}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Height</div>
                      <div className="font-medium">{watchedValues.height} cm</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Current Weight</div>
                      <div className="font-medium">{watchedValues.weight} kg</div>
                    </div>
                  </div>
                  
                  {calculatedValues && (
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-3">Your Targets</h4>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-white rounded-lg p-3">
                          <div className="text-lg font-bold text-primary-600">{Math.round(calculatedValues.bmr)}</div>
                          <div className="text-xs text-gray-600">BMR (cal/day)</div>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <div className="text-lg font-bold text-primary-600">{Math.round(calculatedValues.tdee)}</div>
                          <div className="text-xs text-gray-600">TDEE (cal/day)</div>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <div className="text-lg font-bold text-primary-600">{Math.round(calculatedValues.targetCalories)}</div>
                          <div className="text-xs text-gray-600">Target (cal/day)</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Save Profile</span>
                </button>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                  className="btn-primary"
                >
                  Next
                </button>
              ) : null}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
} 