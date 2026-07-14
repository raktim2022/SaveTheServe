'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users, Search, Shield, Heart, ChefHat, Mail, Phone,
  CheckCircle, XCircle, RotateCcw, AlertCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Loader from '@/components/common/Loader';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { getUsers, suspendUser, activateUser, getUserStats } from '@/services/user.service';

export default function UsersPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const userId = params?.userId;

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, ngos: 0, restaurants: 0, admins: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user && userId) {
      if (user.id.toString() !== userId.toString() || user.role !== 'ADMIN') {
        router.push('/login');
        return;
      }
      fetchAll();
    }
  }, [user, userId]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [usersRes, statsRes] = await Promise.all([
        getUsers().catch(() => ({ data: [] })),
        getUserStats().catch(() => ({})),
      ]);

      const usersData = usersRes?.data?.users || usersRes?.data || usersRes || [];
      const statsData = statsRes?.data || statsRes || {};

      setUsers(Array.isArray(usersData) ? usersData : []);
      setStats({
        total: statsData.total ?? usersData.length ?? 0,
        ngos: statsData.ngos ?? 0,
        restaurants: statsData.restaurants ?? 0,
        admins: statsData.admins ?? 0,
      });
    } catch (err) {
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (targetUserId) => {
    const reason = window.prompt('Please enter a reason for suspension:');
    if (!reason) return; // User cancelled or entered empty string
    
    if (reason.length < 10) {
      setError('Reason must be at least 10 characters long.');
      return;
    }

    try {
      setActionLoading(targetUserId);
      setError('');
      await suspendUser(targetUserId, reason);
      setSuccessMsg('User suspended successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to suspend user.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivate = async (targetUserId) => {
    try {
      setActionLoading(targetUserId);
      setError('');
      await activateUser(targetUserId);
      setSuccessMsg('User reactivated successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reactivate user.');
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'NGO': return Heart;
      case 'RESTAURANT': return ChefHat;
      case 'ADMIN': return Shield;
      default: return Users;
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'NGO': return 'success';
      case 'RESTAURANT': return 'primary';
      case 'ADMIN': return 'warning';
      default: return 'secondary';
    }
  };

  const getStatusBadgeVariant = (isVerified) => {
    return isVerified ? 'success' : 'warning';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) return <Loader fullScreen text="Loading users..." />;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-600 dark:text-slate-300 mt-1">Manage all registered platform users</p>
        </div>
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          <RotateCcw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.total, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'NGOs', value: stats.ngos, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Restaurants', value: stats.restaurants, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Admins', value: stats.admins, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((s) => (
          <div key={s.label} className={`glass-card p-4 rounded-xl ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-600 dark:text-slate-300">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
          <CheckCircle className="h-4 w-4 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 rounded-xl"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="ALL">All Roles</option>
            <option value="NGO">NGOs</option>
            <option value="RESTAURANT">Restaurants</option>
            <option value="ADMIN">Admins</option>
            <option value="VOLUNTEER">Volunteers</option>
          </select>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Users ({filteredUsers.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
              <tr>
                {['User', 'Role', 'Verified', 'Contact', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {filteredUsers.map((u, index) => {
                const RoleIcon = getRoleIcon(u.role);
                const isSuspending = actionLoading === u.id;
                return (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-900 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-600 to-secondary-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <RoleIcon className="h-4 w-4 text-gray-400" />
                        <Badge variant={getRoleBadgeVariant(u.role)}>{u.role}</Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusBadgeVariant(u.isVerified)}>
                        {u.isVerified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1"><Mail className="h-3 w-3" />{u.email}</div>
                        {u.phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3" />{u.phone}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {u.role !== 'ADMIN' && (
                          u.isVerified ? (
                            <button
                              disabled={isSuspending}
                              onClick={() => handleSuspend(u.id)}
                              className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                              <XCircle className="h-3 w-3" />
                              {isSuspending ? '...' : 'Suspend'}
                            </button>
                          ) : (
                            <button
                              disabled={isSuspending}
                              onClick={() => handleReactivate(u.id)}
                              className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle className="h-3 w-3" />
                              {isSuspending ? '...' : 'Reactivate'}
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-16">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-slate-400">No users match your filters.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}