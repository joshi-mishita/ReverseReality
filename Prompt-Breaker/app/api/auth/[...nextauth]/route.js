import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        teamId:   { label: 'Team ID',  type: 'text'     },
        password: { label: 'Password', type: 'password'  }
      },
      async authorize(credentials) {
        if (!credentials?.teamId || !credentials?.password) return null

        const result = await pool.query(
          'SELECT * FROM teams WHERE team_id = $1',
          [credentials.teamId]
        )

        const team = result.rows[0]
        if (!team) return null

        const isValid = await bcrypt.compare(credentials.password, team.password_hash)
        if (!isValid) return null

        return {
          id:       team.id,
          teamId:   team.team_id,
          name:     team.team_name,
          college:  team.college
        }
      }
    })
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.teamId  = user.teamId
        token.college = user.college
        token.dbId    = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.teamId  = token.teamId
        session.user.college = token.college
        session.user.dbId    = token.dbId
      }
      return session
    }
  },

  pages: {
    signIn: '/login'
  },

  session: { strategy: 'jwt' }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }