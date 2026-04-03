import {
  Container,
  Graphics,
  Sprite,
  Assets,
  Texture,
  AnimatedSprite,
  Text,
  TextStyle,
  Rectangle,
} from "pixi.js";
import {
  VIEWPORT_WIDTH,
  VIEWPORT_HEIGHT,
  GROUND_Y,
} from "@/data/buildings";
import { DialogBox } from "./DialogBox";

export class FightingRingScene {
  container: Container;
  roomContainer: Container;

  // Room geometry
  private readonly roomWidth = 500;
  private readonly roomHeight = 200;
  readonly roomLeft: number;
  readonly roomRight: number;
  readonly floorY = GROUND_Y;

  // Character bounds
  charMinX: number;
  charMaxX: number;

  // Door
  private doorX = 0;
  private readonly doorInteractionRange = 40;
  private doorPrompt: Container | null = null;

  // State
  private _shouldExit = false;
  private _shouldNavigate: string | null = null;
  private interactCooldownMs = 0;

  // Glow effects
  private glowSprites: { sprite: Graphics; baseAlpha: number; color: number }[] = [];

  // Robot animation
  private robotAnim: AnimatedSprite | null = null;

  // Dialog
  private dialog: DialogBox | null = null;

  // Desk interaction
  private deskX = 0;
  private readonly deskInteractionRange = 60;
  private deskPrompt: Container | null = null;

  constructor() {
    this.container = new Container();
    this.roomContainer = new Container();
    this.container.addChild(this.roomContainer);

    // Center room
    this.roomLeft = (VIEWPORT_WIDTH - this.roomWidth) / 2;
    this.roomRight = this.roomLeft + this.roomWidth;

    // Door on the left
    this.doorX = this.roomLeft + 30;

    // Desk to the left of robots
    this.deskX = this.roomLeft + 340;

    // Character bounds: past door on left, stop before robots on right
    this.charMinX = this.roomLeft + 15;
    this.charMaxX = this.roomLeft + 380;

    this.drawRoom();
  }

  private drawRoom(): void {
    // Just wall edges — the actual room background comes from the tileset sprite
    const g = new Graphics();
    const wallTop = this.floorY - this.roomHeight;

    // Left wall edge
    g.rect(this.roomLeft, wallTop - 6, 3, this.roomHeight + 6 + (VIEWPORT_HEIGHT - this.floorY));
    g.fill(0x4a4f58);
    // Right wall edge
    g.rect(this.roomRight - 3, wallTop - 6, 3, this.roomHeight + 6 + (VIEWPORT_HEIGHT - this.floorY));
    g.fill(0x4a4f58);
    // Ceiling beam
    g.rect(this.roomLeft, wallTop - 6, this.roomWidth, 6);
    g.fill(0x5a5f68);

    this.roomContainer.addChild(g);
  }

  async loadAssets(): Promise<void> {
    const basePath = "/assets/interiors/fighting-ring";

    // --- Room background from PixelLab tileset export (736x320) ---
    try {
      const bgTex = await Assets.load(`${basePath}/room-bg.png`);
      const bg = new Sprite(bgTex);
      // Scale to fit room width
      const scale = this.roomWidth / 736;
      bg.scale.set(scale);
      // The composite's floor line is at ~68% from top (y≈218 of 320)
      // Position so that line aligns with this.floorY
      const floorLineInImage = 218;
      bg.x = this.roomLeft;
      bg.y = this.floorY - floorLineInImage * scale;
      this.roomContainer.addChildAt(bg, 0);
    } catch {
      console.warn("Failed to load room background");
    }

    // --- Door (left side) ---
    try {
      const doorTex = await Assets.load(`${basePath}/door.png`);
      const door = new Sprite(doorTex);
      door.anchor.set(0.5, 1);
      door.scale.set(1.4);
      door.x = this.doorX;
      door.y = this.floorY;
      this.roomContainer.addChild(door);
    } catch {
      console.warn("Failed to load door sprite");
    }

    // --- Display board (wall, between door and desk) ---
    try {
      const boardTex = await Assets.load(`${basePath}/display-board.png`);
      const board = new Sprite(boardTex);
      board.anchor.set(0.5, 0);
      board.scale.set(1.3);
      board.x = this.roomLeft + 170;
      board.y = this.floorY - this.roomHeight + 20;
      this.roomContainer.addChild(board);

      // Subtle green glow from the display
      this.addGlowEffect(this.roomLeft + 170, this.floorY - this.roomHeight + 55, 0x44cc66, 30);
    } catch {
      console.warn("Failed to load display board sprite");
    }

    // --- Desk with monitors (left of robots) ---
    try {
      const deskTex = await Assets.load(`${basePath}/desk.png`);
      const desk = new Sprite(deskTex);
      desk.anchor.set(0.5, 1);
      desk.scale.set(1.5);
      desk.x = this.deskX;
      desk.y = this.floorY;
      this.roomContainer.addChild(desk);

      // Monitor glow from the desk screens
      this.addGlowEffect(this.deskX, this.floorY - 50, 0x6699cc, 25);
    } catch {
      console.warn("Failed to load desk sprite");
    }

    // --- Robot fight animation (far right) ---
    try {
      const sheetTex = await Assets.load(`${basePath}/robot-fight-sheet.png`);
      const frameW = 64;
      const frameH = 64;
      const frames: Texture[] = [];

      // 3x3 grid, 9 frames
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const rect = new Rectangle(col * frameW, row * frameH, frameW, frameH);
          const frameTex = new Texture({ source: sheetTex.source, frame: rect });
          frames.push(frameTex);
        }
      }

      this.robotAnim = new AnimatedSprite(frames);
      this.robotAnim.anchor.set(0.5, 1);
      this.robotAnim.scale.set(2.2);
      this.robotAnim.x = this.roomLeft + 440;
      this.robotAnim.y = this.floorY;
      this.robotAnim.animationSpeed = 0.08;
      this.robotAnim.play();
      this.roomContainer.addChild(this.robotAnim);

      // Ring glow under robots — warm fight arena light
      this.addGlowEffect(this.roomLeft + 440, this.floorY - 40, 0xff6644, 40);
    } catch {
      console.warn("Failed to load robot fight spritesheet");
    }

    // --- Lava lamps (two, positioned in front for depth) ---
    try {
      const lampTex = await Assets.load(`${basePath}/lava-lamp.png`);

      // Lamp 1: left-center area
      const lamp1 = new Sprite(lampTex);
      lamp1.anchor.set(0.5, 1);
      lamp1.scale.set(1.5);
      lamp1.x = this.roomLeft + 110;
      lamp1.y = this.floorY + 20; // slightly down for depth
      lamp1.zIndex = 10;
      this.roomContainer.addChild(lamp1);

      // Lamp 2: right-center area
      const lamp2 = new Sprite(lampTex);
      lamp2.anchor.set(0.5, 1);
      lamp2.scale.set(1.5);
      lamp2.x = this.roomLeft + 280;
      lamp2.y = this.floorY + 20; // slightly down for depth
      lamp2.zIndex = 10;
      this.roomContainer.addChild(lamp2);

      // Enable sorting so lamps render in front
      this.roomContainer.sortableChildren = true;

      // Red lava lamp glow effects — warm pulsing red light
      // Each lamp gets two glow layers: a tight bright core and a wider ambient
      this.addLavaGlow(this.roomLeft + 110, this.floorY - 20, 18, 35);
      this.addLavaGlow(this.roomLeft + 280, this.floorY - 20, 18, 35);
    } catch {
      console.warn("Failed to load lava lamp sprite");
    }

    // --- Door exit prompt ---
    this.doorPrompt = this.createPrompt("Press E to exit");
    this.doorPrompt.visible = false;
    this.doorPrompt.x = this.doorX;
    this.doorPrompt.y = this.floorY - 85;
    this.roomContainer.addChild(this.doorPrompt);

    // --- Desk interaction prompt ---
    this.deskPrompt = this.createPrompt("Press E to read");
    this.deskPrompt.visible = false;
    this.deskPrompt.x = this.deskX;
    this.deskPrompt.y = this.floorY - 75;
    this.roomContainer.addChild(this.deskPrompt);
  }

  /** Add a lava lamp glow: tight red core + wider ambient spread */
  private addLavaGlow(x: number, y: number, coreR: number, ambientR: number): void {
    // Tight bright core
    const core = new Graphics();
    core.circle(0, 0, coreR);
    core.fill({ color: 0xff2200, alpha: 0.18 });
    core.x = x;
    core.y = y;
    this.roomContainer.addChild(core);
    this.glowSprites.push({ sprite: core, baseAlpha: 0.18, color: 0xff2200 });

    // Wider ambient spread
    const ambient = new Graphics();
    ambient.circle(0, 0, ambientR);
    ambient.fill({ color: 0xff4422, alpha: 0.08 });
    ambient.x = x;
    ambient.y = y + 10;
    this.roomContainer.addChild(ambient);
    this.glowSprites.push({ sprite: ambient, baseAlpha: 0.08, color: 0xff4422 });

    // Upward light cast on wall behind lamp
    const wallGlow = new Graphics();
    wallGlow.ellipse(0, 0, ambientR * 0.8, ambientR * 1.2);
    wallGlow.fill({ color: 0xff3311, alpha: 0.06 });
    wallGlow.x = x;
    wallGlow.y = y - 50;
    this.roomContainer.addChild(wallGlow);
    this.glowSprites.push({ sprite: wallGlow, baseAlpha: 0.06, color: 0xff3311 });
  }

  private addGlowEffect(x: number, y: number, color: number, radius: number): void {
    const glow = new Graphics();
    glow.circle(0, 0, radius);
    glow.fill({ color, alpha: 0.15 });
    glow.x = x;
    glow.y = y;
    this.roomContainer.addChild(glow);
    this.glowSprites.push({ sprite: glow, baseAlpha: 0.15, color });
  }

  private updateGlows(): void {
    const t = Date.now() * 0.003;
    for (const { sprite, baseAlpha, color } of this.glowSprites) {
      // Lava lamps get a more organic, slower pulse
      if (color === 0xff2200 || color === 0xff4422 || color === 0xff3311) {
        // Organic lava bubble rhythm — two sine waves for irregular pulse
        sprite.alpha = baseAlpha + Math.sin(t * 0.8) * 0.04 + Math.sin(t * 1.7) * 0.02;
      } else {
        sprite.alpha = baseAlpha + Math.sin(t) * 0.05;
      }
    }
  }

  private createPrompt(text: string): Container {
    const prompt = new Container();

    const bg = new Graphics();
    bg.roundRect(-40, -14, 80, 18, 4).fill({ color: 0x000000, alpha: 0.75 });
    prompt.addChild(bg);

    const style = new TextStyle({
      fontFamily: "monospace",
      fontSize: 9,
      fill: "#ffffff",
      align: "center",
    });
    const t = new Text({ text, style });
    t.anchor.set(0.5, 0.5);
    t.y = -5;
    prompt.addChild(t);

    return prompt;
  }

  get shouldExit(): boolean {
    return this._shouldExit;
  }

  get shouldNavigate(): string | null {
    return this._shouldNavigate;
  }

  update(deltaMs: number, characterX: number, isInteracting: boolean): void {
    if (this.interactCooldownMs > 0) {
      this.interactCooldownMs -= deltaMs;
    }

    // Update glows
    this.updateGlows();

    // Dialog active
    if (this.dialog) {
      this.dialog.update(deltaMs, isInteracting && this.interactCooldownMs <= 0);
      if (this.dialog.isDismissed) {
        this.dialog.destroy();
        this.roomContainer.removeChild(this.dialog.container);
        this.dialog = null;
        this._shouldNavigate = "/colm-paper";
      }
      return;
    }

    // Door exit check
    const doorDist = Math.abs(characterX - this.doorX);
    const nearDoor = doorDist < this.doorInteractionRange;

    if (this.doorPrompt) {
      this.doorPrompt.visible = nearDoor;
      if (nearDoor) {
        this.doorPrompt.y = this.floorY - 85 + Math.sin(Date.now() * 0.004) * 2;
      }
    }

    if (nearDoor && isInteracting && this.interactCooldownMs <= 0) {
      this.interactCooldownMs = 500;
      this._shouldExit = true;
      return;
    }

    // Desk interaction check
    const deskDist = Math.abs(characterX - this.deskX);
    const nearDesk = deskDist < this.deskInteractionRange;

    if (this.deskPrompt) {
      this.deskPrompt.visible = nearDesk;
      if (nearDesk) {
        this.deskPrompt.y = this.floorY - 75 + Math.sin(Date.now() * 0.004) * 2;
      }
    }

    if (nearDesk && isInteracting && this.interactCooldownMs <= 0) {
      this.interactCooldownMs = 500;
      this.dialog = new DialogBox(
        "COLM 2025: Multi-Agent Social Simulation with LLMs...",
        this.deskX,
        this.floorY - 70,
      );
      this.roomContainer.addChild(this.dialog.container);
      if (this.deskPrompt) this.deskPrompt.visible = false;
    }
  }

  destroy(): void {
    if (this.dialog) {
      this.dialog.destroy();
      this.dialog = null;
    }
    if (this.robotAnim) {
      this.robotAnim.stop();
    }
    this.container.destroy({ children: true });
  }
}
