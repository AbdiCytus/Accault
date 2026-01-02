// app/help/page.tsx
import React from "react";

export const metadata = {
  title: "Help Center - Accault",
};

const faqs = [
  {
    question: "How do I add a new account?",
    answer:
      "Navigate to your dashboard and click the 'Add Account' button in the top right corner. Fill in the platform name, username, and password details.",
  },
  {
    question: "Is my password safe?",
    answer:
      "Yes. We use advanced encryption methods to store your passwords. We do not store your passwords in plain text, meaning even our staff cannot read them.",
  },
  {
    question: "Can I group my accounts?",
    answer:
      "Absolutely. You can create 'Groups' (e.g., Work, Social, Gaming) and assign your accounts to these groups for better organization.",
  },
  // --- UPDATED: Backup / Export Section ---
  {
    question: "Can I backup my data?",
    answer:
      "Yes, you can secure your data by exporting it to an Excel file. This feature is accessible via the Action Menu (usually a '...' icon or 'Actions' button) located on the main Dashboard, Group Detail pages, and Account Detail pages.",
  },
  // --- NEW: Import Section ---
  {
    question: "How do I restore or import data?",
    answer:
      "To import data, go to the main Dashboard and open the Action Menu. Select the 'Import' option and upload your previously exported Excel file. The system will validate and restore your accounts and groups automatically.",
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Help Center
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Frequently asked questions and guides to help you manage your
            accounts.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {faq.question}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
