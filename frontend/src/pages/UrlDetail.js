import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Copy, Download, Check, ExternalLink, Trash2,
  BarChart2, Users, Clock, Globe, Monitor, Smartphone,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { ClicksLineChart, DeviceDonutChart, ReferrerBarChart, HourlyBarChart } from '../components/Charts';
import { urlAPI } from '../lib/api';
import toast from 'react-hot-toast';
import { format, formatDistanceToNow } from 'date-fns';

export default function UrlDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    urlAPI.getOne(id)
      .then(res => setData(res.data.data))
      .catch(() => { toast.error('Failed to load URL'); navigate('/dashboard'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(data.url.shortUrl);
      setCopied(true);
      toast.success('Copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch { toast.error('Failed to copy'); }
  };

  const downloadQR = () => {
    if (!data?.qrCode) return;
    const link = document.createElement('a');
    link.href = data.qrCode;
    link.download = `qr-${data.url.short_code}.png`;
    link.click();
    toast.success('QR code downloaded!');
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this link permanently?')) return;
    try {
      await urlAPI.delete(id);
      toast.success('Deleted');
      navigate('/dashboard');
    } catch { toast.error('Failed to delete'); }
  };

  // Safe date helpers
  const safeFormat = (dateVal, fmt) => {
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return '—';
      return format(d, fmt);
    } catch { return '—'; }
  };

  const safeRelative = (dateVal) => {
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return '—';
      return formatDistanceToNow(d) + ' ago';
    } catch { return '—'; }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    </div>
  );

  const { url, qrCode, analytics, recentClicks } = data;
  const isExpired = url?.isExpired;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        {/* Back */}
        <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-3)', fontSize: 13, marginBottom: 28 }}>
          <ArrowLeft size={14} /> Back to dashboard
        </Link>

        {/* Header card */}
        <div className="card" style={{ padding: 28, marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span className={`badge ${isExpired ? 'badge-red' : url.is_active ? 'badge-green' : 'badge-yellow'}`}>
                  ● {isExpired ? 'Expired' : url.is_active ? 'Active' : 'Inactive'}
                </span>
                {url.title && <span style={{ fontSize: 14, fontWeight: 500 }}>{url.title}</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <a href={url.shortUrl} target="_blank" rel="noopener noreferrer"
                  style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 22, fontFamily: 'var(--font-display)' }}>
                  {url.shortUrl?.replace(/^https?:\/\//, '')}
                </a>
                <ExternalLink size={14} color="var(--text-3)" />
              </div>
              <div className="truncate" style={{ fontSize: 13, color: 'var(--text-3)', maxWidth: 600 }}>{url.original_url}</div>
              <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 12, color: 'var(--text-3)', flexWrap: 'wrap' }}>
                <span>Created {safeRelative(url.createdAt || url.created_at)}</span>
                {url.expires_at && (
                  <span style={{ color: isExpired ? 'var(--red)' : 'inherit' }}>
                    Expires {safeFormat(url.expires_at, 'MMM d, yyyy HH:mm')}
                  </span>
                )}
                {url.custom_alias && <span>Alias: <strong style={{ color: 'var(--text-2)' }}>{url.custom_alias}</strong></span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={copy} className="btn btn-ghost" style={{ padding: '9px 14px', fontSize: 13 }}>
                {copied ? <><Check size={14} color="var(--green)" /> Copied</> : <><Copy size={14} /> Copy</>}
              </button>
              <button onClick={handleDelete} className="btn btn-danger" style={{ padding: '9px 14px', fontSize: 13 }}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid-4" style={{ marginBottom: 28 }}>
          {[
            { icon: <BarChart2 size={16} />, label: 'Total Clicks', value: (analytics?.overview?.total_clicks || 0).toLocaleString(), color: 'var(--accent)' },
            { icon: <Users size={16} />, label: 'Unique Visitors', value: (analytics?.overview?.unique_clicks || 0).toLocaleString(), color: 'var(--green)' },
            { icon: <Clock size={16} />, label: 'First Click', value: analytics?.overview?.first_click ? safeFormat(analytics.overview.first_click, 'MMM d') : '—', color: '#f472b6' },
            { icon: <Globe size={16} />, label: 'Last Click', value: analytics?.overview?.last_click ? safeRelative(analytics.overview.last_click) : '—', color: 'var(--yellow)' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>{s.label}</span>
                <div style={{ color: s.color }}>{s.icon}</div>
              </div>
              <div style={{ fontSize: 26, fontFamily: 'var(--font-display)', fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)' }}>
          {['overview', 'clicks', 'qr code'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 18px', background: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none',
                color: activeTab === tab ? 'var(--accent)' : 'var(--text-3)',
                borderBottom: `2px solid ${activeTab === tab ? 'var(--accent)' : 'transparent'}`,
                textTransform: 'capitalize', transition: 'all 0.2s',
              }}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 20, fontWeight: 600 }}>Clicks — Last 30 Days</h3>
              <div style={{ height: 220 }}>
                {analytics?.byDay?.length > 0
                  ? <ClicksLineChart data={analytics.byDay} />
                  : <p style={{ color: 'var(--text-3)', textAlign: 'center', paddingTop: 80 }}>No click data yet</p>}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 16, fontWeight: 600 }}>Device Types</h3>
                <div style={{ height: 200 }}>
                  {analytics?.byDevice?.length > 0
                    ? <DeviceDonutChart data={analytics.byDevice} />
                    : <p style={{ color: 'var(--text-3)', textAlign: 'center', paddingTop: 70 }}>No data</p>}
                </div>
              </div>
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 16, fontWeight: 600 }}>Top Referrers</h3>
                <div style={{ height: 200 }}>
                  {analytics?.byReferrer?.length > 0
                    ? <ReferrerBarChart data={analytics.byReferrer} />
                    : <p style={{ color: 'var(--text-3)', textAlign: 'center', paddingTop: 70 }}>No data</p>}
                </div>
              </div>
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 16, fontWeight: 600 }}>Browsers</h3>
                {analytics?.byBrowser?.length > 0
                  ? analytics.byBrowser.slice(0, 5).map(b => (
                    <div key={b.browser} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-2)', minWidth: 80 }}>{b.browser}</span>
                      <div style={{ flex: 1, height: 6, background: 'var(--bg-3)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 3, background: 'var(--accent)', width: `${(b.count / (analytics.overview?.total_clicks || 1)) * 100}%` }} />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-3)', minWidth: 30, textAlign: 'right' }}>{b.count}</span>
                    </div>
                  ))
                  : <p style={{ color: 'var(--text-3)', fontSize: 13 }}>No data</p>}
              </div>
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 16, fontWeight: 600 }}>Clicks by Hour (7d)</h3>
                <div style={{ height: 150 }}>
                  {analytics?.byHour?.length > 0
                    ? <HourlyBarChart data={analytics.byHour} />
                    : <p style={{ color: 'var(--text-3)', textAlign: 'center', paddingTop: 50 }}>No data</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'clicks' && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600 }}>Recent Clicks <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>({recentClicks?.length || 0})</span></h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Time', 'Browser', 'OS', 'Device', 'Referrer'].map(h => (
                      <th key={h} style={{ padding: '10px 24px', textAlign: 'left', color: 'var(--text-3)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentClicks?.map((click, i) => (
                    <tr key={click._id || i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                      <td style={{ padding: '12px 24px', color: 'var(--text-2)', whiteSpace: 'nowrap' }}>{safeFormat(click.clicked_at, 'MMM d, HH:mm')}</td>
                      <td style={{ padding: '12px 24px', color: 'var(--text-2)' }}>{click.browser || '—'}</td>
                      <td style={{ padding: '12px 24px', color: 'var(--text-2)' }}>{click.os || '—'}</td>
                      <td style={{ padding: '12px 24px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--text-2)' }}>
                          {click.device_type === 'mobile' ? <Smartphone size={12} /> : <Monitor size={12} />}
                          {click.device_type || 'desktop'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 24px', color: 'var(--text-3)', maxWidth: 200 }}>
                        <div className="truncate">{click.referrer || '—'}</div>
                      </td>
                    </tr>
                  ))}
                  {!recentClicks?.length && (
                    <tr><td colSpan={5} style={{ padding: 48, textAlign: 'center', color: 'var(--text-3)' }}>No clicks recorded yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'qr code' && (
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, alignSelf: 'flex-start' }}>QR Code</h3>
              {qrCode && (
                <div style={{ background: 'white', borderRadius: 16, padding: 24 }}>
                  <img src={qrCode} alt="QR Code" style={{ width: 240, height: 240, display: 'block' }} />
                </div>
              )}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16 }}>
                  Scan to visit <strong style={{ color: 'var(--accent)' }}>{url.shortUrl?.replace(/^https?:\/\//, '')}</strong>
                </div>
                <button onClick={downloadQR} disabled={!qrCode} className="btn btn-primary" style={{ padding: '10px 24px' }}>
                  <Download size={15} /> Download PNG
                </button>
              </div>
            </div>
            <div className="card" style={{ padding: 24, flex: 1, minWidth: 240 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Link Details</h3>
              {[
                { label: 'Short URL', value: url.shortUrl },
                { label: 'Short Code', value: url.short_code },
                { label: 'Custom Alias', value: url.custom_alias || '—' },
                { label: 'Created', value: safeFormat(url.createdAt || url.created_at, 'MMM d, yyyy HH:mm') },
                { label: 'Expires', value: url.expires_at ? safeFormat(url.expires_at, 'MMM d, yyyy HH:mm') : 'Never' },
                { label: 'Status', value: isExpired ? 'Expired' : url.is_active ? 'Active' : 'Inactive' },
              ].map(d => (
                <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-3)' }}>{d.label}</span>
                  <span style={{ color: 'var(--text-2)', fontWeight: 500, maxWidth: '60%', textAlign: 'right', wordBreak: 'break-all' }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
