import { NextResponse } from 'next/server';
import { verifyApiPassword } from '../../../lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const key = process.env.INDEX_NOW_KEY;
  if (!key) {
    return NextResponse.json({ error: 'INDEX_NOW_KEY not set' }, { status: 400 });
  }
  // Serve key file for IndexNow verification
  return new Response(key, {
    headers: { 'Content-Type': 'text/plain' },
  });
}

export async function POST(request) {
  if (!verifyApiPassword(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { urls } = await request.json();
    const key = process.env.INDEX_NOW_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!key || !siteUrl) {
      return NextResponse.json({ error: 'Missing INDEX_NOW_KEY or SITE_URL' }, { status: 400 });
    }

    const host = new URL(siteUrl).hostname;

    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host,
        key,
        keyLocation: `${siteUrl}/${key}.txt`,
        urlList: urls,
      }),
    });

    return NextResponse.json({ status: res.status, submitted: urls.length });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
