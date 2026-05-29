'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, User, Mail, Phone, Building2, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';
import Button from '@/components/common/Button';
import { listNGOs, registerVolunteer } from '@/services/volunteer.service';

const FIELD_CLASS =
  'w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-gray-400';

function Field({ label, required, error, children }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function VolunteerRegisterPage() {
  const router = useRouter();
  const [ngos, setNgos] = useState([]);
  const [ngosLoading, setNgosLoading] = useState(true);
  const [form, setForm] = useState({ ngoId: '', name: '', email: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [globalError, setGlobalError] = useState('');

  useEffect(() => {
    listNGOs()
      .then((res) => setNgos(res.data || []))
      .catch(() => setNgos([]))
      .finally(() => setNgosLoading(false));
  }, []);

  const validate = () => {
    const e = {};
    if (!form.ngoId) e.ngoId = 'Please select an NGO';
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address';
    if (form.phone && !/^\+?[\d\s\-()]{7,20}$/.test(form.phone)) e.phone = 'Invalid phone number';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setGlobalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setGlobalError('');
    try {
      await registerVolunteer({
        ngoId: parseInt(form.ngoId),
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || undefined,
      });
      setSuccess(true);
    } catch (err) {
      setGlobalError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-500 mb-6 text-sm leading-relaxed">
            Thank you for registering as a volunteer. We have sent you a confirmation email.
            The NGO will review your application and send your login credentials once verified.
          </p>
          <Link
            href="/login"
            className="inline-block w-full py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl shadow-lg mb-4">
            <Heart className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Become a Volunteer</h1>
          <p className="text-gray-500 text-sm mt-1">Join an NGO and help reduce food waste</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-5">
          {globalError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{globalError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NGO Select */}
            <Field label="Select NGO" required error={errors.ngoId}>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <select
                  name="ngoId"
                  value={form.ngoId}
                  onChange={handleChange}
                  className={`${FIELD_CLASS} pl-9 appearance-none ${errors.ngoId ? 'border-red-400' : ''}`}
                  disabled={ngosLoading}
                >
                  <option value="">{ngosLoading ? 'Loading NGOs...' : 'Choose an NGO...'}</option>
                  {ngos.map((ngo) => (
                    <option key={ngo.id} value={ngo.id}>
                      {ngo.ngoName} – {ngo.address}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </Field>

            {/* Full Name */}
            <Field label="Full Name" required error={errors.name}>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className={`${FIELD_CLASS} pl-9 ${errors.name ? 'border-red-400' : ''}`}
                />
              </div>
            </Field>

            {/* Email */}
            <Field label="Email Address" required error={errors.email}>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`${FIELD_CLASS} pl-9 ${errors.email ? 'border-red-400' : ''}`}
                />
              </div>
            </Field>

            {/* Phone */}
            <Field label="Phone Number" error={errors.phone}>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210 (optional)"
                  className={`${FIELD_CLASS} pl-9 ${errors.phone ? 'border-red-400' : ''}`}
                />
              </div>
            </Field>

            <Button type="submit" fullWidth loading={loading} disabled={ngosLoading || loading}>
              Submit Application
            </Button>
          </form>

          <p className="text-center text-xs text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-green-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
