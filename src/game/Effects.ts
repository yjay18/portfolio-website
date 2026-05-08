import { Container, Graphics, Sprite, Texture } from "pixi.js";
import {
  VIEWPORT_WIDTH,
  VIEWPORT_HEIGHT,
  GROUND_Y,
  INTERACTION_WIDTH,
  visibleBuildings as buildingConfigs,
} from "@/data/buildings";
import { streetObjects } from "./constants";

// ============================================================
// RAIN
// ============================================================

interface Raindrop {
  graphic: Graphics;
  x: number;
  y: number;
  speed: number;
  length: number;
}

export class Rain {
  container: Container;
  private drops: Raindrop[] = [];

  constructor(count = 80) {
    this.container = new Container();

    for (let i = 0; i < count; i++) {
      const g = new Graphics();
      const length = 4 + Math.random() * 8;
      g.moveTo(0, 0).lineTo(-2, length).stroke({
        color: 0x8888cc,
        width: 1,
        alpha: 0.15 + Math.random() * 0.15,
      });

      const drop: Raindrop = {
        graphic: g,
        x: Math.random() * VIEWPORT_WIDTH,
        y: Math.random() * VIEWPORT_HEIGHT,
        speed: 3 + Math.random() * 4,
        length,
      };
      g.x = drop.x;
      g.y = drop.y;
      this.container.addChild(g);
      this.drops.push(drop);
    }
  }

  update() {
    for (const d of this.drops) {
      d.y += d.speed;
      d.x -= d.speed * 0.3; // slight diagonal

      // Reset when off screen
      if (d.y > GROUND_Y + 5 || d.x < -20) {
        d.y = -10 - Math.random() * 30;
        d.x = Math.random() * (VIEWPORT_WIDTH + 100);
      }

      // Fade near ground
      const groundDist = GROUND_Y - d.y;
      d.graphic.alpha = groundDist > 30 ? 1 : Math.max(0, groundDist / 30);

      d.graphic.x = d.x;
      d.graphic.y = d.y;
    }
  }
}

// ============================================================
// LAMP POST GLOW
// ============================================================

export class LampGlows {
  container: Container;
  private glows: { sprite: Sprite; phase: number }[] = [];

  constructor() {
    this.container = new Container();

    // Create a radial glow texture
    const glowTex = this.createGlowTexture();

    // Add glow at each lamp post position
    const lampPositions = streetObjects
      .filter((o) => o.sprite === "lamp-post.png")
      .map((o) => o.x);

    for (const x of lampPositions) {
      const sprite = new Sprite(glowTex);
      sprite.anchor.set(0.5, 0.5);
      sprite.x = x;
      sprite.y = GROUND_Y - 118; // lantern center is 106px from sprite bottom * 1.2 scale - ground sink
      sprite.scale.set(0.8);
      sprite.alpha = 0.6;
      this.container.addChild(sprite);

      this.glows.push({
        sprite,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  private createGlowTexture(): Texture {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(255, 220, 120, 0.4)");
    grad.addColorStop(0.3, "rgba(255, 200, 80, 0.15)");
    grad.addColorStop(0.7, "rgba(255, 180, 50, 0.04)");
    grad.addColorStop(1, "rgba(255, 180, 50, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    return Texture.from(canvas);
  }

  update(time: number) {
    for (const g of this.glows) {
      // Gentle warm flicker
      const flicker = 0.85 + 0.15 * Math.sin(time * 0.002 + g.phase);
      g.sprite.alpha = 0.5 * flicker;
    }
  }
}

// ============================================================
// SHOOTING STARS
// ============================================================

interface ShootingStar {
  graphic: Graphics;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  active: boolean;
}

export class ShootingStars {
  container: Container;
  private stars: ShootingStar[] = [];
  private timer = 0;
  private nextSpawn = 8000 + Math.random() * 7000; // 8-15s

  constructor() {
    this.container = new Container();

    // Pre-allocate a few shooting star objects
    for (let i = 0; i < 3; i++) {
      const g = new Graphics();
      g.visible = false;
      this.container.addChild(g);
      this.stars.push({
        graphic: g,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 0,
        active: false,
      });
    }
  }

  update(deltaMs: number) {
    this.timer += deltaMs;

    // Spawn new shooting star
    if (this.timer > this.nextSpawn) {
      this.timer = 0;
      this.nextSpawn = 8000 + Math.random() * 7000;
      this.spawn();
    }

    // Update active stars
    for (const s of this.stars) {
      if (!s.active) continue;

      s.life += deltaMs;
      s.x += s.vx;
      s.y += s.vy;

      const progress = s.life / s.maxLife;

      if (progress >= 1) {
        s.active = false;
        s.graphic.visible = false;
        continue;
      }

      // Draw trail
      const alpha = progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7;
      const tailLen = 15 + 20 * (1 - progress);

      s.graphic.clear();
      s.graphic
        .moveTo(s.x, s.y)
        .lineTo(s.x - s.vx * tailLen * 0.1, s.y - s.vy * tailLen * 0.1)
        .stroke({
          color: 0xffffff,
          width: 1.5,
          alpha: alpha * 0.8,
        });

      // Bright head dot
      s.graphic.circle(s.x, s.y, 1).fill({
        color: 0xffffff,
        alpha: alpha,
      });

      s.graphic.visible = true;
    }
  }

  private spawn() {
    // Find an inactive star
    const star = this.stars.find((s) => !s.active);
    if (!star) return;

    // Start from upper portion of sky, move diagonally
    star.x = 100 + Math.random() * (VIEWPORT_WIDTH - 200);
    star.y = 20 + Math.random() * 80;
    const angle = 0.3 + Math.random() * 0.4; // shallow diagonal
    const speed = 4 + Math.random() * 3;
    star.vx = Math.cos(angle) * speed;
    star.vy = Math.sin(angle) * speed;
    star.life = 0;
    star.maxLife = 400 + Math.random() * 300; // 0.4-0.7s
    star.active = true;
    star.graphic.clear();
    star.graphic.visible = true;
  }
}

// ============================================================
// DUST MOTES (floating between layers)
// ============================================================

interface Mote {
  graphic: Graphics;
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
}

export class DustMotes {
  container: Container;
  private motes: Mote[] = [];

  constructor(count = 25) {
    this.container = new Container();

    for (let i = 0; i < count; i++) {
      const g = new Graphics();
      const size = 0.5 + Math.random() * 1;
      g.circle(0, 0, size).fill({
        color: 0xccccdd,
        alpha: 0.1 + Math.random() * 0.15,
      });

      const mote: Mote = {
        graphic: g,
        x: Math.random() * VIEWPORT_WIDTH,
        y: 100 + Math.random() * (GROUND_Y - 150),
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.08,
        phase: Math.random() * Math.PI * 2,
      };
      g.x = mote.x;
      g.y = mote.y;
      this.container.addChild(g);
      this.motes.push(mote);
    }
  }

  update(time: number) {
    for (const m of this.motes) {
      // Gentle drift with sine wobble
      m.x += m.vx + Math.sin(time * 0.0005 + m.phase) * 0.05;
      m.y += m.vy + Math.cos(time * 0.0003 + m.phase) * 0.03;

      // Wrap around viewport
      if (m.x < -10) m.x = VIEWPORT_WIDTH + 10;
      if (m.x > VIEWPORT_WIDTH + 10) m.x = -10;
      if (m.y < 80) m.y = GROUND_Y - 50;
      if (m.y > GROUND_Y - 50) m.y = 80;

      m.graphic.x = m.x;
      m.graphic.y = m.y;

      // Subtle brightness pulse
      m.graphic.alpha =
        0.08 + 0.12 * Math.abs(Math.sin(time * 0.001 + m.phase));
    }
  }
}

// ============================================================
// FOOTSTEP DUST PUFFS
// ============================================================

interface DustPuff {
  graphic: Graphics;
  x: number;
  y: number;
  life: number;
  maxLife: number;
  active: boolean;
  scale: number;
}

export class FootstepDust {
  container: Container;
  private puffs: DustPuff[] = [];
  private cooldown = 0;

  constructor() {
    this.container = new Container();
    // Pre-allocate puffs
    for (let i = 0; i < 8; i++) {
      const g = new Graphics();
      g.circle(0, 0, 4).fill({ color: 0xaaaabb, alpha: 0.5 });
      g.visible = false;
      this.container.addChild(g);
      this.puffs.push({
        graphic: g,
        x: 0, y: 0,
        life: 0, maxLife: 300,
        active: false, scale: 1,
      });
    }
  }

  update(deltaMs: number, playerX: number, isMoving: boolean) {
    this.cooldown -= deltaMs;

    // Spawn puff when walking
    if (isMoving && this.cooldown <= 0) {
      this.cooldown = 120; // every 120ms
      const puff = this.puffs.find((p) => !p.active);
      if (puff) {
        puff.active = true;
        puff.life = 0;
        puff.maxLife = 250 + Math.random() * 150;
        puff.x = playerX + (Math.random() - 0.5) * 8;
        puff.y = GROUND_Y + 10;
        puff.scale = 0.5 + Math.random() * 0.5;
        puff.graphic.visible = true;
      }
    }

    // Update active puffs
    for (const p of this.puffs) {
      if (!p.active) continue;
      p.life += deltaMs;
      const progress = p.life / p.maxLife;

      if (progress >= 1) {
        p.active = false;
        p.graphic.visible = false;
        continue;
      }

      // Rise and expand, fade out
      p.y -= 0.5;
      p.x += (Math.random() - 0.5) * 0.5; // slight horizontal drift
      const s = p.scale * (1 + progress * 2);
      p.graphic.scale.set(s);
      p.graphic.alpha = 0.4 * (1 - progress);
      p.graphic.x = p.x;
      p.graphic.y = p.y;
    }
  }
}

// ============================================================
// FOG WISPS
// ============================================================

interface FogWisp {
  graphic: Graphics;
  x: number;
  y: number;
  speed: number;
  width: number;
  phase: number;
}

export class FogWisps {
  container: Container;
  private wisps: FogWisp[] = [];

  constructor(count = 4) {
    this.container = new Container();

    for (let i = 0; i < count; i++) {
      const g = new Graphics();
      const wispWidth = 150 + Math.random() * 200;
      const wispHeight = 8 + Math.random() * 12;

      // Draw an elongated soft ellipse
      g.ellipse(0, 0, wispWidth / 2, wispHeight / 2).fill({
        color: 0x8899aa,
        alpha: 0.12 + Math.random() * 0.08,
      });

      const wisp: FogWisp = {
        graphic: g,
        x: Math.random() * VIEWPORT_WIDTH,
        y: 200 + Math.random() * (GROUND_Y - 250),
        speed: 0.08 + Math.random() * 0.12,
        width: wispWidth,
        phase: Math.random() * Math.PI * 2,
      };
      g.x = wisp.x;
      g.y = wisp.y;
      this.container.addChild(g);
      this.wisps.push(wisp);
    }
  }

  update(time: number) {
    for (const w of this.wisps) {
      w.x += w.speed;

      // Wrap
      if (w.x > VIEWPORT_WIDTH + w.width) {
        w.x = -w.width;
        w.y = 200 + Math.random() * (GROUND_Y - 250);
      }

      // Gentle vertical drift
      w.graphic.x = w.x;
      w.graphic.y = w.y + Math.sin(time * 0.0003 + w.phase) * 5;
      w.graphic.alpha = 0.1 + 0.06 * Math.sin(time * 0.0005 + w.phase);
    }
  }
}

// ============================================================
// BUILDING DOOR GLOW (when player is near)
// ============================================================

export class DoorGlows {
  container: Container;
  private glows: { sprite: Sprite; doorX: number; alpha: number }[] = [];

  constructor() {
    this.container = new Container();
    const tex = this.createDoorGlowTexture();

    for (const b of buildingConfigs) {
      const sprite = new Sprite(tex);
      sprite.anchor.set(0.5, 1);
      sprite.x = b.doorX;
      sprite.y = GROUND_Y + 5;
      sprite.scale.set(0.6, 0.4);
      sprite.alpha = 0;
      this.container.addChild(sprite);

      this.glows.push({ sprite, doorX: b.doorX, alpha: 0 });
    }
  }

  private createDoorGlowTexture(): Texture {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createRadialGradient(64, 0, 0, 64, 0, 80);
    grad.addColorStop(0, "rgba(255, 220, 150, 0.35)");
    grad.addColorStop(0.5, "rgba(255, 200, 100, 0.1)");
    grad.addColorStop(1, "rgba(255, 180, 80, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 64);
    return Texture.from(canvas);
  }

  update(playerX: number) {
    for (const g of this.glows) {
      const dist = Math.abs(playerX - g.doorX);
      const targetAlpha = dist < INTERACTION_WIDTH * 2 ?
        Math.max(0, 1 - dist / (INTERACTION_WIDTH * 2)) * 0.7 : 0;

      // Smooth interpolation
      g.alpha += (targetAlpha - g.alpha) * 0.05;
      g.sprite.alpha = g.alpha;
    }
  }
}

// ============================================================
// HEADLIGHT SWEEP (light across background buildings)
// ============================================================

export class HeadlightSweep {
  container: Container;
  private beam: Graphics;
  private beamX = -200;
  private active = false;
  private timer = 0;
  private nextSpawn = 15000 + Math.random() * 15000; // 15-30s
  private speed = 0;
  private beamAlpha = 0;

  constructor() {
    this.container = new Container();
    this.beam = new Graphics();
    this.beam.visible = false;
    this.container.addChild(this.beam);
  }

  update(deltaMs: number) {
    this.timer += deltaMs;

    if (!this.active) {
      if (this.timer > this.nextSpawn) {
        // Start sweep
        this.active = true;
        this.timer = 0;
        this.beamX = -100;
        this.speed = 2 + Math.random() * 2;
        this.beam.visible = true;
      }
      return;
    }

    // Move beam across
    this.beamX += this.speed;

    // Fade in at start, fade out at end
    if (this.beamX < 0) {
      this.beamAlpha = (this.beamX + 100) / 100;
    } else if (this.beamX > VIEWPORT_WIDTH - 100) {
      this.beamAlpha = (VIEWPORT_WIDTH - this.beamX) / 100;
    } else {
      this.beamAlpha = 1;
    }

    // Draw beam — a tall narrow gradient that lights up background buildings
    this.beam.clear();
    this.beam
      .rect(this.beamX - 30, 50, 60, GROUND_Y - 60)
      .fill({ color: 0xffeedd, alpha: 0.03 * Math.max(0, this.beamAlpha) });
    this.beam
      .rect(this.beamX - 10, 80, 20, GROUND_Y - 90)
      .fill({ color: 0xffffff, alpha: 0.05 * Math.max(0, this.beamAlpha) });

    // End sweep
    if (this.beamX > VIEWPORT_WIDTH + 100) {
      this.active = false;
      this.beam.visible = false;
      this.nextSpawn = 15000 + Math.random() * 15000;
    }
  }
}
