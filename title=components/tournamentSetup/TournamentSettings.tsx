import React, { useEffect } from 'react';
import { useForm } from 'react';

const TournamentSettings = () => {
  const { currentPlayerCount, mode, setPlayerCount, setValue, getValues } = useForm();

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
        if (!currentValue || (typeof currentValue === "string" && currentValue.startsWith("Team "))) {
          setValue(fieldName, `Player ${i + 1}`);
        }
      } else {
        // In team mode, force default if current value is empty or still an individual default
        if (!currentValue || (typeof currentValue === "string" && currentValue.startsWith("Player "))) {
          setValue(fieldName, `Team ${i + 1}`);
        }
      }
    }
  }, [currentPlayerCount, mode, setPlayerCount, setValue, getValues]);

  return (
    // Rest of the component code
  );
};

export default TournamentSettings; 