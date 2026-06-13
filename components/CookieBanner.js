'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) setVisible(true);
      } catch {
        setVisible(true);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  function accept() {
    try {
      localStorage.setItem('cookie_consent', 'accepted');
    } catch {}
    setVisible(false);
  }

  function decline() {
    try {
      localStorage.setItem('cookie_consent', 'declined');
    } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie consent">
      <div className="cookie-banner-inner">
        <div className="cookie-text">
          <strong>We use cookies</strong> to improve your experience and show relevant job alerts.
          By continuing, you agree to our{' '}
          <Link href="/cookie-policy" className="cookie-link">
            Cookie Policy
          </Link>{' '}
          and{' '}
          <Link href="/privacy-policy" className="cookie-link">
            Privacy Policy
          </Link>.
        </div>
        <div className="cookie-actions">
          <button className="cookie-btn cookie-btn-accept" onClick={accept}>
            Accept All
          </button>
          <button className="cookie-btn cookie-btn-decline" onClick={decline}>
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
