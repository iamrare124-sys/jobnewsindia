import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabase';
import { verifyApiPassword } from '../../../lib/security';
import { getSiteConfig } from '../../../config/site.config';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  if (!verifyApiPassword(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const config = getSiteConfig();

  try {
    const supabase = getSupabaseAdmin();
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, excerpt, meta_description, content')
      .or('excerpt.is.null,excerpt.eq.');

    if (error) throw error;

    let fixed = 0;
    for (const post of posts || []) {
      let content = post.content;
      if (typeof content === 'string') {
        try { content = JSON.parse(content); } catch {}
      }

      const excerpt =
        post.meta_description ||
        content?.sections?.[0]?.body?.substring(0, 160) ||
        content?.rawContent?.substring(0, 160) ||
        `${post.title} — ${config.tagline}`;

      await supabase
        .from('posts')
        .update({ excerpt: excerpt.substring(0, 160) })
        .eq('id', post.id);

      fixed++;
    }

    return NextResponse.json({ fixed, total: posts?.length || 0 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
