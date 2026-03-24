import { VIEWPORT_WIDTH, WORLD_WIDTH } from "@/data/buildings";

export class Camera {
  x: number;
  private targetX: number;
  private leadAmount = 50;
  private smoothing = 0.08;

  constructor(initialCharX: number) {
    this.x = initialCharX - VIEWPORT_WIDTH / 2;
    this.targetX = this.x;
    this.clamp();
  }

  update(characterX: number, movementDelta: number) {
    const lead =
      movementDelta > 0
        ? this.leadAmount
        : movementDelta < 0
          ? -this.leadAmount
          : 0;
    this.targetX = characterX - VIEWPORT_WIDTH / 2 + lead;
    this.clamp();

    this.x += (this.targetX - this.x) * this.smoothing;

    // Clamp again after interpolation to prevent sub-pixel overshoot
    const max = WORLD_WIDTH - VIEWPORT_WIDTH;
    this.x = Math.max(0, Math.min(max, this.x));
  }

  snapTo(characterX: number) {
    this.x = characterX - VIEWPORT_WIDTH / 2;
    this.clamp();
    this.targetX = this.x;
  }

  private clamp() {
    const max = WORLD_WIDTH - VIEWPORT_WIDTH;
    this.targetX = Math.max(0, Math.min(max, this.targetX));
    this.x = Math.max(0, Math.min(max, this.x));
  }
}
