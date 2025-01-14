import { useForm, FieldValues } from "react-hook-form";
import { Button } from "./ui/button";

interface PlayerNamesFormProps {
  numberOfPlayers: number;
  onSubmit: (playerNames: string[]) => void;
}

export default function PlayerNamesForm({
  numberOfPlayers,
  onSubmit,
}: PlayerNamesFormProps) {
  const { register, handleSubmit } = useForm<FieldValues>();

  const handlePlayerNamesSubmit = (data: FieldValues) => {
    const playerNames = Object.keys(data)
      .filter((key) => key.startsWith("playerName"))
      .map((key) => data[key]);
    onSubmit(playerNames);
  };

  return (
    <div className="flex flex-col items-center mt-4">
      <p>Player names</p>
      <form onSubmit={handleSubmit(handlePlayerNamesSubmit)}>
        {[...Array(numberOfPlayers)].map((_, index) => (
          <div key={index} className="flex justify-center gap-2 mb-4">
            <input
              className="border-2 border-slate-500 p-1"
              type="text"
              defaultValue={`Player${index + 1}`}
              {...register(`playerName${index}`, { required: true })}
              onFocus={(e) => e.target.select()}
            />
          </div>
        ))}
        <Button className="mx-auto block" type="submit">
          Generate Matches
        </Button>
      </form>
    </div>
  );
}
