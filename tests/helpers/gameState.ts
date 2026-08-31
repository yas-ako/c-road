import {
  createTownConnectionInitialState,
  type TownConnectionGameState,
} from "../../src/game/state";

export function createTownRoadState(
  overrides: Partial<Omit<TownConnectionGameState, "mode" | "phase">> = {},
): TownConnectionGameState {
  return {
    ...createTownConnectionInitialState(),
    phase: "placing-roads",
    ...overrides,
  };
}
