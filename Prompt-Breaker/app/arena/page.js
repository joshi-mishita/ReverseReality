import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import pool from '@/lib/db'

export default async function ArenaIndexPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  // Find the first unlocked level for this team
  const result = await pool.query(
    `SELECT l.id
     FROM levels l
     JOIN team_progress tp ON tp.level_id = l.id
     WHERE tp.team_id = $1 AND tp.status != 'locked'
     ORDER BY l.order_index ASC
     LIMIT 1`,
    [session.user.dbId]
  )

  const firstLevel = result.rows[0]
  if (firstLevel) {
    redirect(`/arena/${firstLevel.id}`)
  }

  // Fallback — no progress rows found (shouldn't happen after seed)
  return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-white/30 font-mono text-sm">
        &gt; NO LEVELS AVAILABLE. CONTACT ORGANIZER.
      </p>
    </div>
  )
}