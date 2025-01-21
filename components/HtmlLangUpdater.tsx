"use client";

import { useEffect } from "react";
import { useLanguage } from "@/lib/LanguageContext";

export default function HtmlLangUpdater() {
  const { language } = useLanguage();

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return null;
}
