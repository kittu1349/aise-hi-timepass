import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateBMR, calculateTDEE, getDeficitCalories } from '@/lib/utils'
import { getOrCreateUserId } from '@/lib/user'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { userId } = getOrCreateUserId(false)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = await prisma.user.findUnique({ where: { id: userId } })
    return NextResponse.json(user)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = getOrCreateUserId(false)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { name, email, age, gender, height, weight, goalWeight, activityLevel, deficitSpeed } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    let bmr: number | null = null
    let tdee: number | null = null
    let targetCalories: number | null = null

    if (age && gender && height && weight && activityLevel) {
      bmr = calculateBMR(Number(age), String(gender), Number(weight), Number(height))
      tdee = calculateTDEE(bmr, String(activityLevel))
      targetCalories = getDeficitCalories(tdee, String(deficitSpeed || 'MODERATE'))
    }

    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {
        name,
        email,
        age: age ? Number(age) : null,
        gender: gender || null,
        height: height ? Number(height) : null,
        weight: weight ? Number(weight) : null,
        goalWeight: goalWeight ? Number(goalWeight) : null,
        activityLevel: activityLevel || null,
        deficitSpeed: deficitSpeed || null,
        bmr,
        tdee,
        targetCalories,
      },
      create: {
        id: userId,
        name,
        email,
        age: age ? Number(age) : null,
        gender: gender || null,
        height: height ? Number(height) : null,
        weight: weight ? Number(weight) : null,
        goalWeight: goalWeight ? Number(goalWeight) : null,
        activityLevel: activityLevel || null,
        deficitSpeed: deficitSpeed || null,
        bmr,
        tdee,
        targetCalories,
      }
    })

    return NextResponse.json(user)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
  }
} 