import React, { useState, useEffect, useCallback } from 'react';
import { Link2, BarChart2, Users, TrendingUp, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import ShortenForm from '../components/ShortenForm';
import UrlCard from '../components/UrlCard';
import StatCard from '../components/StatCard';
import { ClicksLineChart } from '../components/Charts';
import { urlAPI } from '../lib/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [urls, setUrls] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const loadData = useCallback(async () => {
    try {
      const [urlsRes, analyticsRes] = await Promise.all([
        urlAPI.getAll(),
        urlAPI.dashboardAnalytics(),
      ]);
      setUrls(urlsRes.data.data.urls || []);
      setAnalytics(analyticsRes.data.data.analytics);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleNewUrl = (data) => {
    if (!data) return;
    // BUG FIX: Normalize response shape — service returns { url, shortUrl, qrCode }
    const urlObj = data.url || data;
    const newItem = {
      ...urlObj,
      id: (urlObj._id || urlObj.id || '').toString(),
      shortUrl: data.shortUrl || '',
      isExpired: false,
      today_clicks: 0,
    };
    setUrls(prev => [newItem, ...prev]);
  };

  const handleDelete = (id) =>
    setUrls(prev => prev.filter(u => u.id !== id && u._id?.toString() !== id));

  const handleToggle = (id, isActive) =>
    setUrls(prev => prev.map(u =>
      (u.id === id || u._id?.toString() === id) ? { ...u, is_active: isActive } : u
    ));

  const totalClicks = urls.reduce((a, u) => a + (u.click_count || 0), 0);
  const totalUnique = urls.reduce((a, u) => a + (u.unique_click_count || 0), 0);
  const activeCount = urls.filter(u => u.is_active && !u.isExpired).length;
  const todayClicks = urls.reduce((a, u) => a + (u.today_clicks || 0), 0);

  const filtered = urls.filter(u => {
    const s = search.toLowerCase();
    const matchSearch = !s
      || u.original_url?.toLowerCase().includes(s)
      || u.short_code?.toLowerCase().includes(s)
      || u.custom_alias?.toLowerCase().includes(s)
      || u.title?.toLowerCase().includes(s);

    const matchFilter = filter === 'all' ? true
      : filter === 'active' ? (u.is_active && !u.isExpired)
      : filter === 'expired' ? u.isExpired
      : !u.is_active;

    return matchSearch && matchFilter;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, marginBottom: 6 }}>Dashboard</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Manage and track all your short links</p>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: 32 }}>
          <StatCard icon={<Link2 size={16} />} label="Total Links" value={urls.length} sub={`${activeCount} active`} color="var(--accent)" />
          <StatCard icon={<BarChart2 size={16} />} label="Total Clicks" value={totalClicks.toLocaleString()} sub="All time" color="var(--green)" />
          <StatCard icon={<Users size={16} />} label="Unique Visitors" value={totalUnique.toLocaleString()} sub="Distinct IPs" color="#f472b6" />
          <StatCard icon={<TrendingUp size={16} />} label="Today's Clicks" value={todayClicks} sub="Since midnight" color="var(--yellow)" />
        </div>

        {/* Chart */}
        {analytics?.clicksByDay?.length > 0 && (
          <div className="card" style={{ padding: 24, marginBottom: 32 }}>
            <h3 style={{ fontSize: 15, marginBottom: 20, color: 'var(--text-2)' }}>Clicks — Last 30 Days</h3>
            <div style={{ height: 200 }}>
              <ClicksLineChart data={analytics.clicksByDay} />
            </div>
          </div>
        )}

        {/* Shorten form */}
        <ShortenForm onSuccess={handleNewUrl} />

        {/* List header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: 18 }}>
            Your Links <span style={{ color: 'var(--text-3)', fontWeight: 400, fontSize: 14 }}>({filtered.length})</span>
          </h2>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
              <input placeholder="Search links..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 32, height: 36, fontSize: 13, width: 200 }} />
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['all', 'active', 'expired', 'inactive'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{
                    padding: '5px 12px', borderRadius: 100, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: 'none',
                    background: filter === f ? 'var(--accent)' : 'var(--bg-2)',
                    color: filter === f ? 'white' : 'var(--text-3)',
                    textTransform: 'capitalize',
                  }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* URL List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="card" style={{ padding: 24, height: 100 }}>
                <div style={{ width: '60%', height: 14, borderRadius: 4, background: 'var(--bg-3)', marginBottom: 10 }} />
                <div style={{ width: '40%', height: 10, borderRadius: 4, background: 'var(--bg-3)' }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: 60, textAlign: 'center' }}>
            <Link2 size={40} color="var(--text-3)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ color: 'var(--text-2)', marginBottom: 8 }}>
              {search || filter !== 'all' ? 'No links match your filter' : 'No links yet'}
            </h3>
            <p style={{ color: 'var(--text-3)', fontSize: 14 }}>
              {search || filter !== 'all' ? 'Try adjusting your search or filter' : 'Paste a URL above to create your first short link'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(url => (
              <UrlCard
                key={url.id || url._id}
                url={url}
                onDelete={handleDelete}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
