'use client';

import { useState, useEffect } from 'react';
import UserTable from '@/components/admin/UserTable';
import Loader from '@/components/common/Loader';
import {
  getUsers,
  verifyUser,
  suspendUser,
  deleteUser,
} from '@/services/user.service';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data || response);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId) => {
    try {
      await verifyUser(userId);
      fetchUsers();
      alert('User verified successfully');
    } catch (error) {
      console.error('Error verifying user:', error);
      alert('Failed to verify user');
    }
  };

  const handleSuspend = async (userId) => {
    if (!confirm('Are you sure you want to suspend this user?')) return;

    try {
      await suspendUser(userId);
      fetchUsers();
      alert('User suspended successfully');
    } catch (error) {
      console.error('Error suspending user:', error);
      alert('Failed to suspend user');
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.'))
      return;

    try {
      await deleteUser(userId);
      fetchUsers();
      alert('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading users..." />;
  }

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-title">User Management</h1>
        <p className="text-gray-600">Manage all platform users</p>
      </div>

      <UserTable
        users={users}
        onVerify={handleVerify}
        onSuspend={handleSuspend}
        onDelete={handleDelete}
      />
    </div>
  );
}

