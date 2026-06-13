import { getSiteConfig } from '../../config/site.config';

export function generateMetadata() {
  const config = getSiteConfig();
  return { title: `Terms of Use | ${config.siteName}` };
}

export default function TermsPage() {
  const config = getSiteConfig();
  return (
    <div className="container" style={{ padding: '24px 16px' }}>
      <div className="static-page">
        <h1>Terms of Use</h1>
        <p className="page-date">Last updated: May 2026</p>
        <p>
          By accessing {config.siteName} ({config.domain}), you agree to these terms and conditions.
          Please read them carefully.
        </p>
        <h2>Use of Content</h2>
        <p>
          All content on {config.siteName} is for informational purposes only. You may not
          reproduce, distribute, or use our content without written permission.
        </p>
        <h2>Accuracy of Information</h2>
        <p>
          We strive to provide accurate and up-to-date job information. However, we are not
          responsible for errors or changes in job notifications. Always verify from official sources.
        </p>
        <h2>No Affiliation</h2>
        <p>
          {config.siteName} is an independent platform and is not affiliated with any government
          department, PSU, or recruitment board.
        </p>
        <h2>Limitation of Liability</h2>
        <p>
          We are not liable for any direct or indirect losses arising from the use of information
          on this website. Job application decisions are the sole responsibility of the user.
        </p>
        <h2>Changes to Terms</h2>
        <p>
          We may update these terms at any time. Continued use of the website constitutes acceptance
          of the updated terms.
        </p>
        <h2>Contact</h2>
        <p>Questions? Email <strong>legal@{config.domain}</strong>.</p>
      </div>
    </div>
  );
}
