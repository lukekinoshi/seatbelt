'use client'
import { useRouter } from 'next/navigation'

export default function AboutPage() {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: '#111', color: '#e0e0e0', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif', paddingBottom: '80px' }}>

      <div style={{ background: '#111', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '0.5px solid #222', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '22px' }}>←</button>
        <span style={{ color: '#e0e0e0', fontSize: '17px', fontWeight: '600', letterSpacing: '1px' }}>About SeatBelt</span>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 20px' }}>

        <div style={{ marginBottom: '48px' }}>
          <div style={{ fontSize: '11px', color: '#555', letterSpacing: '3px', marginBottom: '16px' }}>OUR MISSION</div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#e0e0e0', lineHeight: 1.4, marginBottom: '20px' }}>
            To build the most community-driven transportation platform in America.
          </h1>
          <div style={{ width: '40px', height: '2px', background: '#c8b86a', marginBottom: '24px' }}></div>
          <p style={{ color: '#777', fontSize: '15px', lineHeight: 1.8 }}>
            SeatBelt was born from a simple idea in Brooklyn, New York. If someone was already driving from Coney Island to Downtown Brooklyn, why not offer a neighbor a seat for a fraction of what traditional rideshare would charge?
          </p>
        </div>

        <div style={{ background: '#1a1a1a', borderRadius: '16px', padding: '24px', border: '0.5px solid #2a2a2a', marginBottom: '32px' }}>
          <div style={{ fontSize: '11px', color: '#555', letterSpacing: '3px', marginBottom: '16px' }}>THE STORY</div>
          <p style={{ color: '#888', fontSize: '14px', lineHeight: 1.9, marginBottom: '16px' }}>
            We watched rideshare companies grow into billion-dollar corporations while the drivers who built them struggled to make minimum wage — and the riders who depended on them faced prices they couldn't afford.
          </p>
          <p style={{ color: '#888', fontSize: '14px', lineHeight: 1.9, marginBottom: '16px' }}>
            We saw a better way. What if the ride was already happening? What if a driver heading downtown could simply offer a seat to someone who needed it — at a price they agreed on together, person to person, with no corporate middleman taking a cut?
          </p>
          <p style={{ color: '#c8b86a', fontSize: '14px', lineHeight: 1.9, fontStyle: 'italic' }}>
            "No surge pricing. No app tax. No algorithm. Just neighbors helping neighbors get where they need to go."
          </p>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <div style={{ fontSize: '11px', color: '#555', letterSpacing: '3px', marginBottom: '24px' }}>WHAT WE STAND FOR</div>
          {[
            { icon: '🤝', title: 'Community First', desc: 'Every feature we build puts the community before the corporation. SeatBelt exists to serve the people who use it — not investors.' },
            { icon: '💰', title: 'Economic Empowerment', desc: 'We believe everyone deserves a path to income. If you have a car and a route, you can earn on SeatBelt — no resume, no interview, no boss.' },
            { icon: '⚖️', title: 'Fair Pricing Always', desc: 'We will never implement surge pricing. Prices are set by humans — drivers and riders — through honest conversation. The way it should be.' },
            { icon: '🏘️', title: 'Built for Real Communities', desc: 'SeatBelt is built specifically for urban communities that have been underserved and overcharged by the rideshare industry for too long.' },
            { icon: '🔒', title: 'Safety & Trust', desc: 'Every user is verified. Every ride is tracked. Every transaction is processed securely in-app. Your safety is non-negotiable.' },
          ].map((value, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '28px', alignItems: 'flex-start' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#1a1a1a', border: '0.5px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                {value.icon}
              </div>
              <div>
                <div style={{ color: '#e0e0e0', fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>{value.title}</div>
                <div style={{ color: '#666', fontSize: '13px', lineHeight: 1.7 }}>{value.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: '#1a1a1a', borderRadius: '16px', padding: '24px', border: '0.5px solid #2a2a2a', marginBottom: '32px' }}>
          <div style={{ fontSize: '11px', color: '#555', letterSpacing: '3px', marginBottom: '16px' }}>FOUNDER</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#2a2a2a', border: '0.5px solid #444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', color: '#aaa' }}>LK</div>
            <div>
              <div style={{ color: '#e0e0e0', fontSize: '16px', fontWeight: '600' }}>Lookman Kinoshi</div>
              <div style={{ color: '#555', fontSize: '12px' }}>Founder & CEO · Brooklyn, New York</div>
            </div>
          </div>
          <p style={{ color: '#777', fontSize: '13px', lineHeight: 1.8 }}>
            Lookman built SeatBelt from a genuine frustration — watching his community pay too much for rides while drivers earned too little. He believes the best solutions come from the people who live the problem every day, and that technology should serve communities, not extract from them.
          </p>
        </div>

        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <p style={{ color: '#555', fontSize: '14px', marginBottom: '20px' }}>Ready to be part of the movement?</p>
          <button onClick={() => router.push('/login')} style={{ background: '#c8b86a', color: '#111', border: 'none', borderRadius: '10px', padding: '14px 32px', fontSize: '14px', fontWeight: '700', letterSpacing: '1px', cursor: 'pointer' }}>
            JOIN SEATBELT
          </button>
        </div>
      </div>

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