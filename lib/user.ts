import { cookies } from 'next/headers'

export function getOrCreateUserId(allowCreate: boolean = false): { userId: string | null; setCookie: boolean } {
  const store = cookies()
  const existing = store.get('uid')?.value
  if (existing) return { userId: existing, setCookie: false }
  if (!allowCreate) return { userId: null, setCookie: false }
  const userId = (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2))
  return { userId, setCookie: true }
} 