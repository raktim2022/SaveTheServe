import { StatusBadge } from '@/components/common/Badge';
import { formatDateTime } from '@/utils/formatDate';

/**
 * Pickup status component for NGO
 */
export default function PickupStatus({ request }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{request.food?.name}</h3>
        <StatusBadge status={request.status} />
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-slate-300">Quantity:</span>
          <span className="font-medium">{request.requestedQuantity} {request.food?.unit}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-slate-300">Pickup Time:</span>
          <span className="font-medium">{formatDateTime(request.pickupTime)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-slate-300">Restaurant:</span>
          <span className="font-medium">{request.restaurant?.name}</span>
        </div>

        {request.status === 'approved' && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-green-800 text-sm font-medium">
              ✓ Request Approved! Please arrive at the scheduled time.
            </p>
          </div>
        )}

        {request.status === 'rejected' && request.rejectionReason && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg">
            <p className="text-red-800 text-sm font-medium">
              Rejection Reason: {request.rejectionReason}
            </p>
          </div>
        )}

        {request.notes && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
            <p className="text-gray-700 dark:text-slate-200 text-sm">
              <span className="font-medium">Notes:</span> {request.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

