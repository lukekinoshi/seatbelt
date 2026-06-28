'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function DMsPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => { loadConversations() }, [])

  async function loadConversations() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.href = '/login'; return }
    setCurrentUser(session.user)

    const { data: messages } = await supabase
      .from('messages')
      .select('*, trips(id, origin, destination, departure_time, suggested_price)')
      .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
      .order('created_at', { ascending: false })

    if (!messages) { setLoading(false); return }

    // Group by trip_id to get unique conversations
    const seen = new Set()
    const unique = messages.filter(msg => {
      if (seen.has(msg.trip_id)) return false
      seen.add(msg.trip_id)
      return true
    })

    // Get other user profiles for each conversation
    const convosWithProfiles = await Promise.all(unique.map(async (msg) => {
      const otherId = msg.sender_id === session.user.id ? msg.receiver_id : msg.sender_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_initials')
        .eq('id', otherId)
        .single()
      return { ...msg, otherProfile: profile }
    }))

    setConversations(convosWithProfiles)
    setLoading(false)
  }

  function formatTime(timestamp: string) {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return 'Just now'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#111', paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{ background: '#111', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid #222', position: 'sticky', top: 0, zIndex: 10 }}>
        <span style={{ color: '#e0e0e0', fontSize: '17px', fontWeight: '600', letterSpacing: '1px' }}>Messages</span>
        <span style={{ color: '#555', fontSize: '12px' }}>{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</span>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#444' }}>Loading messages...</div>
      )}

      {!loading && conversations.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
          <p style={{ color: '#aaa', fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>No messages yet</p>
          <p style={{ color: '#444', fontSize: '13px', marginBottom: '24px' }}>Browse the feed and message a driver to get started</p>
          <button onClick={() => router.push('/feed')}
            style={{ background: '#c8b86a', color: '#111', border: 'none', borderRadius: '10px', padding: '12px 28px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
            BROWSE FEED
          </button>
        </div>
      )}

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {conversations.map((convo, i) => (
          <div key={i} onClick={() => router.push(`/messages/${convo.trip_id}`)}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderBottom: '0.5px solid #1e1e1e', cursor: 'pointer', background: '#111' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1a1a1a')}
            onMouseLeave={e => (e.currentTarget.style.background = '#111')}
          >
            {/* Avatar */}
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#2a2a2a', border: '0.5px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '14px', color: '#aaa', flexShrink: 0 }}>
              {convo.otherProfile?.avatar_initials || '??'}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ color: '#e0e0e0', fontSize: '14px', fontWeight: '500' }}>
                  {convo.otherProfile?.full_name || 'User'}
                </span>
                <span style={{ color: '#444', fontSize: '11px', flexShrink: 0 }}>
                  {formatTime(convo.created_at)}
                </span>
              </div>
              <div style={{ color: '#555', fontSize: '12px', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {convo.content}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#7ab3d4', flexShrink: 0 }}></div>
                <span style={{ color: '#444', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {convo.trips?.origin} → {convo.trips?.destination}
                </span>
              </div>
            </div>

            <span style={{ color: '#333', fontSize: '16px' }}>›</span>
          </div>
        ))}
      </div>

      {/* Bottom nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#111', borderTop: '0.5px solid #222', display: 'flex', padding: '8px 0' }}>
        {[
          { icon: '🏠', label: 'Feed', path: '/feed' },
          { icon: '➕', label: 'Post', path: '/post' },
          { icon: '💬', label: 'DMs', path: '/dms' },
          { icon: 'ℹ️', label: 'About', path: '/about' },
          { icon: '👤', label: 'Profile', path: '/profile' },
        ].map((item, i) => (
          <div key={i} onClick={() => router.push(item.path)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer' }}>
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            <span style={{ fontSize: '9px', color: i === 2 ? '#c8b86a' : '#444' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}