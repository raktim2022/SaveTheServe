import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/common/Button';

export default function MarketingPageShell({
  eyebrow,
  title,
  description,
  highlights = [],
  children,
  primaryCta = { label: 'Get started', href: '/register' },
  secondaryCta = { label: 'View leaderboard', href: '/leaderboard' },
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-linear-to-b from-slate-50 via-white to-emerald-50/30 pt-24 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <section className="grid gap-12 rounded-4xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 p-8 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur xl:grid-cols-[1.1fr_0.9fr] xl:p-12">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                {eyebrow}
              </div>

              <div className="space-y-5">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                  {title}
                </h1>
                <p className="max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
                  {description}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href={primaryCta.href}>
                  <Button size="lg" className="rounded-2xl bg-linear-to-r from-emerald-500 to-teal-600 px-6 shadow-lg shadow-emerald-950/10">
                    {primaryCta.label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href={secondaryCta.href}>
                  <Button size="lg" variant="outline" className="rounded-2xl border-slate-300 px-6 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900">
                    {secondaryCta.label}
                  </Button>
                </Link>
              </div>

              {highlights.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {highlights.map((item) => (
                    <div key={item.title} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4">
                      <p className="text-sm font-semibold text-slate-950 dark:text-white">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[28px] border border-slate-200 dark:border-slate-700 bg-linear-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-2xl shadow-slate-950/10">
              {children}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}