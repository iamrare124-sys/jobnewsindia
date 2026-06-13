import Link from 'next/link';
import { getSiteConfig } from '../config/site.config';

export function generateMetadata() {
  const config = getSiteConfig();
  return { title: `Page Not Found | ${config.siteName}` };
}

export default function NotFound() {
  const config = getSiteConfig();
  return (
    <div className="container">
      <div className="error-page">
        <div className="error-code">404</div>
        <h1 className="error-title">Page Not Found</h1>
        <p className="error-desc">
          The job alert or page you are looking for does not exist or may have been moved.
          Try searching for the latest sarkari naukri updates.
        </p>
        <Link href="/" className="error-home-btn">
          Back to Home
        </Link>
        <div style={{ marginTop: '20px' }}>
          <Link href="/search" style={{ fontSize: '14px', color: 'var(--link)' }}>
            🔍 Search Job Alerts
          </Link>
        </div>
      </div>
    </div>
  );
}
