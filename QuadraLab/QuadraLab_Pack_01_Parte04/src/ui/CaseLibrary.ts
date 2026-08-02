import { element } from "./dom";

interface CaseExample {
  label: string;
  equation: string;
  category: "two" | "one" | "none" | "advanced";
}

const CASES: CaseExample[] = [
  { label: "Duas raízes", equation: "x² + 5x + 6 = 0", category: "two" },
  { label: "Duas raízes (a ≠ 1)", equation: "2x² + 7x + 3 = 0", category: "advanced" },
  { label: "Uma raiz", equation: "x² + 4x + 4 = 0", category: "one" },
  { label: "Uma raiz (a ≠ 1)", equation: "4x² + 4x + 1 = 0", category: "advanced" },
  { label: "Nenhuma raiz real", equation: "x² + 2x + 5 = 0", category: "none" },
  { label: "Nenhuma raiz real (a ≠ 1)", equation: "2x² + 4x + 7 = 0", category: "advanced" }
];

export class CaseLibrary {
  readonly element = element("section", "case-library panel");

  constructor(onSelect: (equation: string) => void) {
    const heading = element("div", "panel-heading");
    heading.append(
      element("p", "eyebrow", "Casos"),
      element("h2", "", "Explorador de equações")
    );

    const list = element("div", "case-list");

    CASES.forEach((item) => {
      const button = element(
        "button",
        `case-card case-card--${item.category}`
      );
      button.type = "button";
      button.innerHTML = `
        <span>${item.label}</span>
        <strong>${item.equation}</strong>
      `;
      button.addEventListener("click", () => onSelect(item.equation));
      list.append(button);
    });

    this.element.append(heading, list);
  }
}
