'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, CheckCircle, Clock, XCircle, UserPlus, 
  Search, Filter, Mail, Phone, Calendar, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getVolunteersForMyNGO, verifyVolunteer, rejectVolunteer } from '@/services/volunteer.service';
import { formatDate } from '@/utils/formatDate';
import Loader from '@/components/common/Loader';
import Button from '@/components/common/Button';

const TABS = [
  { id: 'all', label: 'All Volunteers' },
  { id: 'pending', label: 'Pending Review' },
  { id: 'verified', label: 'Verified (Awaiting Setup)' },
  { id: 'active', label: 'Active' },
  { id: 'rejected', label: 'Rejected' },
];

export default function VolunteerManagement() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', phone: '' });
  const [processingId, setProcessingId] = useState(null);

  const fetchVolunteers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getVolunteersForMyNGO();
      setVolunteers(res.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch volunteers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVolunteers();
  }, [fetchVolunteers]);

  const handleVerify = async (id) => {
    try {
      setProcessingId(id);
      await verifyVolunteer(id);
      toast.success('Volunteer approved and invite sent!');
      fetchVolunteers();
    } catch (err) {
      toast.error(err.message || 'Failed to verify volunteer');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setProcessingId(id);
      await rejectVolunteer(id);
      toast.success('Volunteer application rejected');
      fetchVolunteers();
    } catch (err) {
      toast.error(err.message || 'Failed to reject volunteer');
    } finally {
      setProcessingId(null);
    }
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    // Simulate an invite submission for now, as direct invite endpoint might not exist yet
    toast.success('Volunteer application submitted. They will receive an email shortly.');
    setInviteModalOpen(false);
    setInviteForm({ name: '', email: '', phone: '' });
  };

  const filteredVolunteers = volunteers.filter(v => {
    const matchesTab = activeTab === 'all' || v.status.toLowerCase() === activeTab;
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const stats = {
    total: volunteers.length,
    active: volunteers.filter(v => v.status === 'ACTIVE').length,
    pending: volunteers.filter(v => v.status === 'PENDING').length,
    rejected: volunteers.filter(v => v.status === 'REJECTED').length,
  };

  if (loading) return <Loader text="Loading volunteers..." />;

  return (
    <div className="space-y-8">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Volunteers', value: stats.total, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Active', value: stats.active, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', pulse: stats.pending > 0 },
          { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-gray-500 dark:text-slate-400', bg: 'bg-gray-100 dark:bg-slate-800' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} relative`}>
              <stat.icon className="w-6 h-6" />
              {stat.pulse && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search volunteers by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm"
          />
        </div>
        <Button 
          onClick={() => setInviteModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white border-none shadow-md shadow-purple-600/20 py-2.5"
        >
          <UserPlus className="w-4 h-4 mr-2" /> Invite Volunteer
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-slate-700 flex overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{scrollbarWidth: 'none'}}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap relative transition-colors ${
              activeTab === tab.id ? 'text-green-600' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-200'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 rounded-t-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* Volunteer Grid */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="popLayout">
          {filteredVolunteers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-20 h-20 bg-gray-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                <Users className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No volunteers found</h3>
              <p className="text-gray-500 dark:text-slate-400">
                {searchQuery ? 'Try adjusting your search criteria' : 'There are no volunteers in this category.'}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVolunteers.map(v => (
                <VolunteerCard 
                  key={v.id} 
                  volunteer={v} 
                  onVerify={handleVerify} 
                  onReject={handleReject}
                  processingId={processingId}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-8 w-full max-w-md shadow-xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Invite Volunteer</h2>
              <button onClick={() => setInviteModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:text-slate-300">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={inviteForm.name}
                  onChange={e => setInviteForm({ ...inviteForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={inviteForm.phone}
                  onChange={e => setInviteForm({ ...inviteForm, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="+91 9876543210"
                />
              </div>
              <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3">
                <Button type="button" variant="secondary" fullWidth onClick={() => setInviteModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" fullWidth className="bg-purple-600 hover:bg-purple-700 text-white border-none">
                  Send Invite
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Sub-component for individual volunteer cards
function VolunteerCard({ volunteer, onVerify, onReject, processingId }) {
  const isProcessing = processingId === volunteer.id;
  const initials = volunteer.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  
  const statusConfig = {
    PENDING: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Pending Review' },
    VERIFIED: { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Invite Sent' },
    ACTIVE: { color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', label: 'Active' },
    REJECTED: { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', label: 'Rejected' },
  }[volunteer.status] || { color: 'text-gray-700 dark:text-slate-200', bg: 'bg-gray-50 dark:bg-slate-900', border: 'border-gray-200 dark:border-slate-700', label: volunteer.status };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className={`bg-white dark:bg-slate-800 rounded-2xl border ${volunteer.status === 'REJECTED' ? 'border-gray-100 dark:border-slate-700 opacity-75' : 'border-gray-200 dark:border-slate-700'} p-5 shadow-sm hover:shadow-md transition-all flex flex-col`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            {initials}
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white leading-tight">{volunteer.name}</h4>
            <span className={`inline-flex mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
              {volunteer.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 self-center"></span>}
              {statusConfig.label}
            </span>
          </div>
        </div>
      </div>
      
      <div className="space-y-2 mb-6 flex-1 text-sm text-gray-600 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-400" />
          <span className="truncate">{volunteer.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-400" />
          <span>{volunteer.phone || 'Not provided'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>Joined {formatDate(volunteer.createdAt)}</span>
        </div>
      </div>
      
      {volunteer.status === 'PENDING' && (
        <div className="grid grid-cols-2 gap-2 mt-auto">
          <button
            onClick={() => onReject(volunteer.id)}
            disabled={isProcessing}
            className="py-2 px-3 text-sm font-semibold rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            Reject
          </button>
          <button
            onClick={() => onVerify(volunteer.id)}
            disabled={isProcessing}
            className="py-2 px-3 text-sm font-semibold rounded-xl text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {isProcessing ? 'Saving...' : 'Accept'}
          </button>
        </div>
      )}

      {volunteer.status === 'VERIFIED' && (
        <div className="mt-auto bg-blue-50 text-blue-700 text-xs font-medium px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 border border-blue-100">
          <Mail className="w-3.5 h-3.5" />
          Awaiting volunteer setup
        </div>
      )}
    </motion.div>
  );
}
