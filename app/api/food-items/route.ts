import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateUserId } from '@/lib/user'

export async function GET(req: NextRequest) {
  try {
    const { userId } = getOrCreateUserId()
    const search = req.nextUrl.searchParams.get('q')?.trim() || ''
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const items = await prisma.foodItem.findMany({
      where: {
        userId,
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
      },
      orderBy: { name: 'asc' },
      take: 50,
    })
    return NextResponse.json(items)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch food items' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, setCookie } = getOrCreateUserId()
    const body = await req.json()
    const { name, caloriesPer100g, protein = 0, carbs = 0, fat = 0, fiber = 0, sugar = 0, sodium = 0 } = body
    if (!name || typeof caloriesPer100g !== 'number') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const created = await prisma.foodItem.create({
      data: { name, caloriesPer100g, protein, carbs, fat, fiber, sugar, sodium, userId },
    })
    const res = NextResponse.json(created, { status: 201 })
    if (setCookie && userId) res.cookies.set('uid', userId, { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })
    return res
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create food item' }, { status: 500 })
  }
} 