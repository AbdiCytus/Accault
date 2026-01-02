"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { dictionary, Locale } from "@/lib/dictionary";

type LanguageContextType = {
  lang: Locale;
  toggleLanguage: () => void;
  t: typeof dictionary.en; // Type inference dari dictionary Inggris
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Locale>("en");

  // Load bahasa dari LocalStorage saat pertama kali buka
  useEffect(() => {
    const savedLang = localStorage.getItem("app-lang") as Locale;
    if (savedLang && (savedLang === "en" || savedLang === "id")) {
      setLang(savedLang);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = lang === "en" ? "id" : "en";
    setLang(newLang);
    localStorage.setItem("app-lang", newLang); // Simpan pilihan user
  };

  return (
    <LanguageContext.Provider
      value={{ lang, toggleLanguage, t: dictionary[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
