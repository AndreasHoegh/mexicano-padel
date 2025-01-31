import { Button } from "../ui/button";

type FinalRoundPairingSelectorProps = {
  finalRoundPattern: number[];
  setFinalRoundPattern: (pattern: number[]) => void;
};

export function FinalRoundPairingSelector({
  finalRoundPattern,
  setFinalRoundPattern,
}: FinalRoundPairingSelectorProps) {
  return (
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
  );
}
