"use client";

import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";
import type { Court, TournamentSettings as Settings } from "@/lib/types";
import { useEffect, useState } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import { CourtsSection } from "../tournamentSetup/CourtsSection";
import { FinalRoundPairingSelector } from "../tournamentSetup/FinalRoundPairingSelector";
import FormatSelector from "../tournamentSetup/FormatSelector";
import { NamesSection } from "../tournamentSetup/NamesSection";
import { PointSelection } from "../tournamentSetup/PointSelection";
import { PointSystemSection } from "../tournamentSetup/PointSystemSection";
import { RoundsSelector } from "../tournamentSetup/RoundsSelector";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

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
  const { register, handleSubmit, setValue, watch, getValues } =
    useForm<FormValues>({
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
    const count = Number.parseInt(currentPlayerCount);
    const actualCount = mode === "team" ? count * 2 : count;
    setPlayerCount(actualCount);

    const nameCount = mode === "team" ? actualCount / 2 : actualCount;
    for (let i = 0; i < nameCount; i++) {
      const fieldName = `playerName${mode === "team" ? i * 2 : i}`;
      const currentValue = getValues(fieldName);
      if (mode === "individual") {
        // In individual mode, force default if current value is empty or still a team default
        if (
          !currentValue ||
          (typeof currentValue === "string" && currentValue.startsWith("Team "))
        ) {
          setValue(fieldName, `Player ${i + 1}`);
        }
      } else {
        // In team mode, force default if current value is empty or still an individual default
        if (
          !currentValue ||
          (typeof currentValue === "string" &&
            currentValue.startsWith("Player "))
        ) {
          setValue(fieldName, `Team ${i + 1}`);
        }
      }
    }
  }, [currentPlayerCount, mode, setValue, getValues]);

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
        ? Number.parseInt(data.customPoints)
        : Number.parseInt(data.points);

    const maxRounds =
      data.maxRounds === "∞"
        ? 1000
        : data.maxRounds === "custom"
        ? Number.parseInt(data.customRounds)
        : Number.parseInt(data.maxRounds);

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

  const handleRemovePlayer = (index: number, mode: "individual" | "team") => {
    const currentCount = Number.parseInt(watch("Number of players"));
    const newCount = mode === "team" ? currentCount - 1 : currentCount - 1;

    if (newCount < 4) {
      // Don't remove if it would result in fewer than 4 players
      return;
    }

    // Update player count
    setValue("Number of players", newCount.toString());

    if (mode === "team") {
      // Shift all team names up
      for (let i = index; i < currentCount - 1; i++) {
        const nextValue = watch(`playerName${i * 2}`);
        setValue(`playerName${i * 2}`, nextValue);
      }
      // Clear the last team name
      setValue(`playerName${(currentCount - 1) * 2}`, "");
    } else {
      // Shift all player names up
      for (let i = index; i < currentCount - 1; i++) {
        const nextValue = watch(`playerName${i + 1}`);
        setValue(`playerName${i}`, nextValue);
      }
      // Clear the last player name
      setValue(`playerName${currentCount - 1}`, "");
    }

    setPlayerCount(newCount);
  };

  // When switching to team mode, force reset even-indexed playerName fields to default team names.
  useEffect(() => {
    if (mode === "team") {
      const currentCountStr = getValues("Number of players");
      const currentCount = Number.parseInt(currentCountStr);
      const actualCount = currentCount * 2; // in team mode, playerCount is doubled.
      const teamCount = actualCount / 2;
      for (let i = 0; i < teamCount; i++) {
        setValue(`playerName${i * 2}`, `Team ${i + 1}`);
      }
    }
  }, [mode, getValues, setValue]);

  // When switching to individual mode, reset player names that still look like team defaults.
  useEffect(() => {
    if (mode === "individual") {
      // playerCount in individual mode is the numeric count from the form.
      const count = Number.parseInt(getValues("Number of players"));
      // Loop over the individual names
      for (let i = 0; i < count; i++) {
        const currentName = getValues(`playerName${i}`);
        if (
          typeof currentName === "string" &&
          currentName.startsWith("Team ")
        ) {
          setValue(`playerName${i}`, `Player ${i + 1}`);
        }
      }
    }
  }, [mode, getValues, setValue]);

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
                defaultValue={4}
                onFocus={(e) => e.target.select()}
                type="number"
                min={mode === "team" ? 2 : 4}
                step={1}
                className="text-black text-center text-xl font-semibold w-20 h-12 rounded-md border-2 focus:border-black focus:outline-none transition-all p-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                {...register("Number of players", {
                  required: true,
                  valueAsNumber: true,
                  validate: (value) =>
                    (Number.parseInt(value) > 0 && Number.isInteger(value)) ||
                    "Must be a positive integer",
                })}
                onChange={(e) => {
                  const value = e.target.value;
                  const numericValue = Number.parseInt(value, 10);
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
          setValue={setValue}
          watch={watch}
          onRemovePlayer={handleRemovePlayer}
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
