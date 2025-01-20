import PageBackButton from "@/components/ui/pageBackButton";
import type { Metadata } from "next";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen p-8">
      <PageBackButton />
      <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-lg rounded-lg p-8 text-gray-200">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <div className="space-y-4">
          <section>
            <h2 className="text-xl font-semibold mb-2">Data Collection</h2>
            <p>
              We only store tournament data locally in your browser&apos;s
              storage. No personal information is collected or transmitted to
              any servers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Local Storage</h2>
            <p>
              Tournament data is saved in your browser&apos;s local storage to
              allow you to continue tournaments later. This data never leaves
              your device.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Cookies</h2>
            <p>
              This application does not use cookies or any other tracking
              mechanisms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Contact</h2>
            <p>
              For any questions about this privacy policy, please contact us at{" "}
              <a
                href="mailto:Ahoegh2602@gmail.com"
                className="text-yellow-400 hover:underline"
              >
                Ahoegh2602@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy and data handling practices for PadelAmericano",
};
