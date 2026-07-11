'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { TrendingUp, Package, Users, Leaf } from 'lucide-react';
import Loader from '@/components/common/Loader';
import { getMyFoodListings } from '@/services/food.service';
import { getIncomingRequests } from '@/services/request.service';

// ── Simple CSS Bar Chart ──────────────────────────────────────────────────────
function BarChart({ data, color = 'bg-green-500' }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-36 w-full">
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">{d.value || ''}</span>
          <div
            className={`w-full rounded-t-md ${color} transition-all duration-700`}
            style={{ height: `${Math.round((d.value / max) * 100)}%`, minHeight: d.value ? '4px' : '0' }}
          />
          <span className="text-xs text-gray-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Simple SVG Donut Chart ────────────────────────────────────────────────────
function DonutChart({ slices }) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  let offset = 0;
  const r = 40, cx = 50, cy = 50, circumference = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
        {slices.map((s) => {
          const dash = (s.value / total) * circumference;
          const el = (
            <circle
              key={s.label}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="18"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset * circumference / total}
            />
          );
          offset += s.value;
          return el;
        })}
      </svg>
      <ul className="space-y-1.5 text-sm">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-gray-600 dark:text-slate-300">{s.label}</span>
            <span className="ml-auto font-semibold text-gray-800 dark:text-slate-100">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DonorImpactPage() {
  const { userId } = useParams();
  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [l, r] = await Promise.all([getMyFoodListings(), getIncomingRequests()]);
      setListings(l?.data || []);
      setRequests(r?.data || []);
    } catch { /* non-critical */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <Loader fullScreen text="Loading your impact…" />;

  const completed = requests.filter((r) => r.status === 'COMPLETED').length;
  const totalKg = listings.reduce((s, l) => s + (parseFloat(l.quantity) || 0), 0);
  const co2 = Math.round(totalKg * 2.5);

  // 6-month bar chart data
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return { month: d.getMonth(), year: d.getFullYear(), label: d.toLocaleString('default', { month: 'short' }) };
  });
  const barData = months.map((m) => ({
    label: m.label,
    value: listings.filter((l) => {
      const d = new Date(l.createdAt);
      return d.getMonth() === m.month && d.getFullYear() === m.year;
    }).length,
  }));

  // Food type donut
  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#a78bfa', '#f97316', '#14b8a6'];
  const categoryMap = {};
  listings.forEach((l) => {
    const k = l.category || 'other';
    categoryMap[k] = (categoryMap[k] || 0) + 1;
  });
  const slices = Object.entries(categoryMap).map(([k, v], i) => ({
    label: k.charAt(0).toUpperCase() + k.slice(1),
    value: v,
    color: COLORS[i % COLORS.length],
  }));

  const statCards = [
    { label: 'Listings Posted', value: listings.length, icon: Package, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pickups Completed', value: completed, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Kg of Food Donated', value: Math.round(totalKg), icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'CO₂ Saved (kg)', value: co2, icon: Leaf, color: 'text-teal-600', bg: 'bg-teal-50' },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-3 py-4 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Impact</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">See the difference your food donations are making</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((c) => (
          <div key={c.label} className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className={`inline-flex p-2 rounded-lg ${c.bg} mb-3`}>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{c.value}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 dark:text-slate-100 mb-4">Listings Over Last 6 Months</h2>
          <BarChart data={barData} color="bg-green-500" />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 dark:text-slate-100 mb-4">Donations by Food Type</h2>
          {slices.length > 0 ? <DonutChart slices={slices} /> : (
            <p className="text-sm text-gray-400 text-center py-8">No data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
