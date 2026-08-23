export const BOARD_SIZE = 13;
export const DISPLAY_BOARD_SIZE = BOARD_SIZE + 2;

export type PlayerColor = "blue" | "red";

export type Coordinate = Readonly<{
  x: number;
  y: number;
}>;

export type Direction = Readonly<{
  x: -1 | 0 | 1;
  y: -1 | 0 | 1;
}>;

export const DIRECTIONS: readonly Direction[] = [
  { x: -1, y: -1 },
  { x: 0, y: -1 },
  { x: 1, y: -1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: -1, y: 1 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
];

export type TownId = "north-west" | "south-east";

export const TOWN_ANCHORS: Readonly<Record<TownId, Coordinate>> = {
  "north-west": { x: 2, y: 2 },
  "south-east": { x: BOARD_SIZE - 3, y: BOARD_SIZE - 3 },
};

export type Cell =
  | Readonly<{ kind: "empty" }>
  | Readonly<{ kind: "road"; color: PlayerColor; level: number }>
  | Readonly<{ kind: "town"; townId: TownId }>;

export type Board = ReadonlyArray<ReadonlyArray<Cell>>;
