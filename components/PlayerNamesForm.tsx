import { useForm, FieldValues } from "react-hook-form";
import { Button } from "./ui/button";
import { TournamentSettings } from "@/lib/types";

interface PlayerNamesFormProps {
  numberOfPlayers: number;
  onSubmit: (settings: TournamentSettings) => void;
}

export default function PlayerNamesForm({
  numberOfPlayers,
  onSubmit,
}: PlayerNamesFormProps) {
  const { register, handleSubmit } = useForm<FieldValues>({
    defaultValues: {
      pointsPerMatch: 21,
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
        className="space-y-6"
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

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-center">
            Points per Match
          </h2>
          <div className="flex justify-center gap-2">
            <select
              {...register("pointsPerMatch", { required: true })}
              className="border-2 border-slate-500 p-1 rounded"
            >
              <option value="11">11</option>
              <option value="15">15</option>
              <option value="21">21</option>
            </select>
          </div>
        </div>

        <Button className="mx-auto block" type="submit">
          Generate Matches
        </Button>
      </form>
    </div>
  );
}
