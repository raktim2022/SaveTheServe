'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2, 
  User,
  Building2,
  Heart,
  Shield,
  MapPin,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Textarea from '@/components/common/Textarea';
import BackButton from '@/components/common/BackButton';
import { useAuth } from '@/hooks/useAuth';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { register as registerService } from '@/services/auth.service';
import '@/styles/auth.css';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: searchParams.get('type') === 'restaurant' ? 'RESTAURANT' : 'NGO',
    organizationName: '',
    description: '',
    address: '',
    coverageRadiusKm: 10,
    shopType: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  const { location, loading: locationLoading, error: locationError, refetch: refetchLocation } = useGeoLocation({ autoFetch: false });

  const handleLocationRequest = async () => {
    try {
      setLocationPermission(true);
      await refetchLocation();
    } catch (err) {
      console.error('Location permission denied:', err);
      setError('Location access is required for registration. Please enable location permissions.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate required fields based on role
    if (!formData.organizationName) {
      setError(`${formData.role === 'NGO' ? 'NGO' : 'Restaurant'} name is required`);
      setLoading(false);
      return;
    }

    if (!formData.address) {
      setError('Address is required');
      setLoading(false);
      return;
    }

    if (!location) {
      setError('Location access is required. Please enable location permissions and try again.');
      setLoading(false);
      return;
    }

    try {
      // Prepare registration data with location
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
        organizationName: formData.organizationName,
        description: formData.description,
        address: formData.address,
        latitude: location.latitude,
        longitude: location.longitude,
      };

      // Add role-specific fields
      if (formData.role === 'NGO') {
        registrationData.coverageRadiusKm = formData.coverageRadiusKm;
      } else if (formData.role === 'RESTAURANT') {
        registrationData.shopType = formData.shopType || 'Restaurant';
      }

      // Only include phone if it's not empty
      if (formData.phone && formData.phone.trim()) {
        registrationData.phone = formData.phone;
      }

      console.log('Sending registration data:', registrationData);
      const response = await registerService(registrationData);
      console.log('Registration response:', response);

      // Redirect to email verification instead of auto-login
      if (response.data.verificationToken) {
        // Store email for verification page
        sessionStorage.setItem('registrationEmail', formData.email);
        router.push('/verify-email');
      } else {
        // Fallback: auto-login if verification not required
        const { data } = response;
        await login(data.token, data.user);
      }
    } catch (err) {
      console.error('Registration error:', err);
      // Show detailed error message
      const errorMessage = err.errors
        ? err.errors.map(e => e.message).join(', ')
        : err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-emerald-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-amber-400/20 to-green-600/20 rounded-full blur-3xl"></div>
      </div>
      
      <BackButton 
        href="/" 
        label="Back to Home" 
        showHomeButton={false} 
        className="absolute top-6 left-6 z-10"
      />
      
      <motion.div 
        className="w-full max-w-2xl relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Card */}
        <motion.div 
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          {/* Header */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600 text-sm">Join SaveTheServe and help combat food waste while feeding communities</p>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div 
              className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-r-lg mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-400 rounded-full mr-3 flex-shrink-0"></div>
                <span className="text-sm font-medium">{error}</span>
              </div>
            </motion.div>
          )}

          {/* Form */}
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
              <Select
                label="I am registering as"
                name="role"
                value={formData.role}
                onChange={handleChange}
                options={[
                  { 
                    value: 'NGO', 
                    label: 'NGO / Non-Profit Organization'
                  },
                  { 
                    value: 'RESTAURANT', 
                    label: 'Restaurant / Food Donor'
                  },
                ]}
                required
              />
            </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/50"
              />

              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/50"
              />
            </div>

            <Input
              label="Phone (Optional)"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1234567890"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/50"
            />

            <Input
              label={`${formData.role === 'NGO' ? 'NGO' : 'Restaurant'} Name`}
              name="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              required
              placeholder={`Enter your ${formData.role === 'NGO' ? 'NGO' : 'restaurant'} name`}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/50"
            />

            {formData.role === 'RESTAURANT' && (
              <Input
                label="Restaurant Type (Optional)"
                name="shopType"
                value={formData.shopType}
                onChange={handleChange}
                placeholder="e.g., Restaurant, Bakery, Cafe, Grocery Store"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/50"
              />
            )}

            <Textarea
              label="Description (Optional)"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder={`Tell us about your ${formData.role === 'NGO' ? 'organization and mission' : 'restaurant and the food you typically donate'}`}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/50 resize-vertical"
            />

            {/* Address and Location */}
            <div className="space-y-4">
              <Input
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="Enter your complete address"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/50"
              />
              
              {/* Location Permission Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">Location Access Required</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      We need your location to help connect you with nearby {formData.role === 'NGO' ? 'food donors' : 'NGOs'} and provide accurate distance calculations.
                    </p>
                    {!location && !locationError && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleLocationRequest}
                        loading={locationLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {locationLoading ? 'Getting Location...' : 'Allow Location Access'}
                      </Button>
                    )}
                    {location && (
                      <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                        <CheckCircle className="h-4 w-4" />
                        Location accessed successfully (±{location.accuracy?.toFixed(0) || 'Unknown'}m accuracy)
                      </div>
                    )}
                    {locationError && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          {locationError}
                        </div>
                        <div className="space-y-1 text-xs text-gray-600">
                          <p className="font-medium">To enable location access:</p>
                          <ul className="list-disc list-inside pl-2 space-y-1">
                            <li>Click the location icon in your browser's address bar</li>
                            <li>Select "Allow" when prompted for location permission</li>
                            <li>Refresh the page if needed</li>
                          </ul>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={handleLocationRequest}
                          loading={locationLoading}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                        >
                          {locationLoading ? 'Retrying...' : 'Try Again'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {formData.role === 'NGO' && (
              <Input
                label="Coverage Radius (km)"
                name="coverageRadiusKm"
                type="number"
                min="1"
                max="100"
                value={formData.coverageRadiusKm}
                onChange={handleChange}
                placeholder="10"
                helpText="How far are you willing to travel to pick up food donations?"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/50"
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  Must contain uppercase, lowercase, number, and special character
                </p>
              </div>

              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                type="submit" 
                fullWidth 
                loading={loading} 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Create Account
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </motion.div>
          </motion.form>

          {/* Divider */}
          <div className="my-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">or</span>
            </div>
          </div>

          {/* Sign In Link */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="text-green-600 hover:text-green-700 font-semibold transition-colors hover:underline"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <p className="text-gray-500 text-xs">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-green-600 hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-green-600 hover:underline">Privacy Policy</Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

