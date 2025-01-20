import App from "@/components/App";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Tournament | PadelAmericano",
  description:
    "Create and manage your padel tournament with our easy-to-use tournament generator",
};

export default function Home() {
  return (
    <main>
      <App />
    </main>
  );
}
