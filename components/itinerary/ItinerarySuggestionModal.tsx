"use client";

import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { useState } from "react";
import "./itinerary-suggestion-modal.css";

type Stage = "morning" | "evening" | "closed";

function getInitialStage(
  isMorningSuggestion: boolean | undefined,
  isEveningSuggestion: boolean | undefined,
  fromSuggestion: "morning" | "evening" | undefined
): Stage {
  if (isEveningSuggestion && fromSuggestion !== "evening") return "evening";
  if (isMorningSuggestion && fromSuggestion !== "morning") return "morning";
  return "closed";
}

interface ItinerarySuggestionModalProps {
  tripId: string;
  isMorningSuggestion?: boolean;
  isEveningSuggestion?: boolean;
  fromSuggestion: "morning" | "evening" | undefined;
}

const ItinerarySuggestionModal = ({
  tripId,
  isMorningSuggestion,
  isEveningSuggestion,
  fromSuggestion,
}: ItinerarySuggestionModalProps) => {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>(() =>
    getInitialStage(isMorningSuggestion, isEveningSuggestion, fromSuggestion)
  );

  function handleClose() {
    if (stage === "evening" && isMorningSuggestion && fromSuggestion !== "morning") {
      setStage("morning")
    } else {
      setStage("closed")
    }
  }

  return (
    <AlertDialog open={stage !== "closed"} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <AlertDialogContent className="suggestion-modal__content">
        <AlertDialogHeader className="suggestion-modal__header">
          <AlertDialogTitle className="suggestion-modal__title">Hello friend!</AlertDialogTitle>
          <AlertDialogDescription className="suggestion-modal__description">
            {stage === "morning" &&
              "You won't have a schedule for your departure day, as time is short. However, we have a personal recommendation for you on how best to spend the morning."}
            {stage === "evening" &&
              "You won't have a schedule for your arrival evening, as time is short. However, we have a personal recommendation for you on how best to spend the evening."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="suggestion-modal__footer">
          <AlertDialogCancel className="suggestion-modal__cancel" onClick={handleClose}>
            Close
          </AlertDialogCancel>
          <AlertDialogAction
            className="suggestion-modal__action"
            onClick={() =>
              router.push(
                stage === "morning"
                  ? `/morning-suggestion?tripId=${tripId}`
                  : `/evening-suggestion?tripId=${tripId}`
              )
            }
          >
            Show {stage === "morning" ? "Morning" : "Evening"} Suggestion
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ItinerarySuggestionModal;
