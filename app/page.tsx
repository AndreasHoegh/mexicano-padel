import App from "@/components/App";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Play Americano And Mexicano Padel Tournaments",
  description:
    "Create exciting Americano and Mexicano padel tournaments with our free generator! Organize fair and fun matches for any number of players.",
};

export default function Home() {
  return (
    <main>
      <App />
    </main>
  );
}
