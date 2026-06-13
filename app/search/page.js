'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function SearchInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      doSearch(initialQuery);
    }
  }, [initialQuery]);

  async function doSearch(q) {
    if (!q || q.trim().length < 2) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const q = inputValue.trim();
    if (!q) return;
    setQuery(q);
    router.push(`/search?q=${encodeURIComponent(q)}`, { scroll: false });
    doSearch(q);
  }

  const popularSearches = [
    'UPSC 2026', 'SSC CGL', 'Railway Jobs', 'Bank Jobs',
    'Defence Jobs', 'Teaching Jobs', 'Engineering Jobs', 'Medical Jobs',
  ];

  return (
    <div className="search-page">
      <h1 className="search-page-title">Search Job Alerts</h1>

      <form onSubmit={handleSubmit}>
        <div className="search-box-wrap">
          <input
            className="search-box-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search UPSC, SSC, Railway, Bank Jobs..."
            autoFocus
          />
          <button type="submit" className="search-box-submit">
            Search
          </button>
        </div>
      </form>

      {/* Popular Searches */}
      {!searched && (
        <div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Popular Searches:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
            {popularSearches.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setInputValue(s);
                  setQuery(s);
                  router.push(`/search?q=${encodeURIComponent(s)}`, { scroll: false });
                  doSearch(s);
                }}
                className="tag-chip"
                style={{ cursor: 'pointer' }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ background: '#fff', padding: '16px', marginBottom: '1px' }}>
              <div className="sk sk-title" />
              <div className="sk sk-text" />
              <div className="sk sk-text-sm" />
            </div>
          ))}
        </div>
      )}

      {!loading && searched && (
        <>
          <p className="search-results-count">
            {results.length > 0
              ? `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`
              : `No results found for "${query}"`}
          </p>

          {results.length === 0 ? (
            <div className="search-empty">
              <div className="search-empty-icon">🔍</div>
              <h3>No results found</h3>
              <p>Try different keywords or browse our categories.</p>
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {['Govt Jobs', 'UPSC & SSC', 'Private Jobs', 'Career Tips'].map((cat, i) => {
                  const slugs = ['govt-jobs', 'upsc-ssc', 'private-jobs', 'career-tips'];
                  return (
                    <Link key={cat} href={`/category/${slugs[i]}`} className="cat-badge" style={{
                      background: ['#1a6b3a','#c0392b','#2471a3','#7d3c98'][i],
                      padding: '8px 16px',
                      fontSize: '13px',
                    }}>
                      {cat}
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ background: 'var(--bg-white)', boxShadow: 'var(--shadow-sm)' }}>
              {results.map((post) => (
                <Link key={post.id} href={`/${post.slug}`} style={{ display: 'block' }}>
                  <div className="post-list-item">
                    {post.cover_image && (
                      <img src={post.cover_image} alt={post.title} className="post-list-thumb" />
                    )}
                    <div className="post-list-content">
                      <div className="post-list-title">{post.title}</div>
                      <div className="post-list-meta">
                        <span>{formatDate(post.published_at)}</span>
                        <span>| {post.category?.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</span>
                      </div>
                      {post.excerpt && (
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {post.excerpt.substring(0, 120)}...
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="search-page">
        <div className="sk sk-title" style={{ height: '32px', width: '200px', marginBottom: '16px' }} />
        <div className="sk" style={{ height: '48px', maxWidth: '580px', marginBottom: '24px', borderRadius: '6px' }} />
      </div>
    }>
      <SearchInner />
    </Suspense>
  );
}
