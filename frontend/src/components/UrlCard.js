import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Trash2, BarChart2, QrCode, ExternalLink, Check, ToggleLeft, ToggleRight, Clock } from 'lucide-react';
import { urlAPI } from '../lib/api';
import toast from 'react-hot-toast';
import { format, formatDistanceToNow } from 'date-fns';
import QRModal from './QRModal';

// BUG FIX: This file was accidentally overwritten with UrlDetail code.
// Restored to the correct UrlCard component.
export default function UrlCard({ url, onDelete, onToggle }) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const baseUrl = process.env.REACT_APP_BASE_URL || window.location.origin;
  const shortUrl = url.shortUrl || `${baseUrl}/${url.custom_alias || url.short_code}`;
  const isExpired = url.isExpired || (url.expires_at && new Date(url.expires_at) < new Date());

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this link? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await urlAPI.delete(url.id || url._id);
      toast.success('Link deleted');
      onDelete?.(url.id || url._id);
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggle = async () => {
    setToggling(true);
    try {
      await urlAPI.update(url.id || url._id, { isActive: !url.is_active });
      toast.success(url.is_active ? 'Link deactivated' : 'Link activated');
      onToggle?.(url.id || url._id, !url.is_active);
    } catch {
      toast.error('Failed to update');
    } finally {
      setToggling(false);
    }
  };

  const status = isExpired ? 'expired' : !url.is_active ? 'inactive' : 'active';
  const statusBadge = {
    active: <span className="badge badge-green">● Active</span>,
    expired: <span className="badge badge-red">● Expired</span>,
    inactive: <span className="badge badge-yellow">● Inactive</span>,
  }[status];

  // Safe date formatting
  const createdAt = url.createdAt || url.created_at;
  const createdRelative = (() => {
    try {
      const d = new Date(createdAt);
      if (isNaN(d.getTime())) return 'recently';
      return formatDistanceToNow(d) + ' ago';
    } catch { return 'recently'; }
  })();

  const expiresFormatted = (() => {
    if (!url.expires_at) return null;
    try {
      const d = new Date(url.expires_at);
      if (isNaN(d.getTime())) return null;
      return format(d, 'MMM d, yyyy');
    } catch { return null; }
  })();

  return (
    <>
      <div className="card animate-fade-in" style={{
        padding: '20px 24px',
        opacity: status !== 'active' ? 0.75 : 1,
        transition: 'opacity 0.2s',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          {/* Left content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              {statusBadge}
              {url.title && (
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{url.title}</span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <a href={shortUrl} target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 16, fontFamily: 'var(--font-display)' }}>
                {shortUrl.replace(/^https?:\/\//, '')}
              </a>
              <ExternalLink size={13} color="var(--text-3)" />
            </div>

            <div className="truncate" style={{ fontSize: 12, color: 'var(--text-3)', maxWidth: 500, marginBottom: 12 }}>
              {url.original_url}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'var(--text-3)', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <BarChart2 size={12} />
                <strong style={{ color: 'var(--text-2)', fontWeight: 600 }}>{(url.click_count || 0).toLocaleString()}</strong> clicks
              </span>
              <span>
                <strong style={{ color: 'var(--text-2)', fontWeight: 600 }}>{(url.unique_click_count || 0).toLocaleString()}</strong> unique
              </span>
              {url.today_clicks > 0 && (
                <span style={{ color: 'var(--green)' }}>+{url.today_clicks} today</span>
              )}
              <span>Created {createdRelative}</span>
              {expiresFormatted && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: isExpired ? 'var(--red)' : 'var(--text-3)' }}>
                  <Clock size={11} />
                  {isExpired ? 'Expired' : `Expires ${expiresFormatted}`}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <button onClick={copy} className="btn btn-ghost" style={{ padding: '7px', borderRadius: 8 }} title="Copy link">
              {copied ? <Check size={15} color="var(--green)" /> : <Copy size={15} />}
            </button>
            <button onClick={() => setShowQR(true)} className="btn btn-ghost" style={{ padding: '7px', borderRadius: 8 }} title="QR Code">
              <QrCode size={15} />
            </button>
            <Link to={`/url/${url.id || url._id}`}>
              <button className="btn btn-ghost" style={{ padding: '7px', borderRadius: 8 }} title="Analytics">
                <BarChart2 size={15} />
              </button>
            </Link>
            <button onClick={handleToggle} disabled={toggling} className="btn btn-ghost"
              style={{ padding: '7px', borderRadius: 8 }} title={url.is_active ? 'Deactivate' : 'Activate'}>
              {url.is_active
                ? <ToggleRight size={15} color="var(--green)" />
                : <ToggleLeft size={15} color="var(--text-3)" />}
            </button>
            <button onClick={handleDelete} disabled={deleting} className="btn btn-danger"
              style={{ padding: '7px', borderRadius: 8 }} title="Delete">
              {deleting
                ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 1.5 }} />
                : <Trash2 size={15} />}
            </button>
          </div>
        </div>
      </div>

      {showQR && <QRModal shortUrl={shortUrl} onClose={() => setShowQR(false)} />}
    </>
  );
}
