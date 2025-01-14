import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { useState } from "react";

interface NumOfPlayersFormProps {
  onSubmit: (data: { mode: "individual" | "team"; count: number }) => void;
}

interface FormData {
  "Number of players": string;
}

export default function NumOfPlayersForm({ onSubmit }: NumOfPlayersFormProps) {
  const [mode, setMode] = useState<"individual" | "team">("individual");
  const { register, handleSubmit } = useForm<FormData>();

  const onFormSubmit = (data: FormData) => {
    const count = parseInt(data["Number of players"]);
    onSubmit({
      mode,
      count: mode === "team" ? count * 2 : count,
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-center">Tournament Mode</h2>
        <RadioGroup
          defaultValue="individual"
          className="grid grid-cols-2 gap-4"
          onValueChange={(value: "individual" | "team") => setMode(value)}
        >
          {[
            {
              value: "individual",
              label: "Individual",
              description: "Players collect points individually",
            },
            {
              value: "team",
              label: "Team",
              description: "Points are collected for teams",
            },
          ].map((option) => (
            <div key={option.value}>
              <RadioGroupItem
                value={option.value}
                id={`mode-${option.value}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`mode-${option.value}`}
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
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
          Number of {mode === "team" ? "Teams" : "Players"}
        </h2>
        <div className="flex justify-center">
          <input
            type="number"
            min={mode === "team" ? 2 : 4}
            step={1}
            className="border-2 border-slate-500 p-1 rounded"
            {...register("Number of players", { required: true })}
          />
        </div>
        <p className="text-sm text-gray-500 text-center">
          {mode === "team"
            ? "Minimum 2 teams (4 players)"
            : "Minimum 4 players"}
        </p>
      </div>

      <Button className="mx-auto block" type="submit">
        Next
      </Button>
    </form>
  );
}
