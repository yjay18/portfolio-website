import { Graphics, Container } from "pixi.js";
import { VIEWPORT_WIDTH, VIEWPORT_HEIGHT } from "@/data/buildings";

export class Transition {
  container: Container;
  private overlay: Graphics;
  private _active = false;

  constructor() {
    this.container = new Container();
    this.container.zIndex = 9999;

    this.overlay = new Graphics();
    this.overlay.rect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT).fill(0x000000);
    this.overlay.alpha = 0;
    this.container.addChild(this.overlay);
  }

  get active() {
    return this._active;
  }

  /** Fade to black over durationMs, then call onComplete */
  fadeOut(durationMs: number): Promise<void> {
    if (this._active) return Promise.resolve();
    this._active = true;

    return new Promise((resolve) => {
      const startTime = performance.now();
      const startAlpha = 0;
      const endAlpha = 1;

      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        // Ease-in quad
        const eased = progress * progress;
        this.overlay.alpha = startAlpha + (endAlpha - startAlpha) * eased;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.overlay.alpha = 1;
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
  }

  /** Fade from black to transparent over durationMs */
  fadeIn(durationMs: number): Promise<void> {
    return new Promise((resolve) => {
      const startTime = performance.now();

      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        // Ease-out quad
        const eased = 1 - (1 - progress) * (1 - progress);
        this.overlay.alpha = 1 - eased;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.overlay.alpha = 0;
          this._active = false;
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
  }

  /** Set to fully black (for initial state when returning) */
  setBlack() {
    this.overlay.alpha = 1;
    this._active = true;
  }

  /** Set to fully transparent */
  setClear() {
    this.overlay.alpha = 0;
    this._active = false;
  }
}
