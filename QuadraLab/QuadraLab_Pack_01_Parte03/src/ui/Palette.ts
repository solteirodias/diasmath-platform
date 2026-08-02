import type { TileKind, TileSign } from "../types";
import type { BoardModel } from "../engine/BoardModel";
import { element } from "./dom";

const ITEMS: Array<{
  kind: TileKind;
  sign: TileSign;
  label: string;
  description: string;
}> = [
  { kind: "x2", sign: 1, label: "x²", description: "Peça quadrática positiva" },
  { kind: "x", sign: 1, label: "x", description: "Peça linear positiva" },
  { kind: "unit", sign: 1, label: "1", description: "Unidade positiva" },
  { kind: "x2", sign: -1, label: "−x²", description: "Peça quadrática negativa" },
  { kind: "x", sign: -1, label: "−x", description: "Peça linear negativa" },
  { kind: "unit", sign: -1, label: "−1", description: "Unidade negativa" }
];

export class Palette {
  readonly element = element("aside", "palette panel");

  constructor(private readonly board: BoardModel) {
    const heading = element("div", "panel-heading");
    heading.append(
      element("p", "eyebrow", "Peças"),
      element("h2", "", "Paleta ALGEPLAN")
    );

    const grid = element("div", "palette-grid");

    ITEMS.forEach((item) => {
      const button = element(
        "button",
        `palette-item palette-item--${item.sign === 1 ? "positive" : "negative"}`
      );

      button.type = "button";
      button.title = item.description;
      button.innerHTML = `
        <span class="palette-shape palette-shape--${item.kind}">${item.label}</span>
        <small>${item.description}</small>
      `;

      button.addEventListener("click", () => {
        const offset = this.board.allTiles.length * 7;
        this.board.addTile(item.kind, item.sign, {
          x: 72 + (offset % 250),
          y: 72 + (offset % 180)
        });
      });

      grid.append(button);
    });

    this.element.append(heading, grid);
  }
}
