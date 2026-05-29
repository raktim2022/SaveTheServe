import Link from 'next/link';
import {
  ArrowRight,
  Clock3,
  HeartHandshake,
  Leaf,
  MapPin,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/common/Button';
import SEO from '@/components/common/SEO';
import { generateSEOProps } from '@/utils/seo';
import LiveImpactCounter from '@/components/common/LiveImpactCounter';

const features = [
  {
    icon: <Leaf className="h-6 w-6 text-primary-600" />,
    title: 'Zero Waste, Zero Hunger',
    description:
      'Move surplus meals before they spoil and redirect them to people who need them most.',
  },
  {
    icon: <HeartHandshake className="h-6 w-6 text-secondary-500" />,
    title: 'Trusted NGO Partners',
    description:
      'Screened NGOs with verified delivery capacity and transparent reporting.',
  },
  {
    icon: <Clock3 className="h-6 w-6 text-primary-600" />,
    title: 'Real-Time Pickup Windows',
    description:
      'Match donations with nearby partners instantly and schedule optimized pickups.',
  },
];

const steps = [
  {
    title: 'Publish surplus food in minutes',
    detail:
      'Log portions, dietary notes, and expiry windows to help NGOs plan routes.',
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    title: 'Auto-match with nearby NGOs',
    detail:
      'Smart matching uses location and capacity to send the right NGO to you.',
    icon: <MapPin className="h-5 w-5" />,
  },
  {
    title: 'Verified pickup & handoff',
    detail:
      'Track pickup codes, handoff status, and receive proof-of-delivery instantly.',
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    title: 'Impact you can measure',
    detail:
      'Live dashboards for meals served, CO₂ saved, and communities reached.',
    icon: <Truck className="h-5 w-5" />,
  },
];

export default function HomePage() {
  const seoProps = generateSEOProps('home');

  return (
    <>
      <SEO {...seoProps} />

      <div className="relative min-h-screen overflow-hidden bg-[#f8fafc]">
        {/* Background Blur Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-100px] left-[15%] h-[500px] w-[500px] rounded-full bg-primary-200/30 blur-3xl" />
          <div className="absolute bottom-[-100px] right-[10%] h-[450px] w-[450px] rounded-full bg-secondary-200/20 blur-3xl" />
        </div>

        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 space-y-28">

          {/* HERO SECTION */}
          <section className="grid lg:grid-cols-2 gap-16 items-center">

            {/* LEFT */}
            <div className="space-y-10">

              <div className="inline-flex items-center gap-3 rounded-full border border-white/40 bg-white/70 backdrop-blur-xl px-5 py-2 text-sm font-semibold text-primary-700 shadow-xl">
                <span className="h-2.5 w-2.5 rounded-full bg-secondary-500 animate-pulse" />
                Food rescue platform for NGOs & restaurants
              </div>

              <div className="space-y-6">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-[-0.04em] text-slate-900 leading-[1.05]">
                  Rescue surplus food.
                  <span className="block bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 bg-clip-text text-transparent">
                    Fuel local communities.
                  </span>
                </h1>

                <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl">
                  SaveTheServe connects restaurants, donors, and NGOs to move
                  good food to the right people — faster, safer, and with full
                  transparency.
                </p>
              </div>

              {/* BUTTONS */}
              <div className="flex flex-wrap gap-4">
                <Link href="/register?type=ngo">
                  <Button
                    size="lg"
                    className="rounded-2xl px-7 py-6 text-base font-semibold shadow-2xl hover:scale-[1.03] transition-all duration-300"
                  >
                    Join as NGO
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

                <Link href="/register?type=restaurant">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-2xl border border-slate-300 bg-white/70 backdrop-blur-md text-primary-700 hover:bg-white transition-all duration-300 px-7 py-6"
                  >
                    Donate surplus food
                  </Button>
                </Link>
              </div>

              {/* STATS */}
              <div className="flex flex-wrap gap-10 pt-2">

                <div>
                  <p className="text-3xl font-black text-primary-700">1.2M+</p>
                  <p className="text-slate-600 mt-1">
                    Meals served
                  </p>
                </div>

                <div>
                  <p className="text-3xl font-black text-primary-700">120+</p>
                  <p className="text-slate-600 mt-1">
                    Restaurants onboarded
                  </p>
                </div>

                <div>
                  <p className="text-3xl font-black text-primary-700">80+</p>
                  <p className="text-slate-600 mt-1">
                    NGO partners
                  </p>
                </div>

              </div>
            </div>

            {/* RIGHT HERO CARD */}
            <div className="relative">

              {/* Floating Card */}
              <div className="absolute -top-6 right-10 rounded-2xl bg-white p-4 shadow-2xl border border-slate-100 z-20">
                <p className="text-xs text-slate-500">Meals Saved</p>
                <p className="text-2xl font-black text-primary-700">46K+</p>
              </div>

              <div className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-secondary-200 blur-3xl opacity-70" />
              <div className="absolute -right-10 bottom-10 h-40 w-40 rounded-full bg-primary-200 blur-3xl opacity-60" />

              <div className="relative rounded-[32px] border border-white/40 bg-white/70 backdrop-blur-2xl shadow-2xl p-8 space-y-6">

                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-black">
                    S
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Live availability
                    </p>
                    <p className="font-semibold text-slate-900">
                      Nearby surplus ready for pickup
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">

                  {['Meals (veg)', 'Packed grains', 'Fresh produce'].map(
                    (item, idx) => (
                      <div
                        key={item}
                        className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-white/70 px-5 py-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-white shadow-md flex items-center justify-center text-primary-700 font-bold group-hover:scale-110 transition-transform duration-300">
                            {idx + 2}0
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {item}
                            </p>

                            <p className="text-xs text-slate-500">
                              Expires in {idx + 2} hrs
                            </p>
                          </div>
                        </div>

                        <span className="rounded-full bg-primary-50 px-4 py-2 text-xs font-semibold text-primary-700">
                          Reserve
                        </span>
                      </div>
                    )
                  )}
                </div>

                {/* Impact Card */}
                <div className="rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 p-5 text-white flex items-center justify-between shadow-xl">

                  <div>
                    <p className="text-sm text-primary-100">
                      Impact tracker
                    </p>

                    <p className="text-2xl font-bold">
                      46,820 meals delivered
                    </p>
                  </div>

                  <HeartHandshake className="h-12 w-12" />
                </div>

              </div>
            </div>
          </section>

          {/* DIVIDER */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

          {/* FEATURES */}
          <section className="space-y-14" id="how-it-works">

            <div className="text-center max-w-3xl mx-auto space-y-4">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary-700">
                WHY SAVETHESERVE
              </p>

              <h2 className="text-4xl font-black tracking-tight text-slate-900">
                Built for teams that refuse to waste good food
              </h2>

              <p className="text-lg text-slate-600">
                Operational tools, safety checks, and transparent reporting
                designed for donors and NGOs.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-7">

              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-3xl border border-white/40 bg-white/70 backdrop-blur-xl p-8 shadow-xl hover:-translate-y-2 hover:shadow-2xl transition-all duration-500"
                >
                  <div className="h-14 w-14 rounded-2xl bg-primary-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* DIVIDER */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

          {/* STEPS */}
          <section className="grid lg:grid-cols-3 gap-10 items-start">

            <div className="space-y-5">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary-700">
                HOW IT WORKS
              </p>

              <h2 className="text-4xl font-black tracking-tight text-slate-900">
                From surplus to served in four simple steps
              </h2>

              <p className="text-lg text-slate-600 leading-relaxed">
                Verified partners, pickup codes, and live updates keep every
                donation accountable.
              </p>
            </div>

            <div className="lg:col-span-2 grid md:grid-cols-2 gap-5">

              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="group rounded-3xl border border-white/40 bg-white/70 backdrop-blur-xl p-7 shadow-xl hover:-translate-y-2 hover:shadow-2xl transition-all duration-500"
                >
                  <div className="flex items-center gap-4 mb-5">

                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 font-bold group-hover:scale-110 transition-transform duration-300">
                      {index + 1}
                    </span>

                    <div className="flex items-center gap-2 text-primary-700">
                      {step.icon}

                      <span className="text-xs font-bold uppercase tracking-[0.15em]">
                        Step {index + 1}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {step.title}
                  </h3>

                  <p className="text-slate-600 leading-relaxed">
                    {step.detail}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* IMPACT */}
          <section
            id="impact"
            className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900 p-12 text-white shadow-2xl"
          >

            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-primary-500/20 blur-3xl" />

            <div className="space-y-10 relative z-10">

              <div className="text-center space-y-4">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary-200">
                  LIVE IMPACT
                </p>

                <h2 className="text-4xl font-black">
                  Every plate saved — counted in real time
                </h2>

                <p className="text-primary-100 text-lg max-w-2xl mx-auto">
                  Numbers update directly from our platform as restaurants donate
                  and NGOs collect.
                </p>
              </div>

              <LiveImpactCounter />

              <div className="flex flex-wrap justify-center gap-4 text-sm">

                <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2">
                  Delivery proof photos
                </span>

                <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2">
                  Safety & hygiene logs
                </span>

                <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2">
                  Automated receipts
                </span>

                <Link
                  href="/leaderboard"
                  className="rounded-full border border-white/30 bg-white/20 px-4 py-2 font-semibold hover:bg-white/30 transition-all"
                >
                  🏆 View Leaderboard →
                </Link>

              </div>
            </div>
          </section>

          {/* CTA */}
          <section
            id="get-started"
            className="rounded-[40px] border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-12 text-white shadow-2xl"
          >

            <div className="grid md:grid-cols-2 gap-10 items-center">

              <div className="space-y-4">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary-300">
                  GET STARTED
                </p>

                <h3 className="text-4xl font-black leading-tight">
                  Ready to move surplus food to the right hands?
                </h3>

                <p className="text-slate-300 text-lg">
                  Create an account and start posting donations or requesting
                  meals in under five minutes.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 md:justify-end">

                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 px-6 py-6"
                  >
                    Sign in
                  </Button>
                </Link>

                <Link href="/register">
                  <Button className="rounded-2xl px-7 py-6 text-base font-semibold shadow-2xl hover:scale-[1.03] transition-all duration-300">
                    Start for free
                  </Button>
                </Link>

              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}