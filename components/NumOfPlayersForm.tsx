import { Button } from "./ui/button";
import { useForm, SubmitHandler } from "react-hook-form";

export type NumOfPlayersFormData = {
  "Number of players": number;
};

interface NumOfPlayersFormProps {
  onSubmit: SubmitHandler<NumOfPlayersFormData>;
}

export default function NumOfPlayersForm({ onSubmit }: NumOfPlayersFormProps) {
  const { register, handleSubmit } = useForm<NumOfPlayersFormData>();

  return (
    <div>
      <h2 className="flex justify-center mt-4">Number of players</h2>
      <form
        className="flex justify-center gap-2 mt-2"
        onSubmit={handleSubmit(onSubmit)}
      >
        <input
          className="border-2 border-slate-500 p-1 w-12"
          type="number"
          placeholder="Number of players"
          defaultValue={8}
          {...register("Number of players", {
            required: true,
            valueAsNumber: true,
            min: 4,
            max: 999,
          })}
          autoFocus
          onFocus={(e) => e.target.select()}
        />

        <Button type="submit">Confirm</Button>
      </form>
      <p className="text-center text-sm text-gray-600 mt-2">
        Minimum 4 players required. Players will rotate sitting out if the total
        is not a multiple of 4.
      </p>
    </div>
  );
}
