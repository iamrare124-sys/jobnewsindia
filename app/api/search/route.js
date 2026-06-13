import { NextResponse } from 'next/server';
import { searchPosts } from '../../../lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') || '';
  const limit = parseInt(url.searchParams.get('limit') || '20');

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [], query: '' });
  }

  try {
    const results = await searchPosts(query.trim(), Math.min(limit, 50));
    return NextResponse.json({ results, query });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
