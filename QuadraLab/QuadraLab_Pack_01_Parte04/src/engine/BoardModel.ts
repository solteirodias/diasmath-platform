import type {
  BoardSnapshot,
  Orientation,
  Point,
  TileKind,
  TileSign,
  TileSnapshot
} from "../types";
import { EventBus } from "../core/EventBus";
import { createTile } from "../math/TileFactory";
import { tileSize } from "./TileMetrics";
import { SnapEngine } from "./SnapEngine";
import { CollisionEngine } from "./CollisionEngine";
import { HistoryManager } from "./HistoryManager";
import type { BoardEvents } from "./BoardEvents";

export class BoardModel {
  readonly events = new EventBus<BoardEvents>();
  readonly snap = new SnapEngine();
  readonly collision = new CollisionEngine();
  readonly history = new HistoryManager();

  private tiles: TileSnapshot[] = [];

  get allTiles(): readonly TileSnapshot[] {
    return this.tiles;
  }

  get selectedTiles(): TileSnapshot[] {
    return this.tiles.filter((tile) => tile.selected);
  }

  addTile(
    kind: TileKind,
    sign: TileSign,
    point: Point,
    orientation: Orientation = 0
  ): TileSnapshot {
    this.commit();
    const snapped = this.snap.snap(point);
    const tile = createTile(kind, sign, snapped.x, snapped.y, orientation);
    this.tiles.push(tile);
    this.selectOnly(tile.id);
    this.notify();
    return tile;
  }

  addMany(tiles: TileSnapshot[]): void {
    this.commit();
    this.tiles.push(...tiles.map((tile) => ({ ...tile })));
    this.notify();
  }

  replaceAll(tiles: TileSnapshot[]): void {
    this.commit();
    this.tiles = tiles.map((tile) => ({ ...tile, selected: false }));
    this.notify();
  }

  moveSelection(delta: Point): void {
    const selected = this.selectedTiles.filter((tile) => !tile.locked);
    if (selected.length === 0) return;

    const ignored = new Set(selected.map((tile) => tile.id));
    const candidates = selected.map((tile) => {
      const snapped = this.snap.snap({
        x: tile.x + delta.x,
        y: tile.y + delta.y
      });

      return { tile, x: snapped.x, y: snapped.y };
    });

    const blocked = candidates.some(({ tile, x, y }) =>
      this.collision.collides(
        { x, y, width: tile.width, height: tile.height },
        this.tiles,
        ignored
      )
    );

    if (blocked) {
      this.events.emit("message", "Há outra peça ocupando esse espaço.");
      return;
    }

    candidates.forEach(({ tile, x, y }) => {
      tile.x = x;
      tile.y = y;
    });

    this.notify();
  }

  setSelection(ids: Iterable<string>, additive = false): void {
    const set = new Set(ids);

    this.tiles.forEach((tile) => {
      tile.selected = additive ? tile.selected || set.has(tile.id) : set.has(tile.id);
    });

    this.emitSelection();
    this.notify();
  }

  toggleSelection(id: string): void {
    const tile = this.tiles.find((candidate) => candidate.id === id);
    if (!tile) return;

    tile.selected = !tile.selected;
    this.emitSelection();
    this.notify();
  }

  selectOnly(id: string): void {
    this.tiles.forEach((tile) => {
      tile.selected = tile.id === id;
    });

    this.emitSelection();
  }

  clearSelection(): void {
    this.tiles.forEach((tile) => {
      tile.selected = false;
    });

    this.emitSelection();
    this.notify();
  }

  deleteSelection(): void {
    if (this.selectedTiles.length === 0) return;
    this.commit();
    this.tiles = this.tiles.filter((tile) => !tile.selected);
    this.notify();
  }

  duplicateSelection(offset = 24): void {
    const selected = this.selectedTiles;
    if (selected.length === 0) return;

    this.commit();

    const clones = selected.map((tile) => ({
      ...tile,
      id: `${tile.id}-copy-${crypto.randomUUID()}`,
      x: tile.x + offset,
      y: tile.y + offset,
      selected: true
    }));

    this.tiles.forEach((tile) => {
      tile.selected = false;
    });

    this.tiles.push(...clones);
    this.notify();
  }

  rotateSelection(): void {
    const selected = this.selectedTiles.filter((tile) => tile.kind === "x");
    if (selected.length === 0) return;

    this.commit();

    selected.forEach((tile) => {
      tile.orientation = tile.orientation === 0 ? 90 : 0;
      const size = tileSize(tile.kind, tile.orientation);
      tile.width = size.width;
      tile.height = size.height;
    });

    this.notify();
  }

  toggleSignSelection(): void {
    const selected = this.selectedTiles;
    if (selected.length === 0) return;

    this.commit();
    selected.forEach((tile) => {
      tile.sign = tile.sign === 1 ? -1 : 1;
    });
    this.notify();
  }

  lockSelection(): void {
    const selected = this.selectedTiles;
    if (selected.length === 0) return;

    this.commit();
    const shouldLock = selected.some((tile) => !tile.locked);
    selected.forEach((tile) => {
      tile.locked = shouldLock;
    });
    this.notify();
  }

  clear(): void {
    if (this.tiles.length === 0) return;
    this.commit();
    this.tiles = [];
    this.notify();
  }

  bringToFront(id: string): void {
    const index = this.tiles.findIndex((tile) => tile.id === id);
    if (index < 0) return;

    const [tile] = this.tiles.splice(index, 1);
    this.tiles.push(tile);
    this.notify();
  }

  snapshot(): BoardSnapshot {
    return {
      tiles: structuredClone(this.tiles),
      gridSize: this.snap.gridSize,
      snappingEnabled: this.snap.enabled
    };
  }

  restore(snapshot: BoardSnapshot): void {
    this.tiles = structuredClone(snapshot.tiles);
    this.snap.gridSize = snapshot.gridSize;
    this.snap.enabled = snapshot.snappingEnabled;
    this.notify();
  }

  undo(): void {
    const previous = this.history.undo(this.snapshot());
    if (previous) this.restore(previous);
  }

  redo(): void {
    const next = this.history.redo(this.snapshot());
    if (next) this.restore(next);
  }

  commit(): void {
    this.history.push(this.snapshot());
  }

  private emitSelection(): void {
    this.events.emit("selectionChanged", this.selectedTiles);
  }

  private notify(): void {
    const snapshot = this.snapshot();
    this.events.emit("changed", snapshot);
    this.emitSelection();
  }
}
