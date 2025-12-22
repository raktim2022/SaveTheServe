import Link from 'next/link';
import { ArrowRight, Clock3, HeartHandshake, Leaf, MapPin, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/common/Button';

const features = [
  {
    icon: <Leaf className="h-6 w-6 text-primary-600" />,
    title: 'Zero Waste, Zero Hunger',
    description: 'Move surplus meals before they spoil and redirect them to people who need them most.',
  },
  {
    icon: <HeartHandshake className="h-6 w-6 text-secondary-600" />,
    title: 'Trusted NGO Partners',
    description: 'Screened NGOs with verified delivery capacity and transparent reporting.',
  },
  {
    icon: <Clock3 className="h-6 w-6 text-primary-600" />,
    title: 'Real-Time Pickup Windows',
    description: 'Match donations with nearby partners instantly and schedule optimized pickups.',
  },
];

const steps = [
  {
    title: 'Publish surplus food in minutes',
    detail: 'Log portions, dietary notes, and expiry windows to help NGOs plan routes.',
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    title: 'Auto-match with nearby NGOs',
    detail: 'Smart matching uses location and capacity to send the right NGO to you.',
    icon: <MapPin className="h-5 w-5" />,
  },
  {
    title: 'Verified pickup & handoff',
    detail: 'Track pickup codes, handoff status, and receive proof-of-delivery instantly.',
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    title: 'Impact you can measure',
    detail: 'Live dashboards for meals served, CO₂ saved, and communities reached.',
    icon: <Truck className="h-5 w-5" />,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50/60 via-white to-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 space-y-20">
        {/* Hero */}
        <section className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full bg-primary-100 text-primary-800 px-4 py-2 text-sm font-semibold shadow-brand-card">
              <span className="h-2 w-2 rounded-full bg-secondary-500" />
              Food rescue for NGOs & restaurants
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
                Rescue surplus food.
                <span className="block text-primary-700">Fuel local communities.</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl">
                SaveTheServe connects restaurants, donors, and NGOs to move good food to the right place—fast, safely, and with full transparency.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link href="/register?type=ngo">
                <Button size="lg" className="shadow-brand-card">
                  Join as NGO <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register?type=restaurant">
                <Button size="lg" variant="outline" className="border-primary-200 text-primary-700 hover:bg-primary-50">
                  Donate surplus food
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-600">
              <div>
                <p className="font-semibold text-primary-700">1.2M+</p>
                <p>Meals served through our partners</p>
              </div>
              <div>
                <p className="font-semibold text-primary-700">120+</p>
                <p>Restaurants & donors onboarded</p>
              </div>
              <div>
                <p className="font-semibold text-primary-700">80+</p>
                <p>NGOs across urban corridors</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 -top-6 h-28 w-28 rounded-full bg-secondary-200 blur-3xl opacity-70" />
            <div className="absolute -right-10 bottom-10 h-32 w-32 rounded-full bg-primary-200 blur-3xl opacity-60" />
            <div className="relative rounded-2xl bg-white shadow-brand-card border border-primary-50/80 p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">S</div>
                <div>
                  <p className="text-sm text-slate-500">Live availability</p>
                  <p className="font-semibold text-slate-900">Nearby surplus ready for pickup</p>
                </div>
              </div>
              <div className="grid gap-4">
                {["Meals (veg)", "Packed grains", "Fresh produce"].map((item, idx) => (
                  <div key={item} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 bg-slate-50/70">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary-700 font-semibold">
                        {idx + 2}0
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{item}</p>
                        <p className="text-xs text-slate-500">Expires in {idx + 2} hrs</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-3 py-1 rounded-full">Reserve</span>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary-100">Impact tracker</p>
                  <p className="text-xl font-semibold">46,820 meals delivered</p>
                </div>
                <HeartHandshake className="h-10 w-10" />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="space-y-8" id="how-it-works">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <p className="text-sm font-semibold text-primary-700 uppercase tracking-wide">Why SaveTheServe</p>
            <h2 className="text-3xl font-bold text-slate-900">Built for teams that refuse to waste good food</h2>
            <p className="text-slate-600">Operational tools, safety checks, and transparent reporting designed for donors and NGOs.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-brand-card/40 hover:shadow-brand-card transition">
                <div className="h-12 w-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Steps */}
        <section className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 space-y-4">
            <p className="text-sm font-semibold text-primary-700 uppercase tracking-wide">How it works</p>
            <h2 className="text-3xl font-bold text-slate-900">From surplus to served in four steps</h2>
            <p className="text-slate-600">Clear guardrails keep every handoff accountable: verified partners, pickup codes, and live status updates.</p>
          </div>
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-4">
            {steps.map((step, index) => (
              <div key={step.title} className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-brand-card/30">
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-700 font-semibold">{index + 1}</span>
                  <div className="flex items-center gap-2 text-primary-700">{step.icon}<span className="text-xs font-semibold uppercase tracking-wide">Step {index + 1}</span></div>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{step.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Impact */}
        <section id="impact" className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-700 to-primary-600 text-white p-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <p className="text-sm font-semibold text-primary-100 uppercase tracking-wide">Impact dashboard</p>
              <h2 className="text-3xl font-bold">See your impact in real time</h2>
              <p className="text-primary-50 leading-relaxed">
                Every donation is tracked from pickup to delivery. Shareable reports highlight meals served, CO₂ prevented, and communities reached.
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="px-3 py-2 rounded-full bg-white/10 border border-white/20">Delivery proof photos</span>
                <span className="px-3 py-2 rounded-full bg-white/10 border border-white/20">Safety & hygiene logs</span>
                <span className="px-3 py-2 rounded-full bg-white/10 border border-white/20">Automated receipts</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[{ label: 'Meals delivered', value: '46,820' }, { label: 'CO₂ saved', value: '128 tons' }, { label: 'Active pickups today', value: '32' }, { label: 'Avg. pickup SLA', value: '22 mins' }].map((metric) => (
                <div key={metric.label} className="rounded-2xl bg-white/10 border border-white/20 p-4 backdrop-blur-sm">
                  <p className="text-sm text-primary-100">{metric.label}</p>
                  <p className="text-2xl font-semibold">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="get-started" className="bg-white border border-slate-100 rounded-3xl p-10 shadow-brand-card">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-primary-700 uppercase tracking-wide">Get started</p>
              <h3 className="text-2xl font-bold text-slate-900">Ready to move surplus food to the right hands?</h3>
              <p className="text-slate-600">Create an account and start posting donations or requesting meals in under five minutes.</p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link href="/login">
                <Button variant="ghost" className="border border-slate-200 hover:border-primary-200 hover:bg-primary-50">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button>Start for free</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
