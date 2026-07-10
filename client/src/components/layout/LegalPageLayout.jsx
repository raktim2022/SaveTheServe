import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function LegalPageLayout({
  title,
  lastUpdated,
  sections,
  children,
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-28 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="mb-12">
            <h1 className="text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight sm:text-5xl">{title}</h1>
            {lastUpdated && (
              <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Last updated: {lastUpdated}</p>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Sidebar Navigation */}
            {sections && sections.length > 0 && (
              <aside className="lg:w-1/4 shrink-0">
                <div className="sticky top-32 rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white dark:text-slate-100 mb-4 uppercase tracking-wider">Contents</h3>
                  <nav className="flex flex-col gap-2">
                    {sections.map((section) => (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        className="group flex items-center justify-between text-sm font-medium text-slate-600 dark:text-slate-300 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-1.5"
                      >
                        {section.title}
                        <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>
            )}

            {/* Main Content */}
            <article className="lg:w-3/4 rounded-3xl bg-white dark:bg-slate-800 p-8 sm:p-12 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
              <div className="prose prose-slate dark:prose-invert prose-emerald dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-p:text-slate-600 dark:text-slate-300 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-a:font-semibold prose-a:text-emerald-600 hover:prose-a:text-emerald-500">
                {children}
              </div>
            </article>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
