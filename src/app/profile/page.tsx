'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadProfile() }, [])

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: profileData } = await supabase
      .from('profiles').select('*').eq('id', user.id).single()
    setProfile(profileData)

    const { data: tripsData } = await supabase
      .from('trips').select('*').eq('driver_id', user.id).order('created_at', { ascending: false })
    setTrips(tripsData || [])
    setLoading(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function deactivateTrip(id: string) {
    await supabase.from('trips').update({ is_active: false }).eq('id', id)
    setTrips(prev => prev.filter(t => t.id !== id))
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#444' }}>Loading...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#111', paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{ background: '#111', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid #222', position: 'sticky', top: 0, zIndex: 10 }}>
        <span style={{ color: '#e0e0e0', fontSize: '17px', fontWeight: '600', letterSpacing: '1px' }}>Profile</span>
        <button onClick={signOut} style={{ background: 'none', border: '0.5px solid #333', borderRadius: '99px', padding: '6px 14px', color: '#666', fontSize: '12px' }}>Sign out</button>
      </div>

      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px 16px' }}>

        {/* Profile card */}
        <div style={{ background: '#1a1a1a', borderRadius: '16px', padding: '24px', border: '0.5px solid #2a2a2a', marginBottom: '20px', textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#2a2a2a', border: '2px solid #444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700', color: '#aaa', margin: '0 auto 14px' }}>
            {profile?.avatar_initials || '??'}
          </div>
          <div style={{ color: '#e0e0e0', fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>{profile?.full_name}</div>
          <div style={{ color: '#555', fontSize: '13px', marginBottom: '16px' }}>
            {profile?.is_driver ? '🚗 Driver & Rider' : '🙋 Rider'}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '1px', background: '#2a2a2a', borderRadius: '12px', overflow: 'hidden' }}>
            {[
              { label: 'Rides', value: profile?.total_rides || 0 },
              { label: 'Rating', value: `${profile?.rating || '5.0'}⭐` },
              { label: 'Trips posted', value: trips.length },
            ].map((stat, i) => (
              <div key={i} style={{ flex: 1, background: '#1a1a1a', padding: '12px 8px', textAlign: 'center' }}>
                <div style={{ color: '#c8b86a', fontSize: '18px', fontWeight: '600' }}>{stat.value}</div>
                <div style={{ color: '#444', fontSize: '10px', marginTop: '2px', letterSpacing: '0.5px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Vehicle info */}
        {profile?.car_make && (
          <div style={{ background: '#1a1a1a', borderRadius: '12px', padding: '14px 16px', border: '0.5px solid #2a2a2a', marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', color: '#555', letterSpacing: '0.5px', marginBottom: '8px' }}>YOUR VEHICLE</div>
            <div style={{ color: '#e0e0e0', fontSize: '15px', fontWeight: '500' }}>
              🚗 {profile.car_year} {profile.car_make} {profile.car_model}
            </div>
          </div>
        )}

        {/* My trips */}
        <div style={{ fontSize: '11px', color: '#555', letterSpacing: '0.5px', marginBottom: '12px' }}>MY POSTED TRIPS</div>

        {trips.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: '#1a1a1a', borderRadius: '12px', border: '0.5px solid #2a2a2a' }}>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>🚗</div>
            <p style={{ color: '#555', fontSize: '13px' }}>No trips posted yet</p>
            <button onClick={() => router.push('/post')} style={{ marginTop: '14px', background: '#c8b86a', color: '#111', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: '700' }}>
              POST A TRIP
            </button>
          </div>
        )}

        {trips.map(trip => (
          <div key={trip.id} style={{ background: '#1a1a1a', borderRadius: '12px', padding: '14px', border: '0.5px solid #2a2a2a', marginBottom: '10px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#7ab3d4' }}></div>
                <div style={{ width: '1px', height: '14px', background: '#333' }}></div>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#c47a5a' }}></div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#e0e0e0', fontSize: '13px', fontWeight: '500' }}>{trip.origin}</div>
                <div style={{ color: '#555', fontSize: '12px', marginTop: '4px' }}>{trip.destination}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#c8b86a', fontSize: '15px', fontWeight: '600' }}>{trip.suggested_price || 'Open'}</div>
                <div style={{ color: '#444', fontSize: '11px' }}>{trip.departure_time}</div>
              </div>
            </div>
            <button
              onClick={() => deactivateTrip(trip.id)}
              style={{ width: '100%', background: 'transparent', border: '0.5px solid #3a2a2a', borderRadius: '8px', padding: '8px', color: '#6a3a3a', fontSize: '12px', cursor: 'pointer' }}
            >
              Remove trip
            </button>
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
            <span style={{ fontSize: '9px', color: i === 4 ? '#c8b86a' : '#444' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}