"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem("cookie-consent");

    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "true");
    setShowConsent(false);
    if (window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "granted",
      });
    }
  };

  const declineCookies = () => {
    localStorage.setItem("cookie-consent", "false");
    setShowConsent(false);
    if (window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "denied",
      });
    }
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 text-white p-4 shadow-lg z-50">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-center sm:text-left">
          <p>
            We use cookies to analyze our traffic and improve your experience.
            You can choose to accept or decline cookies.
          </p>
          <p className="text-xs mt-1 text-gray-300">
            We do not share your data with third parties.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={declineCookies}
            variant="outline"
            className="text-sm bg-gray-800 border-gray-600"
          >
            Decline
          </Button>
          <Button
            onClick={acceptCookies}
            className="text-sm bg-yellow-600 hover:bg-yellow-700"
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
