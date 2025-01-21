"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Language } from "./translations";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Start with "en" as default for server-side rendering
  const [language, setLanguage] = useState<Language>("en");

  // Update language on client-side after mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem(
      "preferred-language"
    ) as Language;
    if (savedLanguage) {
      setLanguage(savedLanguage);
      return;
    }

    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith("da")) setLanguage("da");
    if (browserLang.startsWith("es")) setLanguage("es");
  }, []);

  const setLanguageWithPersist = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem("preferred-language", newLanguage);
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: setLanguageWithPersist }}
    >
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
