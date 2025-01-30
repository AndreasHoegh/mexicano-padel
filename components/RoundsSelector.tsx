import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { translations } from "@/lib/translations";
import { useLanguage } from "@/lib/LanguageContext";
import {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { FormValues } from "./TournamentSettings";

type RoundsSelectorProps = {
  register: UseFormRegister<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  watch: UseFormWatch<FormValues>;
};

export function RoundsSelector({
  register,
  setValue,
  watch,
}: RoundsSelectorProps) {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold text-center text-gray-200">
        {t.numberOfRounds}
      </h2>
      <RadioGroup
        defaultValue="∞"
        className="grid grid-cols-2 sm:grid-cols-3 gap-4"
        onValueChange={(value) => setValue("maxRounds", value)}
      >
        {[5, 7, 10, 15, "∞", "custom"].map((rounds) => (
          <div key={rounds}>
            <RadioGroupItem
              value={rounds.toString()}
              id={`rounds-${rounds}`}
              className="peer sr-only"
              {...register("maxRounds")}
            />
            <Label
              htmlFor={`rounds-${rounds}`}
              className="text-black flex flex-col items-center justify-between rounded-md border-2 bg-white p-4 peer-data-[state=checked]:border-yellow-600 peer-data-[state=checked]:border-4 [&:has([data-state=checked])]:scale-105 cursor-pointer transition-transform"
            >
              <span className="text-xl font-semibold">
                {rounds === "custom" ? "Custom" : rounds}
              </span>
              <span className="text-sm text-muted-foreground">{t.rounds}</span>
            </Label>
          </div>
        ))}
      </RadioGroup>
      <div
        className={`flex justify-center transition-all duration-300 ${
          watch("maxRounds") === "custom" ? "h-12 opacity-100" : "h-0 opacity-0"
        }`}
      >
        <input
          type="number"
          min={1}
          className="text-black text-center text-xl font-semibold w-20 h-12 rounded-md border-2 focus:border-black focus:outline-none transition-all p-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          placeholder="Rounds"
          {...register("customRounds", {
            min: 1,
            valueAsNumber: true,
          })}
        />
      </div>
    </div>
  );
}
