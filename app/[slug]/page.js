import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getRelatedPosts } from '../../lib/supabase';
import { getSiteConfig } from '../../config/site.config';

export const revalidate = 3600;

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatISO(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString();
}

function getCategoryLabel(cat, categories) {
  return categories.find((c) => c.slug === cat)?.name || cat;
}

export async function generateMetadata({ params }) {
  const config = getSiteConfig();
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: 'Not Found' };

  const siteUrl = config.siteUrl;
  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      type: 'article',
      url: `${siteUrl}/${post.slug}`,
      images: post.cover_image ? [{ url: post.cover_image, alt: post.cover_image_alt || post.title }] : [],
      publishedTime: post.published_at,
      modifiedTime: post.updated_at || post.published_at,
      authors: [config.author.name],
      section: getCategoryLabel(post.category, config.categories),
      tags: post.tags || [],
      locale: 'en_IN',
      siteName: config.siteName,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      images: post.cover_image ? [post.cover_image] : [],
    },
    alternates: { canonical: `${siteUrl}/${post.slug}` },
  };
}

function renderContent(content) {
  // content is already parsed object or we parse it here
  if (!content) return null;

  // Object with sections
  if (typeof content === 'object' && content.sections && Array.isArray(content.sections)) {
    return content.sections.map((section, i) => (
      <div key={i} className={section.type === 'hook' ? '' : 'article-section'}>
        {section.heading && <h2>{section.heading}</h2>}
        {section.body && section.body.split('\n').filter((l) => l.trim()).map((line, j) => (
          <p key={j}>{line}</p>
        ))}
      </div>
    ));
  }

  // rawContent string fallback
  if (typeof content === 'object' && content.rawContent) {
    return content.rawContent.split('\n\n').filter((p) => p.trim()).map((para, i) => (
      <p key={i} style={{ fontSize: '15px', lineHeight: '1.75', marginBottom: '14px', color: 'var(--text)' }}>
        {para.trim()}
      </p>
    ));
  }

  // Plain string fallback
  if (typeof content === 'string') {
    return content.split('\n\n').filter((p) => p.trim()).map((para, i) => (
      <p key={i} style={{ fontSize: '15px', lineHeight: '1.75', marginBottom: '14px', color: 'var(--text)' }}>
        {para.trim()}
      </p>
    ));
  }

  return null;
}

export default async function ArticlePage({ params }) {
  const config = getSiteConfig();
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  // Parse content at top
  let content = post.content;
  if (typeof content === 'string') {
    try { content = JSON.parse(content); } catch {}
  }

  // Parse FAQ
  let faq = post.faq;
  if (typeof faq === 'string') {
    try { faq = JSON.parse(faq); } catch { faq = []; }
  }
  faq = Array.isArray(faq) ? faq : [];

  const siteUrl = config.siteUrl;
  const relatedPosts = await getRelatedPosts(post.category, post.slug, 4);
  const categoryLabel = getCategoryLabel(post.category, config.categories);
  const readTime = Math.max(3, Math.ceil((post.excerpt?.length || 500) / 200));

  // Structured Data
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    description: post.meta_description || post.excerpt,
    image: post.cover_image ? [post.cover_image] : [],
    datePublished: formatISO(post.published_at),
    dateModified: formatISO(post.updated_at || post.published_at),
    author: {
      '@type': 'Person',
      name: config.author.name,
      url: `${siteUrl}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: config.siteName,
      url: siteUrl,
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}/${post.slug}` },
    articleSection: categoryLabel,
    keywords: (post.tags || []).join(', '),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: categoryLabel, item: `${siteUrl}/category/${post.category}` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${siteUrl}/${post.slug}` },
    ],
  };

  const faqSchema = faq.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  } : null;

  return (
    <>
      {/* JSON-LD Schemas */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      {/* Reading Progress Bar */}
      <div className="progress-bar" id="progressBar" />

      <div className="container">
        <div className="page-grid">
          <article>
            {/* Article Header */}
            <div className="article-header">
              <nav className="breadcrumb" aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <span className="breadcrumb-sep">»</span>
                <Link href={`/category/${post.category}`}>{categoryLabel}</Link>
                <span className="breadcrumb-sep">»</span>
                <span>{post.title.substring(0, 50)}{post.title.length > 50 ? '...' : ''}</span>
              </nav>
              <h1 className="article-title">{post.title}</h1>
              <div className="article-meta">
                <span>📅 {formatDate(post.published_at)}</span>
                <span>
                  🏷️{' '}
                  <Link href={`/category/${post.category}`} style={{ color: 'var(--primary)' }}>
                    {categoryLabel}
                  </Link>
                </span>
                <span>✍️ {config.author.name}</span>
                <span>⏱️ {readTime} min read</span>
              </div>
            </div>

            {/* Article Actions */}
            <div className="article-actions">
              <button className="copy-link-btn" id="copyLinkBtn">
                🔗 Copy Link
              </button>
              <Link
                href={`/category/${post.category}`}
                className={`cat-badge ${post.category}`}
                style={{ display: 'inline-flex', alignItems: 'center' }}
              >
                {categoryLabel}
              </Link>
            </div>

            {/* Featured Image */}
            {post.cover_image && (
              <img
                src={post.cover_image}
                alt={post.cover_image_alt || post.title}
                className="article-featured-img"
              />
            )}

            {/* Article Body */}
            <div className="article-body">
              {renderContent(content)}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="article-tags">
                  {post.tags.map((tag) => (
                    <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`} className="tag-chip">
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* FAQ Section */}
            {faq.length > 0 && (
              <div className="faq-section">
                <h2 className="faq-title">Frequently Asked Questions</h2>
                {faq.map((item, i) => (
                  <div key={i} className="faq-item">
                    <div className="faq-q">Q: {item.question}</div>
                    <div className="faq-a">{item.answer}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Author Box */}
            <div className="author-box" style={{ margin: '0', borderTop: '1px solid var(--border-light)' }}>
              <div className="author-avatar">
                {config.author.name.charAt(0)}
              </div>
              <div className="author-info">
                <div className="author-name">{config.author.name}</div>
                <div className="author-title">{config.author.title}</div>
                <div className="author-bio">{config.author.bio}</div>
              </div>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="related-section">
                <div className="section-header">
                  <span className="section-title">RELATED JOB ALERTS</span>
                </div>
                <div className="related-grid">
                  {relatedPosts.map((rp) => (
                    <Link key={rp.id} href={`/${rp.slug}`} style={{ display: 'block' }}>
                      <div className="related-card">
                        {rp.cover_image && (
                          <img src={rp.cover_image} alt={rp.title} className="related-card-img" />
                        )}
                        <div className="related-card-title">{rp.title}</div>
                        <div className="related-card-meta">{formatDate(rp.published_at)}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="sidebar">
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

            <div className="sidebar-widget">
              <div className="sidebar-widget-title">Quick Links</div>
              <ul className="sidebar-list">
                {[
                  { label: 'UPSC 2026', href: '/search?q=UPSC+2026' },
                  { label: 'SSC CGL 2026', href: '/search?q=SSC+CGL' },
                  { label: 'Railway Jobs', href: '/search?q=Railway+Jobs' },
                  { label: 'Bank Jobs', href: '/search?q=Bank+Jobs' },
                  { label: 'State Govt Jobs', href: '/search?q=state+government+jobs' },
                  { label: 'IT Sector Jobs', href: '/search?q=IT+jobs+india' },
                ].map((item) => (
                  <li key={item.href} className="sidebar-list-item">
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="subscribe-widget" style={{ textAlign: 'left' }}>
              <h3 className="subscribe-title" style={{ fontSize: '16px', textAlign: 'center' }}>
                Get Job Alerts
              </h3>
              <p className="subscribe-subtitle">Never miss a sarkari naukri update.</p>
              <div className="subscribe-form">
                <label className="subscribe-field-label">Email *</label>
                <input className="subscribe-input" type="email" placeholder="your@email.com" />
                <button className="subscribe-submit">SUBSCRIBE FREE</button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Progress Bar + Copy Link JS */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var bar = document.getElementById('progressBar');
              if (bar) {
                window.addEventListener('scroll', function() {
                  var scrolled = window.scrollY;
                  var total = document.documentElement.scrollHeight - window.innerHeight;
                  bar.style.width = total > 0 ? (scrolled / total * 100) + '%' : '0%';
                });
              }
              var copyBtn = document.getElementById('copyLinkBtn');
              if (copyBtn) {
                copyBtn.addEventListener('click', function() {
                  navigator.clipboard.writeText(window.location.href).then(function() {
                    copyBtn.textContent = '✅ Copied!';
                    setTimeout(function() { copyBtn.textContent = '🔗 Copy Link'; }, 2000);
                  });
                });
              }
            })();
          `,
        }}
      />
    </>
  );
}
