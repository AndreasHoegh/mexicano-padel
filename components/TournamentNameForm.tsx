import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "./ui/button";

// Define a type specific to TournamentNameForm
export type TournamentNameFormData = {
  tournamentName: string;
};

interface TournamentNameFormProps {
  onSubmit: SubmitHandler<TournamentNameFormData>;
}

export default function TournamentNameForm({
  onSubmit,
}: TournamentNameFormProps) {
  const { register, handleSubmit } = useForm<TournamentNameFormData>();

  return (
    <div className="flex flex-col items-center">
      <p>Choose tournament name</p>
      <form
        className="flex justify-center gap-2 mt-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <input
          className="border-2 border-slate-500 p-1"
          type="text"
          placeholder="Enter tournament name"
          defaultValue="Mock Tournament"
          onFocus={(e) => e.target.select()}
          autoFocus
          {...register("tournamentName", { required: true })}
        />
        <Button type="submit">Set Name</Button>
      </form>
    </div>
  );
}
