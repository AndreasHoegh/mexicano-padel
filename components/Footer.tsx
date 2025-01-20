import { Github } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="bg-transparent py-2 sm:py-4 mt-auto px-2 sm:px-4 bg-gradient-to-br from-yellow-600/10 to-yellow-500/10 backdrop-blur-sm border-t border-yellow-600/20">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2 sm:gap-4 text-gray-300 text-xs sm:text-sm">
          <div className="text-center md:text-left space-y-2">
            <p>© {currentYear} PadelAmericano. All rights reserved.</p>
            <p className="text-yellow-500/80 text-xs sm:text-sm">
              Created with ♥️ for the padel community
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href="/privacy"
              className="hover:text-yellow-500 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="hover:text-yellow-500 transition-colors"
            >
              Terms of Use
            </a>
          </div>
        </div>
      </footer>
      <div className="fixed bottom-1 right-2 text-[7px] text-gray-400/60">
        <a
          href="https://www.flaticon.com/free-icons/padel"
          title="padel icons"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-yellow-500/60 transition-colors"
        >
          Icons by Freepik - Flaticon
        </a>
      </div>
    </>
  );
}
