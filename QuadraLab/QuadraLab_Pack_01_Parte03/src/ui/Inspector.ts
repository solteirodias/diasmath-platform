import type { TileSnapshot } from "../types";
import type { BoardModel } from "../engine/BoardModel";
import { element } from "./dom";

export class Inspector {
  readonly element = element("aside", "inspector panel");
  private readonly content = element("div", "inspector-content");

  constructor(private readonly board: BoardModel) {
    const heading = element("div", "panel-heading");
    heading.append(
      element("p", "eyebrow", "Seleção"),
      element("h2", "", "Inspetor")
    );

    this.element.append(heading, this.content);
    this.update([]);

    board.events.on("selectionChanged", (tiles) => this.update(tiles));
  }

  private update(tiles: TileSnapshot[]): void {
    this.content.replaceChildren();

    if (tiles.length === 0) {
      this.content.append(
        element("p", "muted", "Selecione uma ou mais peças no tabuleiro.")
      );
      return;
    }

    const summary = element("dl", "inspector-list");
    summary.innerHTML = `
      <div><dt>Selecionadas</dt><dd>${tiles.length}</dd></div>
      <div><dt>x²</dt><dd>${count(tiles, "x2")}</dd></div>
      <div><dt>x</dt><dd>${count(tiles, "x")}</dd></div>
      <div><dt>Unidades</dt><dd>${count(tiles, "unit")}</dd></div>
      <div><dt>Positivas</dt><dd>${tiles.filter((tile) => tile.sign === 1).length}</dd></div>
      <div><dt>Negativas</dt><dd>${tiles.filter((tile) => tile.sign === -1).length}</dd></div>
    `;

    const actions = element("div", "inspector-actions");
    actions.append(
      actionButton("Girar", () => this.board.rotateSelection()),
      actionButton("Trocar sinal", () => this.board.toggleSignSelection()),
      actionButton("Duplicar", () => this.board.duplicateSelection()),
      actionButton(
        tiles.some((tile) => !tile.locked) ? "Bloquear" : "Desbloquear",
        () => this.board.lockSelection()
      ),
      actionButton("Excluir", () => this.board.deleteSelection(), true)
    );

    this.content.append(summary, actions);
  }
}

function count(tiles: TileSnapshot[], kind: TileSnapshot["kind"]): number {
  return tiles.filter((tile) => tile.kind === kind).length;
}

function actionButton(
  label: string,
  onClick: () => void,
  danger = false
): HTMLButtonElement {
  const button = element(
    "button",
    danger ? "secondary-button secondary-button--danger" : "secondary-button",
    label
  );
  button.type = "button";
  button.addEventListener("click", onClick);
  return button;
}
