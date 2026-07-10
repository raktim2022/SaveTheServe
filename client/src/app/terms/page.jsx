import LegalPageLayout from '@/components/layout/LegalPageLayout';
import SEO from '@/components/common/SEO';
import { generateSEOProps } from '@/utils/seo';

export default function TermsPage() {
  const seoProps = generateSEOProps('terms');

  const sections = [
    { id: 'acceptance', title: '1. Acceptance of Terms' },
    { id: 'platform-role', title: '2. Role of the Platform' },
    { id: 'user-obligations', title: '3. User Obligations' },
    { id: 'donations', title: '4. Donations & Payments' },
    { id: 'liability', title: '5. Limitation of Liability' },
    { id: 'termination', title: '6. Termination' },
    { id: 'contact', title: '7. Contact Us' },
  ];

  return (
    <>
      <SEO {...seoProps} />
      <LegalPageLayout 
        title="Terms of Service"
        lastUpdated="October 24, 2025"
        sections={sections}
      >
        <h2 id="acceptance">1. Acceptance of Terms</h2>
        <p>
          By creating an account, accessing, or using the SaveTheServe platform, you agree to be bound by these Terms of Service. These Terms govern your access to and use of our platform, which connects food donors (like restaurants) with verified Non-Governmental Organizations (NGOs).
        </p>

        <h2 id="platform-role">2. Role of the Platform</h2>
        <p>
          SaveTheServe acts strictly as an intermediary technology platform. We provide the tools for coordination, tracking, and communication. We do not take possession of, prepare, or deliver any food items. Therefore, we do not guarantee the quality, safety, or legality of the food donated.
        </p>

        <h2 id="user-obligations">3. User Obligations</h2>
        <p>
          As a user of the platform (whether an NGO, donor, or public supporter), you agree to:
        </p>
        <ul>
          <li>Provide accurate and verifiable information during registration.</li>
          <li>Use the platform solely for lawful, charitable, or operational purposes related to food rescue.</li>
          <li><strong>For Donors:</strong> Ensure that all food listed for donation complies with local health and safety regulations at the time of handoff.</li>
          <li><strong>For NGOs:</strong> Handle all collected food safely, distribute it responsibly, and maintain accurate receipt logs on the platform.</li>
        </ul>

        <h2 id="donations">4. Donations & Payments</h2>
        <p>
          Monetary donations made through the platform are processed by secure third-party payment gateways (e.g., Razorpay). SaveTheServe does not store your credit card information. Donations are directed to the designated NGO or the platform's general operating fund as explicitly chosen by the donor. Donations are generally non-refundable unless there is a verifiable processing error.
        </p>

        <h2 id="liability">5. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, SaveTheServe, its affiliates, and its employees shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform. This includes, but is not limited to, any health issues or liabilities arising from the consumption of donated food. Donors and NGOs assume full responsibility for food safety.
        </p>

        <h2 id="termination">6. Termination</h2>
        <p>
          We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties, or for any other reason.
        </p>

        <h2 id="contact">7. Contact Us</h2>
        <p>
          For any questions regarding these terms, please reach out to our legal team:
        </p>
        <p>
          <strong>Email:</strong> legal@savetheserve.org<br />
          <strong>Address:</strong> Mumbai, India
        </p>
      </LegalPageLayout>
    </>
  );
}