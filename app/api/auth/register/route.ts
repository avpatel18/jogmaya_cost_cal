import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: { email, password: hashed },
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Registration error', e)
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 })
  }
}
