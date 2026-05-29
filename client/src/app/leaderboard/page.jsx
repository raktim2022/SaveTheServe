'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, ArrowLeft, Medal } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getPublicLeaderboard } from '@/services/analytics.service';

const TABS = [
  { key: 'restaurants', label: '🍽️ Restaurants' },
  { key: 'ngos', label: '🤝 NGOs' },
];

const RANK_STYLES = [
  'text-amber-500',   // 1st
  'text-slate-400',   // 2nd
  'text-amber-700',   // 3rd
];

function RankBadge({ rank }) {
  if (rank <= 3) return <Medal className={`h-5 w-5 ${RANK_STYLES[rank - 1]}`} />;
  return <span className="text-sm font-semibold text-gray-400 w-5 text-center">{rank}</span>;
}

function LeaderRow({ rank, name, primary, secondary, delay }) {
  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-center w-8">
        <RankBadge rank={rank} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{name}</p>
        <p className="text-xs text-gray-500 truncate">{secondary}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-bold text-green-700">{primary}</p>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState('restaurants');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicLeaderboard(10)
      .then((res) => setData(res?.data || res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const restaurantRows = (data?.topRestaurants || []).map((r, i) => ({
    rank: i + 1,
    name: r.shopName || r.name || 'Restaurant',
    primary: `${r.totalDonations ?? r.completedRequests ?? 0} donations`,
    secondary: r.city || r.location || '',
  }));

  const ngoRows = (data?.topNGOs || []).map((n, i) => ({
    rank: i + 1,
    name: n.ngoName || n.name || 'NGO',
    primary: `${n.totalReceived ?? n.completedRequests ?? 0} pickups`,
    secondary: n.city || n.location || '',
  }));

  const rows = activeTab === 'restaurants' ? restaurantRows : ngoRows;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-green-50/60 via-white to-white pt-24 pb-20">
        <div className="max-w-2xl mx-auto px-4 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-3">
              <div className="h-14 w-14 rounded-2xl bg-amber-100 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-amber-500" />
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">Impact Leaderboard</h1>
            <p className="text-gray-500">Celebrating the organizations rescuing the most food</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === t.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg">No data yet</p>
              <p className="text-sm mt-1">Be the first to make an impact!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((r) => (
                <LeaderRow key={r.rank} {...r} delay={r.rank * 60} />
              ))}
            </div>
          )}

          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-green-700 hover:text-green-900 font-medium">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
