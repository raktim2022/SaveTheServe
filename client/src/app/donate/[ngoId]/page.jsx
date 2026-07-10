'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, ShieldCheck, Lock, Gift, Copy, CheckCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { initiatePayment, verifyPayment } from '@/services/payment.service';
import { useAuth } from '@/hooks/useAuth';
import axios from '@/lib/axios';

const PRESET_AMOUNTS = [100, 250, 500, 1000, 2500, 5000];

export default function PublicDonatePage() {
  const { ngoId } = useParams();
  const { user } = useAuth();
  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [amount, setAmount] = useState(500);
  const [customAmount, setCustomAmount] = useState('');
  
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setDonorName(user.name || '');
      setDonorEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    const fetchNgoDetails = async () => {
      try {
        setLoading(true);
        // We'll try to fetch NGO details if possible. If public route doesn't exist, we fall back.
        // Assuming there's a public route or we just show a generic NGO name.
        // Since we don't have a public NGO details endpoint explicitly defined in the task,
        // we'll fetch from a potential analytics or generic endpoint if available, else gracefully fallback.
        const res = await axios.get(`/ngos/${ngoId}`).catch(() => null);
        if (res?.data?.data) {
          setNgo(res.data.data);
        } else {
          // Fallback if the endpoint is protected or missing
          setNgo({ id: ngoId, ngoName: `NGO Partner #${ngoId}` });
        }
      } catch (err) {
        setNgo({ id: ngoId, ngoName: `NGO Partner #${ngoId}` });
      } finally {
        setLoading(false);
      }
    };
    if (ngoId) {
      fetchNgoDetails();
    }
  }, [ngoId]);

  const loadRazorpay = () => new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handleDonate = async (e) => {
    e.preventDefault();
    const finalAmount = customAmount ? parseFloat(customAmount) : amount;
    
    if (!finalAmount || finalAmount < 1) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!user) {
      toast.error('Please log in to make a donation');
      // In a real app, you might redirect to login with a callback URL, but for now we just show a toast.
      return;
    }

    setProcessing(true);
    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load. Are you online?');
      }

      // 1. Initiate order from backend
      const response = await initiatePayment(ngoId, finalAmount);
      const orderData = response.data;

      // 2. Open Razorpay modal
      const options = {
        key: orderData.key,
        amount: orderData.amount, // in paise
        currency: orderData.currency || 'INR',
        name: 'SaveTheServe',
        description: orderData.description || `Donation to ${ngo?.ngoName || 'NGO'}`,
        order_id: orderData.orderId,
        prefill: { name: donorName, email: donorEmail },
        theme: { color: '#16a34a' }, // Emerald 600
        handler: async (paymentResponse) => {
          try {
            toast.loading('Verifying payment...', { id: 'verify' });
            // 3. Verify payment
            await verifyPayment({
              orderId: paymentResponse.razorpay_order_id,
              paymentId: paymentResponse.razorpay_payment_id,
              signature: paymentResponse.razorpay_signature,
              ngoId: ngoId,
              amount: finalAmount,
            });
            toast.success('Payment successful!', { id: 'verify' });
            setSuccess(true);
          } catch (verifyErr) {
            toast.error('Payment verification failed', { id: 'verify' });
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        toast.error(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
      
    } catch (err) {
      toast.error(err.message || 'Failed to initiate donation');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, delay: 0.2 }}
            className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-12 h-12" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Thank You!</h1>
          <p className="text-gray-600 dark:text-slate-300 mb-6">
            Your generous donation to <strong>{ngo?.ngoName || 'the NGO'}</strong> has been received successfully. You have made a real impact today.
          </p>
          <div className="bg-gray-50 dark:bg-slate-900 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Amount Donated</p>
            <p className="text-2xl font-bold text-green-600">
              ₹{customAmount ? customAmount : amount}
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
          >
            Return to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Side: NGO Details & Impact */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold mb-6">
              <Heart className="w-4 h-4 fill-green-800" /> Secure Donation
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
              Support <span className="text-green-600">{ngo?.ngoName || 'This NGO'}</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-slate-300">
              Your contribution helps rescue surplus food and feed those in need. Every rupee counts towards fighting hunger and reducing food waste.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">What your donation does</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold">₹100</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Feeds up to 4 people</h4>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Helps cover logistics to rescue and distribute a hearty meal.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold">₹500</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Sustains a family</h4>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Provides enough rescued food for a family of 4 for a week.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold">₹2500</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Sponsors a community pickup</h4>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Funds an entire rescue operation from a large event or caterer.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-gray-400">
             <div className="flex items-center gap-1.5"><ShieldCheck className="w-5 h-5"/> Secure</div>
             <div className="flex items-center gap-1.5"><Lock className="w-5 h-5"/> Encrypted</div>
             <div className="flex items-center gap-1.5"><Gift className="w-5 h-5"/> Tax Deductible</div>
          </div>
        </motion.div>

        {/* Right Side: Donation Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-gray-200/50 p-6 sm:p-8 border border-gray-100 dark:border-slate-700">
            <form onSubmit={handleDonate} className="space-y-6">
              
              {/* Amount Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Choose an amount to donate</label>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => { setAmount(amt); setCustomAmount(''); }}
                      className={`py-3 text-sm font-bold rounded-xl border-2 transition-all ${
                        amount === amt && !customAmount
                          ? 'border-green-600 bg-green-50 text-green-700'
                          : 'border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-900'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-slate-400 font-medium">₹</span>
                  </div>
                  <input
                    type="number"
                    placeholder="Custom Amount"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      if (e.target.value) setAmount(0);
                    }}
                    className={`w-full pl-8 pr-4 py-3 rounded-xl border-2 text-sm font-medium focus:outline-none transition-colors ${
                      customAmount ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-100 dark:border-slate-700 focus:border-green-400'
                    }`}
                  />
                </div>
              </div>

              {/* Personal Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-white dark:bg-slate-800 transition-colors"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-white dark:bg-slate-800 transition-colors"
                    placeholder="jane@example.com"
                  />
                </div>
              </div>
              
              {!user && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800 flex items-start gap-2">
                  <Lock className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>You must be logged in to donate. You will be asked to authenticate.</p>
                </div>
              )}

              <button
                type="submit"
                disabled={processing || (!amount && !customAmount) || !donorName || !donorEmail}
                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-xl shadow-lg shadow-green-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span>Donate ₹{customAmount || amount} Now</span>
                )}
              </button>
              
              <div className="text-center text-xs text-gray-400 font-medium flex items-center justify-center gap-1.5">
                <Lock className="w-3 h-3" /> Payments secured by Razorpay
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
