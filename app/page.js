import Link from 'next/link';
import { getPosts } from '../lib/supabase';
import { getSiteConfig } from '../config/site.config';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || '';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function getCategoryColor(cat) {
  const map = {
    'govt-jobs': 'green',
    'upsc-ssc': 'red',
    'private-jobs': 'blue',
    'career-tips': 'purple',
  };
  return map[cat] || '';
}

function getCategoryLabel(cat, categories) {
  return categories.find((c) => c.slug === cat)?.name || cat;
}

export const revalidate = 60;

export default async function HomePage() {
  const config = getSiteConfig();
  let posts = [];

  try {
    posts = await getPosts({ limit: 20 });
  } catch (err) {
    console.error('HomePage fetch error:', err.message);
  }

  const featuredPost = posts[0] || null;
  const latestPosts = posts.slice(1, 6);
  const govtPosts = posts.filter((p) => p.category === 'govt-jobs').slice(0, 5);
  const upscPosts = posts.filter((p) => p.category === 'upsc-ssc').slice(0, 5);
  const privatePosts = posts.filter((p) => p.category === 'private-jobs').slice(0, 5);
  const careerPosts = posts.filter((p) => p.category === 'career-tips').slice(0, 5);

  const recentAll = posts.slice(0, 10);

  const byDesignation = [
    'Apprentice', 'Management Trainee', 'Trainee', 'Assistant', 'Engineer',
    'Manager', 'Professor', 'Young Professional', 'Senior Resident', 'Medical Officer',
  ];

  const byQualification = [
    '12th Pass', '10th Pass', 'ITI', 'Degree', 'Post Graduate',
    'Diploma', 'B.E/B.Tech', 'Engineering', 'M.E/M.Tech', 'MBBS',
  ];

  const byLocation = [
    'Across India', 'Delhi', 'Kolkata', 'Mumbai', 'Hyderabad',
    'Patna', 'Chennai', 'Guwahati', 'Noida', 'Thiruvananthapuram',
  ];

  if (posts.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h2>No Job Alerts Yet</h2>
          <p>
            The site is set up and ready. Run the cron job to fetch the latest sarkari naukri news
            and generate AI-powered articles.
          </p>
          <p className="text-muted" style={{ marginBottom: '12px', fontSize: '13px' }}>
            Trigger manually:
          </p>
          <code className="empty-cron-url">
            {SITE_URL}/api/cron?secret={'{CRON_SECRET}'}
          </code>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Search */}
      <div className="hero-search-bar">
        <div className="container">
          <h1>Free Job Alert 2026: Search The Latest Sarkari Naukri</h1>
          <div className="hero-search-form">
            <input
              className="hero-search-input"
              type="text"
              placeholder="E.G. UPSC, SSC, RAILWAY, B.TECH, 10TH..."
              readOnly
            />
            <Link href="/search" className="hero-search-btn-submit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </Link>
          </div>
          <p className="hero-welcome">
            Welcome to <strong>{config.siteName}</strong> — your one-stop destination for{' '}
            <strong>Sarkari Naukri 2026</strong> updates from top government organisations.
            Whether you are a fresh graduate or experienced professional, we have got you covered.
          </p>
        </div>
      </div>

      <div className="container">
        <div className="page-grid">
          {/* Main Content */}
          <div>
            {/* Latest Posts Section */}
            <div className="section-block">
              <div className="section-header">
                <span className="section-title" style={{ color: 'var(--link)' }}>LATEST JOB ALERTS</span>
                <Link href="/category/govt-jobs" className="section-view-all">View All</Link>
              </div>

              {featuredPost && (
                <Link href={`/${featuredPost.slug}`} style={{ display: 'block' }}>
                  <div className="hero-card">
                    {featuredPost.cover_image && (
                      <img
                        src={featuredPost.cover_image}
                        alt={featuredPost.cover_image_alt || featuredPost.title}
                        className="hero-card-img"
                      />
                    )}
                    <div className="hero-card-body">
                      <span className={`cat-badge ${featuredPost.category}`}>
                        {getCategoryLabel(featuredPost.category, config.categories)}
                      </span>
                      <div className="hero-card-title">{featuredPost.title}</div>
                      <div className="hero-card-meta">
                        <span>{formatDate(featuredPost.published_at)}</span>
                        <span>| {getCategoryLabel(featuredPost.category, config.categories)}</span>
                      </div>
                      {featuredPost.excerpt && (
                        <p className="hero-card-excerpt">{featuredPost.excerpt.substring(0, 180)}...</p>
                      )}
                    </div>
                  </div>
                </Link>
              )}

              <div className="post-list">
                {latestPosts.map((post) => (
                  <Link key={post.id} href={`/${post.slug}`} style={{ display: 'block' }}>
                    <div className="post-list-item">
                      {post.cover_image && (
                        <img
                          src={post.cover_image}
                          alt={post.cover_image_alt || post.title}
                          className="post-list-thumb"
                        />
                      )}
                      <div className="post-list-content">
                        <div className="post-list-title">{post.title}</div>
                        <div className="post-list-meta">
                          <span>{formatDate(post.published_at)}</span>
                          <span>| {getCategoryLabel(post.category, config.categories)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Govt Jobs Section */}
            {govtPosts.length > 0 && (
              <div className="section-block">
                <div className="section-header green">
                  <span className="section-title green">GOVT JOBS</span>
                  <Link href="/category/govt-jobs" className="section-view-all">View All</Link>
                </div>
                {govtPosts[0] && (
                  <Link href={`/${govtPosts[0].slug}`} style={{ display: 'block' }}>
                    <div className="hero-card">
                      {govtPosts[0].cover_image && (
                        <img src={govtPosts[0].cover_image} alt={govtPosts[0].title} className="hero-card-img" />
                      )}
                      <div className="hero-card-body">
                        <div className="hero-card-title" style={{ color: 'var(--cat-govt)' }}>
                          {govtPosts[0].title}
                        </div>
                        <div className="hero-card-meta">
                          <span>{formatDate(govtPosts[0].published_at)}</span>
                        </div>
                        {govtPosts[0].excerpt && (
                          <p className="hero-card-excerpt">{govtPosts[0].excerpt.substring(0, 160)}...</p>
                        )}
                      </div>
                    </div>
                  </Link>
                )}
                <div className="post-list">
                  {govtPosts.slice(1).map((post) => (
                    <Link key={post.id} href={`/${post.slug}`} style={{ display: 'block' }}>
                      <div className="post-list-item">
                        {post.cover_image && (
                          <img src={post.cover_image} alt={post.title} className="post-list-thumb" />
                        )}
                        <div className="post-list-content">
                          <div className="post-list-title">{post.title}</div>
                          <div className="post-list-meta">{formatDate(post.published_at)} | Govt Jobs</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* UPSC & SSC Section */}
            {upscPosts.length > 0 && (
              <div className="section-block">
                <div className="section-header" style={{ borderTopColor: 'var(--cat-upsc)' }}>
                  <span className="section-title red">UPSC & SSC</span>
                  <Link href="/category/upsc-ssc" className="section-view-all">View All</Link>
                </div>
                <div className="post-list">
                  {upscPosts.map((post) => (
                    <Link key={post.id} href={`/${post.slug}`} style={{ display: 'block' }}>
                      <div className="post-list-item">
                        {post.cover_image && (
                          <img src={post.cover_image} alt={post.title} className="post-list-thumb" />
                        )}
                        <div className="post-list-content">
                          <div className="post-list-title">{post.title}</div>
                          <div className="post-list-meta">{formatDate(post.published_at)} | UPSC & SSC</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* IT / Private Jobs */}
            {privatePosts.length > 0 && (
              <div className="section-block">
                <div className="section-header blue">
                  <span className="section-title blue">PRIVATE JOBS</span>
                  <Link href="/category/private-jobs" className="section-view-all">View All</Link>
                </div>
                {privatePosts[0] && (
                  <Link href={`/${privatePosts[0].slug}`} style={{ display: 'block' }}>
                    <div className="hero-card">
                      {privatePosts[0].cover_image && (
                        <img src={privatePosts[0].cover_image} alt={privatePosts[0].title} className="hero-card-img" />
                      )}
                      <div className="hero-card-body">
                        <div className="hero-card-title" style={{ color: 'var(--cat-private)' }}>
                          {privatePosts[0].title}
                        </div>
                        <div className="hero-card-meta">{formatDate(privatePosts[0].published_at)}</div>
                        {privatePosts[0].excerpt && (
                          <p className="hero-card-excerpt">{privatePosts[0].excerpt.substring(0, 160)}...</p>
                        )}
                      </div>
                    </div>
                  </Link>
                )}
                <div className="post-list">
                  {privatePosts.slice(1).map((post) => (
                    <Link key={post.id} href={`/${post.slug}`} style={{ display: 'block' }}>
                      <div className="post-list-item">
                        {post.cover_image && (
                          <img src={post.cover_image} alt={post.title} className="post-list-thumb" />
                        )}
                        <div className="post-list-content">
                          <div className="post-list-title">{post.title}</div>
                          <div className="post-list-meta">{formatDate(post.published_at)} | Private Jobs</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Vacancies — real posts from UPSC/SSC + Govt Jobs categories */}
            {upscPosts.length + govtPosts.length > 0 && (
              <div className="section-block">
                <div className="section-header" style={{ borderTopColor: 'var(--secondary)' }}>
                  <span className="section-title">LATEST VACANCY UPDATES</span>
                </div>
                <div className="vacancy-list">
                  {[...upscPosts, ...govtPosts].slice(0, 5).map((post) => (
                    <div key={post.id} className="vacancy-item">
                      <div className="vacancy-org">{getCategoryLabel(post.category, config.categories)}</div>
                      <Link href={`/${post.slug}`} className="vacancy-title">{post.title}</Link>
                      {post.excerpt && <div className="vacancy-meta">{post.excerpt}</div>}
                      <div className="vacancy-footer">
                        <span className="vacancy-date">{formatDate(post.published_at)}</span>
                        <Link href={`/${post.slug}`} className="apply-btn">Read More</Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="sidebar">
            {/* Jobs by Designation */}
            <div className="sidebar-widget">
              <div className="sidebar-widget-title" style={{ borderTopColor: 'var(--cat-career)' }}>
                Jobs by Designation
              </div>
              <ul className="sidebar-list">
                {byDesignation.map((d) => (
                  <li key={d} className="sidebar-list-item">
                    <Link href={`/search?q=${encodeURIComponent(d)}`}>{d}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Jobs by Qualification */}
            <div className="sidebar-widget">
              <div className="sidebar-widget-title" style={{ borderTopColor: 'var(--cat-career)' }}>
                Jobs by Qualification
              </div>
              <ul className="sidebar-list">
                {byQualification.map((q) => (
                  <li key={q} className="sidebar-list-item">
                    <Link href={`/search?q=${encodeURIComponent(q)}`}>{q}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Jobs by Location */}
            <div className="sidebar-widget">
              <div className="sidebar-widget-title" style={{ borderTopColor: 'var(--link)' }}>
                Jobs by Location
              </div>
              <ul className="sidebar-list">
                {byLocation.map((loc) => (
                  <li key={loc} className="sidebar-list-item">
                    <Link href={`/search?q=${encodeURIComponent(loc)}`}>{loc}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Subscribe Widget */}
            <div className="subscribe-widget">
              <h3 className="subscribe-title">Subscribe for Job Alerts</h3>
              <p className="subscribe-subtitle">
                Join our mailing list to receive the latest news and updates from {config.domain}.
              </p>
              <div className="subscribe-form">
                <label className="subscribe-field-label">Name</label>
                <input className="subscribe-input" type="text" placeholder="Your name" />
                <label className="subscribe-field-label">Email *</label>
                <input className="subscribe-input" type="email" placeholder="your@email.com" />
                <button className="subscribe-submit">SUBSCRIBE</button>
              </div>
            </div>

            {/* Recent Posts */}
            <div className="sidebar-widget">
              <div className="sidebar-widget-title">Recent Articles</div>
              <ul className="sidebar-list">
                {recentAll.slice(0, 8).map((post) => (
                  <li key={post.id} className="sidebar-list-item">
                    <Link href={`/${post.slug}`}>
                      <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '3px' }}>
                        {post.title.substring(0, 70)}{post.title.length > 70 ? '...' : ''}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {formatDate(post.published_at)}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div className="sidebar-widget">
              <div className="sidebar-widget-title">Categories</div>
              <ul className="sidebar-list">
                {config.categories.map((cat) => (
                  <li key={cat.slug} className="sidebar-list-item">
                    <Link href={`/category/${cat.slug}`} style={{ color: cat.color, fontWeight: 600 }}>
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
