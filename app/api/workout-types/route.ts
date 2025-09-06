import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateUserId } from '@/lib/user'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { userId } = getOrCreateUserId(true)
    const search = req.nextUrl.searchParams.get('q')?.trim() || ''
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const types = await prisma.workoutType.findMany({
      where: {
        userId,
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
      },
      orderBy: { name: 'asc' },
      take: 50,
    })
    return NextResponse.json(types)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch workout types' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, setCookie } = getOrCreateUserId()
    const body = await req.json()
    const { name, category, caloriesPerMin, description } = body
    if (!name || !category || typeof caloriesPerMin !== 'number') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const created = await prisma.workoutType.create({
      data: { name, category, caloriesPerMin, description, userId },
    })
    const res = NextResponse.json(created, { status: 201 })
    if (setCookie) res.cookies.set('uid', userId, { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })
    return res
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create workout type' }, { status: 500 })
  }
} 