import React, { useState } from 'react';
import { Link2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { urlAPI } from '../lib/api';
import toast from 'react-hot-toast';

export default function ShortenForm({ onSuccess }) {
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [title, setTitle] = useState('');
  const [advanced, setAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedExpiry, setSelectedExpiry] = useState('Never');
  const [customDate, setCustomDate] = useState('');

  const expiryOptions = ['Never', '1 Hour', '24 Hours', '7 Days', '30 Days', 'Custom'];

  const getExpiresAt = () => {
    const now = Date.now();
    switch (selectedExpiry) {
      case '1 Hour':    return new Date(now + 3600000).toISOString();
      case '24 Hours':  return new Date(now + 86400000).toISOString();
      case '7 Days':    return new Date(now + 7 * 86400000).toISOString();
      case '30 Days':   return new Date(now + 30 * 86400000).toISOString();
      case 'Custom':    return customDate ? new Date(customDate).toISOString() : null;
      default:          return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    try {
      const payload = {
        originalUrl: url,
        ...(alias.trim() && { customAlias: alias.trim() }),
        ...(title.trim() && { title: title.trim() }),
        expiresAt: getExpiresAt(),
      };

      const res = await urlAPI.shorten(payload);
      toast.success('Short link created!');
      setUrl(''); setAlias(''); setTitle(''); setSelectedExpiry('Never'); setCustomDate('');
      onSuccess?.(res.data?.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to shorten URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card animate-fade-in-up" style={{ padding: 28, marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{
          width: 36, height: 36, background: 'var(--accent-glow)',
          border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)',
        }}>
          <Sparkles size={18} />
        </div>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 2 }}>Shorten a URL</h2>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Paste your long URL to generate a short link</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Link2 size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
            <input
              type="url" required
              placeholder="https://your-very-long-url.com/goes/here"
              value={url}
              onChange={e => setUrl(e.target.value)}
              style={{ paddingLeft: 38, height: 46, fontSize: 14 }}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}
            style={{ padding: '0 24px', height: 46, fontSize: 14, whiteSpace: 'nowrap' }}>
            {loading ? <div className="spinner" /> : 'Shorten →'}
          </button>
        </div>

        <button type="button" onClick={() => setAdvanced(p => !p)}
          style={{ background: 'none', color: 'var(--text-3)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, padding: 0, marginBottom: advanced ? 16 : 0, cursor: 'pointer', border: 'none' }}>
          {advanced ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {advanced ? 'Hide options' : 'Advanced options'}
        </button>

        {advanced && (
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-3)', marginBottom: 6 }}>Custom alias (optional)</label>
              <input placeholder="my-link" value={alias} onChange={e => setAlias(e.target.value)} style={{ height: 38, fontSize: 13 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-3)', marginBottom: 6 }}>Link title (optional)</label>
              <input placeholder="My awesome link" value={title} onChange={e => setTitle(e.target.value)} style={{ height: 38, fontSize: 13 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-3)', marginBottom: 6 }}>Expiration</label>
              <select value={selectedExpiry} onChange={e => setSelectedExpiry(e.target.value)} style={{ height: 38, fontSize: 13 }}>
                {expiryOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            {selectedExpiry === 'Custom' && (
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-3)', marginBottom: 6 }}>Custom date & time</label>
                <input type="datetime-local" value={customDate} onChange={e => setCustomDate(e.target.value)} style={{ height: 38, fontSize: 13 }} />
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
