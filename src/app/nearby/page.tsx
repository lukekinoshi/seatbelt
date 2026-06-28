'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function NearbyPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentProfile, setCurrentProfile] = useState<any>(null)
  const [nearbyUsers, setNearbyUsers] = useState<any[]>([])
  const [myLocation, setMyLocation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [locationError, setLocationError] = useState('')
  const [filter, setFilter] = useState<'all' | 'drivers' | 'riders'>('all')
  const watchRef = useRef<number | null>(null)

  useEffect(() => {
    init()
    return () => {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current)
    }
  }, [])

  async function init() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.href = '/login'; return }
    setCurrentUser(session.user)

    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', session.user.id).single()
    setCurrentProfile(profile)

    startTracking(session.user.id, profile?.is_driver || false)
  }

  function startTracking(userId: string, isDriver: boolean) {
    if (!navigator.geolocation) {
      setLocationError('Location not supported on this device')
      setLoading(false)
      return
    }

    watchRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        setMyLocation({ latitude, longitude })

        await supabase.from('user_locations').upsert({
          user_id: userId,
          latitude,
          longitude,
          is_driver: isDriver,
          is_active: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })

        fetchNearby(latitude, longitude, userId)
        setLoading(false)
      },
      (err) => {
        setLocationError('Please enable location to use this feature')
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    )
  }

  async function fetchNearby(lat: number, lng: number, myId: string) {
    const { data: locations } = await supabase
      .from('user_locations')
      .select('*, profiles(full_name, avatar_initials, is_driver, rating, car_make, car_model)')
      .eq('is_active', true)
      .neq('user_id', myId)

    if (!locations) return

    const withDistance = locations.map(loc => {
      const dist = getDistance(lat, lng, loc.latitude, loc.longitude)
      return { ...loc, distance: dist }
    }).filter(loc => loc.distance <= 10)
      .sort((a, b) => a.distance - b.distance)

    setNearbyUsers(withDistance)
  }

  function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 3958.8
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2)
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  }

  function formatDistance(miles: number) {
    if (miles < 0.1) return 'Very close'
    if (miles < 1) return `${(miles * 5280).toFixed(0)} ft away`
    return `${miles.toFixed(1)} mi away`
  }

  const filtered = nearbyUsers.filter(u => {
    if (filter === 'drivers') return u.profiles?.is_driver
    if (filter === 'riders') return !u.profiles?.is_driver
    return true
  })

  return (
    <div style={{ minHeight: '100vh', background: '#111', paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{ background: '#111', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid #222', position: 'sticky', top: 0, zIndex: 10 }}>
        <span style={{ color: '#e0e0e0', fontSize: '17px', fontWeight: '600', letterSpacing: '1px' }}>
          📍 Nearby
        </span>
        <span style={{ color: '#444', fontSize: '12px' }}>
          {myLocation ? '🟢 Live' : '⏳ Locating...'}
        </span>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', background: '#1a1a1a', borderBottom: '0.5px solid #222' }}>
        {(['all', 'drivers', 'riders'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ flex: 1, padding: '10px', border: 'none', background: 'transparent', color: filter === f ? '#c8b86a' : '#444', fontSize: '12px', fontWeight: filter === f ? '700' : '400', letterSpacing: '0.5px', cursor: 'pointer', borderBottom: filter === f ? '2px solid #c8b86a' : '2px solid transparent', textTransform: 'uppercase' }}>
            {f === 'all' ? 'Everyone' : f}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📍</div>
          <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '6px' }}>Finding your location...</p>
          <p style={{ color: '#444', fontSize: '12px' }}>Make sure location is enabled</p>
        </div>
      )}

      {locationError && (
        <div style={{ margin: '20px 16px', background: '#2a1a1a', border: '0.5px solid #5a2a2a', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', marginBottom: '10px' }}>📍</div>
          <p style={{ color: '#f87171', fontSize: '14px', marginBottom: '6px' }}>{locationError}</p>
          <p style={{ color: '#555', fontSize: '12px' }}>Go to your browser settings and allow location access for SeatBelt</p>
        </div>
      )}

      {!loading && !locationError && (
        <>
          {/* Live map placeholder */}
          <div style={{ margin: '16px', background: '#1a1a1a', borderRadius: '14px', border: '0.5px solid #2a2a2a', overflow: 'hidden', position: 'relative' }}>
            <div style={{ height: '200px', background: 'linear-gradient(135deg, #1a1a2a, #1a2a1a)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
              {/* Radar effect */}
              <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                {[1, 0.66, 0.33].map((scale, i) => (
                  <div key={i} style={{
                    position: 'absolute', top: '50%', left: '50%',
                    width: `${120 * scale}px`, height: `${120 * scale}px`,
                    borderRadius: '50%', border: '0.5px solid #2a4a2a',
                    transform: 'translate(-50%, -50%)'
                  }} />
                ))}
                {/* Center dot - me */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', width: '12px', height: '12px', borderRadius: '50%', background: '#c8b86a', transform: 'translate(-50%, -50%)', boxShadow: '0 0 8px #c8b86a' }} />
                {/* Nearby user dots */}
                {filtered.slice(0, 6).map((u, i) => {
                  const angle = (i / Math.max(filtered.length, 1)) * 360
                  const radius = Math.min(u.distance / 10, 0.9) * 50
                  const x = 50 + radius * Math.cos(angle * Math.PI / 180)
                  const y = 50 + radius * Math.sin(angle * Math.PI / 180)
                  return (
                    <div key={i} style={{
                      position: 'absolute', top: `${y}%`, left: `${x}%`,
                      width: '10px', height: '10px', borderRadius: '50%',
                      background: u.profiles?.is_driver ? '#6dba6d' : '#7ab3d4',
                      transform: 'translate(-50%, -50%)',
                      boxShadow: `0 0 6px ${u.profiles?.is_driver ? '#6dba6d' : '#7ab3d4'}`
                    }} />
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                <span style={{ fontSize: '11px', color: '#555' }}>
                  <span style={{ color: '#c8b86a' }}>●</span> You
                </span>
                <span style={{ fontSize: '11px', color: '#555' }}>
                  <span style={{ color: '#6dba6d' }}>●</span> Drivers
                </span>
                <span style={{ fontSize: '11px', color: '#555' }}>
                  <span style={{ color: '#7ab3d4' }}>●</span> Riders
                </span>
              </div>
            </div>
            <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#555' }}>
                {filtered.length} {filter === 'all' ? 'people' : filter} within 10 miles
              </span>
              <span style={{ fontSize: '11px', color: '#333' }}>
                {myLocation ? `${myLocation.latitude.toFixed(4)}, ${myLocation.longitude.toFixed(4)}` : ''}
              </span>
            </div>
          </div>

          {/* Nearby list */}
          <div style={{ padding: '0 16px' }}>
            <div style={{ fontSize: '11px', color: '#555', letterSpacing: '0.5px', marginBottom: '12px' }}>
              NEARBY {filter.toUpperCase()}
            </div>

            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: '#1a1a1a', borderRadius: '12px', border: '0.5px solid #2a2a2a' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
                <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '6px' }}>No one nearby yet</p>
                <p style={{ color: '#444', fontSize: '12px' }}>Share SeatBelt with friends to build your local network</p>
              </div>
            )}

            {filtered.map((user, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#1a1a1a', borderRadius: '12px', padding: '14px', border: '0.5px solid #2a2a2a', marginBottom: '10px' }}>
                {/* Avatar */}
                <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: user.profiles?.is_driver ? '#1e2a1e' : '#1e1e2a', border: `1.5px solid ${user.profiles?.is_driver ? '#6dba6d' : '#7ab3d4'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '14px', color: user.profiles?.is_driver ? '#6dba6d' : '#7ab3d4', flexShrink: 0 }}>
                  {user.profiles?.avatar_initials || '??'}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                    <span style={{ color: '#e0e0e0', fontSize: '14px', fontWeight: '500' }}>
                      {user.profiles?.full_name || 'User'}
                    </span>
                    <span style={{ background: user.profiles?.is_driver ? '#1e2a1e' : '#1e1e2a', color: user.profiles?.is_driver ? '#6dba6d' : '#7ab3d4', fontSize: '9px', fontWeight: '700', padding: '2px 7px', borderRadius: '99px', letterSpacing: '0.5px' }}>
                      {user.profiles?.is_driver ? 'DRIVER' : 'RIDER'}
                    </span>
                  </div>
                  {user.profiles?.is_driver && user.profiles?.car_make && (
                    <div style={{ fontSize: '11px', color: '#555', marginBottom: '2px' }}>
                      🚗 {user.profiles.car_make} {user.profiles.car_model}
                    </div>
                  )}
                  <div style={{ fontSize: '11px', color: '#444' }}>
                    📍 {formatDistance(user.distance)}
                  </div>
                </div>

                {/* Action */}
                <button
                  onClick={() => router.push('/feed')}
                  style={{ background: '#1e2a1e', color: '#6dba6d', border: '0.5px solid #2a4a2a', borderRadius: '99px', padding: '7px 14px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', flexShrink: 0 }}>
                  View feed
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Bottom nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#111', borderTop: '0.5px solid #222', display: 'flex', padding: '8px 0' }}>
        {[
          { icon: '🏠', label: 'Feed', path: '/feed' },
          { icon: '📍', label: 'Nearby', path: '/nearby' },
          { icon: '➕', label: 'Post', path: '/post' },
          { icon: '💬', label: 'DMs', path: '/dms' },
          { icon: '👤', label: 'Profile', path: '/profile' },
        ].map((item, i) => (
          <div key={i} onClick={() => router.push(item.path)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer' }}>
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            <span style={{ fontSize: '9px', color: i === 1 ? '#c8b86a' : '#444' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}