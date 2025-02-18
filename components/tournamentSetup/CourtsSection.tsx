import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Court } from "@/lib/types";
import { translations } from "@/lib/translations";
import { useLanguage } from "@/lib/LanguageContext";
import { X } from "lucide-react";

type CourtsSectionProps = {
  courts: Court[];
  playerCount: number;
  updateCourtName: (id: number, name: string) => void;
  removeCourt: (id: number) => void;
  addCourt: () => void;
};

export function CourtsSection({
  courts,
  playerCount,
  updateCourtName,
  removeCourt,
  addCourt,
}: CourtsSectionProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const getMaxCourts = (count: number) => Math.floor(count / 4);

  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold text-center text-gray-200">
        {t.courts}
      </h2>
      <div className="space-y-2 w-64 mx-auto flex flex-col items-center">
        {courts.map((court) => (
          <div className="flex items-center gap-2 w-64" key={court.id}>
            <Input
              value={court.name}
              onFocus={(e) => e.target.select()}
              onChange={(e) => updateCourtName(court.id, e.target.value)}
              className="flex-1 text-black text-center text-m border-2 bg-white focus:border-black focus:outline-none transition-all"
              placeholder="Court name"
            />
            {courts.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-red-100 text-red-500"
                onClick={() => removeCourt(court.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={addCourt}
          className="border-2 bg-yellow-600 hover:bg-yellow-600 text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
          disabled={courts.length >= getMaxCourts(playerCount)}
        >
          {t.addCourt}
        </Button>
        <p
          className={`text-sm text-gray-400 ${
            courts.length >= getMaxCourts(playerCount) ? "block" : "hidden"
          }`}
        >
          {t.addMorePlayersForCourts}
        </p>
      </div>
    </div>
  );
}
