'use client';

import { useState } from 'react';
import Input, { Textarea } from '@/components/common/Input';
import Button from '@/components/common/Button';
import { validateForm } from '@/utils/validators';

/**
 * Request form component for NGO
 */
export default function RequestForm({ food, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    requestedQuantity: '',
    pickupTime: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateForm(formData, {
      requestedQuantity: {
        required: true,
        positive: true,
        requiredMessage: 'Please enter quantity',
        positiveMessage: 'Quantity must be greater than 0',
      },
      pickupTime: {
        required: true,
        requiredMessage: 'Please select pickup time',
      },
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Check if requested quantity exceeds available
    if (parseFloat(formData.requestedQuantity) > food.quantity) {
      setErrors({ requestedQuantity: `Maximum available: ${food.quantity} ${food.unit}` });
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        foodId: food.id,
        ...formData,
        requestedQuantity: parseFloat(formData.requestedQuantity),
      });
    } catch (error) {
      console.error('Error submitting request:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">{food.name}</h3>
        <p className="text-sm text-gray-600">
          Available: {food.quantity} {food.unit}
        </p>
      </div>

      <Input
        label="Requested Quantity"
        type="number"
        name="requestedQuantity"
        value={formData.requestedQuantity}
        onChange={handleChange}
        placeholder={`Max: ${food.quantity}`}
        error={errors.requestedQuantity}
        required
      />

      <Input
        label="Pickup Time"
        type="datetime-local"
        name="pickupTime"
        value={formData.pickupTime}
        onChange={handleChange}
        error={errors.pickupTime}
        required
      />

      <Textarea
        label="Notes (Optional)"
        name="notes"
        value={formData.notes}
        onChange={handleChange}
        placeholder="Any special instructions or notes..."
        rows={3}
      />

      <div className="flex gap-3 pt-4">
        <Button type="submit" loading={loading} fullWidth>
          Submit Request
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} fullWidth>
          Cancel
        </Button>
      </div>
    </form>
  );
}

