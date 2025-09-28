import App from "@/components/App";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Padel Americano & Mexicano Tournament Generator – Free App",
  description:
    "Create and manage Americano and Mexicano padel tournaments for free. Easy, fast, and online – perfect for clubs and friends.",
};

export default function Home() {
  return (
    <main>
      <App />
    </main>
  );
}
