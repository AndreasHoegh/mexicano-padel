import { RadioGroupItem } from "@radix-ui/react-radio-group";
import { RadioGroup } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { translations } from "@/lib/translations";
import { useLanguage } from "@/lib/LanguageContext";
import {
  UseFormWatch,
  UseFormSetValue,
  UseFormRegister,
} from "react-hook-form";
import { FormValues } from "./PlayerNamesForm";

type PointSelectionProps = {
  watch: UseFormWatch<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  register: UseFormRegister<FormValues>;
};

export function PointSelection({
  watch,
  setValue,
  register,
}: PointSelectionProps) {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold text-center text-gray-200">
        {watch("pointSystem") === "TimePlay" ? t.minutes : t.points}
      </h2>

      {watch("pointSystem") === "TimePlay" ? (
        <RadioGroup
          value={watch("points")}
          className="grid grid-cols-2 sm:grid-cols-3 gap-4"
          onValueChange={(value) => setValue("points", value)}
        >
          {[5, 10, 15, 20, 25, "custom"].map((minutes) => (
            <div key={minutes}>
              <RadioGroupItem
                value={minutes.toString()}
                id={`points-${minutes}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`points-${minutes}`}
                className="text-black flex flex-col items-center justify-between rounded-md border-2 bg-white p-4 peer-data-[state=checked]:border-yellow-600 peer-data-[state=checked]:border-4 [&:has([data-state=checked])]:scale-105 cursor-pointer transition-transform"
              >
                <span className="text-xl font-semibold">
                  {minutes === "custom" ? "Custom" : minutes}
                </span>
                <span className="text-sm text-muted-foreground">minutes</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      ) : (
        <RadioGroup
          defaultValue="21"
          className="grid grid-cols-2 sm:grid-cols-3 gap-4"
          onValueChange={(value) => setValue("points", value)}
        >
          {[15, 16, 20, 21, 24, "custom"].map((points) => (
            <div key={points}>
              <RadioGroupItem
                value={points.toString()}
                id={`points-${points}`}
                className="peer sr-only"
                {...register("points")}
              />
              <Label
                htmlFor={`points-${points}`}
                className="text-black flex flex-col items-center justify-between rounded-md border-2 bg-white p-4 peer-data-[state=checked]:border-yellow-600 peer-data-[state=checked]:border-4 [&:has([data-state=checked])]:scale-105 cursor-pointer transition-transform"
              >
                <span className="text-xl font-semibold">
                  {points === "custom" ? "Custom" : points}
                </span>
                <span className="text-sm text-muted-foreground">
                  {t.points}
                </span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}

      <div
        className={`flex justify-center transition-all duration-300 ${
          watch("points") === "custom" ? "h-12 opacity-100" : "h-0 opacity-0"
        }`}
      >
        <input
          type="number"
          min={1}
          className="text-black text-center text-xl font-semibold w-20 h-12 rounded-md border-2 focus:border-black focus:outline-none transition-all p-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          placeholder={
            watch("pointSystem") === "TimePlay" ? "Minutes" : "Points"
          }
          {...register("customPoints", {
            min: 1,
            valueAsNumber: true,
          })}
        />
      </div>
    </div>
  );
}
