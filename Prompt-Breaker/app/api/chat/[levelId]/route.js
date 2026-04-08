import { getServerSession } from 'next-auth'
import { authOptions }      from '@/app/api/auth/[...nextauth]/route'
import pool                 from '@/lib/db'

// GET — load chat history for this team + level
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const teamDbId = session.user.dbId
    const resolvedParams = await params
  const levelId = resolvedParams.id


  const result = await pool.query(
    `SELECT role, message, created_at
     FROM chat_history
     WHERE team_id  = $1
       AND level_id = $2
     ORDER BY created_at ASC`,
    [teamDbId, levelId]
  )

  return Response.json({ messages: result.rows })
}

// DELETE — clear chat history for this team + level
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const teamDbId = session.user.dbId
  const levelId  = params.levelId

  await pool.query(
    `DELETE FROM chat_history
     WHERE team_id  = $1
       AND level_id = $2`,
    [teamDbId, levelId]
  )

  return Response.json({ ok: true })
}