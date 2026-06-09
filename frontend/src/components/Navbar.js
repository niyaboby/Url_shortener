import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Link2, LayoutDashboard, LogOut, Menu, X, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', height: 64,
      borderBottom: '1px solid var(--border)',
      background: 'rgba(8,12,20,0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Link2 size={18} color="white" />
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>
          URL<span style={{ color: 'var(--accent)' }}>Snip</span>
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link to="/dashboard">
          <button className="btn btn-ghost" style={{
            padding: '7px 14px', fontSize: 13,
            color: location.pathname === '/dashboard' ? 'var(--text)' : 'var(--text-2)',
            background: location.pathname === '/dashboard' ? 'var(--bg-2)' : 'transparent',
            border: location.pathname === '/dashboard' ? '1px solid var(--border)' : '1px solid transparent',
          }}>
            <LayoutDashboard size={15} /> Dashboard
          </button>
        </Link>

        <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 4px' }} />

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 12px', borderRadius: 8,
            background: 'var(--bg-2)', border: '1px solid var(--border)',
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: 'white',
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{user?.name?.split(' ')[0]}</span>
          </div>

          <button className="btn btn-ghost" onClick={logout}
            style={{ padding: '7px 12px', fontSize: 13, color: 'var(--text-3)' }}
            title="Logout">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </nav>
  );
}
