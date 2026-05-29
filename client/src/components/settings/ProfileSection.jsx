'use client';

import { useState, useEffect } from 'react';
import { User, Building2, Store, Save } from 'lucide-react';
import Button from '@/components/common/Button';

const FC =
  'w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-gray-400';

const SHOP_TYPES = ['Restaurant', 'Bakery', 'Cafe', 'Catering', 'Hotel', 'Other'];

function FieldGroup({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

export default function ProfileSection({ user, roleProfile, role, onSave, saving }) {
  const isNgo = role === 'NGO' || role === 'ngo';

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    // NGO
    ngoName: '',
    address: '',
    coverageRadiusKm: '',
    // Restaurant
    shopName: '',
    shopType: '',
    shopAddress: '',
  });

  // Populate from props
  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      ngoName: roleProfile?.ngoName || '',
      address: isNgo ? (roleProfile?.address || '') : '',
      coverageRadiusKm: roleProfile?.coverageRadiusKm ?? '',
      shopName: roleProfile?.shopName || '',
      shopType: roleProfile?.shopType || '',
      shopAddress: !isNgo ? (roleProfile?.address || '') : '',
    });
  }, [user, roleProfile, isNgo]);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
    };
    if (isNgo) {
      payload.ngoName = form.ngoName;
      payload.address = form.address;
      if (form.coverageRadiusKm !== '') payload.coverageRadiusKm = Number(form.coverageRadiusKm);
    } else {
      payload.shopName = form.shopName;
      payload.shopType = form.shopType;
      payload.address = form.shopAddress;
    }
    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="h-9 w-9 rounded-xl bg-green-50 flex items-center justify-center">
          <User className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">Profile Information</h2>
          <p className="text-xs text-gray-400">An OTP will be sent to verify any changes.</p>
        </div>
      </div>

      {/* Account Info */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Account</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldGroup label="Full Name">
            <input className={FC} value={form.name} onChange={set('name')} placeholder="Your name" required />
          </FieldGroup>
          <FieldGroup label="Email Address">
            <input className={FC} type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
          </FieldGroup>
          <FieldGroup label="Phone Number">
            <input className={FC} type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
          </FieldGroup>
        </div>
      </section>

      {/* Role-specific */}
      {isNgo ? (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-green-500" />
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">NGO Details</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldGroup label="NGO Name">
              <input className={FC} value={form.ngoName} onChange={set('ngoName')} placeholder="Organisation name" />
            </FieldGroup>
            <FieldGroup label="Coverage Radius (km)">
              <input className={FC} type="number" min="1" max="500" value={form.coverageRadiusKm} onChange={set('coverageRadiusKm')} placeholder="e.g. 25" />
            </FieldGroup>
            <FieldGroup label="Address">
              <input className={`${FC} sm:col-span-2`} value={form.address} onChange={set('address')} placeholder="Full address" />
            </FieldGroup>
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-blue-500" />
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Restaurant Details</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldGroup label="Shop Name">
              <input className={FC} value={form.shopName} onChange={set('shopName')} placeholder="Shop name" />
            </FieldGroup>
            <FieldGroup label="Shop Type">
              <select className={FC} value={form.shopType} onChange={set('shopType')}>
                <option value="">Select type</option>
                {SHOP_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </FieldGroup>
            <FieldGroup label="Address">
              <input className={FC} value={form.shopAddress} onChange={set('shopAddress')} placeholder="Full address" />
            </FieldGroup>
          </div>
        </section>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">You&apos;ll receive a verification code before changes are saved.</p>
        <Button type="submit" loading={saving} disabled={saving} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </form>
  );
}
