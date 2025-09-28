"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getTournamentShareUrl } from "@/lib/tournamentStorage";
import type { EditingScores, TournamentState } from "@/lib/types";
import { Share2, Check } from "lucide-react";
import { useMemo, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Label } from "@/components/ui/label";

interface ShareButtonProps {
  tournamentId: string;
  scores: EditingScores;
  round: number;
}

export function ShareButton({ tournamentId, scores, round }: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const { toast } = useToast();

  const buildState = useMemo<TournamentState | null>(() => {
    try {
      const saved = localStorage.getItem(`tournament_${tournamentId}`);
      const parsed = saved ? (JSON.parse(saved) as TournamentState) : null;
      if (parsed) {
        parsed.round = round; // always update to latest round
      }
      return parsed;
    } catch {
      return null;
    }
  }, [tournamentId, round]); // <-- now recalculates when round changes

  const handleShare = async () => {
    setIsSharing(true);

    try {
      let shareUrl;
      if (isReadOnly) {
        shareUrl = getTournamentShareUrl(tournamentId, scores, {
          readOnly: true,
          state: buildState ?? undefined,
        });
      } else {
        shareUrl = getTournamentShareUrl(tournamentId, scores);
      }

      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied!",
        description: isReadOnly
          ? "View-only tournament link has been copied to clipboard."
          : "Editable tournament link has been copied to clipboard.",
        className: "bg-green-50 border-green-200",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast({
        title: "Error",
        description: "Failed to copy tournament link",
        variant: "destructive",
        className: "bg-red-50 border-red-200",
        duration: 3000,
      });
    } finally {
      setTimeout(() => setIsSharing(false), 1200);
    }
  };

  return (
    <>
      <Toaster />
      <div className="flex items-center gap-3">
        <Button
          onClick={handleShare}
          disabled={isSharing}
          className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold inline-flex items-center gap-2"
        >
          {isSharing ? (
            <Check className="w-4 h-4" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
          Share
        </Button>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="readonly-mode"
            checked={isReadOnly}
            onChange={(e) => setIsReadOnly(e.target.checked)}
            className="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500 focus:ring-2"
          />
          <Label htmlFor="readonly-mode" className="text-sm text-gray-600">
            View-only
          </Label>
        </div>
      </div>
    </>
  );
}

export default ShareButton;
