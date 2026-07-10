'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Input, { Textarea, Select } from '@/components/common/Input';
import Button from '@/components/common/Button';
import { FOOD_CATEGORIES, UNITS } from '@/utils/constants';
import { validateForm } from '@/utils/validators';

/**
 * Food form component for donors/restaurants
 * Maps client field names to server field names on submit
 */
// Returns current datetime as 'YYYY-MM-DDTHH:mm' (browser local time) for the min attribute
function getNowLocal() {
  const now = new Date();
  now.setSeconds(0, 0);
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export default function FoodForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(
    initialData
      ? {
          name: initialData.foodName || initialData.name || '',
          description: initialData.description || '',
          category: initialData.category || '',
          quantity: initialData.quantity ? String(initialData.quantity) : '',
          unit: initialData.unit || '',
          expiryDate: initialData.expiryTime
            ? new Date(initialData.expiryTime).toISOString().slice(0, 16)
            : initialData.expiryDate || '',
          pickupInstructions: initialData.pickupInstructions || '',
        }
      : {
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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.imageUrl || null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, image: 'Only image files are allowed' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Image must be less than 5MB' }));
      return;
    }
    setImageFile(file);
    setErrors((prev) => ({ ...prev, image: '' }));
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm(formData, {
      name: { required: true },
      quantity: { required: true, positive: true },
      expiryDate: { required: true },
    });

    // Reject past expiry date/time
    if (formData.expiryDate && new Date(formData.expiryDate) <= new Date()) {
      validationErrors.expiryDate = 'Expiry date & time must be in the future';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      // Map client field names to server field names
      await onSubmit({
        foodName: formData.name,
        description: formData.description,
        category: formData.category,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        expiryTime: new Date(formData.expiryDate).toISOString(),
        pickupInstructions: formData.pickupInstructions,
        _imageFile: imageFile, // pass raw file for separate upload
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
      />

      <Select
        label="Category"
        name="category"
        value={formData.category}
        onChange={handleChange}
        options={FOOD_CATEGORIES}
        error={errors.category}
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
        />
      </div>

      <Input
        label="Expiry Date & Time"
        type="datetime-local"
        name="expiryDate"
        value={formData.expiryDate}
        onChange={handleChange}
        min={getNowLocal()}
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

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
          Food Photo <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        {imagePreview ? (
          <div className="relative inline-block">
            <div className="relative w-48 h-36 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
              <img
                src={imagePreview}
                alt="Food preview"
                className="object-cover w-full h-full"
              />
            </div>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
            >
              ✕
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors"
          >
            <div className="text-3xl mb-2">📷</div>
            <p className="text-sm text-gray-500 dark:text-slate-400">Click to upload a photo</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG or WebP, max 5MB</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
        {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
      </div>

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

