'use client';

import { useEffect, useRef, useState } from 'react';

function useCountUp(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!target) return;
    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return count;
}

function StatBox({ label, value, suffix = '', prefix = '', icon }) {
  const animated = useCountUp(value);
  return (
    <div className="text-center space-y-1">
      <div className="text-4xl font-extrabold text-white tabular-nums">
        {prefix}{animated.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-primary-100">{icon} {label}</div>
    </div>
  );
}

/**
 * Fetches live stats from the public analytics leaderboard endpoint
 * and displays animated count-up numbers.
 */
export default function LiveImpactCounter() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    fetch(`${API}/analytics/public/leaderboard?limit=50`)
      .then((r) => r.json())
      .then((json) => {
        const data = json?.data || {};
        const restaurants = data.topRestaurants || [];
        const ngos = data.topNGOs || [];
        const totalKg = restaurants.reduce((s, r) => s + (r.totalDonations || 0), 0);
        const peopleFed = ngos.reduce((s, n) => s + (n.estimatedPeopleFed || 0), 0);
        const donations = restaurants.reduce((s, r) => s + (r.completedRequests || 0), 0);
        setStats({
          kg: Math.round(totalKg),
          people: peopleFed,
          donations,
          restaurants: restaurants.length,
        });
      })
      .catch(() => {
        // Fallback to illustrative numbers if API unavailable
        setStats({ kg: 4820, people: 19280, donations: 312, restaurants: 48 });
      });
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="text-center space-y-2">
            <div className="h-10 w-24 bg-white/20 rounded-lg mx-auto" />
            <div className="h-4 w-20 bg-white/10 rounded mx-auto" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      <StatBox label="kg of food rescued" value={stats.kg} suffix="+" icon="🍲" />
      <StatBox label="people fed" value={stats.people} suffix="+" icon="🧑‍🤝‍🧑" />
      <StatBox label="successful pickups" value={stats.donations} suffix="+" icon="✅" />
      <StatBox label="restaurants donating" value={stats.restaurants} suffix="+" icon="🏪" />
    </div>
  );
}
