import { useForm, FieldValues } from "react-hook-form";
import { Button } from "./ui/button";
import { TournamentSettings, Court } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "./ui/input";
import { useState, useRef } from "react";

type PlayerNamesFormProps = {
  initialPlayerCount: number;
  onSubmit: (settings: TournamentSettings) => void;
  mode: "individual" | "team";
  onPlayerCountChange: (newCount: number) => void;
};

type FormValues = {
  [key: string]: string;
  pointsPerMatch: string;
  maxRounds: string;
};

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
      // Calculate the next available ID based on the current courts
      const maxId =
        courts.length > 0 ? Math.max(...courts.map((court) => court.id)) : 0;

      const nextId = maxId + 1;

      setCourts((prev) => [
        ...prev,
        {
          id: nextId,
          name: `Court ${nextId}`,
        },
      ]);
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
    if (playerCount <= 4) {
      return; // Don't allow removal if we're at minimum players
    }

    // Unregister the players for this team in "team" mode
    if (mode === "team") {
      unregister(`playerName${index}`);
      unregister(`playerName${index + 1}`);
    } else {
      unregister(`playerName${index}`);
    }

    // Update the player names to fill gaps
    const step = mode === "team" ? 2 : 1;
    for (let i = index; i < playerCount - step; i += step) {
      const nextValue1 = document.querySelector<HTMLInputElement>(
        `input[name="playerName${i + step}"]`
      )?.value;

      setValue(`playerName${i}`, nextValue1 || `Player${i + 1}`);
      if (mode === "team") {
        const nextValue2 = document.querySelector<HTMLInputElement>(
          `input[name="playerName${i + step + 1}"]`
        )?.value;
        setValue(`playerName${i + 1}`, nextValue2 || `Player${i + 2}`);
      }
    }

    const newCount = playerCount - step;
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

    // Add a court if we have enough players for an additional court
    const newMaxCourts = getMaxCourts(newCount);
    if (courts.length < newMaxCourts) {
      // Calculate the next available ID based on the current courts
      const maxId =
        courts.length > 0 ? Math.max(...courts.map((court) => court.id)) : 0;

      const nextId = maxId + 1;

      setCourts((prev) => [
        ...prev,
        {
          id: nextId,
          name: `Court ${nextId}`,
        },
      ]);
    }
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
        className="space-y-8 w-full max-w-2xl px-4"
      >
        {mode === "team" ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-center text-gray-200">
              Team Names
            </h2>
            {[...Array(playerCount / 2)].map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-center gap-2">
                  <input
                    className="text-black text-center text-lg w-64 h-12 rounded-md border-2 bg-white focus:border-black focus:outline-none transition-all p-2"
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
                    className="h-12 border-2 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-center text-gray-200">
              Player Names
            </h2>
            {[...Array(playerCount)].map((_, index) => (
              <div key={index} className="flex justify-center gap-2">
                <input
                  className="text-black text-center text-m rounded-md border-2 bg-white focus:border-black focus:outline-none transition-all"
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
                  className=" border-2 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                >
                  -
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
            className=" bg-yellow-600 hover:bg-yellow-600 text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Add {mode === "team" ? "Team" : "Player"}
          </Button>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-center text-gray-200">
            Points per Match
          </h2>
          <RadioGroup
            defaultValue="21"
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            onValueChange={(value) => setValue("pointsPerMatch", value)}
          >
            {[15, 21, 24, 32].map((points) => (
              <div key={points}>
                <RadioGroupItem
                  value={points.toString()}
                  id={`points-${points}`}
                  className="peer sr-only"
                  {...register("pointsPerMatch")}
                />
                <Label
                  htmlFor={`points-${points}`}
                  className="text-black flex flex-col items-center justify-between rounded-md border-2 bg-white p-4 peer-data-[state=checked]:border-black peer-data-[state=checked]:border-4 [&:has([data-state=checked])]:scale-105 cursor-pointer transition-transform"
                >
                  <span className="text-xl font-semibold">{points}</span>
                  <span className="text-sm text-muted-foreground">points</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-center text-gray-200">
            Number of Rounds
          </h2>
          <RadioGroup
            defaultValue="5"
            className="grid grid-cols-2 sm:grid-cols-3 gap-4"
            onValueChange={(value) => setValue("maxRounds", value)}
          >
            {[3, 5, 7, 10, 15, "∞"].map((rounds) => (
              <div key={rounds}>
                <RadioGroupItem
                  value={rounds.toString()}
                  id={`rounds-${rounds}`}
                  className="peer sr-only"
                  {...register("maxRounds")}
                />
                <Label
                  htmlFor={`rounds-${rounds}`}
                  className="text-black flex flex-col items-center justify-between rounded-md border-2 bg-white p-4 peer-data-[state=checked]:border-black peer-data-[state=checked]:border-4 [&:has([data-state=checked])]:scale-105 cursor-pointer transition-transform"
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
            <h2 className="text-2xl font-semibold text-center text-gray-200">
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
          <h2 className="text-2xl font-semibold text-center text-gray-200">
            Courts
          </h2>
          <div className=" space-y-2 w-64 mx-auto flex flex-col items-center">
            {courts.map((court) => (
              <div className="flex justify-center gap-2" key={court.id}>
                <Input
                  value={court.name}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => updateCourtName(court.id, e.target.value)}
                  className="flex-1  text-black text-center text-m border-2 bg-white focus:border-black focus:outline-none transition-all"
                  placeholder="Court name"
                />
                {courts.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    className=" border-2 text-m hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
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
              className=" border-2 bg-yellow-600 hover:bg-yellow-600 text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
              disabled={courts.length >= getMaxCourts(playerCount)}
            >
              Add Court
            </Button>
          </div>
        </div>

        <Button
          className="mx-auto block w-full border-2 h-12 text-l bg-yellow-600 hover:bg-yellow-700 text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
          type="submit"
        >
          Generate Matches
        </Button>
      </form>
    </div>
  );
}
