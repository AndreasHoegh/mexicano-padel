import { UseFormRegister } from "react-hook-form";
import { FormValues } from "./PlayerNamesForm";
import { translations } from "@/lib/translations";
import { useLanguage } from "@/lib/LanguageContext";

type NamesSectionProps = {
  mode: "individual" | "team";
  playerCount: number;
  register: UseFormRegister<FormValues>;
};

export function NamesSection({
  mode,
  playerCount,
  register,
}: NamesSectionProps) {
  const { language } = useLanguage();
  const t = translations[language];

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
              defaultValue={`Team ${index + 1}`}
              {...register(`playerName${index * 2}`, { required: true })}
              onFocus={(e) => e.target.select()}
            />
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
            defaultValue={`Player ${index + 1}`}
            {...register(`playerName${index}`, { required: true })}
            onFocus={(e) => e.target.select()}
          />
        </div>
      ))}
    </div>
  );
}
