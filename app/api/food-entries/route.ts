import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateUserId } from '@/lib/user'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try { 
    const { userId } = getOrCreateUserId(false)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const date = req.nextUrl.searchParams.get('date')
    const where: any = { userId: userId as string }
    if (date) {
      const start = new Date(date)
      const end = new Date(date)
      end.setDate(end.getDate() + 1)
      where.date = { gte: start, lt: end }
    }
    const entries = await prisma.foodEntry.findMany({
      where,
      include: { foodItem: true },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(entries)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getOrCreateUserId(false)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { date, foodItemId, quantity } = await req.json()
    if (!date || !foodItemId || typeof quantity !== 'number') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    const food = await prisma.foodItem.findFirst({
      where: { id: foodItemId, userId: userId as string }
    })
      if (!food) return NextResponse.json({ error: 'Food not found' }, { status: 404 })
      const totalCalories = (food.caloriesPer100g * quantity) / 100
      const created = await prisma.foodEntry.create({
        data: {
          date: new Date(date),
          quantity,
          totalCalories,
          userId: userId as string,
          foodItemId,
        },
        include: { foodItem: true }
      })
      return NextResponse.json(created, { status: 201 })
    } catch (e) {
      return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 })
    }
}