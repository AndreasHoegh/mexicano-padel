import { useForm, FieldValues } from "react-hook-form";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { TournamentSettings as Settings, Court } from "@/lib/types";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";
import { NamesSection } from "./NamesSection";
import { PointSystemSection } from "./PointSystemSection";
import { CourtsSection } from "./CourtsSection";
import { PointSelection } from "./PointSelection";
import { RoundsSelector } from "./RoundsSelector";
import { FinalRoundPairingSelector } from "./FinalRoundPairingSelector";
import FormatSelector from "./FormatSelector";

type TournamentSettingsProps = {
  onSubmit: (settings: Settings) => void;
};

export type FormValues = {
  [key: string]: string;
  pointSystem: "pointsToPlay" | "pointsToWin" | "TimePlay" | "Match";
  points: string;
  maxRounds: string;
  teamsPerGroup: string;
  teamsAdvancing: string;
  "Number of players": string;
};

const getMaxCourts = (playerCount: number) => {
  return Math.floor(playerCount / 4);
};

export default function TournamentSettings({
  onSubmit,
}: TournamentSettingsProps) {
  const [mode, setMode] = useState<"individual" | "team">("individual");
  const [format, setFormat] = useState<"mexicano" | "americano">("mexicano");
  const [playerCount, setPlayerCount] = useState(8);
  const { register, handleSubmit, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      pointSystem: "pointsToPlay",
      points: "21",
      maxRounds: "∞",
      timePlay: "10",
      teamsPerGroup: "4",
      teamsAdvancing: "2",
      "Number of players": "8",
    },
  });

  const { language } = useLanguage();
  const t = translations[language];
  const pointSystem = watch("pointSystem");
  const currentPlayerCount = watch("Number of players");

  useEffect(() => {
    const count = parseInt(currentPlayerCount);
    const actualCount = mode === "team" ? count * 2 : count;
    setPlayerCount(actualCount);

    // Set default names when player count changes
    const nameCount = mode === "team" ? actualCount / 2 : actualCount;
    for (let i = 0; i < nameCount; i++) {
      setValue(
        `playerName${mode === "team" ? i * 2 : i}`,
        mode === "team" ? `Team ${i + 1}` : `Player ${i + 1}`
      );
    }
  }, [currentPlayerCount, mode, setValue]);

  useEffect(() => {
    if (pointSystem === "TimePlay") {
      setValue("points", "10");
    } else if (pointSystem === "Match") {
      setValue("points", "3");
    } else {
      setValue("points", "21");
    }
  }, [pointSystem, setValue]);

  const [courts, setCourts] = useState<Court[]>(() => {
    const numCourts = Math.floor(playerCount / 4);
    return Array.from({ length: numCourts }, (_, i) => ({
      id: i + 1,
      name: `Court ${i + 1}`,
    }));
  });

  const [finalRoundPattern, setFinalRoundPattern] = useState<number[]>([
    0, 2, 1, 3,
  ]);

  useEffect(() => {
    const numCourts = Math.floor(playerCount / 4);
    setCourts((prevCourts) => {
      const newCourts = [];
      for (let i = 1; i <= numCourts; i++) {
        const existingCourt = prevCourts.find((c) => c.id === i);
        newCourts.push({
          id: i,
          name: existingCourt ? existingCourt.name : `Court ${i}`,
        });
      }
      return newCourts;
    });
  }, [playerCount]);

  const addCourt = () => {
    if (courts.length < getMaxCourts(playerCount)) {
      const maxId =
        courts.length > 0 ? Math.max(...courts.map((court) => court.id)) : 0;
      setCourts((prev) => [
        ...prev,
        { id: maxId + 1, name: `Court ${maxId + 1}` },
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

  const handleFormSubmit = (data: FieldValues) => {
    let playerNames: string[] = [];

    if (mode === "team") {
      const teamCount = playerCount / 2;
      for (let i = 0; i < teamCount; i++) {
        playerNames.push(data[`playerName${i * 2}`]);
      }
    } else {
      playerNames = Object.keys(data)
        .filter((key) => key.startsWith("playerName"))
        .map((key) => data[key])
        .slice(0, playerCount);
    }

    const points =
      data.points === "custom"
        ? parseInt(data.customPoints)
        : parseInt(data.points);

    const maxRounds =
      data.maxRounds === "∞"
        ? 1000
        : data.maxRounds === "custom"
        ? parseInt(data.customRounds)
        : parseInt(data.maxRounds);

    onSubmit({
      playerNames,
      points,
      pointSystem: data.pointSystem,
      maxRounds,
      courts,
      mode,
      finalRoundPattern,
      format,
    });
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-center text-gray-200">
            {t.tournamentFormat}
          </h2>

          <FormatSelector onFormatChange={setFormat} />

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-center text-gray-200">
              {t.tournamentMode}
            </h2>
            <RadioGroup
              value={mode}
              className="grid grid-cols-2 gap-4"
              onValueChange={(value: "individual" | "team") => setMode(value)}
            >
              {[
                {
                  value: "individual",
                  label: t.individual,
                  description: t.playersCollectIndividually,
                },
                {
                  value: "team",
                  label: t.team,
                  description: t.pointsForTeams,
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
                    className="text-black flex flex-col items-center justify-between rounded-md border-2 bg-popover p-4 peer-data-[state=checked]:border-yellow-600 peer-data-[state=checked]:border-4 [&:has([data-state=checked])]:scale-105 cursor-pointer transition-transform"
                  >
                    <span className="text-xl font-semibold">
                      {option.label}
                    </span>
                    <span className="text-sm text-muted-foreground text-center">
                      {option.description}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-center text-gray-200">
              {mode === "team" ? t.numberOfTeams : t.numberOfPlayers}
            </h2>
            <div className="flex justify-center">
              <input
                defaultValue={8}
                onFocus={(e) => e.target.select()}
                type="number"
                min={mode === "team" ? 2 : 4}
                step={1}
                className="text-black text-center text-xl font-semibold w-20 h-12 rounded-md border-2 focus:border-black focus:outline-none transition-all p-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                {...register("Number of players", {
                  required: true,
                  valueAsNumber: true,
                  validate: (value) =>
                    (parseInt(value) > 0 && Number.isInteger(value)) ||
                    "Must be a positive integer",
                })}
                onChange={(e) => {
                  const value = e.target.value;
                  const numericValue = parseInt(value, 10);
                  if (
                    !isNaN(numericValue) &&
                    numericValue >= (mode === "team" ? 2 : 4)
                  ) {
                    setValue("Number of players", numericValue.toString());
                  }
                }}
              />
            </div>
            <p className="text-sm text-gray-500 text-center">
              {mode === "team" ? t.minimumTeams : t.minimumPlayers}
            </p>
          </div>
        </div>

        <NamesSection
          mode={mode}
          playerCount={playerCount}
          register={register}
        />

        <PointSystemSection
          register={register}
          setValue={setValue}
          watch={watch}
        />

        <PointSelection register={register} setValue={setValue} watch={watch} />

        <RoundsSelector register={register} setValue={setValue} watch={watch} />

        {mode === "individual" && (
          <FinalRoundPairingSelector
            finalRoundPattern={finalRoundPattern}
            setFinalRoundPattern={setFinalRoundPattern}
          />
        )}

        <CourtsSection
          courts={courts}
          playerCount={playerCount}
          updateCourtName={updateCourtName}
          removeCourt={removeCourt}
          addCourt={addCourt}
        />

        <Button
          className="mx-auto block w-full border-2 h-12 text-l bg-yellow-600 hover:bg-yellow-700 text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
          type="submit"
        >
          {t.generateMatches}
        </Button>
      </form>
    </div>
  );
}
