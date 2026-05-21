import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0a0a0f 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative blobs */}
        <div
          style={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
            top: -100,
            left: -100,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, transparent 70%)',
            bottom: -100,
            right: -100,
          }}
        />

        {/* Badge */}
        <div
          style={{
            position: 'absolute',
            top: 40,
            right: 40,
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: 24,
            padding: '8px 16px',
            fontSize: 14,
            color: '#a78bfa',
            fontWeight: 500,
          }}
        >
          omniflowapp.ai
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            gap: 24,
          }}
        >
          {/* Logo/Title */}
          <h1
            style={{
              fontSize: 96,
              fontWeight: 900,
              margin: 0,
              color: 'white',
              textAlign: 'center',
              letterSpacing: '-2px',
            }}
          >
            Omniflow
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 32,
              color: '#d1d5db',
              margin: 0,
              textAlign: 'center',
              fontWeight: 400,
            }}
          >
            La plateforme #1 des agences OnlyFans
          </p>

          {/* Stats */}
          <div
            style={{
              display: 'flex',
              gap: 48,
              marginTop: 32,
              justifyContent: 'center',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#a78bfa' }}>50+</div>
              <div style={{ fontSize: 14, color: '#9ca3af', marginTop: 4 }}>Agences</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#22d3ee' }}>500+</div>
              <div style={{ fontSize: 14, color: '#9ca3af', marginTop: 4 }}>Modèles</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#a78bfa' }}>10k+</div>
              <div style={{ fontSize: 14, color: '#9ca3af', marginTop: 4 }}>Posts/mois</div>
            </div>
          </div>
        </div>

        {/* Bottom gradient bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            background: 'linear-gradient(90deg, #a855f7 0%, #22d3ee 100%)',
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
