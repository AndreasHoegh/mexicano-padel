import type {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { translations } from "@/lib/translations";
import { useLanguage } from "@/lib/LanguageContext";
import type { FormValues } from "./TournamentSettings";
import { X } from "lucide-react";
import { Button } from "../ui/button";

type NamesSectionProps = {
  mode: "individual" | "team";
  playerCount: number;
  register: UseFormRegister<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  watch: UseFormWatch<FormValues>;
  onRemovePlayer: (index: number, mode: "individual" | "team") => void;
};

export function NamesSection({
  mode,
  playerCount,
  register,
  setValue,
  watch,
  onRemovePlayer,
}: NamesSectionProps) {
  const { language } = useLanguage();
  const t = translations[language];

  // Watch all player name fields
  const playerNames = [...Array(playerCount)].map(
    (_, i) =>
      watch(`playerName${i}`) ??
      (mode === "team" ? `Team ${Math.floor(i / 2) + 1}` : `Player ${i + 1}`)
  );

  if (mode === "team") {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-center text-gray-200">
          {t.teamNames}
        </h2>
        {[...Array(Math.floor(playerCount / 2))].map((_, index) => (
          <div key={index} className="flex items-center gap-2 w-64 mx-auto">
            <input
              className="text-black text-center text-m rounded-md border-2 bg-white focus:border-black focus:outline-none transition-all w-full"
              type="text"
              value={playerNames[index * 2]}
              onChange={(e) =>
                setValue(`playerName${index * 2}`, e.target.value)
              }
              onFocus={(e) => e.target.select()}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-red-100 text-red-500"
              onClick={() => onRemovePlayer(index, "team")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-center text-gray-200">
        {t.playerNames}
      </h2>
      {[...Array(playerCount)].map((_, index) => (
        <div key={index} className="flex items-center gap-2 w-64 mx-auto">
          <input
            className="text-black text-center text-m rounded-md border-2 bg-white focus:border-black focus:outline-none transition-all w-full"
            type="text"
            value={playerNames[index]}
            onChange={(e) => setValue(`playerName${index}`, e.target.value)}
            onFocus={(e) => e.target.select()}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-red-100 text-red-500"
            onClick={() => onRemovePlayer(index, "individual")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
