'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleReset() {
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }
    setDone(true)
    setTimeout(() => { window.location.href = '/login' }, 2000)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '400px', background: '#1a1a1a', borderRadius: '16px', padding: '28px', border: '0.5px solid #2a2a2a' }}>
        <h2 style={{ color: '#e0e0e0', fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Reset your password</h2>
        <p style={{ color: '#555', fontSize: '13px', marginBottom: '24px' }}>Enter your new password below</p>

        {error && (
          <div style={{ background: '#2a1a1a', border: '0.5px solid #5a2a2a', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#f87171' }}>
            {error}
          </div>
        )}

        {done ? (
          <div style={{ textAlign: 'center', color: '#6dba6d', fontSize: '15px', padding: '20px 0' }}>
            ✅ Password updated! Redirecting to login...
          </div>
        ) : (
          <>
            <label style={{ fontSize: '11px', color: '#555', display: 'block', marginBottom: '5px', letterSpacing: '0.5px' }}>NEW PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              onKeyDown={e => e.key === 'Enter' && handleReset()}
              style={{ width: '100%', background: '#222', border: '0.5px solid #333', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', color: '#e0e0e0', outline: 'none', marginBottom: '20px' }}
            />
            <button
              onClick={handleReset}
              disabled={loading || !password}
              style={{ width: '100%', background: '#c8b86a', color: '#111', border: 'none', borderRadius: '10px', padding: '13px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', opacity: loading || !password ? 0.7 : 1 }}
            >
              {loading ? 'UPDATING...' : 'UPDATE PASSWORD'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}