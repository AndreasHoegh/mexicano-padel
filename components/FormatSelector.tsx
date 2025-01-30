import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";

type FormatSelectorProps = {
  onFormatChange: (format: "mexicano" | "americano") => void;
};

export default function FormatSelector({
  onFormatChange,
}: FormatSelectorProps) {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <RadioGroup
      defaultValue="mexicano"
      className="grid grid-cols-2 gap-4"
      onValueChange={onFormatChange}
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
      ].map(({ value, label, description }) => (
        <div key={value}>
          <RadioGroupItem
            value={value}
            id={`format-${value}`}
            className="peer sr-only"
          />
          <Label
            htmlFor={`format-${value}`}
            className={`text-black flex flex-col items-center justify-between rounded-md border-2 bg-white p-4 ${"peer-data-[state=checked]:border-yellow-600 peer-data-[state=checked]:border-4 [&:has([data-state=checked])]:scale-105 cursor-pointer transition-transform"}`}
          >
            <span className="text-xl font-semibold">{label}</span>
            <span className="text-sm text-muted-foreground">{description}</span>
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}
