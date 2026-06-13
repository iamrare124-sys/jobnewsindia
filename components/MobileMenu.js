'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function MobileMenu({ nav, siteName }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="mobile-menu-btn"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        <span className={`hamburger ${open ? 'open' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      {open && (
        <div className="mobile-overlay" onClick={() => setOpen(false)}>
          <nav className="mobile-nav" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-nav-header">
              <span className="mobile-nav-title">{siteName}</span>
              <button className="mobile-close-btn" onClick={() => setOpen(false)} aria-label="Close menu">
                ✕
              </button>
            </div>
            <ul className="mobile-nav-list">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="mobile-nav-link" onClick={() => setOpen(false)}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mobile-nav-footer">
              <Link href="/search" className="mobile-search-link" onClick={() => setOpen(false)}>
                🔍 Search Jobs
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
