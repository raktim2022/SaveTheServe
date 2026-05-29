'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, CheckCircle, AlertCircle, MapPin, Utensils, Users, Globe, Landmark, Handshake } from 'lucide-react';
import Button from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { register as registerService } from '@/services/auth.service';
import '@/styles/auth.css';

const FIELD_CLASS =
  'w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-gray-400';

function Field({ label, required, hint, error, children }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [role, setRole] = useState(
    searchParams.get('type') === 'restaurant' ? 'restaurant' : 'ngo'
  );
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
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

  const {
    location,
    loading: locationLoading,
    error: locationError,
    refetch: refetchLocation,
  } = useGeoLocation({ autoFetch: false });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!formData.organizationName.trim()) {
      setError(`${role === 'ngo' ? 'NGO' : 'Restaurant'} name is required`);
      return;
    }
    if (!formData.address.trim()) {
      setError('Address is required');
      return;
    }
    if (!location) {
      setError('Location access is required. Click "Allow Location" below and try again.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role,
        organizationName: formData.organizationName,
        description: formData.description,
        address: formData.address,
        latitude: location.latitude,
        longitude: location.longitude,
        ...(formData.phone.trim() && { phone: formData.phone }),
        ...(role === 'ngo' && { coverageRadiusKm: formData.coverageRadiusKm }),
        ...(role === 'restaurant' && { shopType: formData.shopType || 'Restaurant' }),
      };

      const response = await registerService(payload);

      if (response.data.verificationToken) {
        sessionStorage.setItem('registrationEmail', formData.email);
        sessionStorage.setItem('registrationUserId', String(response.data.user.id));
        router.push('/verify-email');
      } else {
        const { data } = response;
        await login(data.token, data.user);
      }
    } catch (err) {
      const errorMessage = err.errors
        ? err.errors.map((e) => e.message).join(', ')
        : err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isNgo = role === 'ngo';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-green-600 to-emerald-700 flex-col justify-between p-10 text-white">
        <div>
          <Image
            src="/images/logo.svg"
            alt="SaveTheServe"
            width={160}
            height={48}
            className="h-10 w-auto brightness-0 invert mb-8"
          />
          <h1 className="text-3xl font-bold leading-tight mb-3">
            Join the movement to end food waste
          </h1>
          <p className="text-green-100 text-sm leading-relaxed">
            Connect restaurants with surplus food to NGOs that can distribute it to communities in need.
          </p>
        </div>

        <div className="space-y-4">
          {[
            { icon: <Utensils className="h-4 w-4" />, text: 'Restaurants list surplus food in minutes' },
            { icon: <Users className="h-4 w-4" />, text: 'NGOs discover and request nearby donations' },
            { icon: <Globe className="h-4 w-4" />, text: 'Together we reduce waste and feed communities' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-sm text-green-100">
              <span className="shrink-0 opacity-80">{icon}</span>
              <span>{text}</span>
            </div>
          ))}
          <p className="text-green-200 text-xs pt-2">
            Already have an account?{' '}
            <Link href="/login" className="text-white font-semibold underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 overflow-y-auto">
        <div className="mx-auto w-full max-w-lg">
          {/* Mobile logo */}
          <div className="lg:hidden mb-6 text-center">
            <Image
              src="/images/logo.svg"
              alt="SaveTheServe"
              width={160}
              height={48}
              className="h-9 w-auto mx-auto mb-3"
            />
            <p className="text-xs text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-green-600 font-medium">Sign in</Link>
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h2>
          <p className="text-sm text-gray-500 mb-8">
            Fill in the details below to get started. Takes less than 2 minutes.
          </p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              {
                value: 'ngo',
                icon: <Landmark className="h-6 w-6" />,
                title: 'NGO / Non-Profit',
                desc: 'Collect surplus food for communities',
              },
              {
                value: 'restaurant',
                icon: <Utensils className="h-6 w-6" />,
                title: 'Restaurant / Donor',
                desc: 'Donate your surplus food to NGOs',
              },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setRole(opt.value); setError(''); }}
                className={`text-left p-4 rounded-xl border-2 transition-all duration-150 ${
                  role === opt.value
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <span className={`block mb-2 ${role === opt.value ? 'text-green-600' : 'text-gray-400'}`}>
                  {opt.icon}
                </span>
                <p className={`text-sm font-semibold ${role === opt.value ? 'text-green-700' : 'text-gray-800'}`}>
                  {opt.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">{opt.desc}</p>
              </button>
            ))}
          </div>

          {/* Volunteer CTA */}
          <Link
            href="/volunteer-register"
            className="flex items-center justify-between w-full mb-8 p-4 rounded-xl border-2 border-dashed border-teal-200 bg-teal-50 hover:border-teal-400 hover:bg-teal-100 transition-all duration-150 group"
          >
            <div className="flex items-center gap-3">
              <span className="text-teal-500 group-hover:text-teal-700">
                <Handshake className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm font-semibold text-teal-800">Volunteer</p>
                <p className="text-xs text-teal-600 mt-0.5">Join an NGO and help with food pickups</p>
              </div>
            </div>
            <span className="text-xs font-medium text-teal-600 group-hover:text-teal-800">Register →</span>
          </Link>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Section: Personal */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Personal Details
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Full Name" required>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Jane Smith"
                    required
                    className={FIELD_CLASS}
                  />
                </Field>
                <Field label="Email Address" required>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="jane@example.com"
                    required
                    className={FIELD_CLASS}
                  />
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Phone Number" hint="Optional — used for pickup coordination">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 234 567 8900"
                    className={FIELD_CLASS}
                  />
                </Field>
              </div>
            </div>

            {/* Section: Organization */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                {isNgo ? 'NGO Details' : 'Restaurant Details'}
              </p>
              <div className="space-y-4">
                <Field
                  label={isNgo ? 'NGO / Organization Name' : 'Restaurant Name'}
                  required
                >
                  <input
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleChange}
                    placeholder={isNgo ? 'e.g. Hope Foundation' : 'e.g. The Green Kitchen'}
                    required
                    className={FIELD_CLASS}
                  />
                </Field>

                {!isNgo && (
                  <Field label="Restaurant Type" hint="Optional — helps NGOs understand your offerings">
                    <input
                      name="shopType"
                      value={formData.shopType}
                      onChange={handleChange}
                      placeholder="e.g. Bakery, Café, Grocery Store"
                      className={FIELD_CLASS}
                    />
                  </Field>
                )}

                <Field
                  label="Description"
                  hint={isNgo ? 'Describe your mission and the communities you serve' : 'Describe the food you typically donate'}
                >
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder={
                      isNgo
                        ? 'We serve underprivileged families in the downtown area…'
                        : 'We typically have surplus pastries and prepared meals…'
                    }
                    className={`${FIELD_CLASS} resize-none`}
                  />
                </Field>

                {isNgo && (
                  <Field
                    label="Coverage Radius (km)"
                    hint="Maximum distance you're willing to travel for pickups"
                  >
                    <input
                      type="number"
                      name="coverageRadiusKm"
                      value={formData.coverageRadiusKm}
                      onChange={handleChange}
                      min="1"
                      max="100"
                      placeholder="10"
                      className={FIELD_CLASS}
                    />
                  </Field>
                )}
              </div>
            </div>

            {/* Section: Location */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Location
              </p>
              <div className="space-y-4">
                <Field label="Street Address" required>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Main St, City, State"
                    required
                    className={FIELD_CLASS}
                  />
                </Field>

                {/* GPS panel */}
                <div className={`rounded-xl border p-4 transition-colors ${
                  location
                    ? 'bg-green-50 border-green-200'
                    : locationError
                    ? 'bg-red-50 border-red-200'
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <MapPin className={`h-4 w-4 mt-0.5 shrink-0 ${
                      location ? 'text-green-600' : locationError ? 'text-red-500' : 'text-blue-600'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 mb-0.5">GPS Location</p>
                      <p className="text-xs text-gray-500 mb-3">
                        Required to match you with nearby{' '}
                        {isNgo ? 'food donors' : 'NGOs'}.
                      </p>

                      {location ? (
                        <div className="flex items-center gap-1.5 text-green-700 text-xs font-medium">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Location captured (±{location.accuracy?.toFixed(0) ?? '?'}m accuracy)
                        </div>
                      ) : locationError ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-red-600 text-xs">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            {locationError}
                          </div>
                          <ul className="text-xs text-gray-500 list-disc list-inside space-y-0.5 pl-1">
                            <li>Click the lock icon in your browser's address bar</li>
                            <li>Set Location to "Allow"</li>
                          </ul>
                          <button
                            type="button"
                            onClick={refetchLocation}
                            disabled={locationLoading}
                            className="mt-1 text-xs font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
                          >
                            {locationLoading ? 'Retrying…' : 'Try again →'}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={refetchLocation}
                          disabled={locationLoading}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-white border border-blue-300 px-3 py-1.5 rounded-lg hover:bg-blue-50 disabled:opacity-50 transition-colors"
                        >
                          {locationLoading ? (
                            <>
                              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Detecting location…
                            </>
                          ) : (
                            <>
                              <MapPin className="h-3 w-3" />
                              Allow Location Access
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Password */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Password
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Password"
                  required
                  hint="Min 8 chars with uppercase, number & symbol"
                >
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className={`${FIELD_CLASS} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>

                <Field label="Confirm Password" required>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className={`${FIELD_CLASS} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>
              </div>
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg">
              {!loading && `Create ${isNgo ? 'NGO' : 'Restaurant'} Account →`}
            </Button>

            <p className="text-center text-xs text-gray-400 leading-relaxed">
              By creating an account you agree to our{' '}
              <Link href="/terms" className="text-green-600 hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-green-600 hover:underline">Privacy Policy</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
