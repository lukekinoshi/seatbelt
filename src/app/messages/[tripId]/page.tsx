'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase, Message } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

export default function MessagesPage() {
  const router = useRouter()
  const params = useParams()
  const tripId = params.tripId as string
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [trip, setTrip] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { loadData() }, [tripId])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function loadData() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }
    setCurrentUser(session.user)

    const { data: tripData } = await supabase
      .from('trips').select('*, profiles(*)').eq('id', tripId).single()
    setTrip(tripData)

    const { data: msgs } = await supabase
      .from('messages').select('*').eq('trip_id', tripId).order('created_at', { ascending: true })
    setMessages(msgs || [])
    setLoading(false)
  }

  useEffect(() => {
    if (!tripId) return
    const channel = supabase
      .channel(`messages-${tripId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `trip_id=eq.${tripId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [tripId])

  async function sendMessage() {
    if (!newMessage.trim() || !currentUser || !trip) return
    const content = newMessage.trim()
    setNewMessage('')
    const receiverId = trip.driver_id === currentUser.id ? currentUser.id : trip.driver_id
    const { data, error } = await supabase.from('messages').insert({
      trip_id: tripId,
      sender_id: currentUser.id,
      receiver_id: receiverId,
      content,
    }).select('*').single()
    if (!error && data) {
      setMessages(prev => [...prev, data as Message])
    }
  }

  function formatTime(timestamp: string) {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={{ height: '100vh', background: '#111', display: 'flex', flexDirection: 'column' }}>

      <div style={{ background: '#111', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '0.5px solid #222', flexShrink: 0 }}>
        <button onClick={() => router.push('/dms')} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '22px' }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#e0e0e0', fontSize: '14px', fontWeight: '500' }}>{trip?.profiles?.full_name || 'Driver'}</div>
          <div style={{ color: '#444', fontSize: '11px' }}>{trip?.origin} → {trip?.destination} · {trip?.departure_time}</div>
        </div>
        <div style={{ background: '#1a2a1a', color: '#6dba6d', fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '99px' }}>
          {trip?.suggested_price || 'Open'}
        </div>
      </div>

      {trip && (
        <div style={{ margin: '12px 16px', background: '#1a1a1a', borderRadius: '12px', padding: '12px', border: '0.5px solid #2a2a2a', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#7ab3d4' }}></div>
              <div style={{ width: '1px', height: '14px', background: '#333' }}></div>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#c47a5a' }}></div>
            </div>
            <div>
              <div style={{ color: '#e0e0e0', fontSize: '13px', fontWeight: '500' }}>{trip.origin}</div>
              <div style={{ color: '#555', fontSize: '12px', marginTop: '4px' }}>{trip.destination}</div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ color: '#c8b86a', fontSize: '16px', fontWeight: '600' }}>{trip.suggested_price || 'Open'}</div>
              <div style={{ color: '#444', fontSize: '11px' }}>{trip.departure_time}</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading && <div style={{ textAlign: 'center', color: '#444', fontSize: '13px' }}>Loading...</div>}
        {!loading && messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>💬</div>
            <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '6px' }}>Start the conversation</p>
            <p style={{ color: '#444', fontSize: '12px' }}>Negotiate a price and arrange your pickup</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.sender_id === currentUser?.id
          return (
            <div key={i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '75%' }}>
                <div style={{ fontSize: '10px', color: '#555', marginBottom: '3px', paddingLeft: isMe ? '0' : '4px', paddingRight: isMe ? '4px' : '0', textAlign: isMe ? 'right' : 'left' }}>
                  {isMe ? 'You' : (trip?.profiles?.full_name || 'Driver')}
                </div>
                <div style={{
                  padding: '10px 14px',
                  borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: isMe ? '#c8b86a' : '#1e1e1e',
                  color: isMe ? '#111' : '#e0e0e0',
                  fontSize: '14px', lineHeight: 1.4,
                  border: isMe ? 'none' : '0.5px solid #2a2a2a'
                }}>
                  {msg.content}
                </div>
                <div style={{ fontSize: '10px', color: '#333', marginTop: '3px', textAlign: isMe ? 'right' : 'left', padding: '0 4px' }}>
                  {formatTime(msg.created_at)}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: '12px 16px', borderTop: '0.5px solid #222', display: 'flex', gap: '10px', alignItems: 'center', background: '#111', flexShrink: 0 }}>
        <input
          type="text" value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Message driver..."
          style={{ flex: 1, background: '#1a1a1a', border: '0.5px solid #2a2a2a', borderRadius: '99px', padding: '10px 16px', fontSize: '14px', color: '#e0e0e0', outline: 'none' }}
        />
        <button onClick={sendMessage}
          style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#c8b86a', border: 'none', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
          ↑
        </button>
      </div>
    </div>
  )
}