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
  CheckCircle,
  Users,
  Zap,
} from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/common/Button';
import SEO from '@/components/common/SEO';
import { generateSEOProps } from '@/utils/seo';
import LiveImpactCounter from '@/components/common/LiveImpactCounter';

const features = [
  {
    icon: <Leaf className="h-7 w-7 text-primary-600" />,
    title: 'Zero Waste, Zero Hunger',
    description:
      'Move surplus meals before they spoil and redirect them to people who need them most.',
    color: 'from-primary-50 to-primary-100',
  },
  {
    icon: <HeartHandshake className="h-7 w-7 text-secondary-500" />,
    title: 'Trusted NGO Partners',
    description:
      'Screened NGOs with verified delivery capacity and transparent reporting.',
    color: 'from-secondary-50 to-amber-50',
  },
  {
    icon: <Zap className="h-7 w-7 text-blue-500" />,
    title: 'Real-Time Coordination',
    description:
      'Match donations with nearby partners instantly and schedule optimized pickups.',
    color: 'from-blue-50 to-blue-100',
  },
];

const steps = [
  {
    title: 'Publish surplus food in minutes',
    detail:
      'Log portions, dietary notes, and expiry windows to help NGOs plan routes efficiently.',
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

const stats = [
  { value: '1.2M+', label: 'Meals Served', icon: '🍽️' },
  { value: '120+', label: 'Restaurants Onboarded', icon: '🏢' },
  { value: '80+', label: 'NGO Partners', icon: '🤝' },
  { value: '46K+', label: 'Meals This Month', icon: '📈' },
];

export default function HomePage() {
  const seoProps = generateSEOProps('home');

  return (
    <>
      <SEO {...seoProps} />

      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
        {/* Enhanced Background Effects */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-[-150px] left-[5%] h-[600px] w-[600px] rounded-full bg-primary-200/25 blur-3xl animate-pulse" />
            <div className="absolute bottom-[-200px] right-[5%] h-[700px] w-[700px] rounded-full bg-secondary-200/20 blur-3xl" />
            <div className="absolute top-[50%] left-[50%] h-[500px] w-[500px] rounded-full bg-blue-200/15 blur-3xl" />
          </div>

        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 space-y-32">

          {/* HERO SECTION */}
          <section className="grid lg:grid-cols-2 gap-16 items-center pt-8">

            {/* LEFT */}
            <div className="space-y-10 animate-fade-in">

              <div className="inline-flex items-center gap-3 rounded-full border border-primary-200/50 bg-gradient-to-r from-primary-50/80 to-white/50 backdrop-blur-xl px-6 py-3 text-sm font-semibold text-primary-700 shadow-lg hover:shadow-xl transition-all duration-300">
                <span className="h-2.5 w-2.5 rounded-full bg-secondary-500 animate-pulse" />
                <span>🚀 Food rescue platform for NGOs & restaurants</span>
              </div>

              <div className="space-y-8">
                <h1 className="font-headings text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-950 leading-[1.1]">
                  Rescue surplus
                  <span className="block bg-linear-to-r from-primary-600 via-primary-500 to-secondary-500 bg-clip-text drop-shadow-sm">food. Fuel</span>
                  <span>communities.</span>
                </h1>

                <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl font-body">
                  SaveTheServe connects restaurants, donors, and NGOs to move good food to the right people — faster, safer, and with complete transparency.
                </p>
              </div>

              {/* BUTTONS */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-4">
                <Link href="/register?type=ngo" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto rounded-2xl px-7 py-6 text-base font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 bg-gradient-to-r from-primary-600 to-primary-700"
                  >
                    Join as NGO
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

                <Link href="/register?type=restaurant" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto rounded-2xl border-2 border-primary-600 bg-white text-primary-700 hover:bg-primary-50 transition-all duration-300 px-7 py-6 font-semibold"
                  >
                    Donate Surplus Food
                  </Button>
                </Link>
              </div>

              {/* STATS GRID */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="group rounded-xl border border-slate-200 bg-white/70 backdrop-blur-md p-4 hover:shadow-lg transition-all duration-300">
                    <p className="text-2xl font-black text-primary-700 mb-1">{stat.value}</p>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT HERO CARD */}
            <div className="relative hidden lg:block animate-slide-up">

              {/* Floating Cards */}
              <div className="absolute -top-4 right-0 rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 z-20 hover:shadow-3xl transition-all duration-300">
                <p className="text-xs text-slate-500 font-semibold">Meals Saved Today</p>
                <p className="text-3xl font-black text-primary-700 mt-1">46K+</p>
              </div>

              <div className="absolute -left-6 top-32 rounded-xl bg-gradient-to-br from-secondary-400 to-amber-400 p-4 shadow-xl z-10 text-neutral-800 hover:shadow-2xl transition-all duration-300">
                <p className="text-xs font-bold">Live Updates</p>
                <p className="text-lg font-black mt-1">Real-time</p>
              </div>

              {/* Animated Blurs */}
              <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-secondary-200 blur-3xl opacity-70 animate-bounce-gentle" />
              <div className="absolute -right-10 bottom-10 h-48 w-48 rounded-full bg-primary-200 blur-3xl opacity-60" />

              {/* Main Card */}
              <div className="relative rounded-[32px] border-2 border-white/60 bg-gradient-to-br from-white/80 via-white/60 to-blue-50/40 backdrop-blur-2xl shadow-2xl p-8 space-y-6">

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white font-black shadow-lg">
                      S
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-semibold">
                        LIVE AVAILABILITY
                      </p>
                      <p className="font-bold text-slate-900">
                        Nearby surplus ready
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl">📍</span>
                </div>

                <div className="grid gap-3">

                  {['Meals (veg)', 'Packed grains', 'Fresh produce'].map(
                    (item, idx) => (
                      <div
                        key={item}
                        className="group/item flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm px-5 py-4 hover:shadow-lg hover:border-primary-300 transition-all duration-300"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary-100 to-primary-50 shadow-md flex items-center justify-center text-primary-700 font-bold group-hover/item:scale-110 transition-transform duration-300">
                            {idx + 2}0
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900 text-sm">
                              {item}
                            </p>

                            <p className="text-xs text-slate-500 mt-1">
                              Expires in {idx + 2}h
                            </p>
                          </div>
                        </div>

                        <span className="rounded-full bg-gradient-to-r from-primary-50 to-primary-100 px-4 py-2 text-xs font-bold text-primary-700 hover:from-primary-100 hover:to-primary-200 transition-all duration-300">
                          Reserve →
                        </span>
                      </div>
                    )
                  )}
                </div>

                {/* Impact Card */}
                <div className="rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-black flex items-center justify-between shadow-xl hover:shadow-2xl transition-all duration-300">

                  <div>
                    <p className="text-sm text-primary-100 font-semibold">
                      💚 Impact This Month
                    </p>

                    <p className="text-2xl font-black mt-2">
                      46,820 meals delivered
                    </p>
                  </div>

                  <HeartHandshake className="h-14 w-14 opacity-80" />
                </div>

              </div>
            </div>
          </section>

          {/* DIVIDER */}
          <div className="h-1 bg-gradient-to-r from-transparent via-slate-300/50 to-transparent rounded-full" />

          {/* FEATURES */}
          <section className="space-y-16" id="how-it-works">

            <div className="text-center max-w-3xl mx-auto space-y-4 animate-fade-in">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary-600">
                ✨ Why SaveTheServe
              </p>

              <h2 className="font-headings text-4xl sm:text-5xl font-black tracking-tight text-slate-950">
                Built for teams that refuse to waste good food
              </h2>

              <p className="text-lg text-slate-600 font-body">
                Operational tools, safety checks, and transparent reporting designed for donors and NGOs.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">

              {features.map((feature, idx) => (
                <div
                  key={feature.title}
                  className="group rounded-3xl border-2 border-white/60 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl p-8 shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 hover:border-primary-300"
                >
                  <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md`}>
                    {feature.icon}
                  </div>

                  <h3 className="font-headings text-2xl font-bold text-slate-950 mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-slate-600 leading-relaxed font-body">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* DIVIDER */}
          <div className="h-1 bg-gradient-to-r from-transparent via-slate-300/50 to-transparent rounded-full" />

          {/* STEPS */}
          <section className="space-y-16" id="process">

            <div className="text-center max-w-3xl mx-auto space-y-4 animate-fade-in">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary-600">
                🚀 How It Works
              </p>

              <h2 className="font-headings text-4xl sm:text-5xl font-black tracking-tight text-slate-950">
                From surplus to served in four simple steps
              </h2>

              <p className="text-lg text-slate-600 font-body">
                Verified partners, pickup codes, and live updates keep every donation accountable.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="group rounded-3xl border-2 border-white/60 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl p-7 shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 hover:border-primary-300 relative"
                >
                  {/* Step Number Badge */}
                  <div className="absolute -top-4 -right-4 h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-primary-700 text-gray-800 font-black shadow-lg">
                    {index + 1}
                  </div>

                  <div className="flex items-center gap-3 mb-5">

                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-50 text-primary-700 font-bold group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                      {step.icon}
                    </span>

                  </div>

                  <h3 className="font-headings text-lg font-bold text-slate-950 mb-3">
                    {step.title}
                  </h3>

                  <p className="text-slate-600 leading-relaxed text-sm font-body">
                    {step.detail}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* IMPACT */}
          <section
            id="impact"
            className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-green-800 via-green-600 to-primary-800 p-12 sm:p-16 text-white shadow-2xl"
          >

            <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-primary-500/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-secondary-500/10 blur-3xl" />

            <div className="space-y-12 relative z-10">

              <div className="text-center space-y-4 animate-fade-in">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary-300">
                  💚 Live Impact
                </p>

                <h2 className="font-headings text-4xl sm:text-5xl font-black">
                  Every plate saved — counted in real time
                </h2>

                <p className="text-slate-300 text-lg max-w-2xl mx-auto font-body">
                  Numbers update directly from our platform as restaurants donate and NGOs collect food.
                </p>
              </div>

              <LiveImpactCounter />

              <div className="flex flex-wrap justify-center gap-3 text-sm">

                <span className="rounded-full border-2 border-primary-400/30 bg-primary-500/10 px-5 py-3 font-semibold hover:bg-primary-500/20 transition-all duration-300 cursor-default">
                  ✅ Delivery proof photos
                </span>

                <span className="rounded-full border-2 border-primary-400/30 bg-primary-500/10 px-5 py-3 font-semibold hover:bg-primary-500/20 transition-all duration-300 cursor-default">
                  🛡️ Safety & hygiene logs
                </span>

                <span className="rounded-full border-2 border-primary-400/30 bg-primary-500/10 px-5 py-3 font-semibold hover:bg-primary-500/20 transition-all duration-300 cursor-default">
                  📋 Automated receipts
                </span>

                <Link
                  href="/leaderboard"
                  className="rounded-full border-2 border-secondary-400/50 bg-secondary-500/20 px-5 py-3 font-semibold hover:bg-secondary-500/30 transition-all duration-300 hover:scale-105"
                >
                  🏆 View Leaderboard
                </Link>

              </div>
            </div>
          </section>

          {/* CTA */}
          <section
            id="get-started"
            className="rounded-[40px] border-2 border-primary-200/50 bg-gradient-to-br from-primary-50 to-white p-12 sm:p-16 shadow-2xl"
          >

            <div className="grid md:grid-cols-2 gap-10 sm:gap-16 items-center">

              <div className="space-y-6 animate-fade-in">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary-600">
                  🎯 Get Started Today
                </p>

                <h3 className="font-headings text-4xl sm:text-5xl font-black text-slate-950 leading-tight">
                  Ready to move surplus food to the right hands?
                </h3>

                <p className="text-slate-600 text-lg font-body">
                  Create an account and start posting donations or requesting meals in under five minutes.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <CheckCircle className="h-5 w-5 text-primary-600 flex-shrink-0" />
                  <span className="text-sm text-slate-600">No credit card required</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Users className="h-5 w-5 text-primary-600 flex-shrink-0" />
                  <span className="text-sm text-slate-600">Join 200+ organizations</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">

                <Link href="/login" className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full rounded-2xl border-2 border-slate-300 bg-white hover:bg-slate-50 px-6 py-6 text-base font-semibold"
                  >
                    Sign In
                  </Button>
                </Link>

                <Link href="/register" className="flex-1">
                  <Button className="w-full rounded-2xl px-7 py-6 text-base font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 bg-gradient-to-r from-primary-600 to-primary-700">
                    Start for Free
                    <ArrowRight className="h-4 w-4 ml-2" />
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
