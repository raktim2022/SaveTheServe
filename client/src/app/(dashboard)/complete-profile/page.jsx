'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import Input, { Textarea } from '@/components/common/Input';
import Button from '@/components/common/Button';
import { updateUser } from '@/services/user.service';
import { Building2, MapPin, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

const SHOP_TYPES = [
  'Restaurant',
  'Cafe',
  'Bakery',
  'Catering',
  'Hotel',
  'Fast Food',
  'Fine Dining',
  'Other'
];

export default function CompleteProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, updateUser: updateAuthUser } = useAuth();
  const { location } = useGeoLocation();

  const [formData, setFormData] = useState({
    shopName: '',
    shopType: '',
    address: '',
    phone: '',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Redirect if already verified or not authenticated
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.businessVerified) {
        // Already completed profile
        const dashboardRoute = user.role === 'NGO' ? '/dashboard/ngo' : '/dashboard/donor';
        router.push(dashboardRoute);
      }
    }
  }, [user, authLoading, router]);

  // Pre-fill location if available
  useEffect(() => {
    if (location && !formData.address) {
      setFormData(prev => ({
        ...prev,
        address: `${location.lat}, ${location.lon}`
      }));
    }
  }, [location]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.shopName.trim()) {
      newErrors.shopName = 'Business name is required';
    }
    if (!formData.shopType) {
      newErrors.shopType = 'Business type is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10,}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Invalid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitted(true);
      return;
    }

    setLoading(true);
    try {
      // Update user with business details
      const response = await updateUser(user.id, {
        ...formData,
        businessVerified: true,
      });

      // Update auth context
      updateAuthUser({
        ...user,
        ...response.data,
        businessVerified: true,
      });

      // Redirect to dashboard
      const dashboardRoute = user.role === 'NGO' ? '/dashboard/ngo' : '/dashboard/donor';
      router.push(dashboardRoute);
    } catch (error) {
      setErrors({
        submit: error.message || 'Failed to save profile. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="animate-spin">
          <div className="h-8 w-8 border-4 border-gray-200 dark:border-slate-700 border-t-green-600 rounded-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <Building2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Complete Your Business Profile
          </h1>
          <p className="text-gray-600 dark:text-slate-300">
            Help us verify your business details to get started
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
          {/* Error Alert */}
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{errors.submit}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Name */}
            <Input
              label="Business Name"
              name="shopName"
              value={formData.shopName}
              onChange={handleChange}
              placeholder="e.g., ABC Restaurant"
              error={submitted && errors.shopName}
              required
              disabled={loading}
            />

            {/* Business Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                Business Type <span className="text-red-500">*</span>
              </label>
              <select
                name="shopType"
                value={formData.shopType}
                onChange={handleChange}
                disabled={loading}
                className={clsx(
                  'w-full px-4 py-2 border rounded-lg transition',
                  'focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent',
                  'disabled:bg-gray-100 dark:bg-slate-800 disabled:cursor-not-allowed',
                  errors.shopType ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                )}
              >
                <option value="">Select a business type</option>
                {SHOP_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {submitted && errors.shopType && (
                <p className="text-sm text-red-600">{errors.shopType}</p>
              )}
            </div>

            {/* Address */}
            <Input
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your full business address"
              error={submitted && errors.address}
              required
              disabled={loading}
              icon={<MapPin className="h-4 w-4" />}
            />

            {/* Phone */}
            <Input
              label="Contact Phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your contact number"
              error={submitted && errors.phone}
              required
              disabled={loading}
            />

            {/* Description */}
            <Textarea
              label="Business Description (Optional)"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell us about your business..."
              disabled={loading}
              rows={4}
            />

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> This information will be used to verify your business and ensure compliance with our platform guidelines.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => router.back()}
                disabled={loading}
                className="flex-1"
              >
                Go Back
              </Button>
              <Button
                type="submit"
                loading={loading}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Saving...' : 'Complete Profile'}
              </Button>
            </div>
          </form>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-gray-500 dark:text-slate-400 mt-6">
          You can update these details anytime in your settings
        </p>
      </div>
    </div>
  );
}