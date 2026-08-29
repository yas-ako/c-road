import type { Coordinate, PlayerColor, TownId } from "~/game/types";

export type RenderEmphasis = "normal" | "winning" | "muted";

export type DisplayCoordinate = Readonly<{
  x: number;
  y: number;
}>;

export type RenderPoint = Readonly<{
  x: number;
  y: number;
}>;

export type RenderedRoad = Readonly<{
  key: string;
  displayCoordinate: DisplayCoordinate;
  logicalCoordinate: Coordinate;
  color: PlayerColor;
  level: number;
  emphasis: RenderEmphasis;
}>;

export type RenderedConnection = Readonly<{
  key: string;
  kind: "road-road" | "town-road";
  from: RenderPoint;
  to: RenderPoint;
  color: PlayerColor;
  emphasis: RenderEmphasis;
}>;

export type RenderedTown = Readonly<{
  townId: TownId;
  x: number;
  y: number;
  width: number;
  height: number;
}>;

export type RenderedCellMarker = Readonly<{
  key: string;
  displayCoordinate: DisplayCoordinate;
  kind: "selection" | "town-candidate" | "display-edge";
  color?: PlayerColor;
}>;

export type BoardRenderModel = Readonly<{
  roads: readonly RenderedRoad[];
  connections: readonly RenderedConnection[];
  towns: readonly RenderedTown[];
  markers: readonly RenderedCellMarker[];
}>;
