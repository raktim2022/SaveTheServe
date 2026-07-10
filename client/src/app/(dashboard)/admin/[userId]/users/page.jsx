'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Search, Filter, MoreVertical, Shield, Heart, ChefHat, Mail, Phone, Calendar, CheckCircle, XCircle, Edit } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Loader from '@/components/common/Loader';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';

export default function UsersPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const userId = params?.userId;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Validate user access to this page
  useEffect(() => {
    if (user && userId) {
      // Check if the user ID matches the logged-in user and user is ADMIN
      if (user.id.toString() !== userId.toString() || user.role !== 'ADMIN') {
        router.push('/login');
        return;
      }
    }
  }, [user, userId, router]);

  useEffect(() => {
    if (user && userId) {
      fetchUsers();
    }
  }, [user, userId]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockUsers = [
        {
          id: 1,
          name: 'Green Hearts Foundation',
          email: 'contact@greenhearts.org',
          role: 'NGO',
          status: 'ACTIVE',
          phone: '+1-555-0123',
          organizationName: 'Green Hearts Foundation',
          createdAt: '2024-01-15T10:00:00Z',
          lastLoginAt: '2024-12-22T14:30:00Z'
        },
        {
          id: 2,
          name: 'Downtown Bistro',
          email: 'manager@downtownbistro.com',
          role: 'RESTAURANT',
          status: 'ACTIVE',
          phone: '+1-555-0456',
          businessName: 'Downtown Bistro',
          createdAt: '2024-02-01T09:15:00Z',
          lastLoginAt: '2024-12-22T12:45:00Z'
        },
        {
          id: 3,
          name: 'Food Angels',
          email: 'info@foodangels.org',
          role: 'NGO',
          status: 'PENDING',
          phone: '+1-555-0789',
          organizationName: 'Food Angels',
          createdAt: '2024-12-20T16:20:00Z',
          lastLoginAt: null
        },
        {
          id: 4,
          name: 'Corner Cafe',
          email: 'owner@cornercafe.com',
          role: 'RESTAURANT',
          status: 'SUSPENDED',
          phone: '+1-555-0321',
          businessName: 'Corner Cafe',
          createdAt: '2024-03-10T11:30:00Z',
          lastLoginAt: '2024-12-15T18:20:00Z'
        }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'NGO':
        return Heart;
      case 'RESTAURANT':
        return ChefHat;
      case 'ADMIN':
        return Shield;
      default:
        return Users;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'NGO':
        return 'success';
      case 'RESTAURANT':
        return 'primary';
      case 'ADMIN':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'SUSPENDED':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleUserAction = async (userId, action) => {
    try {
      console.log(`Action: ${action} on user: ${userId}`);
      // Implement actual API calls here
      alert(`${action} action triggered for user ${userId}`);
    } catch (error) {
      console.error('Error performing user action:', error);
      alert('Failed to perform action');
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading users..." />;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-600 dark:text-slate-300 mt-1">Manage registered users, NGOs, and restaurants</p>
        </div>
        <Button>
          <Users className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card p-6 rounded-xl"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="ALL">All Roles</option>
            <option value="NGO">NGOs</option>
            <option value="RESTAURANT">Restaurants</option>
            <option value="ADMIN">Admins</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="glass-card rounded-xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Users ({filteredUsers.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {filteredUsers.map((user, index) => {
                const RoleIcon = getRoleIcon(user.role);
                return (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-900 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-600 to-secondary-500 text-white flex items-center justify-center font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                          <div className="text-sm text-gray-500 dark:text-slate-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <RoleIcon className="h-4 w-4 mr-2" />
                        <Badge variant={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                      {formatDate(user.lastLoginAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUserAction(user.id, 'edit')}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        {user.status === 'PENDING' && (
                          <Button
                            size="sm"
                            onClick={() => handleUserAction(user.id, 'approve')}
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        )}
                        {user.status === 'ACTIVE' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserAction(user.id, 'suspend')}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Users Found</h3>
            <p className="text-gray-600 dark:text-slate-300">No users match your current filters.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}