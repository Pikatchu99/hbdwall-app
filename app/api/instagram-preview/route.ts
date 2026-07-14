import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url || !url.includes('instagram.com')) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      },
      next: { revalidate: 3600 },
    })
    const html = await res.text()

    const rawImage = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1] ?? null
    const description = html.match(/<meta property="og:description" content="([^"]+)"/)?.[1] ?? null
    const cleanImage = rawImage?.replace(/&amp;/g, '&') ?? null
    const image = cleanImage ? `/api/instagram-image?url=${encodeURIComponent(cleanImage)}` : null

    return NextResponse.json({ image, description })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
