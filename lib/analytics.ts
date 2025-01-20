export const trackEvent = (
  action: string,
  category: string,
  label?: string
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
    });
  }
};

// Add type definition for gtag
declare global {
  interface Window {
    gtag: (
      command: string,
      action: string,
      params: { [key: string]: any }
    ) => void;
  }
}
