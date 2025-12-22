'use client';

import { StatusBadge } from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { formatDateTime } from '@/utils/formatDate';

/**
 * Pickup requests component for donors
 */
export default function PickupRequests({ requests, onApprove, onReject, onComplete }) {
  if (!requests || requests.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">No pickup requests.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div key={request.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">{request.food?.name}</h3>
              <p className="text-sm text-gray-600">
                Requested by: {request.ngo?.name}
              </p>
            </div>
            <StatusBadge status={request.status} />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <span className="text-gray-600">Quantity:</span>
              <span className="ml-2 font-medium">
                {request.requestedQuantity} {request.food?.unit}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Pickup Time:</span>
              <span className="ml-2 font-medium">
                {formatDateTime(request.pickupTime)}
              </span>
            </div>
          </div>

          {request.notes && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Notes:</span> {request.notes}
              </p>
            </div>
          )}

          {request.status === 'pending' && (
            <div className="flex gap-3">
              <Button
                size="sm"
                variant="success"
                onClick={() => onApprove(request.id)}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => onReject(request.id)}
              >
                Reject
              </Button>
            </div>
          )}

          {request.status === 'approved' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => onComplete(request.id)}
            >
              Mark as Completed
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

