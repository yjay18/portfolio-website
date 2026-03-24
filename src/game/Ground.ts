import { Container, Graphics } from "pixi.js";
import {
  VIEWPORT_HEIGHT,
  GROUND_Y,
  WORLD_WIDTH,
} from "@/data/buildings";

export class Ground {
  container: Container;

  constructor() {
    this.container = new Container();
  }

  createGround() {
    const groundHeight = VIEWPORT_HEIGHT - GROUND_Y;
    const sidewalkHeight = 8;
    const sidewalkY = GROUND_Y;
    const roadY = GROUND_Y + sidewalkHeight;
    const roadHeight = groundHeight - sidewalkHeight;

    // Zone ground fills — full world width (4800px)
    const zones = [
      { x: 0, w: 1400, sidewalk: 0x2a2a3e, road: 0x16161f },
      { x: 1400, w: 200, sidewalk: 0x262630, road: 0x181820 },
      { x: 1600, w: 2000, sidewalk: 0x28283a, road: 0x141418 },
      { x: 3600, w: 400, sidewalk: 0x2a2434, road: 0x181420 },
      { x: 4000, w: 800, sidewalk: 0x302020, road: 0x1c1414 },
    ];

    for (const z of zones) {
      const sw = new Graphics();
      sw.rect(z.x, sidewalkY, z.w, sidewalkHeight).fill(z.sidewalk);
      this.container.addChild(sw);

      const rd = new Graphics();
      rd.rect(z.x, roadY, z.w, roadHeight).fill(z.road);
      this.container.addChild(rd);
    }

    // Sidewalk top edge highlight
    const topEdge = new Graphics();
    topEdge
      .rect(0, GROUND_Y, WORLD_WIDTH, 1)
      .fill({ color: 0x3a3a55, alpha: 0.35 });
    this.container.addChild(topEdge);

    // Curb line
    const curbLine = new Graphics();
    curbLine
      .rect(0, GROUND_Y + sidewalkHeight, WORLD_WIDTH, 1)
      .fill({ color: 0x333344, alpha: 0.5 });
    this.container.addChild(curbLine);

    // Road detail lines
    const details = new Graphics();
    for (let x = 50; x < WORLD_WIDTH; x += 80 + Math.random() * 60) {
      const dashLen = 8 + Math.random() * 15;
      const dashY = roadY + 5 + Math.random() * Math.max(roadHeight - 10, 1);
      details
        .rect(x, dashY, dashLen, 1)
        .fill({ color: 0x222233, alpha: 0.3 + Math.random() * 0.2 });
    }
    this.container.addChild(details);

    // Drain grates
    const drains = [300, 900, 1800, 2500, 3200, 4200, 4600];
    const drainGfx = new Graphics();
    for (const dx of drains) {
      drainGfx
        .rect(dx, roadY + 10, 10, 5)
        .fill({ color: 0x0a0a12, alpha: 0.6 });
      drainGfx
        .rect(dx + 3, roadY + 11, 1, 3)
        .fill({ color: 0x222233, alpha: 0.4 });
      drainGfx
        .rect(dx + 6, roadY + 11, 1, 3)
        .fill({ color: 0x222233, alpha: 0.4 });
    }
    this.container.addChild(drainGfx);
  }

  /**
   * Add a solid cover rectangle to a parallax layer container.
   * This covers everything below GROUND_Y on that layer,
   * hiding messy sprite bases that stick below the ground.
   * Uses a very wide rect since parallax layers scroll at different speeds.
   */
  addCoverTo(layerContainer: Container) {
    const cover = new Graphics();
    // Extra wide (10000px) to cover even at max scroll offset
    cover
      .rect(-5000, GROUND_Y, 10000, VIEWPORT_HEIGHT - GROUND_Y + 50)
      .fill(0x0a0e27); // match sky base color so it blends
    layerContainer.addChild(cover);
  }
}
