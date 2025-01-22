import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

interface TimerProps {
  initialMinutes: number;
  onTimeUp: () => void;
}

export function Timer({ initialMinutes, onTimeUp }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [audio] = useState(new Audio("/alarm.mp3"));
  const [isMuted, setIsMuted] = useState(false);

  // Refs to track the last time we updated and when the timer should end
  const lastTickRef = useRef<number>(Date.now());
  const endTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let animationFrameId: number;

    function tick() {
      if (!isRunning || !endTimeRef.current) return;

      const now = Date.now();
      const remaining = Math.max(
        0,
        Math.ceil((endTimeRef.current - now) / 1000)
      );

      if (remaining !== timeLeft) {
        setTimeLeft(remaining);
      }

      if (remaining <= 0) {
        setIsRunning(false);
        if (!isMuted) audio.play();
        onTimeUp();
        endTimeRef.current = null;
        return;
      }

      animationFrameId = requestAnimationFrame(tick);
    }

    function handleVisibilityChange() {
      if (document.hidden || !isRunning) return;

      const now = Date.now();
      const elapsedSinceLastTick = now - lastTickRef.current;
      lastTickRef.current = now;

      if (endTimeRef.current) {
        // Adjust for any drift that occurred while tab was hidden
        const newTimeLeft = Math.max(
          0,
          Math.ceil((endTimeRef.current - now) / 1000)
        );
        setTimeLeft(newTimeLeft);
      }
    }

    if (isRunning) {
      // Set or update the end time when the timer starts/resumes
      if (!endTimeRef.current) {
        endTimeRef.current = Date.now() + timeLeft * 1000;
      }

      document.addEventListener("visibilitychange", handleVisibilityChange);
      animationFrameId = requestAnimationFrame(tick);
      lastTickRef.current = Date.now();
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRunning, timeLeft, onTimeUp, audio, isMuted]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const resetTimer = () => {
    setTimeLeft(initialMinutes * 60);
    setIsRunning(false);
    endTimeRef.current = null;
  };

  const toggleTimer = () => {
    if (!isRunning) {
      // Update end time when starting/resuming
      endTimeRef.current = Date.now() + timeLeft * 1000;
    }
    setIsRunning(!isRunning);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="text-xl font-mono font-bold min-w-[80px] text-center">
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </div>
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTimer}
          className={`${
            isRunning
              ? "bg-yellow-600 hover:bg-yellow-700"
              : "bg-green-600 hover:bg-green-700"
          } text-white`}
        >
          {isRunning ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={resetTimer}
          className="bg-gray-600 hover:bg-gray-700 text-white"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          onClick={toggleMute}
          variant="outline"
          size="icon"
          className={isMuted ? "bg-red-100" : ""}
        >
          {isMuted ? "🔇" : "🔊"}
        </Button>
      </div>
    </div>
  );
}
