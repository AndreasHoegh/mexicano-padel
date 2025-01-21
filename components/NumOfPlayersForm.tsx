import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";

type NumOfPlayersFormProps = {
  onSubmit: (data: {
    mode: "individual" | "team";
    format: "mexicano" | "americano";
    count: number;
  }) => void;
};

type FormData = {
  "Number of players": string;
};

export default function NumOfPlayersForm({ onSubmit }: NumOfPlayersFormProps) {
  const [mode, setMode] = useState<"individual" | "team">("individual");
  const [format, setFormat] = useState<"mexicano" | "americano">("mexicano");
  const { register, handleSubmit } = useForm<FormData>();
  const { language } = useLanguage();
  const t = translations[language];

  const onFormSubmit = (data: FormData) => {
    const count = parseInt(data["Number of players"]);
    onSubmit({
      mode,
      format,
      count: mode === "team" ? count * 2 : count,
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="space-y-8 text-gray-200 max-w-2xl mx-auto mb-12 px-4"
    >
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-center">
          {t.tournamentFormat}
        </h2>
        <RadioGroup
          defaultValue="mexicano"
          className="grid grid-cols-2 gap-4"
          onValueChange={(value: "mexicano" | "americano") => setFormat(value)}
        >
          {[
            {
              value: "mexicano",
              label: "Mexicano",
              description: t.matchupsByRanks,
            },
            {
              value: "americano",
              label: "Americano",
              description: t.playWithEveryone,
            },
          ].map((option) => (
            <div key={option.value}>
              <RadioGroupItem
                value={option.value}
                id={`format-${option.value}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`format-${option.value}`}
                className="text-black flex flex-col items-center justify-between rounded-md border-2 bg-popover p-4 peer-data-[state=checked]:border-yellow-600 peer-data-[state=checked]:border-4 [&:has([data-state=checked])]:scale-105 cursor-pointer transition-transform"
              >
                <span className="text-xl font-semibold">{option.label}</span>
                <span className="text-sm text-muted-foreground text-center">
                  {option.description}
                </span>
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-center">
            {t.tournamentMode}
          </h2>
          <RadioGroup
            defaultValue="individual"
            className="grid grid-cols-2 gap-4"
            onValueChange={(value: "individual" | "team") => setMode(value)}
          >
            {[
              {
                value: "individual",
                label: t.individual,
                description: t.playersCollectIndividually,
              },
              {
                value: "team",
                label: t.team,
                description: t.pointsForTeams,
              },
            ].map((option) => (
              <div key={option.value}>
                <RadioGroupItem
                  value={option.value}
                  id={`mode-${option.value}`}
                  className="peer sr-only ?"
                />
                <Label
                  htmlFor={`mode-${option.value}`}
                  className="text-black flex flex-col items-center justify-between rounded-md border-2 bg-popover p-4 peer-data-[state=checked]:border-yellow-600 peer-data-[state=checked]:border-4 [&:has([data-state=checked])]:scale-105 cursor-pointer transition-transform"
                >
                  <span className="text-xl font-semibold">{option.label}</span>
                  <span className="text-sm text-muted-foreground text-center">
                    {option.description}
                  </span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-center">
            {mode === "team" ? t.numberOfTeams : t.numberOfPlayers}
          </h2>
          <div className="flex justify-center">
            <input
              defaultValue={8}
              onFocus={(e) => e.target.select()}
              type="number"
              min={mode === "team" ? 2 : 4}
              step={1}
              className="text-black text-center text-xl font-semibold w-20 h-12 rounded-md border-2 focus:border-black focus:outline-none transition-all p-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              {...register("Number of players", { required: true })}
            />
          </div>
          <p className="text-sm text-gray-500 text-center">
            {mode === "team" ? t.minimumTeams : t.minimumPlayers}
          </p>
        </div>
      </div>

      <Button
        className="mx-auto block bg-yellow-600 hover:bg-yellow-600 text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
        type="submit"
      >
        {t.next}
      </Button>
    </form>
  );
}
