import { getSiteConfig } from '../../config/site.config';

export function generateMetadata() {
  const config = getSiteConfig();
  return { title: `Privacy Policy | ${config.siteName}` };
}

export default function PrivacyPage() {
  const config = getSiteConfig();
  return (
    <div className="container" style={{ padding: '24px 16px' }}>
      <div className="static-page">
        <h1>Privacy Policy</h1>
        <p className="page-date">Last updated: May 2026</p>
        <p>
          At {config.siteName} ({config.domain}), we take your privacy seriously. This policy explains
          how we collect, use, and protect your personal information.
        </p>
        <h2>Information We Collect</h2>
        <ul>
          <li>Usage data (pages visited, time on site) via Google Analytics</li>
          <li>Email addresses if you subscribe to job alerts (optional)</li>
          <li>Cookie data for functionality and analytics</li>
          <li>IP address and browser information (anonymised)</li>
        </ul>
        <h2>How We Use Your Information</h2>
        <ul>
          <li>To send job alert emails if you have subscribed</li>
          <li>To improve our website content and user experience</li>
          <li>To serve relevant advertisements via Google AdSense</li>
          <li>To comply with legal obligations</li>
        </ul>
        <h2>Cookies</h2>
        <p>
          We use cookies to improve your browsing experience. You can control cookies through
          your browser settings or our cookie consent banner. For more details, see our{' '}
          <a href="/cookie-policy">Cookie Policy</a>.
        </p>
        <h2>Third-Party Services</h2>
        <p>We use the following third-party services:</p>
        <ul>
          <li>Google Analytics — website analytics</li>
          <li>Google AdSense — advertising</li>
          <li>Supabase — database (GDPR compliant)</li>
        </ul>
        <h2>Your Rights</h2>
        <p>
          You have the right to access, correct, or delete your personal data. To exercise
          these rights, contact us at <strong>privacy@{config.domain}</strong>.
        </p>
        <h2>Contact</h2>
        <p>
          Questions about this policy? Email <strong>privacy@{config.domain}</strong>.
        </p>
      </div>
    </div>
  );
}
