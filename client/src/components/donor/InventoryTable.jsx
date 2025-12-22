'use client';

import { StatusBadge } from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { formatDateTime } from '@/utils/formatDate';

/**
 * Inventory table component for donors
 */
export default function InventoryTable({ foods, onEdit, onDelete }) {
  if (!foods || foods.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">No food listings yet.</p>
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
              <th>Category</th>
              <th>Quantity</th>
              <th>Expiry Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {foods.map((food) => (
              <tr key={food.id}>
                <td className="font-medium">{food.name}</td>
                <td className="capitalize">{food.category}</td>
                <td>
                  {food.quantity} {food.unit}
                </td>
                <td>{formatDateTime(food.expiryDate)}</td>
                <td>
                  <StatusBadge status={food.status} />
                </td>
                <td>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => onEdit(food)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => onDelete(food.id)}>
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

