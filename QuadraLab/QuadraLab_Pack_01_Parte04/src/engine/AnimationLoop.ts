export class AnimationLoop {
  private frame = 0;
  private running = false;

  constructor(private readonly render: () => void) {}

  start(): void {
    if (this.running) return;
    this.running = true;
    this.frame = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.frame);
  }

  private readonly tick = (): void => {
    if (!this.running) return;

    this.render();
    this.frame = requestAnimationFrame(this.tick);
  };
}
