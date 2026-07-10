'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { TrendingUp, CheckCircle, Package, Users } from 'lucide-react';
import Loader from '@/components/common/Loader';
import { getMyRequests } from '@/services/request.service';

// ── Horizontal Progress Bar ───────────────────────────────────────────────────
function ProgressBar({ label, value, max, color = 'bg-green-500' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-600 dark:text-slate-300">
        <span>{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Simple Trend Sparkline ────────────────────────────────────────────────────
function Sparkline({ data }) {
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 180;
    const y = 40 - (v / max) * 36;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 180 44" className="w-full h-12" preserveAspectRatio="none">
      <polyline fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function NGOImpactPage() {
  const { userId } = useParams();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await getMyRequests();
      setRequests(res?.data || []);
    } catch { /* non-critical */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <Loader fullScreen text="Loading your impact…" />;

  const completed = requests.filter((r) => r.status === 'COMPLETED').length;
  const pending = requests.filter((r) => r.status === 'PENDING').length;
  const accepted = requests.filter((r) => r.status === 'ACCEPTED').length;
  const totalKg = requests.reduce((s, r) => s + (parseFloat(r.foodListing?.quantity) || 0), 0);
  const peopleFed = Math.round(totalKg * 4); // ~4 people per kg estimate

  // 6-month trend
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return { month: d.getMonth(), year: d.getFullYear(), label: d.toLocaleString('default', { month: 'short' }) };
  });
  const trendData = months.map((m) =>
    requests.filter((r) => {
      const d = new Date(r.createdAt);
      return d.getMonth() === m.month && d.getFullYear() === m.year;
    }).length
  );
  const trendLabels = months.map((m) => m.label);

  // Top donors (restaurants that donated most)
  const donorMap = {};
  requests.forEach((r) => {
    const name = r.foodListing?.restaurant?.shopName || 'Unknown';
    donorMap[name] = (donorMap[name] || 0) + 1;
  });
  const topDonors = Object.entries(donorMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const statCards = [
    { label: 'Total Requests', value: requests.length, icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Completed Pickups', value: completed, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Kg Received', value: Math.round(totalKg), icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'People Fed (est.)', value: peopleFed, icon: Users, color: 'text-teal-600', bg: 'bg-teal-50' },
  ];

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">NGO Impact</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Track your food rescue journey and community impact</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((c) => (
          <div key={c.label} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4">
            <div className={`inline-flex p-2 rounded-lg ${c.bg} mb-3`}>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{c.value}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Trend chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 dark:text-slate-100 mb-3">Requests Over Last 6 Months</h2>
          <Sparkline data={trendData} />
          <div className="flex justify-between mt-1">
            {trendLabels.map((l, i) => (
              <span key={i} className="text-xs text-gray-400">{l}</span>
            ))}
          </div>
        </div>

        {/* Request status breakdown */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 dark:text-slate-100 mb-4">Request Breakdown</h2>
          <div className="space-y-3">
            <ProgressBar label="Completed" value={completed} max={requests.length} color="bg-green-500" />
            <ProgressBar label="Accepted" value={accepted} max={requests.length} color="bg-blue-500" />
            <ProgressBar label="Pending" value={pending} max={requests.length} color="bg-amber-400" />
          </div>
        </div>
      </div>

      {/* Top donors */}
      {topDonors.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 dark:text-slate-100 mb-4">🏆 Top Donor Restaurants</h2>
          <div className="space-y-3">
            {topDonors.map(([name, count], i) => (
              <div key={name} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm text-gray-700 dark:text-slate-200 truncate">{name}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{count} donations</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
