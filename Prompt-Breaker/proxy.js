export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/arena/:path*',
    '/api/submit/:path*',
    '/api/progress/:path*',
    '/api/level/:path*',
    '/api/chat/:path*'
  ]
}