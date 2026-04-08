import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import pool from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const teamDbId = session.user.dbId

  const result = await pool.query(
    `SELECT
       l.id,
       l.agent_name,
       l.tier,
       l.order_index,
       l.objective_text,
       l.points                          AS level_points,
       COALESCE(tp.status, 'unlocked')   AS status,
       COALESCE(tp.points_earned, 0)     AS points_earned,
       tp.solved_at
     FROM levels l
     LEFT JOIN team_progress tp
       ON tp.level_id = l.id AND tp.team_id = $1
     ORDER BY l.order_index ASC`,
    [teamDbId]
  )

  // Total score for this team
  const scoreResult = await pool.query(
    `SELECT COALESCE(SUM(points_earned), 0) AS total
     FROM team_progress
     WHERE team_id = $1`,
    [teamDbId]
  )

  return Response.json({
    levels:      result.rows,
    totalPoints: parseInt(scoreResult.rows[0].total)
  })
}