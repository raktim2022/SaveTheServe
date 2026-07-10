'use client';
import { motion } from 'framer-motion';
import { CheckCircle2, HeartHandshake, ShieldCheck, Truck, Users } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/common/SEO';
import { generateSEOProps } from '@/utils/seo';

const stats = [
  { value: '1.2M+', label: 'Meals Served' },
  { value: '100%', label: 'Verified Partners' },
  { value: '80+', label: 'NGOs Onboarded' },
  { value: '24/7', label: 'Coordination Support' },
];

const pillars = [
  {
    icon: CheckCircle2,
    title: 'Operational reliability',
    description: 'Every pickup follows a clear handoff flow, so donors and NGOs know what happens next.',
  },
  {
    icon: Users,
    title: 'Human-centered partnerships',
    description: 'We work with teams that care about dignity, accountability, and lasting community outcomes.',
  },
  {
    icon: ShieldCheck,
    title: 'Trust and transparency',
    description: 'Secure payments, verified profiles, and audit-ready activity records keep the ecosystem dependable.',
  },
  {
    icon: Truck,
    title: 'Efficient logistics',
    description: 'Smart routing and real-time coordination reduce spoilage and improve pickup reliability.',
  },
];

export default function AboutPage() {
  const seoProps = generateSEOProps('about');

  return (
    <>
      <SEO {...seoProps} />
      <Navbar />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-20">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-emerald-900 py-24 sm:py-32 rounded-b-[3rem] sm:rounded-b-[5rem] mx-2 sm:mx-4">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-emerald-700/30 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-emerald-600/20 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-white">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-emerald-300 font-semibold tracking-widest uppercase text-sm mb-4"
            >
              About SaveTheServe
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6"
            >
              A professional food-rescue network
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto text-lg sm:text-xl text-emerald-100/80 leading-relaxed"
            >
              Built for trust, speed, and measurable impact. We connect restaurants, donors, and NGOs through a structured platform designed to reduce food waste.
            </motion.p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (idx * 0.1) }}
                key={stat.label} 
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-white"
              >
                <div className="text-3xl sm:text-4xl font-black text-emerald-600 mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Mission & Story */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Our Mission</h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                  Make surplus food available to communities quickly and safely. Turn operational waste into reliable nourishment by combining modern coordination tools with verified field partners.
                </p>
              </div>
              <div className="rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 p-8 border border-emerald-100 dark:border-emerald-800">
                <HeartHandshake className="h-10 w-10 text-emerald-600 mb-4" />
                <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">The SaveTheServe Story</h3>
                <p className="text-emerald-800/80 leading-relaxed">
                  Founded on the belief that food waste is an operational failure, not an inevitability. We started by manually matching local eateries with shelters, and soon realized technology could scale this impact exponentially without sacrificing the human element of dignity and care.
                </p>
              </div>
            </div>
            
            {/* Image Placeholder / Visual */}
            <div className="relative rounded-[2.5rem] bg-slate-200 aspect-square sm:aspect-[4/3] lg:aspect-square overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/80 to-teal-500/80 mix-blend-multiply" />
              {/* Using a placeholder gradient since we don't have an image, but in reality this would be an `img` */}
              <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-2xl px-12 text-center leading-snug drop-shadow-lg">
                "Connecting communities, one meal at a time."
              </div>
            </div>
          </div>
        </section>

        {/* Pillars */}
        <section className="bg-white dark:bg-slate-800 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Our Core Pillars</h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">The principles that guide our platform's development and our partner ecosystem.</p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {pillars.map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    key={pillar.title} 
                    className="rounded-3xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="rounded-2xl bg-emerald-100 p-4 inline-block mb-6 text-emerald-600">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{pillar.title}</h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">{pillar.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}