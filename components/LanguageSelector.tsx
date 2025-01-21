"use client";

import { useLanguage } from "@/lib/LanguageContext";
import { Button } from "./ui/button";

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed top-4 right-4 flex gap-2">
      <Button
        variant={language === "en" ? "default" : "outline"}
        onClick={() => setLanguage("en")}
        className="text-sm"
      >
        EN
      </Button>
      <Button
        variant={language === "da" ? "default" : "outline"}
        onClick={() => setLanguage("da")}
        className="text-sm"
      >
        DA
      </Button>
      <Button
        variant={language === "es" ? "default" : "outline"}
        onClick={() => setLanguage("es")}
        className="text-sm"
      >
        ES
      </Button>
    </div>
  );
}
