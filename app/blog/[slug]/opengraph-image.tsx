import { ImageResponse } from 'next/og'
import { getAllSlugs, getPostBySlug } from '@/lib/blog'

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

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  const title = post?.title ?? 'Blog'
  // Long titles get a smaller type size so they stay inside the canvas.
  const titleSize = title.length > 70 ? 52 : title.length > 45 ? 62 : 72

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '80px',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #312e81 100%)',
        color: 'white',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 28, opacity: 0.7, marginBottom: 40 }}>bshastry.github.io/blog</div>
        <div style={{ fontSize: titleSize, fontWeight: 800, lineHeight: 1.1 }}>{title}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 32, opacity: 0.92 }}>Bhargava Shastry</div>
        <div style={{ fontSize: 28, opacity: 0.7 }}>{post ? formatDate(post.date) : ''}</div>
      </div>
    </div>,
    { ...size },
  )
}
