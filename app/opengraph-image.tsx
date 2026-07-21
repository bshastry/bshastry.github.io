import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'
// Note: intentionally NOT declaring `export const runtime = 'edge'`.
// With `output: 'export'` (static export), declaring the edge runtime
// causes `next build` to error. `next/og` works at build time in the
// default Node runtime when the static export target is set.

export const alt = 'Bhargava Shastry — Differential Testing & Protocol Security'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px',
        backgroundColor: '#0a0a0a',
        backgroundImage:
          'radial-gradient(circle at 82% 18%, rgba(59, 130, 246, 0.22), transparent 30%)',
        color: '#ededed',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          color: '#6ea8fe',
          fontSize: 22,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          marginBottom: 32,
        }}
      >
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: 999,
            background: '#6ea8fe',
          }}
        />
        Differential testing · critical systems
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: 84,
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: '-0.04em',
        }}
      >
        Bhargava <span style={{ color: '#6ea8fe', marginLeft: 18 }}>Shastry</span>
      </div>
      <div
        style={{ fontSize: 38, lineHeight: 1.25, color: '#b8b8b8', maxWidth: 930, marginTop: 34 }}
      >
        Turning disagreement between independent implementations into reproducible evidence.
      </div>
      <div style={{ display: 'flex', gap: 14, marginTop: 42 }}>
        {['Ethereum clients', 'Cryptographic libraries', 'Compilers'].map((label) => (
          <div
            key={label}
            style={{
              display: 'flex',
              border: '1px solid #2e2e2e',
              borderRadius: 8,
              padding: '10px 16px',
              color: '#8a8a8a',
              fontSize: 20,
            }}
          >
            {label}
          </div>
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: '1px solid #242424',
          paddingTop: 24,
          marginTop: 42,
          color: '#777',
          fontSize: 19,
        }}
      >
        <span>Security Engineer · Ethereum Foundation</span>
        <span>bshastry.github.io</span>
      </div>
    </div>,
    { ...size },
  )
}
