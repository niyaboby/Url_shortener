import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Home, Link2 } from 'lucide-react';

export function Expired() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }} className="animate-fade-in-up">
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--red)' }}>
          <Clock size={36} />
        </div>
        <h1 style={{ fontSize: 32, marginBottom: 12 }}>Link Expired</h1>
        <p style={{ color: 'var(--text-2)', fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>
          This short link has expired and is no longer active. The creator may have set an expiration date that has passed.
        </p>
        <Link to="/">
          <button className="btn btn-primary" style={{ padding: '12px 28px', fontSize: 15 }}>
            <Home size={15} /> Go to URLSnip
          </button>
        </Link>
      </div>
    </div>
  );
}

export function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }} className="animate-fade-in-up">
        <div style={{ fontSize: 72, fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--bg-3)', lineHeight: 1, marginBottom: 24 }}>404</div>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-glow)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--accent)' }}>
          <Link2 size={28} />
        </div>
        <h1 style={{ fontSize: 28, marginBottom: 12 }}>Link Not Found</h1>
        <p style={{ color: 'var(--text-2)', fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
          This short link doesn't exist or may have been deleted.
        </p>
        <Link to="/">
          <button className="btn btn-primary" style={{ padding: '12px 28px', fontSize: 15 }}>
            <Home size={15} /> Go to URLSnip
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Expired;
