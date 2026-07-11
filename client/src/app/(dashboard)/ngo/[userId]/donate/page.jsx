'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Copy, ExternalLink, Heart, TrendingUp, IndianRupee, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
// Note: We don't have an NGO-specific getPaymentHistory endpoint in our service yet (it currently fetches donor history)
// But we'll build the UI for it assuming we can mock it or the backend handles it via a different route later.
import axios from '@/lib/axios';
import { formatDate } from '@/utils/formatDate';
import Loader from '@/components/common/Loader';

export default function NgoDonateDashboard() {
  const { userId } = useParams();
  const { user } = useAuth();
  
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalAmount: 0, count: 0, uniqueDonors: 0 });

  const donateLink = typeof window !== 'undefined' ? `${window.location.origin}/donate/${user?.ngo?.id || userId}` : '';

  useEffect(() => {
    const fetchNgoDonations = async () => {
      try {
        setLoading(true);
        // Note: For now, if the endpoint doesn't exist to fetch NGO donations, we will handle a 404 gracefully
        // In a full implementation, you'd add `GET /api/ngos/donations` or similar.
        const res = await axios.get('/ngos/donations').catch(() => ({ data: { data: [] }}));
        const data = res?.data?.data || [];
        setDonations(data);
        
        // Calculate basic stats
        let total = 0;
        const unique = new Set();
        data.forEach(d => {
          total += (d.amount || 0);
          unique.add(d.donorId);
        });
        
        setStats({
          totalAmount: total,
          count: data.length,
          uniqueDonors: unique.size
        });
      } catch (err) {
        console.error('Failed to fetch donations', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchNgoDonations();
    }
  }, [user]);

  const copyToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(donateLink);
      toast.success('Donation link copied to clipboard!');
    }
  };

  if (loading) return <Loader fullScreen text="Loading donation data..." />;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-3 py-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Donations Dashboard</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">Track financial support and manage your donor relationships</p>
      </div>

      {/* Share Link Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-between gap-6 rounded-[28px] bg-gradient-to-br from-emerald-700 via-green-600 to-teal-500 p-6 text-white shadow-xl md:flex-row"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-6 h-6 fill-white/20" />
            <h2 className="text-xl font-bold">Your Public Donation Link</h2>
          </div>
          <p className="text-green-50 mb-4 text-sm md:text-base">
            Share this link on your website, social media, or with partners to receive secure online donations via Razorpay.
          </p>
          <div className="flex w-full max-w-xl items-center gap-2 rounded-xl bg-black/20 p-2 backdrop-blur-sm">
            <code className="flex-1 text-sm text-white px-2 truncate select-all">{donateLink}</code>
            <button 
              onClick={copyToClipboard}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors shrink-0"
              title="Copy to clipboard"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
        <Link 
          href={`/donate/${user?.ngo?.id || userId}`}
          target="_blank"
          className="bg-white dark:bg-slate-800 text-green-700 px-6 py-3 rounded-xl font-bold hover:bg-green-50 transition-colors shadow-sm whitespace-nowrap flex items-center gap-2 shrink-0 w-full md:w-auto justify-center"
        >
          View Public Page <ExternalLink className="w-4 h-4" />
        </Link>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col">
          <div className="flex items-center gap-3 text-gray-500 dark:text-slate-400 mb-4">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <IndianRupee className="w-5 h-5" />
            </div>
            <span className="font-medium text-sm uppercase tracking-wide">Total Raised</span>
          </div>
          <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white">₹{stats.totalAmount.toLocaleString()}</h3>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col">
          <div className="flex items-center gap-3 text-gray-500 dark:text-slate-400 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="font-medium text-sm uppercase tracking-wide">Total Donations</span>
          </div>
          <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white">{stats.count}</h3>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col">
          <div className="flex items-center gap-3 text-gray-500 dark:text-slate-400 mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <span className="font-medium text-sm uppercase tracking-wide">Unique Donors</span>
          </div>
          <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white">{stats.uniqueDonors}</h3>
        </div>
      </div>

      {/* Recent Donations Table */}
      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Donations</h3>
        </div>
        
        {donations.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-slate-400 flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">No donations yet</p>
            <p className="text-sm">Share your link to start receiving support!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-slate-300">
              <thead className="bg-gray-50/50 text-xs uppercase text-gray-500 dark:text-slate-400 font-medium">
                <tr>
                  <th className="px-6 py-4">Donor</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Transaction ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {donations.map((donation, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-900 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {donation.donorName || `Donor #${donation.donorId}`}
                    </td>
                    <td className="px-6 py-4 font-bold text-green-600">
                      ₹{donation.amount}
                    </td>
                    <td className="px-6 py-4">
                      {formatDate(donation.createdAt || new Date())}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Completed
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-400">
                      {donation.paymentId || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}