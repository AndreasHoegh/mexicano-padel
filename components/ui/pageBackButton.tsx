import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function PageBackButton() {
  return (
    <Link
      href="/"
      className="fixed top-4 left-4 flex items-center gap-1 text-gray-300 hover:text-white transition-colors"
    >
      <ChevronLeft className="h-5 w-5" />
      Back to Tournament
    </Link>
  );
}
