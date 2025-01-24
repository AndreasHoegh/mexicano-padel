import { useForm } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";

type NumOfPlayersFormProps = {
  onSubmit: (data: {
    mode: "individual" | "team";
    format: "mexicano" | "americano" | "groups";
    count: number;
  }) => void;
};

type FormData = {
  "Number of players": string;
};

export default function NumOfPlayersForm({ onSubmit }: NumOfPlayersFormProps) {
  const [mode, setMode] = useState<"individual" | "team">("individual");
  const [format, setFormat] = useState<"mexicano" | "americano" | "groups">(
    "mexicano"
  );
  const { register, setValue, watch } = useForm<FormData>({
    defaultValues: {
      "Number of players": "8",
    },
  });
  const { language } = useLanguage();
  const t = translations[language];
  const playerCount = watch("Number of players");

  // Effect to handle format changes
  useEffect(() => {
    if (format === "groups") {
      setMode("team");
    }
  }, [format]);

  // Effect to handle mode changes
  useEffect(() => {
    // Reset player count when mode changes
    setValue("Number of players", "8");
  }, [mode, setValue]);

  // Effect to automatically submit form when values change
  useEffect(() => {
    const count = parseInt(playerCount);
    onSubmit({
      mode,
      format,
      count: mode === "team" ? count * 2 : count,
    });
  }, [mode, format, playerCount, onSubmit]);

  return (
    <div className="space-y-8 text-gray-200 max-w-2xl mx-auto px-4">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-center">
          {t.tournamentFormat}
        </h2>
        <RadioGroup
          defaultValue="mexicano"
          className="grid grid-cols-2 gap-4"
          onValueChange={(value: "mexicano" | "americano" | "groups") => {
            setFormat(value);
          }}
        >
          {[
            {
              value: "mexicano",
              label: "Mexicano",
              description: t.matchupsByRanks,
              disabled: false,
            },
            {
              value: "americano",
              label: "Americano",
              description: t.playWithEveryone,
              disabled: false,
            },
            {
              value: "groups",
              label: "Groups & Knockout",
              description: "Groups & Knockout",
              disabled: true,
            },
          ].map(({ value, label, description, disabled }) => (
            <div key={value}>
              <RadioGroupItem
                value={value}
                id={`format-${value}`}
                className="peer sr-only"
                disabled={disabled}
              />
              <Label
                htmlFor={`format-${value}`}
                className={`text-black flex flex-col items-center justify-between rounded-md border-2 bg-white p-4 ${
                  disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "peer-data-[state=checked]:border-yellow-600 peer-data-[state=checked]:border-4 [&:has([data-state=checked])]:scale-105 cursor-pointer transition-transform"
                }`}
              >
                <span className="text-xl font-semibold">{label}</span>
                <span className="text-sm text-muted-foreground">
                  {description}
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
            value={mode}
            className="grid grid-cols-2 gap-4"
            onValueChange={(value: "individual" | "team") => setMode(value)}
          >
            {[
              {
                value: "individual",
                label: t.individual,
                description: t.playersCollectIndividually,
                disabled: format === "groups",
              },
              {
                value: "team",
                label: t.team,
                description: t.pointsForTeams,
                disabled: false,
              },
            ].map((option) => (
              <div
                key={option.value}
                className={`${option.disabled ? "opacity-50" : ""}`}
              >
                <RadioGroupItem
                  value={option.value}
                  id={`mode-${option.value}`}
                  className="peer sr-only"
                  disabled={option.disabled}
                />
                <Label
                  htmlFor={`mode-${option.value}`}
                  className={`text-black flex flex-col items-center justify-between rounded-md border-2 bg-popover p-4 peer-data-[state=checked]:border-yellow-600 peer-data-[state=checked]:border-4 [&:has([data-state=checked])]:scale-105 cursor-pointer transition-transform ${
                    option.disabled ? "cursor-not-allowed" : ""
                  }`}
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
              onFocus={(e) => {
                e.target.select();
              }}
              type="number"
              min={mode === "team" ? 2 : 4}
              step={1}
              className="text-black text-center text-xl font-semibold w-20 h-12 rounded-md border-2 focus:border-black focus:outline-none transition-all p-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              {...register("Number of players", {
                required: true,
                valueAsNumber: true,
                validate: (value) =>
                  (parseInt(value) > 0 && Number.isInteger(value)) ||
                  "Must be a positive integer",
              })}
              onChange={(e) => {
                const value = e.target.value;
                const numericValue = parseInt(value, 10);

                // Ensure the value is a valid number and meets constraints
                if (
                  !isNaN(numericValue) &&
                  numericValue >= (mode === "team" ? 2 : 4)
                ) {
                  setValue("Number of players", numericValue.toString());
                }
              }}
            />
          </div>
          <p className="text-sm text-gray-500 text-center">
            {mode === "team" ? t.minimumTeams : t.minimumPlayers}
          </p>
        </div>
      </div>
    </div>
  );
}
