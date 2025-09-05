import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateUserId } from '@/lib/user'

export async function GET(req: NextRequest) {
  try {
    const { userId } = getOrCreateUserId(true)
    const date = req.nextUrl.searchParams.get('date')
    const where: any = { userId }
    if (date) {
      const start = new Date(date)
      const end = new Date(date)
      end.setDate(end.getDate() + 1)
      where.date = { gte: start, lt: end }
    }
    const workouts = await prisma.workout.findMany({
      where,
      include: { workoutType: true },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(workouts)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch workouts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, setCookie } = getOrCreateUserId()
    const { date, workoutTypeId, duration, caloriesBurned, intensity, notes } = await req.json()
    if (!date || !workoutTypeId || typeof duration !== 'number') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    const type = await prisma.workoutType.findFirst({ where: { id: workoutTypeId, userId } })
    if (!type) return NextResponse.json({ error: 'Workout type not found' }, { status: 404 })

    const created = await prisma.workout.create({
      data: {
        date: new Date(date),
        duration,
        caloriesBurned: typeof caloriesBurned === 'number' ? caloriesBurned : Math.round(duration * type.caloriesPerMin),
        intensity: intensity || 'MODERATE',
        notes,
        userId,
        workoutTypeId,
      },
      include: { workoutType: true }
    })
    const res = NextResponse.json(created, { status: 201 })
    if (setCookie) res.cookies.set('uid', userId, { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })
    return res
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create workout' }, { status: 500 })
  }
} 