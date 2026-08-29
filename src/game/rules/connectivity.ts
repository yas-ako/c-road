import type { Cell } from "../types";

export function areRoadsConnected(first: Cell, second: Cell): boolean {
  return (
    first.kind === "road" &&
    second.kind === "road" &&
    first.color === second.color &&
    Math.abs(first.level - second.level) <= 1
  );
}
