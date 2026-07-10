import { Check, IndianRupee, Sparkles } from 'lucide-react';
import MarketingPageShell from '@/components/marketing/MarketingPageShell';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'For organizations getting started with verified food rescue workflows.',
    features: ['NGO registration', 'Donation discovery', 'Basic impact tracking'],
  },
  {
    name: 'Growth',
    price: 'Custom',
    description: 'For teams coordinating multiple pickups and monitoring engagement closely.',
    features: ['Advanced coordination', 'Analytics dashboard', 'Priority support'],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large networks that need dedicated onboarding and reporting support.',
    features: ['Dedicated success lead', 'Custom integrations', 'Tailored reporting'],
  },
];

export default function PricingPage() {
  return (
    <MarketingPageShell
      eyebrow="Pricing"
      title="Transparent pricing for partners that need dependable food-rescue operations."
      description="We keep the public donor experience straightforward and offer structured partnership options for organizations that need more advanced coordination and support."
      primaryCta={{ label: 'Start free', href: '/register' }}
      secondaryCta={{ label: 'Contact sales', href: '/contact' }}
      highlights={[
        { title: 'No hidden charges', description: 'Public-facing donation journeys remain clear and simple.' },
        { title: 'Operational fit', description: 'Plans are aligned with pickup volume and support needs.' },
        { title: 'Scalable support', description: 'Upgrade as your network grows.' },
      ]}
    >
      <div className="space-y-4">
        {plans.map((plan, index) => (
          <div key={plan.name} className={`rounded-3xl border p-5 ${index === 0 ? 'border-emerald-400/40 bg-emerald-500/10' : 'border-white/10 bg-white/5'}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-white">{plan.name}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{plan.description}</p>
              </div>
              <div className="rounded-2xl bg-white/5 px-4 py-2 text-right">
                <p className="flex items-center justify-end gap-1 text-sm text-slate-400"><IndianRupee className="h-4 w-4" />{plan.price}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              {plan.features.map((feature) => (
                <p key={feature} className="flex items-center gap-2 text-sm text-slate-300"><Check className="h-4 w-4 text-emerald-300" />{feature}</p>
              ))}
            </div>
          </div>
        ))}

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-white"><Sparkles className="h-4 w-4 text-emerald-300" />Donation checkout</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Donor payments are processed through secure checkout and verified on the server before being recorded in the platform.
          </p>
        </div>
      </div>
    </MarketingPageShell>
  );
}