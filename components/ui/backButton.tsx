import { Button } from "./button";

export default function BackButton({
  onClick,
  visible,
}: {
  onClick: () => void;
  visible?: boolean;
}) {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      className={`absolute top-4 left-3 flex items-center gap-2 text-white hover:text-gray-900 transition-colors ${
        !visible ? "hidden" : ""
      }`}
    >
      <span className="text-lg">←</span>
      <span className="font-medium">Back</span>
    </Button>
  );
}
