import { BookOpenCheck, Layers3, ShieldCheck, Settings2 } from 'lucide-react';
import MarketingPageShell from '@/components/marketing/MarketingPageShell';

const docs = [
  { icon: BookOpenCheck, title: 'Getting started', text: 'Register your organization, complete the profile, and begin using the platform.' },
  { icon: Layers3, title: 'Workflow overview', text: 'Learn how requests, matches, pickup, and verification work end to end.' },
  { icon: ShieldCheck, title: 'Verification and trust', text: 'Understand donor verification, NGO approval, and payment confirmation.' },
  { icon: Settings2, title: 'Account settings', text: 'Manage notifications, organization details, and operational preferences.' },
];

export default function DocsPage() {
  return (
    <MarketingPageShell
      eyebrow="Documentation"
      title="A clear reference for using SaveTheServe with confidence."
      description="This documentation hub outlines the core platform flows so teams can onboard quickly and operate consistently."
      primaryCta={{ label: 'Open support', href: '/support' }}
      secondaryCta={{ label: 'About us', href: '/about' }}
      highlights={[
        { title: 'Audience', description: 'Designed for NGOs, restaurants, admins, and donors.' },
        { title: 'Scope', description: 'Covers onboarding, coordination, and verification flows.' },
        { title: 'Outcome', description: 'Reduce friction during day-to-day operations.' },
      ]}
    >
      <div className="space-y-4">
        {docs.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-emerald-500/15 p-3 text-emerald-300">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.text}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </MarketingPageShell>
  );
}