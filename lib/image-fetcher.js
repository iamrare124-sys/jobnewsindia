import { getSiteConfig } from '../config/site.config';

async function fetchFromPexels(query) {
  const key = process.env.PEXELS_API_KEY;
  if (!key || key === 'your_pexels_key') return null;

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
      { headers: { Authorization: key }, signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) throw new Error(`Pexels HTTP ${res.status}`);
    const data = await res.json();
    const photos = data.photos || [];
    if (photos.length === 0) return null;
    const photo = photos[Math.floor(Math.random() * Math.min(photos.length, 3))];
    return {
      url: photo.src.large,
      alt: photo.alt || query,
    };
  } catch (err) {
    console.error('Pexels error:', err.message);
    return null;
  }
}

async function fetchFromUnsplash(query) {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key || key === 'your_unsplash_key') return null;

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
      {
        headers: { Authorization: `Client-ID ${key}` },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) throw new Error(`Unsplash HTTP ${res.status}`);
    const data = await res.json();
    const results = data.results || [];
    if (results.length === 0) return null;
    const photo = results[Math.floor(Math.random() * Math.min(results.length, 3))];
    return {
      url: photo.urls.regular,
      alt: photo.alt_description || query,
    };
  } catch (err) {
    console.error('Unsplash error:', err.message);
    return null;
  }
}

function getFallbackImage(category) {
  const fallbacks = {
    'govt-jobs':    'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?w=800',
    'upsc-ssc':     'https://images.pexels.com/photos/4778611/pexels-photo-4778611.jpeg?w=800',
    'private-jobs': 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?w=800',
    'career-tips':  'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?w=800',
  };
  return {
    url: fallbacks[category] || fallbacks['govt-jobs'],
    alt: 'Job opportunity in India',
  };
}

export async function fetchImage(category, title) {
  const categoryQueries = {
    'govt-jobs':    'government office india job',
    'upsc-ssc':     'exam study india government',
    'private-jobs': 'office professional india work',
    'career-tips':  'career growth india professional',
  };
  const query = categoryQueries[category] || 'job interview india office';

  const pexels = await fetchFromPexels(query);
  if (pexels) return pexels;

  const unsplash = await fetchFromUnsplash(query);
  if (unsplash) return unsplash;

  return getFallbackImage(category);
}
