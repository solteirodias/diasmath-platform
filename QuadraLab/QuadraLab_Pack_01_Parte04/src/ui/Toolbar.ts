import type { BoardModel } from "../engine/BoardModel";
import { element, iconButton } from "./dom";

export class Toolbar {
  readonly element = element("div", "toolbar panel");

  constructor(
    board: BoardModel,
    onTutorial: () => void,
    onFit: () => void
  ) {
    const left = element("div", "toolbar-group");
    left.append(
      iconButton("↶", "Desfazer (Ctrl+Z)", () => board.undo()),
      iconButton("↷", "Refazer (Ctrl+Y)", () => board.redo()),
      iconButton("⧉", "Duplicar seleção", () => board.duplicateSelection()),
      iconButton("↻", "Girar peça x", () => board.rotateSelection()),
      iconButton("±", "Trocar sinal", () => board.toggleSignSelection()),
      iconButton("⌖", "Centralizar peças", onFit),
      iconButton("⌫", "Excluir seleção", () => board.deleteSelection())
    );

    const right = element("div", "toolbar-group");
    const snapLabel = element("label", "switch-label");
    const snapInput = element("input") as HTMLInputElement;
    snapInput.type = "checkbox";
    snapInput.checked = board.snap.enabled;
    snapInput.addEventListener("change", () => {
      board.snap.enabled = snapInput.checked;
    });
    snapLabel.append(snapInput, element("span", "", "Encaixe"));

    right.append(
      snapLabel,
      iconButton("?", "Tutorial", onTutorial),
      iconButton("⟲", "Limpar tabuleiro", () => board.clear())
    );

    this.element.append(left, right);
  }
}
