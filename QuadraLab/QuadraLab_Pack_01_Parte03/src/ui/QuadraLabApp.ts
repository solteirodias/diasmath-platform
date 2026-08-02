import { SafeStorage } from "../core/Storage";
import { AnimationLoop } from "../engine/AnimationLoop";
import { autoLayoutTiles } from "../engine/AutoLayout";
import { BoardModel } from "../engine/BoardModel";
import { CanvasRenderer } from "../engine/CanvasRenderer";
import { InteractionController } from "../engine/InteractionController";
import { KeyboardController } from "../engine/KeyboardController";
import { coefficientsToTiles } from "../math/TileFactory";
import type { BoardSnapshot } from "../types";
import { EquationPanel } from "./EquationPanel";
import { Inspector } from "./Inspector";
import { Modal } from "./Modal";
import { Palette } from "./Palette";
import { StatusBar } from "./StatusBar";
import { Toast } from "./Toast";
import { Toolbar } from "./Toolbar";
import { tutorialContent } from "./TutorialContent";
import { element } from "./dom";

export class QuadraLabApp {
  private readonly board = new BoardModel();
  private readonly storage = new SafeStorage("quadralab");
  private renderer: CanvasRenderer | null = null;
  private interaction: InteractionController | null = null;
  private keyboard: KeyboardController | null = null;
  private loop: AnimationLoop | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private toast: Toast | null = null;

  constructor(private readonly root: HTMLElement) {}

  start(): void {
    this.renderHome();
  }

  private renderHome(): void {
    this.destroyLab();
    this.root.replaceChildren();

    const home = element("main", "home-screen");
    home.innerHTML = `
      <div class="home-orb home-orb--one"></div>
      <div class="home-orb home-orb--two"></div>
      <section class="home-card">
        <div class="brand-mark" aria-hidden="true">
          <span class="brand-tile brand-tile--x2">x²</span>
          <span class="brand-tile brand-tile--x">x</span>
          <span class="brand-tile brand-tile--one">1</span>
        </div>
        <p class="eyebrow">DIASMATH apresenta</p>
        <h1>QuadraLab™</h1>
        <h2>Laboratório Virtual de Equações Quadráticas</h2>
        <p class="home-description">
          Explore, organize e investigue equações quadráticas por meio de
          peças manipuláveis — sem recorrer à fórmula de Bhaskara.
        </p>
        <div class="home-actions">
          <button id="enter-lab" class="primary-button primary-button--large">
            Entrar no laboratório
          </button>
          <button id="open-tutorial" class="secondary-button">
            Como funciona
          </button>
        </div>
        <div class="home-features">
          <span>Manipulação visual</span>
          <span>Fatoração por áreas</span>
          <span>a = 1 e a ≠ 1</span>
          <span>Uma, duas ou nenhuma raiz real</span>
        </div>
      </section>
    `;

    this.root.append(home);
    this.toast = new Toast(this.root);

    home
      .querySelector<HTMLButtonElement>("#enter-lab")
      ?.addEventListener("click", () => this.renderLab());

    home
      .querySelector<HTMLButtonElement>("#open-tutorial")
      ?.addEventListener("click", () => this.openTutorial());
  }

  private renderLab(): void {
    this.root.replaceChildren();

    const shell = element("div", "app-shell");
    const topbar = element("header", "app-topbar");
    const brand = element("button", "app-brand");
    brand.type = "button";
    brand.innerHTML = `
      <span class="app-brand__symbol">Q</span>
      <span><strong>QuadraLab™</strong><small>Equações Quadráticas</small></span>
    `;
    brand.addEventListener("click", () => this.renderHome());

    const title = element("div", "topbar-title");
    title.innerHTML = `
      <span class="live-dot"></span>
      <span>Oficina de peças</span>
    `;

    const saveButton = element("button", "secondary-button", "Salvar");
    saveButton.type = "button";
    saveButton.addEventListener("click", () => this.save());

    const loadButton = element("button", "secondary-button", "Restaurar");
    loadButton.type = "button";
    loadButton.addEventListener("click", () => this.load());

    const topActions = element("div", "topbar-actions");
    topActions.append(loadButton, saveButton);
    topbar.append(brand, title, topActions);

    const workspace = element("div", "workspace");
    const leftColumn = element("div", "workspace-column workspace-column--left");
    const centerColumn = element(
      "div",
      "workspace-column workspace-column--center"
    );
    const rightColumn = element("div", "workspace-column workspace-column--right");

    const palette = new Palette(this.board);
    const status = new StatusBar(this.board);
    const equation = new EquationPanel(this.board, (label) => {
      status.setEquation(label);
      this.toast?.show("Peças geradas com sucesso.");
    });
    const inspector = new Inspector(this.board);

    leftColumn.append(equation.element, palette.element);

    const toolbar = new Toolbar(
      this.board,
      () => this.openTutorial(),
      () => this.fitTiles()
    );

    const canvasPanel = element("section", "canvas-panel");
    const canvasHeader = element("div", "canvas-header");
    canvasHeader.innerHTML = `
      <div>
        <p class="eyebrow">Área de trabalho</p>
        <h2>Tabuleiro de manipulação</h2>
      </div>
      <div class="legend">
        <span><i class="legend-dot legend-dot--positive"></i>Positivo</span>
        <span><i class="legend-dot legend-dot--negative"></i>Negativo</span>
      </div>
    `;

    const canvasWrap = element("div", "canvas-wrap");
    const canvas = element("canvas", "lab-canvas");
    canvas.setAttribute("aria-label", "Tabuleiro de peças algébricas");
    canvasWrap.append(canvas);
    canvasPanel.append(canvasHeader, canvasWrap);

    centerColumn.append(toolbar.element, canvasPanel);
    rightColumn.append(inspector.element);
    workspace.append(leftColumn, centerColumn, rightColumn);
    shell.append(topbar, workspace, status.element);
    this.root.append(shell);

    this.toast = new Toast(this.root);
    this.setupCanvas(canvas, canvasWrap);

    this.board.events.on("message", (message) => this.toast?.show(message));

    if (this.board.allTiles.length === 0) {
      const initial = autoLayoutTiles(
        coefficientsToTiles({ a: 1, b: 5, c: 6 })
      );
      this.board.replaceAll(initial);
      status.setEquation("x² + 5x + 6 = 0");
    }
  }

  private setupCanvas(
    canvas: HTMLCanvasElement,
    canvasWrap: HTMLElement
  ): void {
    this.renderer = new CanvasRenderer(canvas, this.board);
    this.interaction = new InteractionController(canvas, this.board, this.renderer);
    this.keyboard = new KeyboardController(this.board);
    this.loop = new AnimationLoop(() => this.renderer?.render());

    const resize = (): void => {
      const bounds = canvasWrap.getBoundingClientRect();
      this.renderer?.resize(bounds.width, bounds.height);
    };

    this.resizeObserver = new ResizeObserver(resize);
    this.resizeObserver.observe(canvasWrap);
    resize();
    this.loop.start();
  }

  private fitTiles(): void {
    const laidOut = autoLayoutTiles([...this.board.allTiles], 48, 48, 14, 700);
    this.board.replaceAll(laidOut);
    this.toast?.show("Peças organizadas no tabuleiro.");
  }

  private save(): void {
    this.storage.set<BoardSnapshot>("board", this.board.snapshot());
    this.toast?.show("Atividade salva neste dispositivo.");
  }

  private load(): void {
    const snapshot = this.storage.get<BoardSnapshot>("board");

    if (!snapshot) {
      this.toast?.show("Nenhuma atividade salva foi encontrada.");
      return;
    }

    this.board.restore(snapshot);
    this.toast?.show("Atividade restaurada.");
  }

  private openTutorial(): void {
    new Modal(this.root, "Conhecendo o QuadraLab™", tutorialContent()).open();
  }

  private destroyLab(): void {
    this.interaction?.destroy();
    this.keyboard?.destroy();
    this.loop?.stop();
    this.resizeObserver?.disconnect();

    this.interaction = null;
    this.keyboard = null;
    this.loop = null;
    this.resizeObserver = null;
    this.renderer = null;
  }
}
