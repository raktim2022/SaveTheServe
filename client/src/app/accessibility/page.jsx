import LegalPageLayout from '@/components/layout/LegalPageLayout';
import SEO from '@/components/common/SEO';
import { generateSEOProps } from '@/utils/seo';

export default function AccessibilityPage() {
  const seoProps = generateSEOProps('accessibility');

  const sections = [
    { id: 'commitment', title: '1. Our Commitment' },
    { id: 'conformance', title: '2. Conformance Status' },
    { id: 'features', title: '3. Accessibility Features' },
    { id: 'feedback', title: '4. Feedback and Contact' },
  ];

  return (
    <>
      <SEO {...seoProps} />
      <LegalPageLayout 
        title="Accessibility Statement"
        lastUpdated="October 24, 2025"
        sections={sections}
      >
        <h2 id="commitment">1. Our Commitment</h2>
        <p>
          SaveTheServe is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone, and applying the relevant accessibility standards to guarantee that our food rescue platform can be used by the widest possible audience.
        </p>

        <h2 id="conformance">2. Conformance Status</h2>
        <p>
          The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA. SaveTheServe is partially conformant with WCAG 2.1 level AA. Partially conformant means that some parts of the content do not fully conform to the accessibility standard, though we are actively working on resolving these issues.
        </p>

        <h2 id="features">3. Accessibility Features</h2>
        <p>
          We have built the SaveTheServe platform with the following accessibility features in mind:
        </p>
        <ul>
          <li><strong>Keyboard Navigation:</strong> Core user flows, such as posting a donation and claiming a pickup, can be completed using a keyboard.</li>
          <li><strong>Contrast Ratios:</strong> We strive to maintain high color contrast for text and interactive elements.</li>
          <li><strong>Semantic HTML:</strong> We use semantic structure to help screen readers effectively interpret the page layout and content.</li>
          <li><strong>Scalable Text:</strong> Our design supports standard browser zoom functionality without breaking layout up to 200%.</li>
        </ul>

        <h2 id="feedback">4. Feedback and Contact</h2>
        <p>
          We welcome your feedback on the accessibility of SaveTheServe. If you encounter accessibility barriers on our platform, please let us know so we can address them promptly.
        </p>
        <p>
          <strong>Email:</strong> accessibility@savetheserve.org<br />
          <strong>Support:</strong> We aim to respond to accessibility feedback within 2 business days.
        </p>
      </LegalPageLayout>
    </>
  );
}