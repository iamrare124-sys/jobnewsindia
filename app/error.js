'use client';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="container">
      <div className="error-page">
        <div className="error-code" style={{ fontSize: '48px' }}>⚠️</div>
        <h1 className="error-title">Something went wrong</h1>
        <p className="error-desc">
          We hit an unexpected error. Our team has been notified.
          Please try again or go back to the homepage.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => reset()} className="error-home-btn" style={{ border: 'none', cursor: 'pointer' }}>
            Try Again
          </button>
          <Link href="/" className="error-home-btn" style={{ background: 'var(--secondary)' }}>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
