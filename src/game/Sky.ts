import { Container, Sprite, Texture, Graphics, ImageSource } from "pixi.js";
import { VIEWPORT_WIDTH, VIEWPORT_HEIGHT } from "@/data/buildings";

interface Star {
  graphic: Graphics;
  phase: number;
  speed: number;
}

export class Sky {
  container: Container;
  private stars: Star[] = [];

  constructor() {
    this.container = new Container();
    this.createGradient();
    this.createStars(60);
    this.createMoon();
  }

  private createGradient() {
    const gradCanvas = document.createElement("canvas");
    gradCanvas.width = VIEWPORT_WIDTH;
    gradCanvas.height = VIEWPORT_HEIGHT;
    const ctx = gradCanvas.getContext("2d")!;
    const grad = ctx.createLinearGradient(0, 0, 0, VIEWPORT_HEIGHT);
    grad.addColorStop(0, "#0a0e27");
    grad.addColorStop(0.55, "#0f1235");
    grad.addColorStop(0.75, "#1a1040");
    grad.addColorStop(0.88, "#2d1b4e");
    grad.addColorStop(1.0, "#4a2060");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    // PixiJS v8: create texture from canvas via ImageSource
    let skyTexture: Texture;
    try {
      skyTexture = Texture.from(gradCanvas);
    } catch {
      // Fallback for v8 API changes
      const source = new ImageSource({ resource: gradCanvas });
      skyTexture = new Texture({ source });
    }
    const skySprite = new Sprite(skyTexture);
    this.container.addChild(skySprite);
  }

  private createStars(count: number) {
    for (let i = 0; i < count; i++) {
      const g = new Graphics();
      const size = Math.random() > 0.8 ? 2 : 1;
      g.circle(0, 0, size).fill(0xffffff);
      g.x = Math.random() * VIEWPORT_WIDTH;
      g.y = Math.random() * (VIEWPORT_HEIGHT * 0.65);
      g.alpha = 0.3 + Math.random() * 0.7;

      this.container.addChild(g);
      this.stars.push({
        graphic: g,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.5,
      });
    }
  }

  private createMoon() {
    // Subtle small glow
    const glow = new Graphics();
    glow.circle(0, 0, 12).fill({ color: 0xddeeff, alpha: 0.04 });
    glow.x = 680;
    glow.y = 35;
    this.container.addChild(glow);

    // Small moon body
    const moon = new Graphics();
    moon.circle(0, 0, 5).fill({ color: 0xf0e8d0, alpha: 0.8 });
    moon.x = 680;
    moon.y = 35;
    this.container.addChild(moon);
  }

  update(time: number) {
    for (const star of this.stars) {
      star.graphic.alpha =
        0.2 + 0.8 * Math.abs(Math.sin(time * 0.001 * star.speed + star.phase));
    }
  }
}
