import { createGameState, type GameMode } from "~/game/gameModes";
import { useGameStore } from "~/stores/game";
import { useGameInteractionStore } from "~/stores/gameInteraction";
import { useGamePresentationStore } from "~/stores/gamePresentation";
import { useNotificationStore } from "~/stores/notification";

export function useGameSession() {
  const game = useGameStore();
  const interaction = useGameInteractionStore();
  const presentation = useGamePresentationStore();
  const notification = useNotificationStore();

  function resetUi() {
    presentation.reset();
    interaction.reset();
    notification.reset();
  }

  function startGame(mode: GameMode) {
    resetUi();
    game.state = createGameState(mode);
  }

  function restart() {
    startGame(game.state.mode);
  }

  return { startGame, restart, reset: restart };
}
