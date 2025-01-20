import PageBackButton from "@/components/ui/pageBackButton";
import type { Metadata } from "next";

export default function TermsOfUse() {
  return (
    <div className="min-h-screen p-8">
      <PageBackButton />
      <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-lg rounded-lg p-8 text-gray-200">
        <h1 className="text-3xl font-bold mb-6">Terms of Use</h1>
        <div className="space-y-4">
          <section>
            <h2 className="text-xl font-semibold mb-2">Acceptance of Terms</h2>
            <p>
              By accessing and using PadelAmericano, you accept and agree to be
              bound by the terms and conditions of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Proprietary Rights</h2>
            <p>
              This software and its content are protected by copyright and other
              intellectual property rights. Unauthorized copying, modification,
              distribution, or use of this software is strictly prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Disclaimer</h2>
            <p>
              This software is provided "as is", without warranty of any kind,
              express or implied. In no event shall the authors be liable for
              any claim, damages, or other liability.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Commercial Use</h2>
            <p>
              This application may include advertisements. Any unauthorized
              commercial use, including but not limited to copying or
              replicating the service, is prohibited without express written
              permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Please
              check this page periodically for changes.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms and conditions for using PadelAmericano tournament management system",
};
