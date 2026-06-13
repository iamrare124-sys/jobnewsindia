import { getSiteConfig } from '../../config/site.config';

export function generateMetadata() {
  const config = getSiteConfig();
  return {
    title: `About Us | ${config.siteName}`,
    description: `Learn about ${config.siteName} and our career coach ${config.author.name}.`,
  };
}

export default function AboutPage() {
  const config = getSiteConfig();
  const { author } = config;

  return (
    <>
      <div className="about-hero">
        <div className="container">
          <h1>About {config.siteName}</h1>
          <p>{config.tagline}</p>
        </div>
      </div>

      <div className="container">
        <div className="about-author">
          <div className="about-author-avatar">{author.name.charAt(0)}</div>
          <div>
            <div className="about-author-name">{author.name}</div>
            <div className="about-author-title">{author.title}</div>
            <p className="about-author-bio">{author.bio}</p>
          </div>
        </div>

        <div className="static-page" style={{ marginTop: '0' }}>
          <h2>About {config.siteName}</h2>
          <p>
            {config.siteName} ({config.domain}) is India&rsquo;s trusted source for the latest sarkari naukri
            alerts, government job notifications, UPSC updates, SSC recruitment news, and career guidance.
          </p>
          <p>
            Our mission is simple: help every Indian job seeker — from fresh graduates to experienced
            professionals — find the right opportunity. We publish daily job alerts, application
            guides, and insider career tips based on real HR experience.
          </p>

          <h2>What We Cover</h2>
          <ul>
            <li>Central and State Government Job Notifications</li>
            <li>UPSC, SSC, IBPS, and Railway Recruitment Updates</li>
            <li>Private Sector Job Openings (IT, Banking, Manufacturing)</li>
            <li>Career Tips, Interview Guides, and Resume Advice</li>
            <li>Age Limit, Eligibility, and Reservation Category Details</li>
          </ul>

          <h2>Contact Us</h2>
          <p>
            Have a question or want to report a job alert? Reach out to us at{' '}
            <strong>contact@{config.domain}</strong>.
          </p>
          <p>
            For partnership or advertising enquiries, email{' '}
            <strong>partnerships@{config.domain}</strong>.
          </p>

          <h2>Disclaimer</h2>
          <p>
            {config.siteName} is an informational website. We are not affiliated with any government
            department or recruitment board. Always verify job notifications from the official
            organisation website before applying.
          </p>
        </div>
      </div>
    </>
  );
}
