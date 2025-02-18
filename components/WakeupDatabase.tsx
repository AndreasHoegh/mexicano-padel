"use client";

import { useEffect } from "react";

export default function WakeupDatabase() {
  useEffect(() => {
    fetch(
      "https://jwtauthdotnet920250211104511.azurewebsites.net/api/health/keepalive"
    ).catch(console.error);
  }, []);

  return null;
}
