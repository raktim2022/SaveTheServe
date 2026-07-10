'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, Search, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/common/SEO';
import { generateSEOProps } from '@/utils/seo';

const impactStats = [
  { value: '₹500', impact: 'Provides 20 meals to those in need', icon: Heart },
  { value: '₹2500', impact: 'Funds a large scale pickup operation', icon: Truck },
  { value: '₹5000', impact: 'Sustains a local community for a week', icon: Users },
];
// Wait, Truck is not imported. I'll just use a generic icon or import Truck.
import { Truck } from 'lucide-react';

export default function DonateLandingPage() {
  const seoProps = generateSEOProps('donate');

  return (
    <>
      <SEO {...seoProps} />
      <Navbar />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-20">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-slate-900 py-24 sm:py-32 mb-16">
          <div className="absolute inset-0">
            {/* Background image placeholder */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593113565214-80afcb4a45d7?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-white">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-8 backdrop-blur-md"
            >
              <Heart className="h-4 w-4 fill-emerald-300" /> Make a difference today
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6"
            >
              Fuel the rescue mission.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-300 leading-relaxed mb-10"
            >
              Your donation directly covers the logistics of picking up surplus food and delivering it safely to verified NGOs. Help us turn waste into nourishment.
            </motion.p>
          </div>
        </section>

        {/* Action Cards */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            
            {/* Direct Donation to Platform */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-8 sm:p-12 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-emerald-100 dark:border-emerald-800 flex flex-col items-center text-center group hover:border-emerald-300 transition-colors"
            >
              <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Heart className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Support the General Fund</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-8 flex-1">
                Contributions to the general fund are used to optimize routes, maintain the platform, and support NGOs that lack immediate funding for logistics.
              </p>
              <Link href="/donate/general" className="w-full">
                <button className="w-full py-4 rounded-xl bg-emerald-600 text-white font-bold text-lg hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all">
                  Donate Now
                </button>
              </Link>
            </motion.div>

            {/* Find NGO */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-8 sm:p-12 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-blue-100 flex flex-col items-center text-center group hover:border-blue-300 transition-colors"
            >
              <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Search className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Find a Specific NGO</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-8 flex-1">
                Browse our list of verified partner organizations and direct your donation to a specific cause or community near you.
              </p>
              <Link href="/leaderboard" className="w-full">
                <button className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold text-lg hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all">
                  Browse NGOs
                </button>
              </Link>
            </motion.div>

          </div>
        </section>

        {/* Impact Section */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">The impact of your giving</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">Every rupee is stretched to maximize the amount of food rescued and delivered.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {impactStats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  key={stat.value}
                  className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center shadow-lg border border-slate-100 dark:border-slate-700"
                >
                  <div className="mx-auto h-12 w-12 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white mb-2">{stat.value}</div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{stat.impact}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-16 flex justify-center gap-8 text-sm font-medium text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              Secure Checkout
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Transparent Tracking
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
