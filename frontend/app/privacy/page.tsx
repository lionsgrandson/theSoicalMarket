import Image from "next/image";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#ffffff] to-[#E9F4FF]">
        <main className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 items-center pt-16 md:pt-24 gap-8">
            {/* Left Content */}
            <div className="space-y-8 flex-1">
              {/*  short intro paragraph */}
              <p className="text-primary text-lg md:text-xl mb-4">
                At The Social Market, we believe privacy and transparency are
                the foundation of lasting relationships. We’re committed to
                protecting your personal information and being clear about how
                we use it.
              </p>

              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-primary leading-tight">
                  Empowering Brands and Influencers to{" "}
                  <span className="text-primary">Grow Together</span>
                </h1>
              </div>
            </div>

            {/* Right Image  */}
            <div className="relative pt-12 md:pt-16 lg:pt-0 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-lg lg:max-w-2xl">
              <Image
                width={1200}
                height={800}
                src={"/images/privacy-hero.png"}
                alt="Two stylish women representing micro-influencers"
                className="w-full h-auto object-cover "
                priority
              />
              </div>
            </div>
          </div>
        </main>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16 lg:py-24">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 underline">
              Privacy Policy
            </h1>
          </div>

          {/* ✅ Added more spacing between numbered paragraphs */}
          <div className="prose prose-lg max-w-none space-y-12">
            <div className="text-sm text-gray-600 mb-8">
              <p>Effective Date: 02/19/2025</p>
              <p>
                Thank you for visiting The Social Market. Your privacy is
                important to us. This Privacy Policy explains how we collect,
                use, and protect your personal information when you visit or
                interact with our website www.socialmarket.com.
              </p>
            </div>

            {/* 1 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                1. Information We Collect
              </h2>
              <p className="text-gray-700 mb-4">
                We may collect the following types of information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <strong>Personal Information:</strong> such as your name,
                  email address etc. (only when you submit it
                  voluntarily, e.g., through contact forms or account
                  registration)
                </li>
                <li>
                  <strong>Usage Data:</strong> information about how you use our
                  website, browser type, device type, pages visited, time spent
                  on the site, and other analytical data
                </li>
                <li>
                  <strong>Cookies and Tracking Technologies:</strong> we may use
                  cookies to enhance your experience, analyze site traffic, and
                  improve our services
                </li>
              </ul>
            </section>

            {/* 2 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                2. How We Use Your Information
              </h2>
              <p className="text-gray-700 mb-4">
                We may use your information for the following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>To provide and maintain our website</li>
                <li>To respond to your inquiries and provide customer support</li>
                <li>
                  To send you updates, newsletters, or marketing communications
                  (you can opt out)
                </li>
                <li>
                  To analyze and improve the performance and content of our site
                </li>
                <li>To detect and prevent fraudulent or illegal activity</li>
              </ul>
            </section>

            {/* 3 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                3. Sharing Your Information
              </h2>
              <p className="text-gray-700 mb-4">
                We do not sell your personal data. We may share your information
                with:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <strong>Service Providers:</strong> who assist in operating
                  our site or serving you
                </li>
                <li>
                  <strong>Business Partners:</strong> for joint marketing or
                  promotional activities
                </li>
                <li>
                  <strong>Legal Authorities:</strong> if required by law or to
                  protect our legal rights
                </li>
              </ul>
            </section>

            {/* 4 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                4. Your Rights and Choices
              </h2>
              <p className="text-gray-700 mb-4">You may have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Access the personal data we hold about you</li>
                <li>Request correction or deletion of your data</li>
                <li>Opt out of marketing communications</li>
                <li>
                  To exercise any of these rights, contact us at:
                  Creatorflow@gmail.com
                </li>
              </ul>
            </section>

            {/* 5 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                5. Security
              </h2>
              <p className="text-gray-700">
                We take reasonable precautions to protect your personal
                information. However, no method of transmission over the
                Internet is 100% secure.
              </p>
            </section>

            {/* 6 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                6. Third-Party Links
              </h2>
              <p className="text-gray-700">
                Our website may contain links to other websites. We are not
                responsible for their privacy practices or content.
              </p>
            </section>

            {/* 7 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                7. Children&apos;s Privacy
              </h2>
              <p className="text-gray-700">
                Our website is not directed to children under 13. We do not
                knowingly collect personal information from children.
              </p>
            </section>

            {/* 8 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                8. Changes to This Privacy Policy
              </h2>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. Changes
                will be posted on this page with an updated &quot;Effective
                Date.&quot;
              </p>
            </section>

            {/* 9 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                9. Contact Us
              </h2>
              <p className="text-gray-700">
                If you have any questions or concerns about this Privacy Policy,
                please contact us at:
                <br />
                info@thesocialmarket.ai 
 <br />
                {/* [Your Address, City, Country] */}
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
