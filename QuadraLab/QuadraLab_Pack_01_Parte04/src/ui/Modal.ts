import { element, iconButton } from "./dom";

export class Modal {
  private readonly backdrop = element("div", "modal-backdrop");
  private readonly panel = element("section", "modal-panel");

  constructor(
    private readonly parent: HTMLElement,
    title: string,
    content: HTMLElement
  ) {
    const header = element("header", "modal-header");
    header.append(
      element("h2", "", title),
      iconButton("×", "Fechar", () => this.close())
    );

    this.panel.append(header, content);
    this.backdrop.append(this.panel);
    this.backdrop.addEventListener("click", (event) => {
      if (event.target === this.backdrop) this.close();
    });
  }

  open(): void {
    this.parent.append(this.backdrop);
    requestAnimationFrame(() => {
      this.backdrop.classList.add("modal-backdrop--visible");
    });
  }

  close(): void {
    this.backdrop.classList.remove("modal-backdrop--visible");
    window.setTimeout(() => this.backdrop.remove(), 200);
  }
}
