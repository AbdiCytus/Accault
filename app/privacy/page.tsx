// app/privacy/page.tsx
import React from "react";

export const metadata = {
  title: "Privacy Policy - Accault",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Privacy Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              1. Information We Collect
            </h2>
            <p>
              We collect information you provide directly to us, such as when
              you create an account, save credentials, or contact us for
              support. This includes your name, email address, and the encrypted
              account data you store within the application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              2. How We Use Your Information
            </h2>
            <p>
              We use the information we collect to provide, maintain, and
              improve our services, such as verifying your identity and keeping
              your stored accounts secure. We do not sell your personal data to
              third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              3. Data Security
            </h2>
            <p>
              Security is our top priority. Your saved passwords and sensitive
              information are encrypted before being stored in our database. We
              use industry-standard encryption protocols (such as AES) to ensure
              that only you can access your raw data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              4. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us at abdiprayuda203@gmail.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
