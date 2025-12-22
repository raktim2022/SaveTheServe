import Button from '@/components/common/Button';
import { formatDate } from '@/utils/formatDate';

/**
 * Verification card component for admin
 */
export default function VerificationCard({ user, onApprove, onReject }) {
  const isNGO = user.role === 'ngo';
  const isRestaurant = user.role === 'restaurant';
  const details = isNGO ? user.ngo : isRestaurant ? user.restaurant : null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{user.name}</h3>
          <p className="text-sm text-gray-600">{user.email}</p>
          <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium capitalize">
            {user.role}
          </span>
        </div>
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
          Pending Verification
        </span>
      </div>

      {details && (
        <div className="space-y-3 mb-4 text-sm">
          <div>
            <span className="text-gray-600">Organization Name:</span>
            <span className="ml-2 font-medium">{details.name}</span>
          </div>

          {details.registrationNumber && (
            <div>
              <span className="text-gray-600">Registration Number:</span>
              <span className="ml-2 font-medium">{details.registrationNumber}</span>
            </div>
          )}

          {details.type && (
            <div>
              <span className="text-gray-600">Type:</span>
              <span className="ml-2 font-medium capitalize">{details.type}</span>
            </div>
          )}

          {details.description && (
            <div>
              <span className="text-gray-600">Description:</span>
              <p className="mt-1 text-gray-700">{details.description}</p>
            </div>
          )}

          <div>
            <span className="text-gray-600">Registered:</span>
            <span className="ml-2 font-medium">{formatDate(user.createdAt)}</span>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4 border-t">
        <Button
          variant="success"
          onClick={() => onApprove(user.id)}
          fullWidth
        >
          Approve
        </Button>
        <Button
          variant="danger"
          onClick={() => onReject(user.id)}
          fullWidth
        >
          Reject
        </Button>
      </div>
    </div>
  );
}

