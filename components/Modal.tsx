import React from "react";
import PlayerScores from "./PlayerScores"; // Adjust the import based on your file structure

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  scores: { [key: string]: number };
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, scores }) => {
  if (!isOpen) return null; // Return null if the modal is not open

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-lg w-full">
        <PlayerScores scores={scores} />
        <button
          onClick={onClose}
          className="mt-4 bg-red-600 text-white p-2 rounded w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
