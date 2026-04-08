import pool from '@/lib/db'

export const revalidate = 30 // auto refresh every 30 seconds

async function getLeaderboard() {
  const result = await pool.query(
    `SELECT
       t.team_name,
       t.college,
       COUNT(tp.id) FILTER (WHERE tp.status = 'solved')  AS levels_solved,
       COALESCE(SUM(tp.points_earned), 0)                AS total_points,
       MAX(tp.solved_at)                                  AS last_solve_time
     FROM teams t
     LEFT JOIN team_progress tp ON tp.team_id = t.id
     GROUP BY t.id, t.team_name, t.college
     ORDER BY
       total_points  DESC,
       last_solve_time ASC NULLS LAST`
  )
  return result.rows
}

export default async function LeaderboardPage() {
  const teams = await getLeaderboard()

  return (
    <main className="min-h-screen bg-black px-4 py-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-purple-400 font-mono text-xs tracking-widest mb-2">
            &gt; LIVE RANKINGS
          </p>
          <h1 className="text-white font-mono text-3xl font-bold mb-1">
            LEADERBOARD
          </h1>
          <p className="text-white/30 font-mono text-xs">
            Updates every 30 seconds · Ranked by score, tiebroken by solve time
          </p>
        </div>

        {/* Point system legend */}
        <div className="flex justify-center gap-4 mb-8">
          {[
            { tier: 'Easy',   pts: 100, color: 'text-green-400  border-green-400/30  bg-green-400/10'  },
            { tier: 'Medium', pts: 250, color: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' },
            { tier: 'Hard',   pts: 500, color: 'text-red-400    border-red-400/30    bg-red-400/10'    }
          ].map(t => (
            <div
              key={t.tier}
              className={`border rounded-lg px-4 py-2 text-center font-mono ${t.color}`}
            >
              <p className="text-xs opacity-60">{t.tier}</p>
              <p className="text-sm font-bold">{t.pts} pts</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div
          style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)' }}
          className="border border-white/10 rounded-2xl overflow-hidden"
        >
          {/* Table header */}
          <div className="grid grid-cols-12 px-6 py-3 border-b border-white/10">
            <span className="col-span-1 text-white/30 font-mono text-xs">#</span>
            <span className="col-span-4 text-white/30 font-mono text-xs">TEAM</span>
            <span className="col-span-3 text-white/30 font-mono text-xs">COLLEGE</span>
            <span className="col-span-2 text-white/30 font-mono text-xs text-center">SOLVED</span>
            <span className="col-span-2 text-white/30 font-mono text-xs text-right">SCORE</span>
          </div>

          {/* Table rows */}
          {teams.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-white/20 font-mono text-sm">
                &gt; NO SOLVES YET. COMPETITION HAS NOT STARTED.
              </p>
            </div>
          ) : (
            teams.map((team, index) => {
              const rank        = index + 1
              const isFirst     = rank === 1
              const isSecond    = rank === 2
              const isThird     = rank === 3
              const solvedCount = parseInt(team.levels_solved)
              const totalPts    = parseInt(team.total_points)

              const rankColor = isFirst  ? 'text-yellow-400'
                              : isSecond ? 'text-white/60'
                              : isThird  ? 'text-amber-600'
                              : 'text-white/20'

              const rowBg = isFirst  ? 'bg-yellow-400/5 border-b border-yellow-400/10'
                          : isSecond ? 'bg-white/5 border-b border-white/5'
                          : isThird  ? 'bg-amber-600/5 border-b border-amber-600/10'
                          : 'border-b border-white/5 hover:bg-white/3'

              return (
                <div
                  key={index}
                  className={`grid grid-cols-12 px-6 py-4 transition-colors ${rowBg}`}
                >
                  {/* Rank */}
                  <div className="col-span-1 flex items-center">
                    <span className={`font-mono text-sm font-bold ${rankColor}`}>
                      {isFirst ? '01' : isSecond ? '02' : isThird ? '03' : String(rank).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Team name */}
                  <div className="col-span-4 flex items-center gap-2">
                    <span className="text-white font-mono text-sm font-bold truncate">
                      {team.team_name}
                    </span>
                    {isFirst && solvedCount > 0 && (
                      <span className="text-yellow-400 text-xs shrink-0">★</span>
                    )}
                  </div>

                  {/* College */}
                  <div className="col-span-3 flex items-center">
                    <span className="text-white/40 font-mono text-xs truncate">
                      {team.college || '—'}
                    </span>
                  </div>

                  {/* Levels solved */}
                  <div className="col-span-2 flex items-center justify-center">
                    <span className={`font-mono text-sm ${solvedCount > 0 ? 'text-green-400' : 'text-white/20'}`}>
                      {solvedCount}/15
                    </span>
                  </div>

                  {/* Score */}
                  <div className="col-span-2 flex items-center justify-end">
                    <span className={`font-mono text-sm font-bold
                      ${totalPts > 0 ? 'text-purple-400' : 'text-white/20'}`}>
                      {totalPts > 0 ? totalPts.toLocaleString() : '0'}
                      <span className="text-xs font-normal ml-1 opacity-60">pts</span>
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-white/15 font-mono text-xs mt-6">
          PROMPT BREAKER · AUTO-REFRESHING
        </p>

      </div>
    </main>
  )
}