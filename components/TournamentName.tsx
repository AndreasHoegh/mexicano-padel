import React from "react";

function TournamentName() {
  return (
    <form
      className="flex flex-col sm:flex-row mx-8 justify-center gap-2 mt-8"
      onSubmit={handleSubmit(handleTournamentNameSubmit)}
    >
      <input
        className="border-2 border-slate-500 p-1"
        type="text"
        placeholder="Enter Tournament Name"
        defaultValue="Mock Tournament" // Default værdi
        {...register("tournamentName", { required: true })}
        autoFocus
        onFocus={(e) => e.target.select()} // Marker hele teksten når feltet får fokus
      />

      <Button type="submit">Set Tournament Name</Button>
    </form>
  );
}

export default TournamentName;
