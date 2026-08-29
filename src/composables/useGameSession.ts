import { useGameStore } from "~/stores/game";
import { useGameInteractionStore } from "~/stores/gameInteraction";
import { useGamePresentationStore } from "~/stores/gamePresentation";
import { useNotificationStore } from "~/stores/notification";

export function useGameSession() {
  const game = useGameStore();
  const interaction = useGameInteractionStore();
  const presentation = useGamePresentationStore();
  const notification = useNotificationStore();

  function reset() {
    presentation.reset();
    interaction.reset();
    notification.reset();
    game.reset();
  }

  return { reset };
}
