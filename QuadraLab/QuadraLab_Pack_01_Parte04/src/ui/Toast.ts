import { element } from "./dom";

export class Toast {
  private readonly host = element("div", "toast-host");

  constructor(parent: HTMLElement) {
    parent.append(this.host);
  }

  show(message: string, duration = 2200): void {
    const item = element("div", "toast", message);
    this.host.append(item);

    requestAnimationFrame(() => {
      item.classList.add("toast--visible");
    });

    window.setTimeout(() => {
      item.classList.remove("toast--visible");
      window.setTimeout(() => item.remove(), 240);
    }, duration);
  }
}
