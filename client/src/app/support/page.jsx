'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, HelpCircle, ChevronDown, MessageSquare, LifeBuoy } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/common/SEO';
import { generateSEOProps } from '@/utils/seo';

const faqs = [
  {
    category: 'Donors & Restaurants',
    questions: [
      { q: 'How do I know my food is safe to donate?', a: 'All food must meet local health regulations at the time of handoff. Our platform provides guidelines and a checklist during the donation creation process.' },
      { q: 'Can I schedule recurring pickups?', a: 'Yes! When creating a donation, you can set it to repeat daily or weekly, and we will automatically match it with NGOs with standing capacity.' },
    ]
  },
  {
    category: 'NGO Partners',
    questions: [
      { q: 'How do I get verified as an NGO?', a: 'During registration, you will need to upload your NGO registration certificate and identity proof. Our team reviews these documents within 48 hours.' },
      { q: 'What if a driver cannot make a scheduled pickup?', a: 'You can re-assign the pickup to another team member or cancel it through the dashboard. If canceled, the donation returns to the pool for other NGOs.' },
    ]
  },
  {
    category: 'General & Account',
    questions: [
      { q: 'I forgot my password, how do I reset it?', a: 'Click the "Forgot Password" link on the login page to receive a secure reset link via email.' },
      { q: 'How are donations used?', a: 'Monetary donations go directly to funding the logistics of food rescue, ensuring NGOs have the resources to transport food safely.' },
    ]
  }
];

function FaqItem({ q, a }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 overflow-hidden mb-4 transition-shadow hover:shadow-md">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-5 sm:p-6 text-left"
      >
        <span className="font-semibold text-slate-900 dark:text-white">{q}</span>
        <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-5 sm:px-6 pb-6 text-slate-600 dark:text-slate-300 text-sm leading-relaxed"
          >
            {a}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SupportPage() {
  const seoProps = generateSEOProps('support');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <SEO {...seoProps} />
      <Navbar />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-28 pb-20">
        
        {/* Header & Search */}
        <div className="bg-emerald-900 rounded-[3rem] mx-4 sm:mx-8 mb-16 p-8 sm:p-16 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-emerald-600/30 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-teal-500/20 blur-3xl" />
          </div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-800 text-emerald-200 mb-6">
              <LifeBuoy className="h-4 w-4" /> Help Center
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">How can we help you?</h1>
            
            <div className="relative mt-8 max-w-xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-emerald-700" />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for answers..."
                className="w-full rounded-2xl border-none bg-white dark:bg-slate-800 py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/30 text-lg shadow-lg placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_300px] gap-12 items-start">
          
          {/* FAQs */}
          <div className="space-y-12">
            {faqs.map((group) => {
              const filteredFaqs = group.questions.filter(
                q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) || q.a.toLowerCase().includes(searchQuery.toLowerCase())
              );

              if (filteredFaqs.length === 0) return null;

              return (
                <div key={group.category}>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    {group.category}
                  </h2>
                  <div>
                    {filteredFaqs.map((faq, idx) => (
                      <FaqItem key={idx} q={faq.q} a={faq.a} />
                    ))}
                  </div>
                </div>
              );
            })}
            
            {/* Empty state for search */}
            {searchQuery && !faqs.some(group => 
              group.questions.some(q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) || q.a.toLowerCase().includes(searchQuery.toLowerCase()))
            ) && (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No results found for "{searchQuery}"</p>
                <p className="mt-2 text-sm">Try adjusting your search terms or browse the categories.</p>
              </div>
            )}
          </div>

          {/* Sticky Sidebar */}
          <div className="sticky top-32 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 text-center">
              <div className="mx-auto h-12 w-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Still need help?</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">Our support team is just an email away.</p>
              <a href="/contact" className="block w-full py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors">
                Contact Support
              </a>
            </div>
            
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-3xl p-6 border border-emerald-100 dark:border-emerald-800 text-center">
              <h3 className="font-bold text-emerald-900 dark:text-emerald-100 mb-2">System Status</h3>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mt-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                All Systems Operational
              </div>
            </div>
          </div>

        </div>

      </main>
      <Footer />
    </>
  );
}