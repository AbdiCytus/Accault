// app/terms/page.tsx
import React from "react";

export const metadata = {
  title: "Terms of Service - Accault",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Terms of Service
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using Accault, you agree to be bound by these
              Terms. If you disagree with any part of the terms, then you may
              not access the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              2. User Responsibilities
            </h2>
            <p>
              You are responsible for safeguarding the password that you use to
              access the service and for any activities or actions under your
              password. You agree not to disclose your password to any third
              party.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              3. Termination
            </h2>
            <p>
              We may terminate or suspend access to our service immediately,
              without prior notice or liability, for any reason whatsoever,
              including without limitation if you breach the Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              4. Changes to Terms
            </h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace
              these Terms at any time. What constitutes a material change will
              be determined at our sole discretion.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
