// padel-americano/app/tournament-history/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { getTournamentHistory } from "@/services/tournamentService";
import type { Tournament } from "@/lib/types";
import TournamentResult from "@/components/TournamentResult";
import { useAuth } from "@/lib/AuthContext";

const TournamentHistoryPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (isAuthenticated && token) {
      getTournamentHistory(token)
        .then((data) => setTournaments(data))
        .catch((err) =>
          console.error("Error fetching tournament history:", err)
        )
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  return (
    <>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-6">
          Tournament History
        </h1>
        <p className="text-center mb-8 text-gray-200">
          You have played{" "}
          <span className="font-semibold">{tournaments.length}</span> tournament
          {tournaments.length === 1 ? "" : "s"}.
        </p>
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : tournaments.length === 0 ? (
          <p className="text-center text-gray-500">No tournaments found.</p>
        ) : (
          <div className="space-y-6">
            {tournaments
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.tournamentDate).getTime() -
                  new Date(a.tournamentDate).getTime()
              )
              .map((tournament) => (
                <TournamentResult key={tournament.id} tournament={tournament} />
              ))}
          </div>
        )}
      </div>
    </>
  );
};

export default TournamentHistoryPage;
