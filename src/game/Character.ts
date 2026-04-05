import {
  AnimatedSprite,
  Container,
  Texture,
  Assets,
  Graphics,
} from "pixi.js";
import { GROUND_Y, WORLD_WIDTH, CHARACTER_SCALE } from "@/data/buildings";

type Facing = "north" | "south" | "east" | "west";
type CharState = "idle" | "walk";

export class Character {
  container: Container;
  x: number;
  private state: CharState = "idle";
  private facing: Facing = "south";
  private speed = 4; // restored per request
  private minX = 20;
  private maxX = WORLD_WIDTH - 20;
  private keys: Record<string, boolean> = {};
  private onKeyDown: (e: KeyboardEvent) => void;
  private onKeyUp: (e: KeyboardEvent) => void;

  private idleSprites: Partial<Record<Facing, AnimatedSprite>> = {};
  private walkSprites: Partial<Record<Facing, AnimatedSprite>> = {};

  constructor(spawnX: number) {
    this.container = new Container();
    this.x = spawnX;
    this.container.x = spawnX;
    this.container.y = GROUND_Y + 17; // 11px padding * 1.3 scale + ground cover sink

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
      const directions: Facing[] = ["south", "east", "west", "north"];

      for (const direction of directions) {
        const walkFrames: Texture[] = [];
        for (let i = 0; i < 6; i++) {
          const tex = await Assets.load(
            `/assets/character/animations/walk/${direction}/frame_00${i}.png`,
          );
          walkFrames.push(tex);
        }

        const walkSprite = new AnimatedSprite(walkFrames);
        walkSprite.anchor.set(0.5, 1);
        walkSprite.scale.set(CHARACTER_SCALE);
        walkSprite.animationSpeed = 0.15;
        walkSprite.visible = false;
        this.walkSprites[direction] = walkSprite;
        this.container.addChild(walkSprite);

        const idleFrames: Texture[] = [];
        for (let i = 0; i < 4; i++) {
          const tex = await Assets.load(
            `/assets/character/animations/breathing-idle/${direction}/frame_00${i}.png`,
          );
          idleFrames.push(tex);
        }

        const idleSprite = new AnimatedSprite(idleFrames);
        idleSprite.anchor.set(0.5, 1);
        idleSprite.scale.set(CHARACTER_SCALE);
        idleSprite.animationSpeed = 0.08;
        idleSprite.visible = false;
        this.idleSprites[direction] = idleSprite;
        this.container.addChild(idleSprite);
      }

      this.updateVisibility();
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

    const prevFacing = this.facing;
    if (dx < 0) {
      this.facing = "west";
    } else if (dx > 0) {
      this.facing = "east";
    }

    const newState: CharState = dx === 0 ? "idle" : "walk";
    if (newState !== this.state || prevFacing !== this.facing) {
      this.state = newState;
      this.updateVisibility();
    }

    return dx;
  }

  private updateVisibility() {
    const activeIdle = this.idleSprites[this.facing] ?? null;
    const activeWalk = this.walkSprites[this.facing] ?? null;

    for (const sprite of Object.values(this.idleSprites)) {
      if (!sprite) continue;
      sprite.visible = false;
      if (sprite.playing) sprite.stop();
    }

    for (const sprite of Object.values(this.walkSprites)) {
      if (!sprite) continue;
      sprite.visible = false;
      if (sprite.playing) sprite.stop();
    }

    if (this.state === "walk" && activeWalk) {
      activeWalk.visible = true;
      if (!activeWalk.playing) activeWalk.play();
    }

    if (this.state === "idle" && activeIdle) {
      activeIdle.visible = true;
      if (!activeIdle.playing) activeIdle.play();
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
