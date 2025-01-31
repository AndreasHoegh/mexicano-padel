import App from "@/components/App";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Americano Padel App",
  description:
    "The ultimate americano padel app for organizing and running americano and mexicano padel tournaments. For free.",
};

export default function Home() {
  return (
    <main>
      <App />
    </main>
  );
}
