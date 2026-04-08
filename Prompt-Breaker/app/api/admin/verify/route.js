import { NextResponse } from 'next/server'

export async function POST(req) {
  const { password } = await req.json()

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })

  response.cookies.set('admin-session', process.env.ADMIN_PASSWORD, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    maxAge:   60 * 60 * 8,
    path:     '/'
  })

  return response
}