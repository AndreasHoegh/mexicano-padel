import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
} from "react-hook-form";
import { FormValues } from "./TournamentSettings";
import { translations } from "@/lib/translations";
import { useLanguage } from "@/lib/LanguageContext";

type PointSystemSectionProps = {
  register: UseFormRegister<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  watch: UseFormWatch<FormValues>;
};

export function PointSystemSection({
  register,
  setValue,
  watch,
}: PointSystemSectionProps) {
  const pointSystem = watch("pointSystem");
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold text-center text-gray-200">
        {t.pointSystem}
      </h2>
      <RadioGroup
        defaultValue="pointsToPlay"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        onValueChange={(value) =>
          setValue("pointSystem", value as FormValues["pointSystem"])
        }
      >
        {[
          {
            value: "pointsToPlay",
            label: t.pointsToPlay,
            description: t.pointsToPlayDescription,
          },
          {
            value: "pointsToWin",
            label: t.pointsToWin,
            description: t.pointsToWinDescription,
          },
          {
            value: "TimePlay",
            label: t.timePlay,
            description: t.timePlayDescription,
          },
        ].map((option) => (
          <div key={option.value}>
            <RadioGroupItem
              value={option.value}
              id={option.value}
              className="peer sr-only"
              {...register("pointSystem")}
            />
            <Label
              htmlFor={option.value}
              className="text-black flex flex-col items-center justify-between rounded-md border-2 bg-white p-4 peer-data-[state=checked]:border-yellow-600 peer-data-[state=checked]:border-4 [&:has([data-state=checked])]:scale-105 cursor-pointer transition-transform"
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
  );
}
