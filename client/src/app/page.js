'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, CheckCircle, HeartHandshake, Leaf, MapPin, ShieldCheck, Sparkles, Truck, Users, Zap, PlayCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/common/SEO';
import { generateSEOProps } from '@/utils/seo';
import LiveImpactCounter from '@/components/common/LiveImpactCounter';
import { useRef } from 'react';

const features = [
  {
    icon: <Leaf className="h-6 w-6 text-emerald-600" />,
    title: 'Zero Waste, Zero Hunger',
    description: 'Move surplus meals before they spoil and redirect them to people who need them most.',
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-emerald-600" />,
    title: 'Trusted NGO Partners',
    description: 'Screened NGOs with verified delivery capacity and transparent reporting.',
  },
  {
    icon: <Zap className="h-6 w-6 text-emerald-600" />,
    title: 'Real-Time Coordination',
    description: 'Match donations with nearby partners instantly and schedule optimized pickups.',
  },
];

const steps = [
  { title: 'Publish surplus food in minutes', detail: 'Log portions, dietary notes, and expiry windows.', icon: <Sparkles className="h-5 w-5" /> },
  { title: 'Auto-match with nearby NGOs', detail: 'Smart matching uses location and capacity.', icon: <MapPin className="h-5 w-5" /> },
  { title: 'Verified pickup & handoff', detail: 'Track pickup codes and receive proof-of-delivery.', icon: <ShieldCheck className="h-5 w-5" /> },
  { title: 'Impact you can measure', detail: 'Live dashboards for meals served and CO₂ saved.', icon: <Truck className="h-5 w-5" /> },
];

export default function HomePage() {
  const seoProps = generateSEOProps('home');
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <>
      <SEO {...seoProps} />
      <Navbar />

      <main className="min-h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
        
        {/* HERO SECTION */}
        <section ref={heroRef} className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-slate-900 rounded-b-[3rem] sm:rounded-b-[5rem] z-10">
          <motion.div style={{ y, opacity }} className="absolute inset-0 z-0">
            {/* Background Texture/Image */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593113565214-80afcb4a45d7?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-30 mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/90 to-slate-900" />
            
            {/* Animated Orbs */}
            <div className="absolute top-[20%] left-[10%] h-96 w-96 rounded-full bg-emerald-600/20 blur-[100px]" />
            <div className="absolute bottom-[10%] right-[20%] h-80 w-80 rounded-full bg-teal-500/20 blur-[100px]" />
          </motion.div>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16 py-20">
            
            <div className="flex-1 space-y-8 text-center lg:text-left">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md px-4 py-2 text-sm font-semibold text-emerald-300"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                Live in Mumbai, Delhi & Bangalore
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]"
              >
                Rescue surplus food. <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                  Fuel communities.
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0"
              >
                SaveTheServe connects restaurants, donors, and NGOs to move good food to the right people — faster, safer, and with complete transparency.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link href="/register?type=ngo">
                  <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2">
                    Join as NGO <ArrowRight className="h-5 w-5" />
                  </button>
                </Link>
                <Link href="/register?type=restaurant">
                  <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 dark:bg-slate-800/10 hover:bg-white/20 text-white border border-white/20 font-bold text-lg backdrop-blur-md transition-all flex items-center justify-center gap-2">
                    Donate Food
                  </button>
                </Link>
              </motion.div>
            </div>

            {/* Floating UI Elements */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
              className="flex-1 w-full max-w-md relative hidden lg:block"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 rounded-full blur-[80px]" />
              
              <div className="relative rounded-[2.5rem] bg-white/10 dark:bg-slate-800/10 border border-white/20 backdrop-blur-xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-emerald-300 font-semibold text-sm">LIVE FEED</p>
                    <p className="text-white font-bold text-xl">Nearby Surplus</p>
                  </div>
                  <div className="h-10 w-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
                    <MapPin className="h-5 w-5" />
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { item: '50 Meals (Veg)', time: 'Expires in 2h', distance: '1.2 km away' },
                    { item: '20kg Fresh Produce', time: 'Expires in 4h', distance: '3.5 km away' },
                    { item: 'Catered Buffet Surplus', time: 'Expires in 1h', distance: '0.8 km away' }
                  ].map((row, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-white/10 dark:bg-slate-800/10 transition-colors"
                    >
                      <div>
                        <p className="text-white font-semibold">{row.item}</p>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                          <span>{row.time}</span>
                          <span>•</span>
                          <span>{row.distance}</span>
                        </div>
                      </div>
                      <button className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-bold shadow-md">
                        Claim
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Floating Stat Card */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -bottom-6 -left-12 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl shadow-slate-900/50 border border-slate-100 dark:border-slate-700"
              >
                <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">Meals Saved Today</p>
                <p className="text-3xl font-black text-emerald-600">4,289</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* LOGOS SECTION */}
        <section className="py-10 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">Trusted by leading organizations</p>
            <div className="flex flex-wrap justify-center gap-8 sm:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Dummy Logos */}
              <div className="text-xl font-black font-headings">FoodCorp</div>
              <div className="text-xl font-black font-headings">GlobalNGO</div>
              <div className="text-xl font-black font-headings">CityShelter</div>
              <div className="text-xl font-black font-headings">FreshBites</div>
              <div className="text-xl font-black font-headings">CareOrg</div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-24 sm:py-32 relative z-10" id="how-it-works">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-emerald-600 font-semibold tracking-widest uppercase text-sm mb-4">Why SaveTheServe</h2>
              <h3 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
                Built for teams that refuse to waste good food
              </h3>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Operational tools, safety checks, and transparent reporting designed for donors and NGOs.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  key={feature.title}
                  className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-xl shadow-slate-200/40 dark:shadow-slate-900/40 border border-slate-100 dark:border-slate-700 hover:-translate-y-2 transition-transform duration-300"
                >
                  <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* PROCESS WITH VIDEO PLACEHOLDER */}
        <section className="py-24 sm:py-32 bg-slate-900 text-white rounded-[3rem] sm:rounded-[5rem] mx-2 sm:mx-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-emerald-600/20 blur-[120px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <h2 className="text-emerald-400 font-semibold tracking-widest uppercase text-sm mb-4">How it works</h2>
              <h3 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-8">From surplus to served in four simple steps</h3>
              
              <div className="space-y-8">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="mt-1 flex-shrink-0 h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/30">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-1">{step.title}</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative aspect-video bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl flex items-center justify-center group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/40 to-transparent mix-blend-overlay" />
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593113565214-80afcb4a45d7?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity duration-500" />
              <div className="relative h-20 w-20 rounded-full bg-emerald-500/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <PlayCircle className="h-10 w-10" />
              </div>
            </div>
          </div>
        </section>

        {/* IMPACT */}
        <section className="py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-[3rem] p-12 sm:p-20 text-center relative overflow-hidden border border-emerald-100 dark:border-emerald-800">
              <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/60 dark:bg-white/5 blur-3xl" />
              
              <div className="relative z-10 max-w-3xl mx-auto">
                <h2 className="text-emerald-600 dark:text-emerald-400 font-semibold tracking-widest uppercase text-sm mb-4">Live Impact</h2>
                <h3 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8">
                  Every plate saved — counted in real time
                </h3>
                
                <div className="mb-12">
                  <LiveImpactCounter />
                </div>

                <Link href="/leaderboard">
                  <button className="px-8 py-4 rounded-xl bg-slate-900 text-white font-bold text-lg hover:bg-slate-800 transition-colors shadow-lg">
                    View NGO Leaderboard
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
              Ready to make a difference?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-10">
              Join thousands of organizations moving surplus food to the right hands. Create an account in under five minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg transition-all shadow-lg shadow-emerald-600/25">
                  Start for Free
                </button>
              </Link>
              <Link href="/contact">
                <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-lg transition-all">
                  Contact Sales
                </button>
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
