import { getSiteConfig } from '../../config/site.config';

export function generateMetadata() {
  const config = getSiteConfig();
  return { title: `Cookie Policy | ${config.siteName}` };
}

export default function CookiePolicyPage() {
  const config = getSiteConfig();
  return (
    <div className="container" style={{ padding: '24px 16px' }}>
      <div className="static-page">
        <h1>Cookie Policy</h1>
        <p className="page-date">Last updated: May 2026</p>
        <p>
          This Cookie Policy explains how {config.siteName} uses cookies and similar technologies
          when you visit our website.
        </p>
        <h2>What Are Cookies?</h2>
        <p>
          Cookies are small text files stored on your device when you visit a website. They help
          websites remember your preferences and improve your experience.
        </p>
        <h2>Types of Cookies We Use</h2>
        <ul>
          <li>
            <strong>Essential Cookies:</strong> Required for the website to function. These cannot be
            disabled.
          </li>
          <li>
            <strong>Analytics Cookies:</strong> Used by Google Analytics to understand how visitors
            use our site. Data is anonymised.
          </li>
          <li>
            <strong>Advertising Cookies:</strong> Used by Google AdSense to serve relevant
            advertisements.
          </li>
          <li>
            <strong>Preference Cookies:</strong> Remember your settings and preferences (e.g., cookie
            consent).
          </li>
        </ul>
        <h2>How to Control Cookies</h2>
        <p>
          You can control and delete cookies through your browser settings. Note that disabling
          cookies may affect the functionality of the website.
        </p>
        <p>
          You can also use our cookie consent banner to accept or decline non-essential cookies.
        </p>
        <h2>Third-Party Cookies</h2>
        <p>
          Google Analytics and Google AdSense set their own cookies. Please refer to Google&rsquo;s
          privacy policy for details on how they use your data.
        </p>
        <h2>Contact</h2>
        <p>Questions? Email <strong>privacy@{config.domain}</strong>.</p>
      </div>
    </div>
  );
}
