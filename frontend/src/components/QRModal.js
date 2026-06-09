import React, { useEffect, useState } from 'react';
import { X, Download, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

// BUG FIX: Removed stray urlAPI.getAll() call that was firing on every modal open.
// Also fixed QR fetch to use REACT_APP_API_URL env var, not hardcoded /api/url/qr.
export default function QRModal({ shortUrl, onClose }) {
  const [qr, setQr] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const apiBase = process.env.REACT_APP_API_URL || '/api';
    const token = localStorage.getItem('token');

    fetch(`${apiBase}/url/qr?url=${encodeURIComponent(shortUrl)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => {
        if (d.data?.qrCode) setQr(d.data.qrCode);
        else toast.error('Failed to load QR code');
      })
      .catch(() => toast.error('Failed to load QR code'));

    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [shortUrl, onClose]);

  const download = () => {
    if (!qr) return;
    const link = document.createElement('a');
    link.href = qr;
    link.download = `qr-${shortUrl.split('/').pop()}.png`;
    link.click();
    toast.success('QR code downloaded!');
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      toast.success('Copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} className="card animate-fade-in-up"
        style={{ padding: 32, maxWidth: 380, width: '100%', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h3 style={{ fontSize: 17 }}>QR Code</h3>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: 6, borderRadius: 8 }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ background: 'white', borderRadius: 12, padding: 20, marginBottom: 20, display: 'inline-block' }}>
          {qr
            ? <img src={qr} alt="QR Code" style={{ width: 200, height: 200, display: 'block' }} />
            : <div style={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" style={{ borderColor: '#e2e8f0', borderTopColor: '#6366f1' }} />
              </div>
          }
        </div>

        <div style={{
          background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8,
          padding: '10px 14px', fontSize: 13, color: 'var(--accent)', fontWeight: 500,
          marginBottom: 16, wordBreak: 'break-all',
        }}>
          {shortUrl}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={copyUrl} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', padding: '10px' }}>
            {copied ? <><Check size={14} color="var(--green)" /> Copied!</> : <><Copy size={14} /> Copy URL</>}
          </button>
          <button onClick={download} disabled={!qr} className="btn btn-primary"
            style={{ flex: 1, justifyContent: 'center', padding: '10px' }}>
            <Download size={14} /> Download PNG
          </button>
        </div>
      </div>
    </div>
  );
}
