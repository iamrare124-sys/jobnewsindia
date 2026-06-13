import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPosts, getTotalCount } from '../../../lib/supabase';
import { getSiteConfig } from '../../../config/site.config';

export const revalidate = 300;

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export async function generateMetadata({ params }) {
  const config = getSiteConfig();
  const cat = config.categories.find((c) => c.slug === params.category);
  if (!cat) return { title: 'Not Found' };

  return {
    title: `${cat.name} | ${config.siteName}`,
    description: `Latest ${cat.name.toLowerCase()} notifications, recruitment alerts and career updates on ${config.siteName}.`,
    alternates: { canonical: `${config.siteUrl}/category/${params.category}` },
  };
}

export default async function CategoryPage({ params, searchParams }) {
  const config = getSiteConfig();
  const cat = config.categories.find((c) => c.slug === params.category);
  if (!cat) notFound();

  const page = parseInt(searchParams?.page || '1');
  const LIMIT = 12;
  const offset = (page - 1) * LIMIT;

  let posts = [];
  let total = 0;

  try {
    [posts, total] = await Promise.all([
      getPosts({ limit: LIMIT, offset, category: params.category }),
      getTotalCount(params.category),
    ]);
  } catch (err) {
    console.error('CategoryPage fetch error:', err.message);
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <>
      <div className="cat-page-header" style={{ background: cat.color }}>
        <div className="container">
          <h1 className="cat-page-title">{cat.name}</h1>
          <p className="cat-page-desc">
            Latest {cat.name.toLowerCase()} notifications, recruitment alerts and career updates for Indian job seekers.
          </p>
        </div>
      </div>

      <div className="container">
        <div className="page-grid">
          <div>
            {/* Breadcrumb */}
            <nav className="breadcrumb" style={{ padding: '12px 0', background: 'none' }}>
              <Link href="/">Home</Link>
              <span className="breadcrumb-sep">»</span>
              <span>{cat.name}</span>
            </nav>

            {posts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <h2>No articles yet in {cat.name}</h2>
                <p>Check back soon — new job alerts are published daily.</p>
                <Link href="/" className="error-home-btn">Back to Home</Link>
              </div>
            ) : (
              <>
                <div className="posts-grid" style={{ boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}>
                  {posts.map((post) => (
                    <Link key={post.id} href={`/${post.slug}`} style={{ display: 'block' }}>
                      <div className="post-card">
                        {post.cover_image && (
                          <img src={post.cover_image} alt={post.cover_image_alt || post.title} className="post-card-img" />
                        )}
                        <div className="post-card-body">
                          <div className="post-card-category">{cat.name}</div>
                          <div className="post-card-title">{post.title}</div>
                          <div className="post-card-meta">{formatDate(post.published_at)}</div>
                          {post.excerpt && (
                            <p className="post-card-excerpt">{post.excerpt}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    {page > 1 && (
                      <Link
                        href={`/category/${params.category}?page=${page - 1}`}
                        className="page-btn"
                      >
                        ← Prev
                      </Link>
                    )}
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const p = i + 1;
                      return (
                        <Link
                          key={p}
                          href={`/category/${params.category}?page=${p}`}
                          className={`page-btn ${p === page ? 'active' : ''}`}
                        >
                          {p}
                        </Link>
                      );
                    })}
                    {page < totalPages && (
                      <Link
                        href={`/category/${params.category}?page=${page + 1}`}
                        className="page-btn"
                      >
                        Next →
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="sidebar">
            <div className="sidebar-widget">
              <div className="sidebar-widget-title">All Categories</div>
              <ul className="sidebar-list">
                {config.categories.map((c) => (
                  <li key={c.slug} className="sidebar-list-item">
                    <Link
                      href={`/category/${c.slug}`}
                      style={{ color: c.color, fontWeight: c.slug === params.category ? 700 : 500 }}
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="sidebar-widget">
              <div className="sidebar-widget-title">Quick Searches</div>
              <ul className="sidebar-list">
                {['UPSC 2026', 'SSC CGL', 'Railway Jobs', 'Bank Jobs', 'Defence Jobs', 'Teaching Jobs'].map((q) => (
                  <li key={q} className="sidebar-list-item">
                    <Link href={`/search?q=${encodeURIComponent(q)}`}>{q}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="subscribe-widget">
              <h3 className="subscribe-title" style={{ fontSize: '16px' }}>Job Alerts</h3>
              <p className="subscribe-subtitle">Get {cat.name} alerts in your inbox.</p>
              <div className="subscribe-form">
                <label className="subscribe-field-label">Email *</label>
                <input className="subscribe-input" type="email" placeholder="your@email.com" />
                <button className="subscribe-submit">SUBSCRIBE</button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
