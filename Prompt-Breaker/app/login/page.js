'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [teamId, setTeamId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      teamId,
      password,
      redirect: false
    })

    if (result?.ok) {
      router.push('/arena')
    } else {
      setError('Invalid Team ID or password.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-4">

      {/* ── Main container ── */}
      <div className="w-full max-w-sm">

        {/* ── Header ── */}
        <div className="text-center mb-10">
          <p className="text-purple-400 font-mono text-xs tracking-widest mb-3">
            INITIALIZING SECURE CHANNEL...
          </p>
          <h1 className="text-white font-mono text-3xl font-bold mb-2">
            PROMPT BREAKER
          </h1>
          <p className="text-white/30 font-mono text-xs tracking-widest">
            AUTHORIZED PERSONNEL ONLY
          </p>
        </div>

        {/* ── Login card ── */}
        <div
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)' }}
          className="border border-white/10 rounded-2xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Team ID field */}
            <div>
              <label className="text-white/40 font-mono text-xs tracking-widest block mb-2">
                TEAM ID
              </label>
              <input
                type="text"
                value={teamId}
                onChange={e => setTeamId(e.target.value)}
                placeholder="e.g. TEAM_042"
                autoComplete="off"
                autoFocus
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
                           text-white font-mono text-sm placeholder-white/20
                           focus:outline-none focus:border-purple-500/60
                           transition-colors"
              />
            </div>

            {/* Password field */}
            <div>
              <label className="text-white/40 font-mono text-xs tracking-widest block mb-2">
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
                           text-white font-mono text-sm placeholder-white/20
                           focus:outline-none focus:border-purple-500/60
                           transition-colors"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="border border-red-500/30 bg-red-500/10 rounded-xl px-4 py-3">
                <p className="text-red-400 font-mono text-xs">
                  &gt; ERROR: {error}
                </p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || !teamId.trim() || !password.trim()}
              className="w-full bg-purple-600 hover:bg-purple-500
                         disabled:bg-purple-600/30 disabled:cursor-not-allowed
                         text-white font-mono text-sm font-bold py-3 rounded-xl
                         transition-colors mt-2"
            >
              {loading ? '&gt; AUTHENTICATING...' : '&gt; ENTER ARENA'}
            </button>

          </form>

          {/* Divider */}
          <div className="border-t border-white/10 mt-6 pt-5">
            <p className="text-white/20 font-mono text-xs text-center">
              NO REGISTRATION · INVITED TEAMS ONLY
            </p>
          </div>
        </div>

        {/* ── Leaderboard link ── */}
        <div className="text-center mt-6">
          <a
            href="/leaderboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/20 hover:text-purple-400 font-mono text-xs
                       transition-colors"
          >
            &gt; VIEW LIVE LEADERBOARD
          </a>
        </div>

        {/* ── Footer ── */}
        <p className="text-white/10 font-mono text-xs text-center mt-4">
          <span className='text-purple-400'> PROMPT BREAKER · </span>
          <span className="text-purple-400">VERCERA</span>
        </p>

      </div>
    </main>
  )
}