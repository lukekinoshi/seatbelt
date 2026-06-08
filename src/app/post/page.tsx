'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function PostTripPage() {
  const router = useRouter()
  const [postType, setPostType] = useState<'driver' | 'rider'>('driver')
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [departureTime, setDepartureTime] = useState('')
  const [seats, setSeats] = useState('1')
  const [price, setPrice] = useState('')
  const [caption, setCaption] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function postTrip() {
    if (!origin || !destination || !departureTime) {
      setError('Please fill in origin, destination and departure time')
      return
    }
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error: tripError } = await supabase.from('trips').insert({
      driver_id: user.id,
      origin,
      destination,
      departure_time: departureTime,
      seats_available: parseInt(seats),
      suggested_price: price,
      notes: caption,
      is_active: true,
    })

    if (tripError) { setError(tripError.message); setLoading(false); return }
    router.push('/feed')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#111', paddingBottom: '40px' }}>

      {/* Header */}
      <div style={{ background: '#111', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '0.5px solid #222', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => router.push('/feed')} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '22px' }}>←</button>
        <span style={{ color: '#e0e0e0', fontSize: '17px', fontWeight: '600', letterSpacing: '1px' }}>New Post</span>
      </div>

      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '16px' }}>

        {/* Post type toggle */}
        <div style={{ display: 'flex', background: '#1a1a1a', borderRadius: '12px', padding: '4px', marginBottom: '20px', border: '0.5px solid #2a2a2a' }}>
          <button
            onClick={() => setPostType('driver')}
            style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: postType === 'driver' ? '#2a3a2a' : 'transparent', color: postType === 'driver' ? '#6dba6d' : '#444', fontSize: '13px', fontWeight: '600', letterSpacing: '0.5px' }}
          >
            🚗 I'M DRIVING
          </button>
          <button
            onClick={() => setPostType('rider')}
            style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: postType === 'rider' ? '#1a2a3a' : 'transparent', color: postType === 'rider' ? '#6d8dba' : '#444', fontSize: '13px', fontWeight: '600', letterSpacing: '0.5px' }}
          >
            🙋 I NEED A RIDE
          </button>
        </div>

        <div style={{ background: '#1a1a1a', borderRadius: '16px', padding: '20px', border: '0.5px solid #2a2a2a' }}>

          {error && (
            <div style={{ background: '#2a1a1a', border: '0.5px solid #5a2a2a', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#f87171' }}>
              {error}
            </div>
          )}

          {/* Origin */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '11px', color: '#555', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>📍 DEPARTING FROM</label>
            <input
              type="text"
              value={origin}
              onChange={e => setOrigin(e.target.value)}
              placeholder="e.g. Coney Island, Brooklyn"
              style={{ background: '#222', border: '0.5px solid #333', borderRadius: '8px', padding: '11px 12px', fontSize: '14px', color: '#e0e0e0', width: '100%', outline: 'none' }}
            />
          </div>

          {/* Destination */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '11px', color: '#555', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>🏁 DESTINATION</label>
            <input
              type="text"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              placeholder="e.g. Downtown Brooklyn"
              style={{ background: '#222', border: '0.5px solid #333', borderRadius: '8px', padding: '11px 12px', fontSize: '14px', color: '#e0e0e0', width: '100%', outline: 'none' }}
            />
          </div>

          {/* Time + Seats */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', color: '#555', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>🕐 DEPARTURE TIME</label>
              <input
                type="text"
                value={departureTime}
                onChange={e => setDepartureTime(e.target.value)}
                placeholder="e.g. 2:00 PM"
                style={{ background: '#222', border: '0.5px solid #333', borderRadius: '8px', padding: '11px 12px', fontSize: '14px', color: '#e0e0e0', width: '100%', outline: 'none' }}
              />
            </div>
            {postType === 'driver' && (
              <div style={{ width: '110px' }}>
                <label style={{ fontSize: '11px', color: '#555', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>💺 SEATS</label>
                <select
                  value={seats}
                  onChange={e => setSeats(e.target.value)}
                  style={{ background: '#222', border: '0.5px solid #333', borderRadius: '8px', padding: '11px 12px', fontSize: '14px', color: '#e0e0e0', width: '100%', outline: 'none' }}
                >
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                </select>
              </div>
            )}
          </div>

          {/* Price */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '11px', color: '#555', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>
              💰 {postType === 'driver' ? 'SUGGESTED PRICE' : 'MY WAGER (WILLING TO PAY)'}
            </label>
            <input
              type="text"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder={postType === 'driver' ? 'e.g. $8-12 or open to offers' : 'e.g. $15'}
              style={{ background: '#222', border: '0.5px solid #333', borderRadius: '8px', padding: '11px 12px', fontSize: '14px', color: '#e0e0e0', width: '100%', outline: 'none' }}
            />
          </div>

          {/* Caption */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '11px', color: '#555', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>✍️ CAPTION</label>
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder={postType === 'driver'
                ? "e.g. Already heading downtown — ride with me and save big vs Uber. No surge, no nonsense 🤝"
                : "e.g. Need a ride to JFK asap, flexible on pickup. Uber wanted $60 — that's crazy 🙏"
              }
              rows={3}
              style={{ background: '#222', border: '0.5px solid #333', borderRadius: '8px', padding: '11px 12px', fontSize: '14px', color: '#e0e0e0', width: '100%', outline: 'none', resize: 'none', fontFamily: 'inherit', lineHeight: 1.5 }}
            />
          </div>

          <button
            onClick={postTrip}
            disabled={loading}
            style={{ width: '100%', background: postType === 'driver' ? '#c8b86a' : '#5a7aaa', color: '#111', border: 'none', borderRadius: '10px', padding: '14px', fontSize: '14px', fontWeight: '700', letterSpacing: '1px', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'POSTING...' : postType === 'driver' ? '🚗 POST TRIP TO FEED' : '🙋 POST RIDE REQUEST'}
          </button>
        </div>
      </div>
    </div>
  )
}