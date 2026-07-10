"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { listNGOs, registerVolunteer } from "@/services/volunteer.service";
import Input, { Textarea } from "@/components/common/Input";
import Button from "@/components/common/Button";
import { updateUser } from "@/services/user.service";
import { Building2, Users, AlertCircle } from "lucide-react";
import clsx from "clsx";

const ROLES = [
  {
    id: "RESTAURANT",
    label: "Restaurant/Food Business",
    description: "I want to donate excess food",
    icon: "🍔",
  },
  {
    id: "NGO",
    label: "NGO/Charity",
    description: "I want to request and distribute food",
    icon: "🤝",
  },
  {
    id: "VOLUNTEER",
    label: "Volunteer",
    description: "I want to help transport food",
    icon: "🚚",
  },
];

const SHOP_TYPES = [
  "Restaurant",
  "Cafe",
  "Bakery",
  "Catering",
  "Hotel",
  "Fast Food",
  "Fine Dining",
  "Other",
];

export default function SetupProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, updateUser: updateAuthUser } = useAuth();

  const [step, setStep] = useState(1); // Step 1: Role Selection, Step 2: Profile Details
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    shopName: "",
    shopType: "",
    ngoName: "",
    ngoId: "",
    address: "",
    phone: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [ngos, setNgos] = useState([]);

  useEffect(() => {
    listNGOs()
      .then((res) => setNgos(res.data || []))
      .catch(() => setNgos([]));
  }, []);

  // Redirect if already set up or not authenticated
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role && user.role !== "RESTAURANT") {
        // Already has a proper role (not temp default)
        const getDashboardRoute = (user) => {
          switch (user.role) {
            case "RESTAURANT":
              return `/donor/${user.id}`;

            case "NGO":
              return `/ngo/${user.id}`;

            case "VOLUNTEER":
              return `/volunteer/${user.id}`;

            case "ADMIN":
              return "/admin";

            default:
              return "/";
          }
        };

        router.push(
          getDashboardRoute({
            ...user,
            role: selectedRole,
          }),
        );
      }
    }
  }, [user, authLoading, router]);

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setFormData((prev) => ({
      ...prev,
      shopName: "",
      ngoName: "",
    }));
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateProfileForm = () => {
    const newErrors = {};

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10,}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Invalid phone number";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (selectedRole === "RESTAURANT") {
      if (!formData.shopName.trim()) {
        newErrors.shopName = "Business name is required";
      }
      if (!formData.shopType) {
        newErrors.shopType = "Business type is required";
      }
    } else if (selectedRole === "NGO") {
      if (!formData.ngoName.trim()) {
        newErrors.ngoName = "Organization name is required";
      }
    } else if (selectedRole === "VOLUNTEER") {
      if (!formData.ngoId) {
        newErrors.ngoId = "Please select an NGO";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (selectedRole) {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateProfileForm()) {
      return;
    }

    setLoading(true);
    try {
      const updatePayload = {
        role: selectedRole,
        phone: formData.phone,
      };

      // Add role-specific fields
      if (selectedRole === "RESTAURANT") {
        updatePayload.shopName = formData.shopName;
        updatePayload.shopType = formData.shopType;
        updatePayload.address = formData.address;
      } else if (selectedRole === "NGO") {
        updatePayload.ngoName = formData.ngoName;
        updatePayload.address = formData.address;
      }

      if (formData.description) {
        updatePayload.description = formData.description;
      }

        if (selectedRole === "VOLUNTEER") {
        await registerVolunteer({
          ngoId: Number(formData.ngoId),
          name: user.name,
          email: user.email,
          phone: formData.phone,
        });

        updateAuthUser({
          ...user,
          role: 'VOLUNTEER',
          phone: formData.phone,
        });

        router.push('/volunteer/pending');
        return;
      }

      const response = await updateUser(user.id, updatePayload);

      // Update auth context
      updateAuthUser({
        ...user,
        ...response.data,
      });
      // Redirect to appropriate dashboard
      const getDashboardRoute = (user) => {
        switch (user.role) {
          case "RESTAURANT":
            return `/donor/${user.id}`;

          case "NGO":
            return `/ngo/${user.id}`;

          case "VOLUNTEER":
            return `/volunteer/${user.id}`;

          case "ADMIN":
            return "/admin";

          default:
            return "/";
        }
      };

      router.push(
        getDashboardRoute({
          ...user,
          role: selectedRole,
        }),
      );
    } catch (error) {
      setErrors({
        submit: error.message || "Failed to complete setup. Please try again.",
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
    <div className="min-h-screen bg-linear-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <Building2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {step === 1 ? "Choose Your Role" : "Complete Your Profile"}
          </h1>
          <p className="text-gray-600 dark:text-slate-300">
            {step === 1
              ? "Tell us who you are to get started"
              : "Fill in the details to set up your account"}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center gap-2 mb-8">
          <div
            className={clsx(
              "h-2 w-12 rounded-full",
              step >= 1 ? "bg-green-600" : "bg-gray-200",
            )}
          />
          <div
            className={clsx(
              "h-2 w-12 rounded-full",
              step >= 2 ? "bg-green-600" : "bg-gray-200",
            )}
          />
        </div>

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className={clsx(
                    "p-6 rounded-xl border-2 transition text-left",
                    selectedRole === role.id
                      ? "border-green-600 bg-green-50"
                      : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-green-300",
                  )}
                >
                  <div className="text-3xl mb-3">{role.icon}</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {role.label}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-slate-300">{role.description}</p>
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Button
                variant="secondary"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button disabled={!selectedRole || loading} onClick={handleNext}>
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Profile Details */}
        {step === 2 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{errors.submit}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role-Specific Fields */}
              {selectedRole === "RESTAURANT" && (
                <>
                  <Input
                    label="Business Name"
                    name="shopName"
                    value={formData.shopName}
                    onChange={handleChange}
                    placeholder="e.g., ABC Restaurant"
                    error={errors.shopName}
                    required
                    disabled={loading}
                  />

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
                        "w-full px-4 py-2 border rounded-lg transition",
                        "focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
                        "disabled:bg-gray-100 dark:bg-slate-800 disabled:cursor-not-allowed",
                        errors.shopType ? "border-red-500" : "border-gray-300 dark:border-slate-600",
                      )}
                    >
                      <option value="">Select a business type</option>
                      {SHOP_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {errors.shopType && (
                      <p className="text-sm text-red-600">{errors.shopType}</p>
                    )}
                  </div>
                </>
              )}

              {selectedRole === "NGO" && (
                <Input
                  label="Organization Name"
                  name="ngoName"
                  value={formData.ngoName}
                  onChange={handleChange}
                  placeholder="e.g., Food For All NGO"
                  error={errors.ngoName}
                  required
                  disabled={loading}
                />
              )}

              {selectedRole === "VOLUNTEER" && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                    Select NGO <span className="text-red-500">*</span>
                  </label>

                  <select
                    name="ngoId"
                    value={formData.ngoId}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Choose NGO...</option>

                    {ngos.map((ngo) => (
                      <option key={ngo.id} value={ngo.id}>
                        {ngo.ngoName}
                      </option>
                    ))}
                  </select>

                  {errors.ngoId && (
                    <p className="text-sm text-red-600">{errors.ngoId}</p>
                  )}
                </div>
              )}

              {/* Common Fields */}
              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your contact number"
                error={errors.phone}
                required
                disabled={loading}
              />

              <Input
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your full address"
                error={errors.address}
                required
                disabled={loading}
              />

              <Textarea
                label="Description (Optional)"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell us about your business or organization..."
                disabled={loading}
                rows={3}
              />

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> You can update these details anytime in
                  your settings.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Setting up..." : "Complete Setup"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
