'use client';

import Image from 'next/image';
import { StatusBadge } from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { formatDateTime, getTimeRemaining } from '@/utils/formatDate';

/**
 * Food card component for NGO
 */
export default function FoodCard({ food, onRequest }) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-4">
      {/* Image */}
      <div className="relative h-48 mb-4 rounded-lg overflow-hidden bg-gray-200">
        {food.images && food.images[0] ? (
          <Image
            src={food.images[0]}
            alt={food.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No Image
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{food.name}</h3>
          <StatusBadge status={food.status} />
        </div>

        <p className="text-sm text-gray-600 line-clamp-2">{food.description}</p>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Quantity: <span className="font-medium text-gray-900">{food.quantity} {food.unit}</span>
          </span>
          <span className="text-gray-500">
            Category: <span className="font-medium text-gray-900">{food.category}</span>
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Expires: <span className="font-medium text-red-600">{getTimeRemaining(food.expiryDate)}</span>
          </span>
        </div>

        {food.restaurant && (
          <p className="text-sm text-gray-500">
            From: <span className="font-medium text-gray-900">{food.restaurant.name}</span>
          </p>
        )}

        {/* Actions */}
        <div className="pt-4">
          <Button
            fullWidth
            onClick={() => onRequest(food)}
            disabled={food.status !== 'available'}
          >
            Request Food
          </Button>
        </div>
      </div>
    </div>
  );
}

