'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

function SeatBeltLogo({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 400 400">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6a6a6a"/>
          <stop offset="25%" stopColor="#a0a0a0"/>
          <stop offset="50%" stopColor="#787878"/>
          <stop offset="75%" stopColor="#b0b0b0"/>
          <stop offset="100%" stopColor="#505050"/>
        </linearGradient>
        <linearGradient id="bk" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#888"/>
          <stop offset="40%" stopColor="#bbb"/>
          <stop offset="100%" stopColor="#555"/>
        </linearGradient>
        <linearGradient id="wh" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4a4a4a"/>
          <stop offset="50%" stopColor="#6a6a6a"/>
          <stop offset="100%" stopColor="#282828"/>
        </linearGradient>
      </defs>
      <path d="M 200 62 C 240 62 275 80 275 118 C 275 158 240 172 200 182 C 160 192 125 208 125 248 C 125 286 158 308 200 310" fill="none" stroke="#222" strokeWidth="48" strokeLinecap="round" opacity="0.4"/>
      <path d="M 200 62 C 240 62 275 80 275 118 C 275 158 240 172 200 182 C 160 192 125 208 125 248 C 125 286 158 308 200 310" fill="none" stroke="url(#bg)" strokeWidth="42" strokeLinecap="round"/>
      <path d="M 200 62 C 240 62 275 80 275 118 C 275 158 240 172 200 182 C 160 192 125 208 125 248 C 125 286 158 308 200 310" fill="none" stroke="#ddd" strokeWidth="6" strokeLinecap="round" opacity="0.12"/>
      <rect x="170" y="28" width="60" height="46" rx="7" fill="url(#bk)" stroke="#777" strokeWidth="0.5"/>
      <rect x="179" y="36" width="7" height="28" rx="2.5" fill="#333"/>
      <rect x="190" y="36" width="7" height="28" rx="2.5" fill="#333"/>
      <rect x="201" y="36" width="7" height="28" rx="2.5" fill="#333"/>
      <rect x="212" y="36" width="7" height="28" rx="2.5" fill="#333"/>
      <rect x="170" y="308" width="60" height="46" rx="7" fill="url(#bk)" stroke="#777" strokeWidth="0.5"/>
      <rect x="179" y="316" width="7" height="28" rx="2.5" fill="#333"/>
      <rect x="190" y="316" width="7" height="28" rx="2.5" fill="#333"/>
      <rect x="201" y="316" width="7" height="28" rx="2.5" fill="#333"/>
      <rect x="212" y="316" width="7" height="28" rx="2.5" fill="#333"/>
      <rect x="248" y="148" width="52" height="28" rx="12" fill="url(#bk)" stroke="#888" strokeWidth="0.5" transform="rotate(-30 274 162)"/>
      <rect x="258" y="154" width="16" height="16" rx="5" fill="#333" transform="rotate(-30 266 162)"/>
      <circle cx="200" cy="196" r="46" fill="url(#wh)" stroke="#777" strokeWidth="1.5"/>
      <circle cx="200" cy="196" r="36" fill="none" stroke="#888" strokeWidth="9"/>
      <circle cx="200" cy="196" r="12" fill="url(#bk)"/>
      <circle cx="200" cy="196" r="7" fill="#1a1a1a"/>
      <line x1="200" y1="160" x2="200" y2="184" stroke="#888" strokeWidth="8" strokeLinecap="round"/>
      <line x1="168" y1="214" x2="191" y2="204" stroke="#888" strokeWidth="8" strokeLinecap="round"/>
      <line x1="232" y1="214" x2="209" y2="204" stroke="#888" strokeWidth="8" strokeLinecap="round"/>
      <line x1="200" y1="160" x2="200" y2="184" stroke="#ccc" strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
      <line x1="168" y1="214" x2="191" y2="204" stroke="#ccc" strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
      <line x1="232" y1="214" x2="209" y2="204" stroke="#ccc" strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [isDriver, setIsDriver] = useState(false)
  const [carMake, setCarMake] = useState('')
  const [carModel, setCarModel] = useState('')
  const [carYear, setCarYear] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleAuth() {
    setLoading(true)
    setError('')
    if (isSignUp) {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) { setError(signUpError.message); setLoading(false); return }
      if (data.user) {
        const initials = fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        await supabase.from('profiles').insert({
          id: data.user.id, full_name: fullName, avatar_initials: initials,
          car_make: carMake, car_model: carModel, car_year: carYear, is_driver: isDriver,
        })
      }
      router.push('/feed')
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) { setError(signInError.message); setLoading(false); return }
      router.push('/feed')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: '#111' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <SeatBeltLogo size={100} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#e0e0e0', margin: '0 0 6px', letterSpacing: '4px' }}>SEATBELT</h1>
          <p style={{ color: '#444', fontSize: '11px', margin: 0, letterSpacing: '3px' }}>RIDE SMARTER. PAY LESS.</p>
        </div>

        <div style={{ background: '#1a1a1a', borderRadius: '16px', padding: '28px', border: '0.5px solid #2a2a2a' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '500', margin: '0 0 20px', color: '#ccc' }}>
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>

          {error && (
            <div style={{ background: '#2a1a1a', border: '0.5px solid #5a2a2a', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#f87171' }}>
              {error}
            </div>
          )}

          {isSignUp && (
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', color: '#555', display: 'block', marginBottom: '5px', letterSpacing: '0.5px' }}>FULL NAME</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" />
            </div>
          )}

          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '11px', color: '#555', display: 'block', marginBottom: '5px', letterSpacing: '0.5px' }}>EMAIL</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '11px', color: '#555', display: 'block', marginBottom: '5px', letterSpacing: '0.5px' }}>PASSWORD</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" />
          </div>

          {isSignUp && (
            <>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#aaa' }}>
                  <input type="checkbox" checked={isDriver} onChange={e => setIsDriver(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#c8b86a' }} />
                  I want to post trips as a driver
                </label>
              </div>
              {isDriver && (
                <div style={{ background: '#222', borderRadius: '10px', padding: '14px', marginBottom: '14px', border: '0.5px solid #333' }}>
                  <p style={{ fontSize: '11px', color: '#555', margin: '0 0 10px', letterSpacing: '0.5px' }}>YOUR VEHICLE</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" value={carMake} onChange={e => setCarMake(e.target.value)} placeholder="Make" />
                    <input type="text" value={carModel} onChange={e => setCarModel(e.target.value)} placeholder="Model" />
                    <input type="text" value={carYear} onChange={e => setCarYear(e.target.value)} placeholder="Year" style={{ maxWidth: '80px' }} />
                  </div>
                </div>
              )}
            </>
          )}

          <button
            onClick={handleAuth}
            disabled={loading}
            style={{ width: '100%', background: '#c8b86a', color: '#111', border: 'none', borderRadius: '10px', padding: '13px', fontSize: '14px', fontWeight: '700', letterSpacing: '1px', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'PLEASE WAIT...' : isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
          </button>

          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#444' }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <span onClick={() => { setIsSignUp(!isSignUp); setError('') }} style={{ color: '#c8b86a', fontWeight: '500', cursor: 'pointer' }}>
              {isSignUp ? 'Sign in' : 'Sign up'}
            </span>
          </p>
        </div>

      </div>
    </div>
  )
}