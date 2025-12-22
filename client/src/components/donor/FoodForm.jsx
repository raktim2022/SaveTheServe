'use client';

import { useState } from 'react';
import Input, { Textarea, Select } from '@/components/common/Input';
import Button from '@/components/common/Button';
import { FOOD_CATEGORIES, UNITS } from '@/utils/constants';
import { validateForm } from '@/utils/validators';

/**
 * Food form component for donors/restaurants
 */
export default function FoodForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(
    initialData || {
      name: '',
      description: '',
      category: '',
      quantity: '',
      unit: '',
      expiryDate: '',
      pickupInstructions: '',
    }
  );
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm(formData, {
      name: { required: true },
      description: { required: true },
      category: { required: true },
      quantity: { required: true, positive: true },
      unit: { required: true },
      expiryDate: { required: true },
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        quantity: parseFloat(formData.quantity),
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Food Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="e.g., Fresh Sandwiches"
        error={errors.name}
        required
      />

      <Textarea
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Describe the food item..."
        error={errors.description}
        required
      />

      <Select
        label="Category"
        name="category"
        value={formData.category}
        onChange={handleChange}
        options={FOOD_CATEGORIES}
        error={errors.category}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Quantity"
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          placeholder="0"
          error={errors.quantity}
          required
        />

        <Select
          label="Unit"
          name="unit"
          value={formData.unit}
          onChange={handleChange}
          options={UNITS}
          error={errors.unit}
          required
        />
      </div>

      <Input
        label="Expiry Date & Time"
        type="datetime-local"
        name="expiryDate"
        value={formData.expiryDate}
        onChange={handleChange}
        error={errors.expiryDate}
        required
      />

      <Textarea
        label="Pickup Instructions"
        name="pickupInstructions"
        value={formData.pickupInstructions}
        onChange={handleChange}
        placeholder="Special instructions for pickup..."
        rows={3}
      />

      <div className="flex gap-3 pt-4">
        <Button type="submit" loading={loading} fullWidth>
          {initialData ? 'Update' : 'Create'} Food Listing
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} fullWidth>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

