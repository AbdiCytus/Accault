// app/about/page.tsx
// import React from "react";
// import Image from "next/image";

import Image from "next/image";

export const metadata = {
  title: "About Us - Accault",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl mb-6">
            About Accault
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A secure, modern, and efficient way to manage your digital identity.
            Remember one password, access everything.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-16">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                What is Accault?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                <strong>Accault (Account Vault)</strong> is an personal digital
                vault designed to organize and secure your online presence. It
                acts as a centralized database where you can store login
                credentials, track email identities, and group your accounts
                based on their purpose (like Work, Social, or Finance).
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Unlike browser-based password managers, Accault focuses
                on the <strong>relationship between your data</strong>—showing
                you exactly which email is linked to which account, and giving
                you analytical insights into your digital footprint.
              </p>
            </section>

            {/* Bagian Misi */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Our Mission
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                In today`s digital age, managing dozens of accounts is a hassle.
                We built this platform to solve the chaos of forgotten passwords
                and scattered information. We prioritize{" "}
                <strong>security</strong>, <strong>simplicity</strong>, and{" "}
                <strong>speed</strong>, ensuring you never get locked out of
                your accounts again.
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Whether you are a professional managing work tools or a gamer
                keeping track of multiple logins, we`ve got you covered.
              </p>
            </section>
          </div>

          {/* Kolom Ilustrasi (Sticky agar tetap terlihat saat scroll) */}
          <div className="bg-gray-200 dark:bg-gray-800 border dark:border-gray-800 rounded-2xl max-h-max flex items-center justify-center text-gray-400 dark:text-gray-500 sticky top-24">
            <Image src="/images/profile-prev.png" alt="profile-page" width={2000} height={2000} className="w-full h-full object-fit sticky rounded-2xl" />
          </div>
        </div>

        {/* Tech Stack Section */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
          <h3 className="text-center text-xl font-bold text-gray-900 dark:text-white mb-8">
            Built with Modern Technology
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-gray-50 dark:bg-black rounded-xl flex flex-col justify-center items-center gap-2">
              <Image
                src="next.svg"
                alt="nextjs icon"
                width={100}
                height={100}
                className="bg-gray-50 p-3 rounded-md"
              />
            </div>
            <div className="p-4 bg-gray-50 dark:bg-black rounded-xl flex flex-col justify-center items-center gap-2">
              <Image
                src="prisma-svgrepo-com.svg"
                alt="prisma icon"
                width={50}
                height={50}
                className="bg-gray-50 p-3 rounded-md"
              />
            </div>
            <div className="p-4 bg-gray-50 dark:bg-black rounded-xl  flex flex-col justify-center items-center gap-2">
              <Image
                src="Tailwind_CSS_Logo.svg"
                alt="tailwind icon"
                width={50}
                height={50}
              />
            </div>
            <div className="p-4 bg-gray-50 dark:bg-black rounded-xl  flex flex-col justify-center items-center gap-2">
              <Image
                src="nextauth.svg"
                alt="nextauth icon"
                width={50}
                height={50}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
