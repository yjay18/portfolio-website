import {
  AnimatedSprite,
  Container,
  Texture,
  Assets,
  Graphics,
} from "pixi.js";
import { GROUND_Y, WORLD_WIDTH, CHARACTER_SCALE } from "@/data/buildings";

type CharState = "idle" | "walk-left" | "walk-right";

export class Character {
  container: Container;
  x: number;
  private state: CharState = "idle";
  private speed = 4; // slightly faster for the wider world
  private minX = 20;
  private maxX = WORLD_WIDTH - 20;
  private keys: Record<string, boolean> = {};
  private onKeyDown: (e: KeyboardEvent) => void;
  private onKeyUp: (e: KeyboardEvent) => void;

  private idleSprite: AnimatedSprite | null = null;
  private walkSprite: AnimatedSprite | null = null;

  constructor(spawnX: number) {
    this.container = new Container();
    this.x = spawnX;
    this.container.x = spawnX;
    this.container.y = GROUND_Y + 17; // 11px padding * 1.3 scale + ground cover sink

    // Shadow blob (scaled)
    const shadow = new Graphics();
    shadow.ellipse(0, 0, 14, 5).fill({ color: 0x000000, alpha: 0.3 });
    shadow.y = 0;
    this.container.addChild(shadow);

    this.onKeyDown = (e) => {
      this.keys[e.key.toLowerCase()] = true;
    };
    this.onKeyUp = (e) => {
      this.keys[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  async loadSprites() {
    try {
      const walkFrames: Texture[] = [];
      for (let i = 0; i < 6; i++) {
        const tex = await Assets.load(
          `/assets/character/animations/walk/east/frame_00${i}.png`,
        );
        walkFrames.push(tex);
      }
      this.walkSprite = new AnimatedSprite(walkFrames);
      this.walkSprite.anchor.set(0.5, 1);
      this.walkSprite.scale.set(CHARACTER_SCALE);
      this.walkSprite.animationSpeed = 0.15;
      this.walkSprite.play();
      this.walkSprite.visible = false;
      this.container.addChild(this.walkSprite);

      const idleFrames: Texture[] = [];
      for (let i = 0; i < 4; i++) {
        const tex = await Assets.load(
          `/assets/character/animations/breathing-idle/south/frame_00${i}.png`,
        );
        idleFrames.push(tex);
      }
      this.idleSprite = new AnimatedSprite(idleFrames);
      this.idleSprite.anchor.set(0.5, 1);
      this.idleSprite.scale.set(CHARACTER_SCALE);
      this.idleSprite.animationSpeed = 0.08;
      this.idleSprite.play();
      this.container.addChild(this.idleSprite);
    } catch {
      const placeholder = new Graphics();
      placeholder.rect(-15, -40, 30, 40).fill(0x333333);
      this.container.addChild(placeholder);
    }
  }

  update(): number {
    let dx = 0;
    if (this.keys["a"] || this.keys["arrowleft"]) dx -= this.speed;
    if (this.keys["d"] || this.keys["arrowright"]) dx += this.speed;

    this.x = Math.max(this.minX, Math.min(this.maxX, this.x + dx));
    this.container.x = this.x;

    const newState: CharState =
      dx < 0 ? "walk-left" : dx > 0 ? "walk-right" : "idle";

    if (newState !== this.state) {
      this.state = newState;
      this.updateVisibility();
    }

    // Mirror for left walking — only flip x, keep y scale
    if (this.state === "walk-left") {
      this.container.scale.x = -1;
    } else {
      this.container.scale.x = 1;
    }

    return dx;
  }

  private updateVisibility() {
    const walking = this.state !== "idle";
    if (this.walkSprite) {
      this.walkSprite.visible = walking;
      if (walking && !this.walkSprite.playing) this.walkSprite.play();
    }
    if (this.idleSprite) {
      this.idleSprite.visible = !walking;
    }
  }

  isInteracting(): boolean {
    return this.keys["e"] || this.keys["enter"];
  }

  isPressingUp(): boolean {
    return this.keys["w"] || this.keys["arrowup"];
  }

  isPressingDown(): boolean {
    return this.keys["s"] || this.keys["arrowdown"];
  }

  snapTo(x: number) {
    this.x = x;
    this.container.x = x;
  }

  setBounds(min: number, max: number) {
    this.minX = min;
    this.maxX = max;
  }

  resetBounds() {
    this.minX = 20;
    this.maxX = WORLD_WIDTH - 20;
  }

  destroy() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }
}
