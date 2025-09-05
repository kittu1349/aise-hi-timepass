import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateUserId } from '@/lib/user'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = getOrCreateUserId(false)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const data = await req.json()
    const updated = await prisma.workoutType.update({ where: { id: params.id, userId }, data })
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update workout type' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = getOrCreateUserId(false)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await prisma.workoutType.delete({ where: { id: params.id, userId } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete workout type' }, { status: 500 })
  }
} 