/* import { useForm, FieldValues } from "react-hook-form";
import { Button } from "./ui/button";
import { TournamentSettings, Court } from "@/lib/types";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";
import { NamesSection } from "./NamesSection";
import { PointSystemSection } from "./PointSystemSection";
import { CourtsSection } from "./CourtsSection";
import { PointSelection } from "./PointSelection";
import { RoundsSelector } from "./RoundsSelector";
import { FinalRoundPairingSelector } from "./FinalRoundPairingSelector";

type PlayerNamesFormProps = {
  initialPlayerCount: number;
  onSubmit: (settings: TournamentSettings) => void;
  mode: "individual" | "team";
  format: "mexicano" | "americano" | "groups";
  onPlayerCountChange: (newCount: number) => void;
};

type FormValues = {
  [key: string]: string;
  pointSystem: "pointsToPlay" | "pointsToWin" | "TimePlay" | "Match";
  points: string;
  maxRounds: string;
  teamsPerGroup: string;
  teamsAdvancing: string;
};

const getMaxCourts = (playerCount: number) => {
  return Math.floor(playerCount / 4);
};

export default function PlayerNamesForm({
  initialPlayerCount,
  onSubmit,
  mode,
  format,
}: PlayerNamesFormProps) {
  const [playerCount, setPlayerCount] = useState(initialPlayerCount);
  const { register, handleSubmit, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      pointSystem: "pointsToPlay",
      points: "21",
      maxRounds: "∞",
      timePlay: "10",
      teamsPerGroup: "4",
      teamsAdvancing: "2",
    },
  });

  useEffect(() => {
    setPlayerCount(initialPlayerCount);
    const count = mode === "team" ? initialPlayerCount / 2 : initialPlayerCount;
    for (let i = 0; i < count; i++) {
      setValue(
        `playerName${mode === "team" ? i * 2 : i}`,
        mode === "team" ? `Team ${i + 1}` : `Player ${i + 1}`
      );
    }
  }, [initialPlayerCount, mode, setValue]);

  const pointSystem = watch("pointSystem");

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
    const numCourts = Math.floor(initialPlayerCount / 4);
    const initialCourts = [];
    for (let i = 1; i <= numCourts; i++) {
      initialCourts.push({
        id: i,
        name: `Court ${i}`,
      });
    }
    return initialCourts;
  });

  const [finalRoundPattern, setFinalRoundPattern] = useState<number[]>([
    0, 2, 1, 3,
  ]);

  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    const numCourts = Math.floor(playerCount / 4);
    setCourts((prevCourts) => {
      const newCourts = [];
      for (let i = 1; i <= numCourts; i++) {
        // Preserve existing court names if they exist
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

  const handlePlayerNamesSubmit = (data: FieldValues) => {
    // Get all player/team names from form data
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
    <div className="flex flex-col items-center mt-4 mb-12">
      <form
        onSubmit={handleSubmit(handlePlayerNamesSubmit)}
        className="mb-12 space-y-8 w-full max-w-2xl px-4"
      >
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
 */
