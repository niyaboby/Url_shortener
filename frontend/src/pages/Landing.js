import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Link2, BarChart3, QrCode, Shield, Zap, Globe } from 'lucide-react';

const features = [
  { icon: <Zap size={20} />, title: 'Lightning Fast', desc: 'Millisecond redirects with global CDN distribution' },
  { icon: <BarChart3 size={20} />, title: 'Deep Analytics', desc: 'Track clicks, devices, referrers, and geography' },
  { icon: <QrCode size={20} />, title: 'QR Codes', desc: 'Auto-generated QR codes for every link, downloadable as PNG' },
  { icon: <Link2 size={20} />, title: 'Custom Aliases', desc: 'Create branded short links with your own keywords' },
  { icon: <Shield size={20} />, title: 'Link Expiration', desc: 'Set links to expire automatically on your schedule' },
  { icon: <Globe size={20} />, title: 'All Devices', desc: 'Tracks mobile, tablet and desktop traffic separately' },
];

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 40px', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, background: 'rgba(8,12,20,0.85)',
        backdropFilter: 'blur(16px)', zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, background: 'var(--accent)', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Link2 size={18} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>
            URL<span style={{ color: 'var(--accent)' }}>Snip</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/login">
            <button className="btn btn-ghost" style={{ padding: '8px 16px' }}>Log in</button>
          </Link>
          <Link to="/signup">
            <button className="btn btn-primary" style={{ padding: '8px 16px' }}>
              Get started <ArrowRight size={14} />
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        maxWidth: 900, margin: '0 auto', padding: '120px 24px 80px',
        textAlign: 'center',
      }}>
        {/* Glow orb */}
        <div style={{
          position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 300,
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="badge badge-blue" style={{ marginBottom: 24, fontSize: 12 }}>
          ✦ Production-ready URL shortener
        </div>

        <h1 style={{ fontSize: 'clamp(40px, 8vw, 76px)', marginBottom: 24, letterSpacing: '-0.03em' }}>
          Shorten, track,<br />
          <span style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>analyze every click</span>
        </h1>

        <p style={{ fontSize: 18, color: 'var(--text-2)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
          URLSnip turns your long URLs into powerful, trackable short links with analytics, QR codes, and custom aliases — all in seconds.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/signup">
            <button className="btn btn-primary" style={{ padding: '14px 28px', fontSize: 16 }}>
              Start for free <ArrowRight size={16} />
            </button>
          </Link>
          <Link to="/login">
            <button className="btn btn-ghost" style={{ padding: '14px 28px', fontSize: 16 }}>
              Sign in
            </button>
          </Link>
        </div>
      </section>

      {/* Dashboard preview */}
      <section style={{ maxWidth: 1100, margin: '0 auto 100px', padding: '0 24px' }}>
        <div style={{
          background: 'var(--bg-1)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: '2px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)',
          overflow: 'hidden',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--bg-2) 0%, var(--bg-1) 100%)',
            borderRadius: 18, padding: 32,
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
          }}>
            {[
              { label: 'Total Links', value: '1,247', color: 'var(--accent)' },
              { label: 'Total Clicks', value: '84.3K', color: 'var(--green)' },
              { label: 'Unique Visitors', value: '61.2K', color: '#f472b6' },
              { label: 'Active Links', value: '892', color: 'var(--yellow)' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'var(--bg-1)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '20px',
              }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{stat.label}</div>
                <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 700, color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1100, margin: '0 auto 100px', padding: '0 24px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(28px, 4vw, 42px)', marginBottom: 60 }}>
          Everything you need to manage links
        </h2>
        <div className="grid-3">
          {features.map(f => (
            <div key={f.title} className="card" style={{ padding: 28 }}>
              <div style={{
                width: 44, height: 44, background: 'var(--accent-glow)',
                borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent)', marginBottom: 16, border: '1px solid rgba(99,102,241,0.2)',
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 17, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '80px 24px 120px' }}>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', marginBottom: 20 }}>
          Ready to take control of your links?
        </h2>
        <p style={{ color: 'var(--text-2)', marginBottom: 36, fontSize: 16 }}>
          Join thousands using URLSnip to power their link strategy.
        </p>
        <Link to="/signup">
          <button className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 16 }}>
            Create your free account <ArrowRight size={16} />
          </button>
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)', padding: '24px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        color: 'var(--text-3)', fontSize: 13,
      }}>
        <span>© 2025 URLSnip — All rights reserved</span>
        <span>Built with Node.js + React</span>
      </footer>
    </div>
  );
}
