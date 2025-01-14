import { useForm, FieldValues } from "react-hook-form";
import { Button } from "./ui/button";
import { TournamentSettings } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface PlayerNamesFormProps {
  numberOfPlayers: number;
  onSubmit: (settings: TournamentSettings) => void;
}

export default function PlayerNamesForm({
  numberOfPlayers,
  onSubmit,
}: PlayerNamesFormProps) {
  const { register, handleSubmit, setValue } = useForm<FieldValues>({
    defaultValues: {
      pointsPerMatch: "21",
    },
  });

  const handlePlayerNamesSubmit = (data: FieldValues) => {
    const playerNames = Object.keys(data)
      .filter((key) => key.startsWith("playerName"))
      .map((key) => data[key]);

    onSubmit({
      playerNames,
      pointsPerMatch: parseInt(data.pointsPerMatch),
    });
  };

  return (
    <div className="flex flex-col items-center mt-4">
      <form
        onSubmit={handleSubmit(handlePlayerNamesSubmit)}
        className="space-y-8"
      >
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-center">Player Names</h2>
          {[...Array(numberOfPlayers)].map((_, index) => (
            <div key={index} className="flex justify-center gap-2">
              <input
                className="border-2 border-slate-500 p-1 rounded"
                type="text"
                defaultValue={`Player${index + 1}`}
                {...register(`playerName${index}`, { required: true })}
                onFocus={(e) => e.target.select()}
              />
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-center">
            Points per Match
          </h2>
          <RadioGroup
            defaultValue="21"
            className="grid grid-cols-2 sm:grid-cols-3 gap-4"
            onValueChange={(value) => setValue("pointsPerMatch", value)}
          >
            {[11, 15, 21, 24, 32].map((points) => (
              <div key={points}>
                <RadioGroupItem
                  value={points.toString()}
                  id={`points-${points}`}
                  className="peer sr-only"
                  {...register("pointsPerMatch")}
                />
                <Label
                  htmlFor={`points-${points}`}
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <span className="text-xl font-semibold">{points}</span>
                  <span className="text-sm text-muted-foreground">points</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Button className="mx-auto block" type="submit">
          Generate Matches
        </Button>
      </form>
    </div>
  );
}
