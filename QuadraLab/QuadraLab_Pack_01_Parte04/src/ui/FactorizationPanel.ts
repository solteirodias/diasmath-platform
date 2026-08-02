import type { QuadraticCoefficients } from "../types";
import {
  formatFactorization,
  type FactorableQuadratic
} from "../math/QuadraticFactorization";
import {
  analyzeQuadratic,
  type QuadraticAnalysis
} from "../math/QuadraticCaseAnalyzer";
import { formatCompletedSquare } from "../math/CompletingSquare";
import { element } from "./dom";

export class FactorizationPanel {
  readonly element = element("section", "factor-panel panel");
  private readonly content = element("div", "factor-content");
  private current: QuadraticAnalysis | null = null;

  constructor(
    private readonly onShowRectangle: (
      factorization: FactorableQuadratic | null
    ) => void
  ) {
    const heading = element("div", "panel-heading");
    heading.append(
      element("p", "eyebrow", "Investigação"),
      element("h2", "", "Fatoração por manipulação")
    );

    this.element.append(heading, this.content);
    this.renderEmpty();
  }

  analyze(coefficients: QuadraticCoefficients): void {
    this.current = analyzeQuadratic(coefficients);
    this.render();
  }

  private render(): void {
    if (!this.current) {
      this.renderEmpty();
      return;
    }

    this.content.replaceChildren();

    const badge = element(
      "span",
      `root-badge root-badge--${this.current.rootCase}`,
      caseLabel(this.current.rootCase)
    );
    this.content.append(badge);

    if (this.current.factorization.kind === "factorable") {
      const factorization = this.current.factorization;
      const explanation = element("div", "factor-step-list");

      explanation.innerHTML = `
        <article>
          <span>1</span>
          <div>
            <strong>Separe o termo central</strong>
            <p>${factorization.middleSplit[0]}x e ${factorization.middleSplit[1]}x recompõem o termo linear.</p>
          </div>
        </article>
        <article>
          <span>2</span>
          <div>
            <strong>Organize as quatro áreas</strong>
            <p>As peças formam um retângulo com dois lados algébricos.</p>
          </div>
        </article>
        <article>
          <span>3</span>
          <div>
            <strong>Leia os lados</strong>
            <p class="math-line">${formatFactorization(factorization)}</p>
          </div>
        </article>
        <article>
          <span>4</span>
          <div>
            <strong>Área igual a zero</strong>
            <p>Um dos lados precisa medir zero.</p>
          </div>
        </article>
      `;

      const roots = element("div", "roots-grid");
      factorization.roots.forEach((root, index) => {
        const card = element("article", "root-card");
        card.innerHTML = `
          <span>Raiz ${index + 1}</span>
          <strong>x = ${root.toString()}</strong>
        `;
        roots.append(card);
      });

      const showButton = element(
        "button",
        "primary-button",
        "Mostrar retângulo dos fatores"
      );
      showButton.type = "button";
      showButton.addEventListener("click", () => {
        this.onShowRectangle(factorization);
      });

      const hideButton = element(
        "button",
        "secondary-button",
        "Ocultar construção"
      );
      hideButton.type = "button";
      hideButton.addEventListener("click", () => {
        this.onShowRectangle(null);
      });

      const actions = element("div", "factor-actions");
      actions.append(showButton, hideButton);

      this.content.append(explanation, roots, actions);
      return;
    }

    const completed = this.current.completedSquare;
    const nonFactorable = element("div", "non-factorable");
    const squareForm = formatCompletedSquare(completed);

    nonFactorable.innerHTML = `
      <h3>A montagem retangular com fatores inteiros não fecha.</h3>
      <p>
        Reorganizando as peças para completar um quadrado, obtemos:
      </p>
      <p class="math-line">${squareForm} = 0</p>
      <p>${completedExplanation(completed.classification)}</p>
    `;

    const hideButton = element(
      "button",
      "secondary-button",
      "Ocultar construção"
    );
    hideButton.type = "button";
    hideButton.addEventListener("click", () => {
      this.onShowRectangle(null);
    });

    this.content.append(nonFactorable, hideButton);
  }

  private renderEmpty(): void {
    this.content.replaceChildren(
      element(
        "p",
        "muted",
        "Gere uma equação para investigar como as peças podem ser reorganizadas."
      )
    );
  }
}

function caseLabel(
  rootCase: QuadraticAnalysis["rootCase"]
): string {
  if (rootCase === "two-real") return "Duas raízes reais";
  if (rootCase === "one-real") return "Uma raiz real";
  return "Nenhuma raiz real";
}

function completedExplanation(
  rootCase: QuadraticAnalysis["rootCase"]
): string {
  if (rootCase === "no-real") {
    return "Mesmo no menor valor possível, a área algébrica não chega a zero.";
  }

  if (rootCase === "one-real") {
    return "A construção encosta no zero em uma única posição.";
  }

  return "A construção pode atingir zero em duas posições distintas.";
}
