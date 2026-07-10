import LegalPageLayout from '@/components/layout/LegalPageLayout';
import SEO from '@/components/common/SEO';
import { generateSEOProps } from '@/utils/seo';

export default function PrivacyPage() {
  const seoProps = generateSEOProps('privacy');

  const sections = [
    { id: 'introduction', title: '1. Introduction' },
    { id: 'data-collection', title: '2. Data Collection' },
    { id: 'data-use', title: '3. How We Use Data' },
    { id: 'data-sharing', title: '4. Data Sharing' },
    { id: 'data-security', title: '5. Security' },
    { id: 'user-rights', title: '6. Your Rights' },
    { id: 'contact', title: '7. Contact Us' },
  ];

  return (
    <>
      <SEO {...seoProps} />
      <LegalPageLayout 
        title="Privacy Policy"
        lastUpdated="October 24, 2025"
        sections={sections}
      >
        <h2 id="introduction">1. Introduction</h2>
        <p>
          At SaveTheServe, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our platform or use our services. We are committed to ensuring that your privacy is protected while you participate in food rescue operations.
        </p>
        <p>
          By accessing or using our platform, you agree to this Privacy Policy. If you do not agree with our policies and practices, please do not use our services.
        </p>

        <h2 id="data-collection">2. Data Collection</h2>
        <p>
          We collect information that you provide directly to us when you register for an account, update your profile, list surplus food, or arrange a pickup. This may include:
        </p>
        <ul>
          <li><strong>Personal Details:</strong> Name, email address, phone number, and organization details.</li>
          <li><strong>Operational Data:</strong> Location of food pickups, food types, and availability schedules.</li>
          <li><strong>Transaction Data:</strong> Payment details when you make a donation (processed securely via our partners, not stored by us).</li>
        </ul>

        <h2 id="data-use">3. How We Use Data</h2>
        <p>
          The information we collect is used strictly to facilitate our core mission:
        </p>
        <ul>
          <li>To match surplus food donations with verified NGOs.</li>
          <li>To process and track rescue logistics and impact metrics.</li>
          <li>To communicate with you regarding your account, pickups, or customer support inquiries.</li>
          <li>To maintain platform security, prevent fraud, and enforce our terms of service.</li>
        </ul>

        <h2 id="data-sharing">4. Data Sharing</h2>
        <p>
          We do not sell your personal data. We only share information in the following limited circumstances:
        </p>
        <ul>
          <li><strong>With Partners:</strong> We share necessary details (like location and contact info) between restaurants and NGOs to facilitate the physical handoff of food.</li>
          <li><strong>Service Providers:</strong> We use third-party vendors for hosting, email delivery, and payment processing who are bound by strict confidentiality agreements.</li>
          <li><strong>Legal Requirements:</strong> If required by law, subpoena, or other legal process.</li>
        </ul>

        <h2 id="data-security">5. Security</h2>
        <p>
          We implement a variety of security measures to maintain the safety of your personal information. We use industry-standard encryption, secure server hosting, and regular security audits. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
        </p>

        <h2 id="user-rights">6. Your Rights</h2>
        <p>
          You have the right to access, correct, or delete your personal information stored on our platform. You can manage your profile settings directly through your dashboard. If you wish to completely delete your account and associated data, please contact our support team.
        </p>

        <h2 id="contact">7. Contact Us</h2>
        <p>
          If you have questions or comments about this Privacy Policy, please contact our privacy officer at:
        </p>
        <p>
          <strong>Email:</strong> privacy@savetheserve.org<br />
          <strong>Phone:</strong> +91 90000 00000
        </p>
      </LegalPageLayout>
    </>
  );
}