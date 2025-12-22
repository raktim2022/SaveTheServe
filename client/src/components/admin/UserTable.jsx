'use client';

import { StatusBadge } from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { formatDate } from '@/utils/formatDate';

/**
 * User table component for admin
 */
export default function UserTable({ users, onVerify, onSuspend, onDelete }) {
  if (!users || users.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">No users found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="font-medium">{user.name}</td>
                <td>{user.email}</td>
                <td className="capitalize">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    {user.role}
                  </span>
                </td>
                <td>
                  <StatusBadge status={user.status} />
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  <div className="flex gap-2">
                    {!user.verified && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => onVerify(user.id)}
                      >
                        Verify
                      </Button>
                    )}
                    {user.status === 'active' ? (
                      <Button
                        size="sm"
                        variant="warning"
                        onClick={() => onSuspend(user.id)}
                      >
                        Suspend
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => onVerify(user.id)}
                      >
                        Activate
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => onDelete(user.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

