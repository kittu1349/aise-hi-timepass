import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateBMR(age: number, gender: string, weight: number, height: number): number {
  if (gender.toLowerCase() === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161
  }
}

export function calculateTDEE(bmr: number, activityLevel: string): number {
  const multipliers = {
    SEDENTARY: 1.2,
    LIGHTLY_ACTIVE: 1.375,
    MODERATELY_ACTIVE: 1.55,
    VERY_ACTIVE: 1.725,
    EXTRA_ACTIVE: 1.9
  }
  return bmr * (multipliers[activityLevel as keyof typeof multipliers] || 1.2)
}

export function getDeficitCalories(tdee: number, deficitSpeed: string): number {
  const deficits = {
    MAINTENANCE: 0,
    SLOW: -250,
    MODERATE: -500,
    FAST: -750,
    VERY_FAST: -1000
  }
  return tdee + (deficits[deficitSpeed as keyof typeof deficits] || -500)
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function formatCalories(calories: number): string {
  return Math.round(calories).toLocaleString()
} 