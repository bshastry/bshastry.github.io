import { ImageResponse } from 'next/og'

// Note: intentionally NOT declaring `export const runtime = 'edge'`.
// With `output: 'export'` (static export), declaring the edge runtime
// causes `next build` to error. `next/og` works at build time in the
// default Node runtime when the static export target is set.

export const alt = 'Bhargava Shastry — Security Engineer & Researcher'
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
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #312e81 100%)',
        color: 'white',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ fontSize: 28, opacity: 0.7, marginBottom: 24 }}>bshastry.github.io</div>
      <div style={{ fontSize: 82, fontWeight: 800, lineHeight: 1.05, marginBottom: 24 }}>
        Bhargava Shastry
      </div>
      <div style={{ fontSize: 42, opacity: 0.92, marginBottom: 12 }}>
        Security Engineer &amp; Researcher
      </div>
      <div style={{ fontSize: 28, opacity: 0.7, maxWidth: 900 }}>
        Ethereum Foundation · Smart contract security · Fuzzing · Blockchain
      </div>
    </div>,
    { ...size },
  )
}
