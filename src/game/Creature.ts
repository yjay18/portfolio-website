import { Container, Assets, AnimatedSprite, Texture } from "pixi.js";
import { GROUND_Y, CHARACTER_SCALE } from "@/data/buildings";

type CatState = "sleeping" | "waking" | "walking" | "idle";

const CAT_SCALE = CHARACTER_SCALE * 0.8;
const WAKE_RADIUS = 250; // px — how close player must be to wake cat
const ACTIVE_DURATION = 15000; // 15s active after waking
const WALK_MIN = 2000;
const WALK_MAX = 4000;
const IDLE_MIN = 1500;
const IDLE_MAX = 3000;

export class Creature {
  container: Container;
  private x: number;
  private homeX: number; // where the cat sleeps
  private speed: number;
  private minX: number;
  private maxX: number;
  private direction = 1;
  private runSprite: AnimatedSprite | null = null;
  private idleSprite: AnimatedSprite | null = null;
  private sleepSprite: AnimatedSprite | null = null;
  private state: CatState = "sleeping";
  private stateTimer = 0;
  private activeTimer = 0; // total time awake
  private subDuration = 0; // walk/idle sub-duration

  constructor(
    startX: number,
    minX: number,
    maxX: number,
    speed: number,
  ) {
    this.container = new Container();
    this.x = startX;
    this.homeX = startX;
    this.minX = minX;
    this.maxX = maxX;
    this.speed = speed;
    this.container.y = GROUND_Y + 30;
    this.container.x = startX;
  }

  async loadCatSprites() {
    try {
      // Running
      const runFrames: Texture[] = [];
      for (let i = 0; i < 4; i++) {
        runFrames.push(
          await Assets.load(
            `/assets/creatures/cat/animations/running-4-frames/east/frame_00${i}.png`,
          ),
        );
      }
      this.runSprite = new AnimatedSprite(runFrames);
      this.runSprite.anchor.set(0.5, 1);
      this.runSprite.scale.set(CAT_SCALE);
      this.runSprite.animationSpeed = 0.1;
      this.runSprite.visible = false;
      this.container.addChild(this.runSprite);

      // Idle
      try {
        const idleFrames: Texture[] = [];
        for (let i = 0; i < 8; i++) {
          idleFrames.push(
            await Assets.load(
              `/assets/creatures/cat/animations/idle/east/frame_00${i}.png`,
            ),
          );
        }
        this.idleSprite = new AnimatedSprite(idleFrames);
        this.idleSprite.anchor.set(0.5, 1);
        this.idleSprite.scale.set(CAT_SCALE);
        this.idleSprite.animationSpeed = 0.06;
        this.idleSprite.visible = false;
        this.container.addChild(this.idleSprite);
      } catch {
        // idle animation optional
      }

      // Sleeping
      try {
        const sleepFrames: Texture[] = [];
        // Load up to 10 frames
        for (let i = 0; i < 10; i++) {
          try {
            sleepFrames.push(
              await Assets.load(
                `/assets/creatures/cat/animations/seated-on-belly-idle/east/frame_00${i}.png`,
              ),
            );
          } catch {
            break;
          }
        }
        if (sleepFrames.length > 0) {
          this.sleepSprite = new AnimatedSprite(sleepFrames);
          this.sleepSprite.anchor.set(0.5, 1);
          this.sleepSprite.scale.set(CAT_SCALE);
          this.sleepSprite.animationSpeed = 0.03; // slow breathing
          this.sleepSprite.play();
          this.sleepSprite.visible = true; // start sleeping
          this.container.addChild(this.sleepSprite);
        }
      } catch {
        // sleep animation optional
      }
    } catch {
      console.warn("Failed to load cat sprites");
    }
  }

  update(deltaMs: number, playerX: number) {
    this.stateTimer += deltaMs;

    switch (this.state) {
      case "sleeping":
        this.updateSleeping(playerX);
        break;
      case "waking":
        this.updateWaking();
        break;
      case "walking":
        this.updateWalking(deltaMs);
        break;
      case "idle":
        this.updateIdle(deltaMs);
        break;
    }
  }

  private updateSleeping(playerX: number) {
    // Wake up when player gets close
    const dist = Math.abs(playerX - this.x);
    if (dist < WAKE_RADIUS) {
      this.state = "waking";
      this.stateTimer = 0;
      this.activeTimer = 0;
      this.showSprite("idle");
    }
  }

  private updateWaking() {
    // Brief pause before moving (looks at player)
    if (this.stateTimer > 500) {
      this.state = "walking";
      this.stateTimer = 0;
      this.subDuration = WALK_MIN + Math.random() * (WALK_MAX - WALK_MIN);
      this.direction = Math.random() > 0.5 ? 1 : -1;
      this.showSprite("run");
    }
  }

  private updateWalking(deltaMs: number) {
    this.activeTimer += deltaMs;

    // Random speed variation
    const spd = this.speed * (0.7 + Math.random() * 0.6);
    this.x += spd * this.direction;

    if (this.x >= this.maxX) {
      this.x = this.maxX;
      this.direction = -1;
    } else if (this.x <= this.minX) {
      this.x = this.minX;
      this.direction = 1;
    }
    this.container.x = this.x;
    this.container.scale.x = this.direction > 0 ? 1 : -1;

    // Switch to idle after sub-duration
    if (this.stateTimer > this.subDuration) {
      this.state = "idle";
      this.stateTimer = 0;
      this.subDuration = IDLE_MIN + Math.random() * (IDLE_MAX - IDLE_MIN);
      this.showSprite("idle");
    }

    // Go back to sleep after active duration
    if (this.activeTimer > ACTIVE_DURATION) {
      this.goToSleep();
    }
  }

  private updateIdle(deltaMs: number) {
    this.activeTimer += deltaMs;

    // Switch back to walking
    if (this.stateTimer > this.subDuration) {
      this.state = "walking";
      this.stateTimer = 0;
      this.subDuration = WALK_MIN + Math.random() * (WALK_MAX - WALK_MIN);
      // Random direction change
      if (Math.random() > 0.5) this.direction *= -1;
      this.showSprite("run");
    }

    // Go back to sleep after active duration
    if (this.activeTimer > ACTIVE_DURATION) {
      this.goToSleep();
    }
  }

  private goToSleep() {
    this.state = "sleeping";
    this.stateTimer = 0;
    this.activeTimer = 0;
    this.showSprite("sleep");
  }

  private showSprite(which: "run" | "idle" | "sleep") {
    if (this.runSprite) {
      this.runSprite.visible = which === "run";
      if (which === "run") this.runSprite.play();
      else this.runSprite.stop();
    }
    if (this.idleSprite) {
      this.idleSprite.visible = which === "idle";
      if (which === "idle") this.idleSprite.play();
      else this.idleSprite.stop();
    }
    if (this.sleepSprite) {
      this.sleepSprite.visible = which === "sleep";
      if (which === "sleep") this.sleepSprite.play();
      else this.sleepSprite.stop();
    }
  }
}
