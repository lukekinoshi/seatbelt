'use client'
import { useEffect, useState } from 'react'
import { supabase, Trip } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

function SeatBeltLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 400 400">
      <defs>
        <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6a6a6a"/>
          <stop offset="50%" stopColor="#a0a0a0"/>
          <stop offset="100%" stopColor="#505050"/>
        </linearGradient>
        <linearGradient id="bk2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#888"/>
          <stop offset="50%" stopColor="#bbb"/>
          <stop offset="100%" stopColor="#555"/>
        </linearGradient>
        <linearGradient id="wh2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4a4a4a"/>
          <stop offset="50%" stopColor="#6a6a6a"/>
          <stop offset="100%" stopColor="#282828"/>
        </linearGradient>
      </defs>
      <path d="M 200 62 C 240 62 275 80 275 118 C 275 158 240 172 200 182 C 160 192 125 208 125 248 C 125 286 158 308 200 310" fill="none" stroke="url(#bg2)" strokeWidth="42" strokeLinecap="round"/>
      <rect x="170" y="28" width="60" height="46" rx="7" fill="url(#bk2)"/>
      <rect x="179" y="36" width="7" height="28" rx="2.5" fill="#333"/>
      <rect x="190" y="36" width="7" height="28" rx="2.5" fill="#333"/>
      <rect x="201" y="36" width="7" height="28" rx="2.5" fill="#333"/>
      <rect x="212" y="36" width="7" height="28" rx="2.5" fill="#333"/>
      <rect x="170" y="308" width="60" height="46" rx="7" fill="url(#bk2)"/>
      <rect x="179" y="316" width="7" height="28" rx="2.5" fill="#333"/>
      <rect x="190" y="316" width="7" height="28" rx="2.5" fill="#333"/>
      <rect x="201" y="316" width="7" height="28" rx="2.5" fill="#333"/>
      <rect x="212" y="316" width="7" height="28" rx="2.5" fill="#333"/>
      <rect x="248" y="148" width="52" height="28" rx="12" fill="url(#bk2)" transform="rotate(-30 274 162)"/>
      <rect x="258" y="154" width="16" height="16" rx="5" fill="#333" transform="rotate(-30 266 162)"/>
      <circle cx="200" cy="196" r="46" fill="url(#wh2)" stroke="#777" strokeWidth="1.5"/>
      <circle cx="200" cy="196" r="36" fill="none" stroke="#888" strokeWidth="9"/>
      <circle cx="200" cy="196" r="12" fill="url(#bk2)"/>
      <circle cx="200" cy="196" r="7" fill="#1a1a1a"/>
      <line x1="200" y1="160" x2="200" y2="184" stroke="#888" strokeWidth="8" strokeLinecap="round"/>
      <line x1="168" y1="214" x2="191" y2="204" stroke="#888" strokeWidth="8" strokeLinecap="round"/>
      <line x1="232" y1="214" x2="209" y2="204" stroke="#888" strokeWidth="8" strokeLinecap="round"/>
    </svg>
  )
}

export default function FeedPage() {
  const router = useRouter()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('feed')

  useEffect(() => {
    checkUser()
    fetchTrips()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
  }

  async function fetchTrips() {
    const { data } = await supabase
      .from('trips')
      .select('*, profiles(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    setTrips(data || [])
    setLoading(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#111', paddingBottom: '70px' }}>

      {/* Header */}
      <div style={{ background: '#111', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10, borderBottom: '0.5px solid #222' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SeatBeltLogo size={32} />
          <span style={{ color: '#e0e0e0', fontSize: '18px', fontWeight: '700', letterSpacing: '3px' }}>SEATBELT</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button onClick={() => router.push('/post')} style={{ background: 'none', border: 'none', color: '#c8b86a', fontSize: '24px', lineHeight: 1 }}>＋</button>
          <button onClick={signOut} style={{ background: 'none', border: 'none', color: '#444', fontSize: '13px' }}>Sign out</button>
        </div>
      </div>

      {/* Stories row */}
      <div style={{ display: 'flex', gap: '12px', padding: '12px 16px', borderBottom: '0.5px solid #1e1e1e', overflowX: 'auto' }}>
        {['LK', 'AM', 'JR', 'TP', 'SK', 'DB'].map((initials, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'linear-gradient(135deg, #555, #333)', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', color: '#aaa' }}>
                {initials}
              </div>
            </div>
            <span style={{ fontSize: '10px', color: '#555' }}>{initials}</span>
          </div>
        ))}
      </div>

      {/* Feed */}
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#444', fontSize: '14px' }}>Loading trips...</div>
        )}

        {!loading && trips.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚗</div>
            <p style={{ color: '#aaa', fontWeight: '500', marginBottom: '8px' }}>No trips posted yet</p>
            <p style={{ color: '#444', fontSize: '13px', marginBottom: '24px' }}>Be the first to post a trip!</p>
            <button onClick={() => router.push('/post')} style={{ background: '#c8b86a', color: '#111', border: 'none', borderRadius: '10px', padding: '12px 28px', fontSize: '14px', fontWeight: '700', letterSpacing: '1px' }}>
              POST A TRIP
            </button>
          </div>
        )}

        {trips.map(trip => (
          <div key={trip.id} style={{ borderBottom: '0.5px solid #1e1e1e', paddingBottom: '4px' }}>

            {/* Post header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#2a2a2a', border: '0.5px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '12px', color: '#aaa', flexShrink: 0 }}>
                {trip.profiles?.avatar_initials || '??'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#e0e0e0', fontSize: '13px', fontWeight: '500' }}>{trip.profiles?.full_name || 'Driver'}</span>
                  <span style={{ background: '#1a2a1a', color: '#6dba6d', fontSize: '9px', fontWeight: '600', padding: '2px 7px', borderRadius: '99px', letterSpacing: '0.5px' }}>DRIVER</span>
                </div>
                <div style={{ fontSize: '11px', color: '#444', marginTop: '1px' }}>📍 {trip.origin}</div>
              </div>
              <span style={{ color: '#333', fontSize: '18px' }}>···</span>
            </div>

            {/* Trip card */}
            <div style={{ margin: '0 16px 10px', background: '#1a1a1a', borderRadius: '12px', padding: '14px', border: '0.5px solid #2a2a2a' }}>

              {/* Route */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7ab3d4' }}></div>
                  <div style={{ width: '1px', height: '18px', background: '#333' }}></div>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c47a5a' }}></div>
                </div>
                <div>
                  <div style={{ color: '#e0e0e0', fontSize: '14px', fontWeight: '500' }}>{trip.origin}</div>
                  <div style={{ color: '#666', fontSize: '12px', marginTop: '6px' }}>{trip.destination}</div>
                </div>
              </div>

              {/* Pills */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                <span style={{ background: '#222', border: '0.5px solid #333', borderRadius: '99px', padding: '3px 10px', fontSize: '11px', color: '#777' }}>🕐 {trip.departure_time}</span>
                <span style={{ background: '#222', border: '0.5px solid #333', borderRadius: '99px', padding: '3px 10px', fontSize: '11px', color: '#777' }}>💺 {trip.seats_available} seat{trip.seats_available > 1 ? 's' : ''}</span>
                {trip.profiles?.car_make && <span style={{ background: '#222', border: '0.5px solid #333', borderRadius: '99px', padding: '3px 10px', fontSize: '11px', color: '#777' }}>🚗 {trip.profiles.car_make} {trip.profiles.car_model}</span>}
              </div>

              {/* Caption */}
              {trip.notes && <p style={{ color: '#888', fontSize: '13px', marginBottom: '12px', lineHeight: 1.5 }}>{trip.notes}</p>}

              {/* Price + CTA */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#444' }}>Suggested price</div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#c8b86a' }}>{trip.suggested_price || 'Open to offers'}</div>
                </div>
                <button
                  onClick={() => router.push(`/messages/${trip.id}`)}
                  style={{ background: '#1e2e1e', color: '#6dba6d', border: '0.5px solid #2a4a2a', borderRadius: '99px', padding: '8px 18px', fontSize: '12px', fontWeight: '600' }}
                >
                  Message driver
                </button>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '16px', padding: '4px 16px 12px', alignItems: 'center' }}>
              <span style={{ fontSize: '22px', cursor: 'pointer' }}>🤍</span>
              <span style={{ fontSize: '22px', cursor: 'pointer' }}>💬</span>
              <span style={{ fontSize: '22px', cursor: 'pointer' }}>↗️</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#111', borderTop: '0.5px solid #222', display: 'flex', padding: '8px 0' }}>
        {[
          { icon: '🏠', label: 'Feed', path: '/feed' },
          { icon: '🔍', label: 'Search', path: '/feed' },
          { icon: '➕', label: 'Post', path: '/post' },
          { icon: '💬', label: 'DMs', path: '/feed' },
          { icon: '👤', label: 'Profile', path: '/profile' },
        ].map((item, i) => (
          <div key={i} onClick={() => router.push(item.path)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer' }}>
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            <span style={{ fontSize: '9px', color: '#444' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}