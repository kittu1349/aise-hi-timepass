import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateUserId } from '@/lib/user'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = getOrCreateUserId()
    const data = await req.json()
    const updated = await prisma.foodEntry.update({ where: { id: params.id, userId }, data, include: { foodItem: true } })
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = getOrCreateUserId()
    await prisma.foodEntry.delete({ where: { id: params.id, userId } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 })
  }
} 