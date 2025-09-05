import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateUserId } from '@/lib/user'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = getOrCreateUserId()
    const item = await prisma.foodItem.findFirst({ where: { id: params.id, userId } })
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(item)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch food item' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = getOrCreateUserId()
    const data = await req.json()
    const updated = await prisma.foodItem.update({ where: { id: params.id, userId }, data })
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update food item' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = getOrCreateUserId()
    await prisma.foodItem.delete({ where: { id: params.id, userId } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete food item' }, { status: 500 })
  }
} 