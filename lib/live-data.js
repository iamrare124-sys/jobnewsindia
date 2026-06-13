import { getSiteConfig } from '../config/site.config';
import { getPosts } from './supabase';

// Ticker shows REAL counts derived from published posts (no fabricated numbers)
export async function getLiveData() {
  try {
    const posts = await getPosts({ limit: 100 });
    const total = posts.length;
    const govt = posts.filter((p) => p.category === 'govt-jobs').length;
    const upscSsc = posts.filter((p) => p.category === 'upsc-ssc').length;
    const privateJobs = posts.filter((p) => p.category === 'private-jobs').length;

    const items = [];
    if (total > 0) items.push({ label: 'Job Alerts Published', value: String(total) });
    if (govt > 0) items.push({ label: 'Govt Job Posts', value: String(govt) });
    if (upscSsc > 0) items.push({ label: 'UPSC/SSC Updates', value: String(upscSsc) });
    if (privateJobs > 0) items.push({ label: 'Private Job Alerts', value: String(privateJobs) });

    return items;
  } catch (err) {
    console.error('getLiveData error:', err.message);
    return [];
  }
}

export function formatTickerItems(items) {
  return items.map((s) => {
    const changeStr = s.change
      ? ` ${s.change.startsWith('+') ? '\u25b2' : '\u25bc'} ${s.change}`
      : '';
    return `${s.label}: ${s.value}${changeStr}`;
  });
}
