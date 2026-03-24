import { Container, Graphics } from "pixi.js";

interface Particle {
  graphic: Graphics;
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
}

export class FireflyEmitter {
  container: Container;
  private particles: Particle[] = [];
  private minX: number;
  private maxX: number;
  private minY: number;
  private maxY: number;

  constructor(
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
    count: number,
  ) {
    this.container = new Container();
    this.minX = minX;
    this.maxX = maxX;
    this.minY = minY;
    this.maxY = maxY;

    for (let i = 0; i < count; i++) {
      const g = new Graphics();
      g.circle(0, 0, 1.5).fill(0xffff88);

      const p: Particle = {
        graphic: g,
        x: minX + Math.random() * (maxX - minX),
        y: minY + Math.random() * (maxY - minY),
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.2,
        phase: Math.random() * Math.PI * 2,
      };
      g.x = p.x;
      g.y = p.y;
      this.container.addChild(g);
      this.particles.push(p);
    }
  }

  update(time: number) {
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;

      // Gentle bounce at boundaries
      if (p.x < this.minX || p.x > this.maxX) p.vx *= -1;
      if (p.y < this.minY || p.y > this.maxY) p.vy *= -1;

      p.graphic.x = p.x;
      p.graphic.y = p.y;
      p.graphic.alpha =
        0.15 + 0.85 * Math.abs(Math.sin(time * 0.0015 + p.phase));
    }
  }
}
