"use client";

import Script from "next/script";

export default function GoogleAnalytics() {
  return (
    <>
      {/* Google tag (gtag.js) */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-MSBZN2XFXQ"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('consent', 'default', {
            'analytics_storage': 'denied'
          });

          const consent = localStorage.getItem('cookie-consent');
          if (consent === 'true') {
            gtag('consent', 'update', {
              'analytics_storage': 'granted'
            });
          }

          gtag('config', 'G-MSBZN2XFXQ');
        `}
      </Script>
    </>
  );
}
