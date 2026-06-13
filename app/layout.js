import './globals.css';
import Link from 'next/link';
import { getSiteConfig } from '../config/site.config';
import { getLiveData, formatTickerItems } from '../lib/live-data';
import MobileMenu from '../components/MobileMenu';
import CookieBanner from '../components/CookieBanner';

export async function generateMetadata() {
  const config = getSiteConfig();
  return {
    title: { default: config.siteName, template: `%s | ${config.siteName}` },
    description: config.description,
    metadataBase: new URL(config.siteUrl),
    alternates: { canonical: config.siteUrl },
    openGraph: {
      siteName: config.siteName,
      type: 'website',
      locale: 'en_IN',
    },
    twitter: { card: 'summary_large_image' },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      other: { 'msvalidate.01': process.env.BING_SITE_VERIFICATION },
    },
  };
}

export default async function RootLayout({ children }) {
  const config = getSiteConfig();
  const liveSymbols = await getLiveData();
  const tickerItems = formatTickerItems(liveSymbols);

  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID;
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  const hasGA4 = ga4Id && ga4Id !== 'G-XXXXXXXXXX' && ga4Id.startsWith('G-');
  const hasAdsense = adsenseId && adsenseId !== 'ca-pub-XXXXXXXXXXXXXXXX';

  return (
    <html lang="en-IN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700&family=Merriweather:wght@700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content={config.theme.primaryColor} />

        {hasGA4 && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ga4Id}');`,
              }}
            />
          </>
        )}
        {hasAdsense && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body>
        {/* Live Ticker */}
        {tickerItems.length > 0 && (
          <div className="ticker-bar">
            <span className="ticker-label">LIVE</span>
            <div className="ticker-track">
              <div className="ticker-content">
                {[...tickerItems, ...tickerItems].map((item, i) => (
                  <span key={i} className="ticker-item">{item}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="site-header">
          <div className="header-inner">
            <Link href="/" className="site-logo">
              <span className="logo-main">{config.siteName.replace('India', '')}</span>
              <span className="logo-accent">India</span>
              <span className="logo-tagline">{config.tagline}</span>
            </Link>
            <div className="header-right">
              <Link href="/search" className="header-search-btn" aria-label="Search">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </Link>
              <MobileMenu nav={config.nav} siteName={config.siteName} />
            </div>
          </div>
        </header>

        {/* Category Nav */}
        <nav className="cat-nav" aria-label="Category navigation">
          <div className="cat-nav-inner">
            {config.nav.map((item) => (
              <Link key={item.href} href={item.href} className="cat-nav-link">
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="site-main">{children}</main>

        {/* Footer */}
        <footer className="site-footer">
          <div className="footer-inner">
            <div className="footer-top">
              <div className="footer-brand">
                <Link href="/" className="footer-logo">
                  <span>{config.siteName}</span>
                </Link>
                <p className="footer-tagline">{config.footer.tagline}</p>
                <p className="footer-desc">{config.description}</p>
              </div>
              {config.footer.columns.map((col) => (
                <div key={col.title} className="footer-col">
                  <h4 className="footer-col-title">{col.title}</h4>
                  <ul className="footer-col-links">
                    {col.links.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href}>{link.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="footer-bottom">
              <p>
                &copy; {new Date().getFullYear()} {config.siteName} | {config.domain} — All rights reserved.
              </p>
              <div className="footer-bottom-links">
                <Link href="/privacy-policy">Privacy Policy</Link>
                <Link href="/terms">Terms</Link>
                <Link href="/disclaimer">Disclaimer</Link>
                <Link href="/about">Contact Us</Link>
              </div>
            </div>
          </div>
        </footer>

        {/* Cookie Banner */}
        <CookieBanner />

        {/* Back to Top */}
        <button className="back-to-top" id="backToTop" aria-label="Back to top">↑</button>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var btn = document.getElementById('backToTop');
                if (!btn) return;
                window.addEventListener('scroll', function() {
                  btn.classList.toggle('visible', window.scrollY > 400);
                });
                btn.addEventListener('click', function() {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                });
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
