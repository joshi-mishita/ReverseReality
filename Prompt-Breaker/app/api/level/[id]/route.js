import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import pool from '@/lib/db'

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const teamDbId = session.user.dbId
  const resolvedParams = await params
  const levelId = resolvedParams.id

  const result = await pool.query(
    `SELECT
       l.id, l.agent_name, l.tier,
       l.objective_text, l.order_index, l.points,
       COALESCE(tp.status, 'unlocked') AS status,
       COALESCE(tp.points_earned, 0)   AS points_earned
     FROM levels l
     LEFT JOIN team_progress tp
       ON tp.level_id = l.id AND tp.team_id = $1
     WHERE l.id = $2`,
    [teamDbId, levelId]
  )

  const level = result.rows[0]
  if (!level) return Response.json({ error: 'Not found' }, { status: 404 })

  return Response.json({ level, status: level.status })
}