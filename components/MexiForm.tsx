"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";

type PlayerCountFormData = {
  playerCount: number;
};

type PlayerNamesFormData = {
  playerNames: string[];
};

const PlayerCountForm: React.FC = () => {
  const [confirmedPlayerCount, setConfirmedPlayerCount] = useState<
    number | null
  >(null);

  const {
    register: registerCount,
    handleSubmit: handleSubmitCount,
    formState: { errors: countErrors },
  } = useForm<PlayerCountFormData>();

  const {
    control,
    register: registerNames,
    handleSubmit: handleSubmitNames,
    formState: { errors: nameErrors },
  } = useForm<PlayerNamesFormData>();

  const { fields, append } = useFieldArray({
    control,
    name: "playerNames",
  });

  const handleCountSubmit: SubmitHandler<PlayerCountFormData> = (data) => {
    setConfirmedPlayerCount(data.playerCount);
    // Dynamically append fields based on player count
    const playerNamesArray = new Array(data.playerCount).fill("");
    playerNamesArray.forEach(() => append({ playerNames: "" }));
  };

  const handleNamesSubmit: SubmitHandler<PlayerNamesFormData> = (data) => {
    console.log("Spillernavne:", data.playerNames);
    // Here you can proceed with the data.playerNames
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Mexicano Padel Turnering</h1>
      {!confirmedPlayerCount && (
        <form onSubmit={handleSubmitCount(handleCountSubmit)}>
          <div className="mb-4">
            <label htmlFor="playerCount" className="block font-medium mb-2">
              Antal spillere:
            </label>
            <input
              id="playerCount"
              type="number"
              {...registerCount("playerCount", {
                required: "Du skal indtaste antal spillere.",
                min: {
                  value: 4,
                  message: "Der skal mindst være 4 spillere.",
                },
                validate: (value) =>
                  value % 4 === 0 || "Antal spillere skal være deleligt med 4.",
              })}
              className="border p-2 rounded w-full"
              placeholder="Skriv antal spillere (fx 8, 12, 16)"
            />
            {countErrors.playerCount && (
              <p className="text-red-500 text-sm mt-1">
                {countErrors.playerCount.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Bekræft antal spillere
          </button>
        </form>
      )}

      {confirmedPlayerCount && (
        <form onSubmit={handleSubmitNames(handleNamesSubmit)}>
          <h2 className="text-xl font-medium mt-4">Indtast spillernavne:</h2>
          {fields.map((item, index) => (
            <div key={item.id} className="mb-4">
              <label
                htmlFor={`playerName-${index}`}
                className="block font-medium mb-2"
              >
                Spiller {index + 1}:
              </label>
              <input
                id={`playerName-${index}`}
                type="text"
                {...registerNames(`playerNames.${index}`, {
                  required: "Du skal indtaste et navn.",
                })}
                className="border p-2 rounded w-full"
                placeholder={`Navn på spiller ${index + 1}`}
              />
              {nameErrors.playerNames && nameErrors.playerNames[index] && (
                <p className="text-red-500 text-sm mt-1">
                  {nameErrors.playerNames[index]?.message}
                </p>
              )}
            </div>
          ))}
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Bekræft spillernavne
          </button>
        </form>
      )}
    </div>
  );
};

export default PlayerCountForm;
