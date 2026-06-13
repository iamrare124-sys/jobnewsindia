import { getSiteConfig } from '../../config/site.config';

export function generateMetadata() {
  const config = getSiteConfig();
  return { title: `Disclaimer | ${config.siteName}` };
}

export default function DisclaimerPage() {
  const config = getSiteConfig();
  return (
    <div className="container" style={{ padding: '24px 16px' }}>
      <div className="static-page">
        <h1>Disclaimer</h1>
        <p className="page-date">Last updated: May 2026</p>
        <p>
          The information provided on {config.siteName} ({config.domain}) is for general informational
          purposes only. While we strive to keep the information up to date and accurate, we make
          no representations or warranties of any kind.
        </p>
        <h2>Job Information</h2>
        <p>
          All job notifications, recruitment alerts, and vacancy details published on this website
          are sourced from publicly available information. We are not responsible for any discrepancies
          between information on our website and the official notifications.
        </p>
        <h2>No Official Affiliation</h2>
        <p>
          {config.siteName} is not an official government website and is not affiliated with UPSC, SSC,
          Railway Recruitment Board, IBPS, SBI, or any other government body or PSU. Always visit the
          official website of the recruiting organisation for accurate and final information.
        </p>
        <h2>Application Responsibility</h2>
        <p>
          Candidates are advised to verify all details including eligibility, application dates, fees,
          and procedures from the official notification before applying. {config.siteName} is not
          responsible for any loss arising from reliance on information published here.
        </p>
        <h2>External Links</h2>
        <p>
          Our website may contain links to external sites. We have no control over the content of
          those sites and accept no responsibility for them.
        </p>
        <h2>Contact</h2>
        <p>To report incorrect information, email <strong>contact@{config.domain}</strong>.</p>
      </div>
    </div>
  );
}
