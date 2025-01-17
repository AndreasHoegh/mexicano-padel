import { useForm, FieldValues } from "react-hook-form";
import { Button } from "./ui/button";
import { TournamentSettings, Court } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "./ui/input";
import { useState, useRef } from "react";

interface PlayerNamesFormProps {
  initialPlayerCount: number;
  onSubmit: (settings: TournamentSettings) => void;
  mode: "individual" | "team";
  onPlayerCountChange: (newCount: number) => void;
}

interface FormValues {
  [key: string]: string;
  pointsPerMatch: string;
  maxRounds: string;
}

const getMaxCourts = (playerCount: number) => {
  return Math.floor(playerCount / 4);
};

export default function PlayerNamesForm({
  initialPlayerCount,
  onSubmit,
  mode,
  onPlayerCountChange,
}: PlayerNamesFormProps) {
  const [playerCount, setPlayerCount] = useState(initialPlayerCount);
  const { register, handleSubmit, setValue, unregister } = useForm<FormValues>({
    defaultValues: {
      pointsPerMatch: "21",
      maxRounds: "5",
    },
  });

  const nextIdRef = useRef(2);
  const maxCourts = getMaxCourts(playerCount);

  const [courts, setCourts] = useState<Court[]>(() => {
    const initialCourts = [];
    for (let i = 1; i <= maxCourts; i++) {
      initialCourts.push({
        id: i,
        name: `Court ${i}`,
      });
    }
    nextIdRef.current = maxCourts + 1;
    return initialCourts;
  });

  const [finalRoundPattern, setFinalRoundPattern] = useState<number[]>([
    0, 2, 1, 3,
  ]);

  const addCourt = () => {
    if (courts.length < getMaxCourts(playerCount)) {
      setCourts((prev) => [
        ...prev,
        {
          id: nextIdRef.current,
          name: `Court ${nextIdRef.current}`,
        },
      ]);
      nextIdRef.current += 1;
    }
  };

  const removeCourt = (id: number) => {
    if (courts.length > 1) {
      setCourts((prev) => prev.filter((court) => court.id !== id));
    }
  };

  const updateCourtName = (id: number, name: string) => {
    setCourts((prev) =>
      prev.map((court) => (court.id === id ? { ...court, name } : court))
    );
  };

  const removePlayer = (index: number) => {
    if ((mode === "team" && playerCount <= 4) || (!mode && playerCount <= 4)) {
      return; // Don't allow removal if we're at minimum players
    }

    // Unregister the field from react-hook-form
    unregister(`playerName${index}`);

    // Shift all player names up
    for (let i = index; i < playerCount - 1; i++) {
      const nextValue = document.querySelector<HTMLInputElement>(
        `input[name="playerName${i + 1}"]`
      )?.value;
      setValue(`playerName${i}`, nextValue || `Player${i + 1}`);
    }

    // Update player count
    const newCount = playerCount - (mode === "team" ? 2 : 1);
    setPlayerCount(newCount);
    onPlayerCountChange(newCount);

    // Adjust courts if necessary
    if (courts.length > getMaxCourts(newCount)) {
      setCourts((prev) => prev.slice(0, getMaxCourts(newCount)));
    }
  };

  const addPlayer = () => {
    const newCount = playerCount + (mode === "team" ? 2 : 1);
    setPlayerCount(newCount);
    onPlayerCountChange(newCount);
  };

  const handlePlayerNamesSubmit = (data: FieldValues) => {
    const playerNames = Object.keys(data)
      .filter((key) => key.startsWith("playerName"))
      .map((key) => data[key]);

    onSubmit({
      playerNames,
      pointsPerMatch: parseInt(data.pointsPerMatch),
      maxRounds: data.maxRounds === "∞" ? null : parseInt(data.maxRounds),
      courts,
      mode,
      finalRoundPattern,
    });
  };

  return (
    <div className="flex flex-col items-center mt-4">
      <form
        onSubmit={handleSubmit(handlePlayerNamesSubmit)}
        className="space-y-8"
      >
        {mode === "team" ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-center">Team Names</h2>
            {[...Array(playerCount / 2)].map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-center gap-2">
                  <input
                    className="border-2 border-slate-500 p-1 rounded"
                    type="text"
                    defaultValue={`Team ${index + 1}`}
                    {...register(`playerName${index * 2}`, { required: true })}
                    onFocus={(e) => e.target.select()}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removePlayer(index * 2)}
                    disabled={playerCount <= 4}
                    className="text-red-500"
                  >
                    Remove
                  </Button>
                </div>
                <div className="text-sm text-gray-500 text-center">
                  Players {index * 2 + 1} & {index * 2 + 2}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-center">Player Names</h2>
            {[...Array(playerCount)].map((_, index) => (
              <div key={index} className="flex justify-center gap-2">
                <input
                  className="border-2 border-slate-500 p-1 rounded"
                  type="text"
                  defaultValue={`Player${index + 1}`}
                  {...register(`playerName${index}`, { required: true })}
                  onFocus={(e) => e.target.select()}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removePlayer(index)}
                  disabled={playerCount <= 4}
                  className="text-red-500"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={addPlayer}
            className="w-48"
          >
            Add {mode === "team" ? "Team" : "Player"}
          </Button>
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

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-center">
            Number of Rounds
          </h2>
          <RadioGroup
            defaultValue="5"
            className="grid grid-cols-2 sm:grid-cols-3 gap-4"
            onValueChange={(value) => setValue("maxRounds", value)}
          >
            {[3, 5, 7, 10, "∞"].map((rounds) => (
              <div key={rounds}>
                <RadioGroupItem
                  value={rounds.toString()}
                  id={`rounds-${rounds}`}
                  className="peer sr-only"
                  {...register("maxRounds")}
                />
                <Label
                  htmlFor={`rounds-${rounds}`}
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <span className="text-xl font-semibold">{rounds}</span>
                  <span className="text-sm text-muted-foreground">rounds</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {mode === "individual" && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-center">
              Final Round Pairing
            </h2>
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setFinalRoundPattern([0, 1, 2, 3]);
                }}
                variant={
                  finalRoundPattern.toString() === [0, 1, 2, 3].toString()
                    ? "default"
                    : "outline"
                }
                className="text-sm"
              >
                1&2 vs 3&4
              </Button>
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setFinalRoundPattern([0, 2, 1, 3]);
                }}
                variant={
                  finalRoundPattern.toString() === [0, 2, 1, 3].toString()
                    ? "default"
                    : "outline"
                }
                className="text-sm"
              >
                1&3 vs 2&4
              </Button>
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setFinalRoundPattern([0, 3, 1, 2]);
                }}
                variant={
                  finalRoundPattern.toString() === [0, 3, 1, 2].toString()
                    ? "default"
                    : "outline"
                }
                className="text-sm"
              >
                1&4 vs 2&3
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-center">Courts</h2>
          <div className="space-y-2">
            {courts.map((court) => (
              <div key={court.id} className="flex items-center gap-2">
                <Input
                  value={court.name}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => updateCourtName(court.id, e.target.value)}
                  className="flex-1"
                  placeholder="Court name"
                />
                {courts.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="text-red-500"
                    onClick={() => removeCourt(court.id)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addCourt}
              className="w-full"
              disabled={courts.length >= getMaxCourts(playerCount)}
            >
              Add Court{" "}
              {courts.length < getMaxCourts(playerCount) &&
                `(${courts.length}/${getMaxCourts(playerCount)})`}
            </Button>
          </div>
        </div>

        <Button className="mx-auto block" type="submit">
          Generate Matches
        </Button>
      </form>
    </div>
  );
}
