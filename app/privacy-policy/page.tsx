import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PrivacyPolicyPage = () => {
  const companyName = "Finfik";
  const contactEmail = "support@finfik.com";
  // TODO: Update with actual date

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center mb-4">Privacy Policy</CardTitle>
          
        </CardHeader>
        <CardContent className="space-y-6 text-lg leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold mb-2">1. Introduction</h2>
            <p>
              Welcome to {companyName}! We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website finfik.com, including any other media form, media channel, mobile website, or mobile application related or connected thereto (collectively, the “Site”). Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">2. Information We Collect</h2>
            <p>
              We collect information that identifies, relates to, describes, references, is capable of being associated with, or could reasonably be linked, directly or indirectly, with a particular consumer or device ("personal information").
            </p>
            <h3 className="text-xl font-medium mt-4 mb-2">2.1 Personal Information You Disclose to Us</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>**Identity Data:** Name, username, or similar identifier.</li>
              <li>**Contact Data:** Billing address, email address, and telephone numbers.</li>
              <li>**Financial Data:** Payment card details (processed securely by third-party payment processors).</li>
              <li>**Profile Data:** Your username and password, purchases or orders made by you, your interests, preferences, feedback, and survey responses.</li>
            </ul>
            <h3 className="text-xl font-medium mt-4 mb-2">2.2 Information Automatically Collected</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>**Usage Data:** Information about how you use our Site, products, and services.</li>
              <li>**Technical Data:** Internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this Site.</li>
              <li>**Cookies and Tracking Technologies:** We use cookies and similar tracking technologies to track the activity on our Site and hold certain information.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">3. How We Use Your Information</h2>
            <p>
              We use the information we collect for various purposes, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide, operate, and maintain our Site.</li>
              <li>To improve, personalize, and expand our Site.</li>
              <li>To understand and analyze how you use our Site.</li>
              <li>To develop new products, services, features, and functionality.</li>
              <li>To communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the Site, and for marketing and promotional purposes.</li>
              <li>To process your transactions and manage your orders.</li>
              <li>To find and prevent fraud.</li>
              <li>For compliance with legal obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">4. How We Share Your Information</h2>
            <p>
              We may share your information with third parties in the following situations:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>**Service Providers:** We may share your personal information with third-party service providers who perform services on our behalf, such as payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.</li>
              <li>**Business Transfers:** We may share or transfer your personal information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
              <li>**Legal Requirements:** We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or a government agency).</li>
              <li>**Affiliates:** We may share your information with our affiliates, in which case we will require those affiliates to honor this Privacy Policy.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">5. Your Rights</h2>
            <p>
              Depending on your location, you may have the following rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>**Access:** You have the right to request access to the personal information we hold about you.</li>
              <li>**Correction:** You have the right to request that we correct any inaccurate personal information.</li>
              <li>**Deletion:** You have the right to request the deletion of your personal information.</li>
              <li>**Objection/Restriction:** You have the right to object to or request restriction of our processing of your personal information.</li>
              <li>**Data Portability:** You have the right to request a copy of your personal information in a structured, commonly used, and machine-readable format.</li>
            </ul>
            <p className="mt-4">
              To exercise any of these rights, please contact us at {contactEmail}.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">6. Data Security</h2>
            <p>
              We implement reasonable technical, administrative, and physical security measures designed to protect your personal information from unauthorized access, use, or disclosure. However, please be aware that no security measures are perfect or impenetrable, and we cannot guarantee the absolute security of your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">7. Third-Party Links</h2>
            <p>
              Our Site may contain links to third-party websites or services that are not owned or controlled by {companyName}. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services. We strongly advise you to review the privacy policies of any third-party websites or services that you visit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">8. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective Date" at the top of this Privacy Policy. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at: <Link href={`mailto:${contactEmail}`} className="text-primary hover:underline">{contactEmail}</Link>
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyPolicyPage;
