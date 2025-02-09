"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getTournamentShareUrl } from "@/lib/tournamentStorage";
import type { EditingScores } from "@/lib/types";
import { Share2, Check } from "lucide-react";
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";

interface ShareButtonProps {
  tournamentId: string;
  scores: EditingScores;
}

export function ShareButton({ tournamentId, scores }: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    setIsSharing(true);
    const shareUrl = getTournamentShareUrl(tournamentId, scores);

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied!",
        description: "Tournament link has been copied to clipboard.",
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
      setTimeout(() => {
        setIsSharing(false);
      }, 3000);
    }
  };

  return (
    <>
      <Toaster />
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
    </>
  );
}

export default ShareButton;
