import type { BoardModel } from "../engine/BoardModel";
import { element } from "./dom";

export class StatusBar {
  readonly element = element("footer", "status-bar");
  private readonly tileCount = element("span", "", "0 peças");
  private readonly selectedCount = element("span", "", "0 selecionadas");
  private readonly equation = element("strong", "", "Exploração livre");

  constructor(board: BoardModel) {
    const brand = element("span", "status-brand", "QuadraLab™");
    const hints = element(
      "span",
      "status-hints",
      "Shift: seleção múltipla · R: girar · N: trocar sinal · Del: excluir"
    );

    this.element.append(
      brand,
      this.equation,
      this.tileCount,
      this.selectedCount,
      hints
    );

    board.events.on("changed", (snapshot) => {
      this.tileCount.textContent = `${snapshot.tiles.length} ${
        snapshot.tiles.length === 1 ? "peça" : "peças"
      }`;
    });

    board.events.on("selectionChanged", (tiles) => {
      this.selectedCount.textContent = `${tiles.length} selecionada${
        tiles.length === 1 ? "" : "s"
      }`;
    });
  }

  setEquation(label: string): void {
    this.equation.textContent = label;
  }
}
