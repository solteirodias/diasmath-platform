import type { BoardModel } from "../engine/BoardModel";
import { parseQuadraticEquation, EquationParseError } from "../math/QuadraticEquationParser";
import { coefficientsToTiles } from "../math/TileFactory";
import { autoLayoutTiles } from "../engine/AutoLayout";
import { formatQuadratic } from "../math/EquationFormatter";
import { element } from "./dom";

export class EquationPanel {
  readonly element = element("section", "equation-panel panel");
  private readonly input = element("input", "equation-input") as HTMLInputElement;
  private readonly feedback = element("p", "equation-feedback");

  constructor(
    private readonly board: BoardModel,
    private readonly onEquationReady: (
      label: string,
      coefficients: import("../types").QuadraticCoefficients
    ) => void
  ) {
    const heading = element("div", "panel-heading");
    heading.append(
      element("p", "eyebrow", "Gerador"),
      element("h2", "", "Monte a equação")
    );

    this.input.type = "text";
    this.input.placeholder = "Ex.: 2x² + 7x + 3 = 0";
    this.input.value = "x² + 5x + 6 = 0";
    this.input.setAttribute("aria-label", "Equação quadrática");

    const button = element("button", "primary-button", "Gerar peças");
    button.type = "button";
    button.addEventListener("click", () => this.generate());

    this.input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") this.generate();
    });

    const examples = element("div", "example-row");
    [
      "x² + 5x + 6 = 0",
      "x² + 4x + 4 = 0",
      "2x² + 7x + 3 = 0",
      "x² + 2x + 5 = 0"
    ].forEach((equation) => {
      const chip = element("button", "chip", equation);
      chip.type = "button";
      chip.addEventListener("click", () => {
        this.input.value = equation;
        this.generate();
      });
      examples.append(chip);
    });

    this.element.append(heading, this.input, button, examples, this.feedback);
  }

  generateFrom(equation: string): void {
    this.input.value = equation;
    this.generate();
  }

  private generate(): void {
    try {
      const parsed = parseQuadraticEquation(this.input.value);
      const tiles = autoLayoutTiles(coefficientsToTiles(parsed.coefficients));
      this.board.replaceAll(tiles);
      const label = formatQuadratic(parsed.coefficients);
      this.feedback.textContent = `${tiles.length} peças geradas para ${label}`;
      this.feedback.className = "equation-feedback equation-feedback--success";
      this.onEquationReady(label, parsed.coefficients);
    } catch (error) {
      const message =
        error instanceof EquationParseError
          ? error.message
          : "Não foi possível interpretar a equação.";

      this.feedback.textContent = message;
      this.feedback.className = "equation-feedback equation-feedback--error";
    }
  }
}
