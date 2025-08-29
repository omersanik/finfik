import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TermsOfServicePage = () => {
  const companyName = "Finfik";
  const contactEmail = "support@finfik.com";
  // TODO: Update with actual date

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center mb-4">Terms of Service</CardTitle>
          
        </CardHeader>
        <CardContent className="space-y-6 text-lg leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold mb-2">1. Introduction</h2>
            <p>
              Welcome to {companyName}! These Terms of Service ("Terms") govern your use of our website finfik.com, including any other media form, media channel, mobile website, or mobile application related or connected thereto (collectively, the “Site”). Please read these Terms carefully before using the Site. By accessing or using the Site, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not access or use the Site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">2. Acceptance of Terms</h2>
            <p>
              By creating an account, making a purchase, or otherwise accessing or using the Site, you acknowledge that you have read, understood, and agree to be bound by these Terms, as well as any additional terms and conditions or policies referenced herein or made available on the Site from time to time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">3. Changes to Terms</h2>
            <p>
              We reserve the right, in our sole discretion, to make changes or modifications to these Terms at any time and for any reason. We will alert you about any changes by updating the "Effective Date" of these Terms. You waive any right to receive specific notice of each such change. It is your responsibility to periodically review these Terms to stay informed of updates. Your continued use of the Site after the date such revised Terms are posted will constitute your acceptance of such changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">4. Access and Use of the Service</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>**Eligibility:** You must be at least 18 years old or the age of legal majority in your jurisdiction to use the Site.</li>
              <li>**License:** We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Site for your personal, non-commercial use, strictly in accordance with these Terms.</li>
              <li>**Restrictions:** You agree not to (a) reproduce, duplicate, copy, sell, resell, or exploit any portion of the Site without our express written permission; (b) use the Site for any illegal or unauthorized purpose; (c) interfere with or disrupt the integrity or performance of the Site or the data contained therein.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">5. User Accounts</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>**Account Creation:** You may be required to register with the Site to access certain features. You agree to keep your password confidential and will be responsible for all use of your account and password.</li>
              <li>**Accuracy of Information:** You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">6. Intellectual Property</h2>
            <p>
              All content on the Site, including text, graphics, logos, images, as well as the compilation thereof, and any software used on the Site, is the property of {companyName} or its suppliers and protected by copyright and other laws that protect intellectual property and proprietary rights. You agree to observe and abide by all copyright and other proprietary notices, legends, or other restrictions contained in any such content and will not make any changes thereto.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">7. Prohibited Activities</h2>
            <p>
              You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us. Prohibited activities include, but are not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Systematically retrieving data or other content from the Site to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
              <li>Engaging in unauthorized framing of or linking to the Site.</li>
              <li>Interfering with, disrupting, or creating an undue burden on the Site or the networks or services connected to the Site.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">8. Termination</h2>
            <p>
              We may terminate or suspend your access to the Site immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms. Upon termination, your right to use the Site will immediately cease. If you wish to terminate your account, you may simply discontinue using the Site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">9. Disclaimers</h2>
            <p>
              THE SITE IS PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SITE AND OUR SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SITE AND YOUR USE THEREOF, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">10. Limitation of Liability</h2>
            <p>
              IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SITE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">11. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">12. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at: <Link href={`mailto:${contactEmail}`} className="text-primary hover:underline">{contactEmail}</Link>
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default TermsOfServicePage;
