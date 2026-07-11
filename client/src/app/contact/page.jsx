'use client';
import { motion } from 'framer-motion';
import { Clock3, Mail, MapPin, PhoneCall, Send } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/common/SEO';
import { generateSEOProps } from '@/utils/seo';

export default function ContactPage() {
  const seoProps = generateSEOProps('contact');

  return (
    <>
      <SEO {...seoProps} />
      <Navbar />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-28 pb-20">
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-emerald-600 font-semibold tracking-widest uppercase text-sm mb-4"
            >
              Get in Touch
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6"
            >
              We're here to help you rescue food.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-600 dark:text-slate-300"
            >
              Whether you're a restaurant wanting to donate, an NGO needing support, or someone looking to partner, drop us a message.
            </motion.p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
            
            {/* Contact Form */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700"
            >
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Send us a message</h2>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">First Name</label>
                    <input type="text" className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-emerald-500 transition-colors" placeholder="Jane" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Last Name</label>
                    <input type="text" className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-emerald-500 transition-colors" placeholder="Doe" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Email Address</label>
                  <input type="email" className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-emerald-500 transition-colors" placeholder="jane@example.com" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Subject</label>
                  <select className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-emerald-500 transition-colors">
                    <option>General Inquiry</option>
                    <option>Partnership</option>
                    <option>Platform Support</option>
                    <option>Donation Issue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Message</label>
                  <textarea rows="4" className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-emerald-500 transition-colors resize-none" placeholder="How can we help you?"></textarea>
                </div>

                <button type="button" className="w-full rounded-xl bg-emerald-600 px-6 py-4 text-sm font-bold text-white hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30">
                  Send Message
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </motion.div>

            {/* Contact Information */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-8"
            >
              <div className="bg-emerald-900 rounded-[2rem] p-8 sm:p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-emerald-700/50 blur-3xl" />
                
                <h3 className="text-xl font-bold mb-6 relative z-10">Direct Contact</h3>
                
                <div className="space-y-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-emerald-800 p-3 text-emerald-300">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-emerald-200">Email Us</p>
                      <p className="font-semibold">savetheserve.ngo@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-emerald-800 p-3 text-emerald-300">
                      <PhoneCall className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-emerald-200">Call Us</p>
                      <p className="font-semibold">+91 90000 00000</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-emerald-800 p-3 text-emerald-300">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-emerald-200">Headquarters</p>
                      <p className="font-semibold">Kolkata, India</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 sm:p-10 shadow-lg shadow-slate-200/40 dark:shadow-slate-900/40 border border-slate-100 dark:border-slate-700 flex items-start gap-4">
                <div className="rounded-full bg-blue-50 p-3 text-blue-600 shrink-0">
                  <Clock3 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Response Window</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    Operational requests are reviewed on business days, with urgent donation support prioritized during active pickup windows. We typically respond within 24 hours.
                  </p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}