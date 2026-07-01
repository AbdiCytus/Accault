"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";

export default function OrbitSSOHandler() {
  useEffect(() => {
    // Automatically trigger NextAuth login in the background
    signIn("orbit", { callbackUrl: "/dashboard" });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500 px-4">
      <div className="relative flex flex-col items-center justify-center space-y-8 p-10 bg-white/70 dark:bg-gray-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
        
        {/* Pulsing Logo Container */}
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500 dark:bg-blue-600 rounded-full animate-ping opacity-20"></div>
          <div className="relative flex items-center justify-center h-20 w-20 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-10 h-10 text-white">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
        </div>

        <div className="text-center space-y-3">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Accault
          </h1>
          <div className="flex items-center justify-center space-x-3 text-blue-600 dark:text-blue-400">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="font-medium text-sm tracking-wide uppercase">Authenticating Securely...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
