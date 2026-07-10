'use client';
import { motion } from 'framer-motion';
import { CalendarDays, ChevronRight, User } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/common/SEO';
import { generateSEOProps } from '@/utils/seo';

const featuredPost = {
  title: 'How verified food rescue improves community outcomes across major cities',
  excerpt: 'A deep dive into the logistics and human impact of modernizing the surplus food pipeline from restaurants to shelters.',
  date: 'Jan 15, 2026',
  author: 'Sarah Jenkins',
  category: 'Impact',
  readTime: '8 min read',
};

const posts = [
  { title: 'Operational lessons from coordinating surplus pickup routes', excerpt: 'Route optimization isn\'t just for delivery apps. Here\'s how NGOs are doing it.', date: 'Dec 10, 2025', author: 'Raj Patel', category: 'Operations', readTime: '5 min' },
  { title: 'Building trust in donation systems through radical transparency', excerpt: 'Why proving delivery through photos and signatures changes the donor relationship.', date: 'Nov 22, 2025', author: 'Amit Desai', category: 'Product', readTime: '6 min' },
  { title: 'The new guidelines for safe food handoffs', excerpt: 'Updates to our safety checklist and what restaurants need to know.', date: 'Oct 05, 2025', author: 'Sarah Jenkins', category: 'Guidelines', readTime: '4 min' },
];

export default function BlogPage() {
  const seoProps = generateSEOProps('blog');

  return (
    <>
      <SEO {...seoProps} />
      <Navbar />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-28 pb-24">
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="mb-16">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">The SaveTheServe Blog</h1>
            <p className="mt-4 text-xl text-slate-600 dark:text-slate-300 max-w-2xl">Editorial updates on food rescue, operational scale, and platform progress.</p>
          </div>

          {/* Featured Post */}
          <motion.article 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative rounded-[2rem] bg-white dark:bg-slate-800 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 mb-16 grid md:grid-cols-2"
          >
            {/* Image Placeholder */}
            <div className="relative h-64 md:h-auto bg-slate-200 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-700 mix-blend-multiply opacity-80 group-hover:scale-105 transition-transform duration-700" />
            </div>
            
            <div className="p-8 sm:p-12 flex flex-col justify-center">
              <div className="flex items-center gap-3 text-sm font-semibold text-emerald-600 mb-4 uppercase tracking-wider">
                <span>{featuredPost.category}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 dark:text-slate-400">{featuredPost.readTime}</span>
              </div>
              
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 leading-tight group-hover:text-emerald-700 transition-colors">
                <a href="#">{featuredPost.title}</a>
              </h2>
              
              <p className="text-slate-600 dark:text-slate-300 text-lg mb-8 line-clamp-3">
                {featuredPost.excerpt}
              </p>
              
              <div className="flex items-center gap-4 mt-auto">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{featuredPost.author}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{featuredPost.date}</p>
                </div>
              </div>
            </div>
          </motion.article>

          {/* Recent Posts Grid */}
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Recent Articles</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, idx) => (
              <motion.article 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (idx + 1) }}
                key={post.title}
                className="group flex flex-col bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-lg shadow-slate-200/40 dark:shadow-slate-900/40 border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                {/* Image Placeholder */}
                <div className="h-48 bg-slate-200 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-400 to-slate-300 opacity-50 group-hover:scale-105 transition-transform duration-500" />
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">
                    {post.category}
                  </div>
                  
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3 leading-snug group-hover:text-emerald-600 transition-colors">
                    <a href="#">{post.title}</a>
                  </h4>
                  
                  <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 flex-1">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <CalendarDays className="h-4 w-4" />
                      {post.date}
                    </div>
                    <span className="text-emerald-600 group-hover:translate-x-1 transition-transform">
                      <ChevronRight className="h-5 w-5" />
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="mt-16 text-center">
            <button className="px-8 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 transition-colors">
              Load More Articles
            </button>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}