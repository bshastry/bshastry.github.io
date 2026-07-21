import { ImageResponse } from 'next/og'
import { getAllSlugs, getAllPostsMeta } from '@/lib/blog'
import { formatDate } from '@/lib/format'

export const dynamic = 'force-static'

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}
// Note: intentionally NOT declaring `export const runtime = 'edge'` — see
// app/opengraph-image.tsx. `next/og` works at build time in the default
// Node runtime when the static export target is set.

export const alt = 'Blog post by Bhargava Shastry'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  // The image only needs title and date — frontmatter metadata is enough;
  // running the full markdown pipeline here would triple the build cost.
  const post = getAllPostsMeta().find((p) => p.slug === slug)
  const title = post?.title ?? 'Blog'
  // Long titles get a smaller type size so they stay inside the canvas.
  const titleSize = title.length > 70 ? 52 : title.length > 45 ? 62 : 72

  // Visual language matches the homepage OG card (app/opengraph-image.tsx):
  // near-black canvas, accent radial glow, accent eyebrow, footer rule.
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '80px',
        backgroundColor: '#0a0a0a',
        backgroundImage:
          'radial-gradient(circle at 82% 18%, rgba(59, 130, 246, 0.22), transparent 30%)',
        color: '#ededed',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            color: '#6ea8fe',
            fontSize: 22,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginBottom: 40,
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
          Blog
        </div>
        <div
          style={{
            fontSize: titleSize,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid #242424',
          paddingTop: 24,
          color: '#777',
          fontSize: 22,
        }}
      >
        <span style={{ color: '#b8b8b8', fontSize: 26 }}>Bhargava Shastry</span>
        <span>{post ? formatDate(post.date) : 'bshastry.github.io/blog'}</span>
      </div>
    </div>,
    { ...size },
  )
}
