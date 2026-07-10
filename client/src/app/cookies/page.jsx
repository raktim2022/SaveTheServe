import LegalPageLayout from '@/components/layout/LegalPageLayout';
import SEO from '@/components/common/SEO';
import { generateSEOProps } from '@/utils/seo';

export default function CookiesPage() {
  const seoProps = generateSEOProps('cookies');

  const sections = [
    { id: 'what-are-cookies', title: '1. What Are Cookies?' },
    { id: 'how-we-use', title: '2. How We Use Cookies' },
    { id: 'types-of-cookies', title: '3. Types of Cookies We Use' },
    { id: 'managing-cookies', title: '4. Managing Cookies' },
    { id: 'updates', title: '5. Updates to This Policy' },
  ];

  return (
    <>
      <SEO {...seoProps} />
      <LegalPageLayout 
        title="Cookie Policy"
        lastUpdated="October 24, 2025"
        sections={sections}
      >
        <h2 id="what-are-cookies">1. What Are Cookies?</h2>
        <p>
          Cookies are small text files placed on your device (computer, smartphone, or other electronic device) when you visit our website. They help us recognize your device and store some information about your preferences or past actions to improve your experience on the SaveTheServe platform.
        </p>

        <h2 id="how-we-use">2. How We Use Cookies</h2>
        <p>
          We use cookies to ensure the basic functionality of the platform, enhance your user experience, and analyze how our site is used. Specifically, we use cookies to:
        </p>
        <ul>
          <li>Keep you signed in across different pages of the platform.</li>
          <li>Remember your dashboard preferences and filters.</li>
          <li>Understand how visitors interact with the site so we can improve the interface and features.</li>
        </ul>

        <h2 id="types-of-cookies">3. Types of Cookies We Use</h2>
        
        <h3>Essential Cookies</h3>
        <p>
          These are strictly necessary to provide you with services available through our platform and to use some of its features, such as access to secure areas (e.g., your NGO dashboard or donor profile).
        </p>

        <h3>Performance and Analytics Cookies</h3>
        <p>
          These cookies collect information that is used either in aggregate form to help us understand how our platform is being used or how effective our campaigns are, or to help us customize our platform for you.
        </p>

        <h3>Functionality Cookies</h3>
        <p>
          These cookies are used to recognize you when you return to our platform. This enables us to personalize our content for you and remember your preferences (for example, your choice of language or region).
        </p>

        <h2 id="managing-cookies">4. Managing Cookies</h2>
        <p>
          Most web browsers allow you to control cookies through their settings preferences. You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. However, if you disable or refuse essential cookies, please note that some parts of the SaveTheServe platform may become inaccessible or not function properly.
        </p>

        <h2 id="updates">5. Updates to This Policy</h2>
        <p>
          We may update this Cookie Policy from time to time in order to reflect changes to the cookies we use or for other operational, legal, or regulatory reasons. Please revisit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
        </p>
      </LegalPageLayout>
    </>
  );
}