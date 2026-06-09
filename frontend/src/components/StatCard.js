import React from 'react';

export default function StatCard({ icon, label, value, sub, color = 'var(--accent)', trend }) {
  return (
    <div className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{label}</span>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: `${color}18`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color,
        }}>
          {icon}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 32, fontFamily: 'var(--font-display)', fontWeight: 700, color, lineHeight: 1 }}>
          {value}
        </div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>{sub}</div>}
      </div>
      {trend !== undefined && (
        <div style={{ fontSize: 12, color: trend >= 0 ? 'var(--green)' : 'var(--red)' }}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last week
        </div>
      )}
    </div>
  );
}
