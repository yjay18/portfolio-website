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

  // Room geometry — shop interior scale
  private readonly roomWidth = 480;
  private readonly roomHeight = 240;
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

  // Board interaction
  private boardX = 0;
  private readonly boardInteractionRange = 50;
  private boardPrompt: Container | null = null;

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
    this.deskX = this.roomLeft + 330;

    // Board between door and desk
    this.boardX = this.roomLeft + 185;

    // Character bounds: past door on left, stop before robots on right
    this.charMinX = this.roomLeft + 15;
    this.charMaxX = this.roomLeft + 370;

    this.drawRoom();
  }

  private drawRoom(): void {
    const g = new Graphics();
    const wallTop = this.floorY - this.roomHeight;
    const floorH = VIEWPORT_HEIGHT - this.floorY;

    // ── Back wall — dark brickwork ──
    g.rect(this.roomLeft, wallTop, this.roomWidth, this.roomHeight);
    g.fill(0x180c12); // Mortar base color

    const brickW = 32;
    const brickH = 16;
    for (let r = 0; r <= Math.ceil(this.roomHeight / brickH); r++) {
      for (let c = -1; c <= Math.ceil(this.roomWidth / brickW); c++) {
        // Offset alternate rows
        let x = this.roomLeft + c * brickW;
        if (r % 2 === 1) x += brickW / 2;
        const y = wallTop + r * brickH;

        if (x + brickW < this.roomLeft || x > this.roomRight) continue;

        // Draw individual brick
        const drawX = Math.max(this.roomLeft, x + 1);
        const finalW = Math.min(brickW - 2, this.roomRight - drawX);
        if (finalW <= 0) continue;

        // Subtle variation in brick color (purplish dark reds)
        const baseColor = (r * 17 + c * 31) % 3 === 0 ? 0x24141b : ((r * 11 + c * 7) % 2 === 0 ? 0x2d1a22 : 0x26141c);
        g.rect(drawX, y + 1, finalW, brickH - 2);
        g.fill(baseColor);

        // Brick top highlight
        g.rect(drawX, y + 1, finalW, 1);
        g.fill(0x3d2631);
        // Brick bottom shadow
        g.rect(drawX, y + brickH - 2, finalW, 1);
        g.fill(0x1a0e14);
      }
    }

    // ── Baseboard / wall-floor transition ──
    g.rect(this.roomLeft, this.floorY - 14, this.roomWidth, 14);
    g.fill(0x120a0e);
    g.rect(this.roomLeft, this.floorY - 14, this.roomWidth, 2);
    g.fill(0x2d1a22);
    // Vertical baseboard ribs
    for (let c = 0; c <= Math.floor(this.roomWidth / 24); c++) {
      g.rect(this.roomLeft + c * 24 + 10, this.floorY - 12, 4, 12);
      g.fill(0x1a0e14);
    }

    // ── Floor — Checkered dark shop floor ──
    g.rect(this.roomLeft, this.floorY, this.roomWidth, floorH);
    g.fill(0x100a0c);

    const fTile = 24;
    for (let r = 0; r < Math.ceil(floorH / fTile); r++) {
      for (let c = 0; c < Math.ceil(this.roomWidth / fTile); c++) {
        const x = this.roomLeft + c * fTile;
        const y = this.floorY + r * fTile;

        const drawX = Math.max(this.roomLeft, x);
        const finalW = Math.min(fTile, this.roomRight - drawX);
        if (finalW <= 0) continue;

        // Dark grey vs Dark red tiles
        const isDark = (r + c) % 2 === 0;
        const color = isDark ? 0x14161a : 0x221317;

        g.rect(drawX + 1, y + 1, finalW - 2, fTile - 2);
        g.fill(color);

        // Subtle tile highlight
        if (isDark) {
          g.rect(drawX + 1, y + 1, finalW - 2, 1);
          g.fill(0x202428);
        } else {
          g.rect(drawX + 1, y + 1, finalW - 2, 1);
          g.fill(0x2f1b21);
        }
      }
    }

    // Heavy separation floor line
    g.rect(this.roomLeft, this.floorY, this.roomWidth, 2);
    g.fill(0x0a0508);

    // ── Ceiling beam ──
    g.rect(this.roomLeft, wallTop - 12, this.roomWidth, 12);
    g.fill(0x120a0e);
    // Ceiling highlight
    g.rect(this.roomLeft, wallTop - 2, this.roomWidth, 2);
    g.fill(0x2d1a22);

    // ── Wall edges ──
    const totalH = this.roomHeight + 12 + floorH;
    // Left edge
    g.rect(this.roomLeft, wallTop - 12, 6, totalH);
    g.fill(0x120a0e);
    g.rect(this.roomLeft + 6, wallTop - 12, 2, totalH);
    g.fill(0x2d1a22);
    // Right edge
    g.rect(this.roomRight - 6, wallTop - 12, 6, totalH);
    g.fill(0x120a0e);
    g.rect(this.roomRight - 8, wallTop - 12, 2, totalH);
    g.fill(0x2d1a22);

    // ── Corner shadows and top down ambiance ──
    const corners = new Graphics();
    corners.rect(this.roomLeft + 8, wallTop, 40, this.roomHeight);
    corners.fill({ color: 0x000000, alpha: 0.35 });
    corners.rect(this.roomRight - 48, wallTop, 40, this.roomHeight);
    corners.fill({ color: 0x000000, alpha: 0.35 });

    // Global room vignette / top down lighting for arena mood
    corners.rect(this.roomLeft, wallTop, this.roomWidth, 60);
    corners.fill({ color: 0x000000, alpha: 0.4 });
    // And red ambient top light
    corners.rect(this.roomLeft, wallTop + 60, this.roomWidth, 40);
    corners.fill({ color: 0xff0000, alpha: 0.05 });

    this.roomContainer.addChild(g);
    this.roomContainer.addChild(corners);
  }

  async loadAssets(): Promise<void> {
    const basePath = "/assets/interiors/fighting-ring";

    // --- Door (left side) ---
    try {
      const doorTex = await Assets.load(`${basePath}/door.png`);
      const door = new Sprite(doorTex);
      door.anchor.set(0.5, 1);
      door.scale.set(1.4);
      door.x = this.doorX;
      door.y = this.floorY + 8; // fix door position
      this.roomContainer.addChild(door);
    } catch {
      console.warn("Failed to load door sprite");
    }

    // --- Display board (wall, between door and desk) ---
    try {
      const boardTex = await Assets.load(`${basePath}/display-board.png`);
      const board = new Sprite(boardTex);
      board.anchor.set(0.5, 0);
      board.scale.set(1.6); // slightly smaller
      board.x = this.roomLeft + 185;
      board.y = this.floorY - 150; // fixed position relative to floor
      this.roomContainer.addChild(board);

      // Subtle green glow from the display
      this.addGlowEffect(this.roomLeft + 185, this.floorY - 110, 0x44cc66, 40);
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
      desk.y = this.floorY + 18; // correctly mount desk on the floor
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
      this.robotAnim.scale.set(1.4); // Made smaller
      this.robotAnim.x = this.roomLeft + 430;
      // Added offset so the robots touch the ground instead of floating
      this.robotAnim.y = this.floorY + 22;
      this.robotAnim.animationSpeed = 0.08;
      this.robotAnim.play();
      this.roomContainer.addChild(this.robotAnim);

      // (No glow under robots per user request)
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
      lamp2.x = this.roomLeft + 260;
      lamp2.y = this.floorY + 20; // slightly down for depth
      lamp2.zIndex = 10;
      this.roomContainer.addChild(lamp2);

      // Enable sorting so lamps render in front
      this.roomContainer.sortableChildren = true;

      // Massive, soft red ambient light cast from lamps diffusing across the room
      this.addLavaGlow(this.roomLeft + 110, this.floorY - 60, 220);
      this.addLavaGlow(this.roomLeft + 260, this.floorY - 60, 220);
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

    // --- Board interaction prompt ---
    this.boardPrompt = this.createPrompt("Press E to run demo");
    this.boardPrompt.visible = false;
    this.boardPrompt.x = this.boardX;
    this.boardPrompt.y = this.floorY - 140;
    this.roomContainer.addChild(this.boardPrompt);
  }

  /** Add a massive, buttery smooth ambient red glow radiating from lava lamps */
  private addLavaGlow(x: number, y: number, maxSize: number): void {
    const glow = new Graphics();
    const layers = 40; // Heavily reduced from 40! 40 loops completely crashes Chromium WebGL context on load.
    const color = 0xff1100;

    for (let i = layers; i >= 1; i--) {
      const progress = i / layers;
      const radius = maxSize * progress;

      // Feather outer edge to 0 alpha for a perfect, band-less bleed
      // The outer-most circle (progress 1) gets ~0 alpha, center gets ~0.02
      // This creates a flawless Gaussian-like bloom
      const a = 0.025 * Math.pow(1 - progress, 1.5);

      glow.circle(0, 0, radius);
      glow.fill({ color, alpha: a });
    }

    glow.x = x;
    glow.y = y;
    this.roomContainer.addChild(glow);
    // BaseAlpha for pulsing needs to reflect a balanced alpha state
    this.glowSprites.push({ sprite: glow, baseAlpha: 0.6, color });
  }

  /** Ultra-soft diffused circular glow for monitors and boards */
  private addGlowEffect(x: number, y: number, color: number, radius: number): void {
    const glow = new Graphics();
    const layers = 5; // Heavily reduced from 30! 30 loops crashes Chromium WebGL.

    for (let i = layers; i >= 1; i--) {
      const progress = i / layers;
      const r = radius * progress;
      // Exponential zero-falloff for the board glows
      const a = 0.03 * Math.pow(1 - progress, 1.5);
      glow.circle(0, 0, r);
      glow.fill({ color, alpha: a });
    }

    glow.x = x;
    glow.y = y;
    this.roomContainer.addChild(glow);
    this.glowSprites.push({ sprite: glow, baseAlpha: 0.7, color });
  }

  private updateGlows(): void {
    const t = Date.now() * 0.003;
    for (const { sprite, baseAlpha, color } of this.glowSprites) {
      // Lava lamps get a more organic, slower pulse
      if (color === 0xff2200 || color === 0xff4422 || color === 0xff3311) {
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

    // Board interaction check
    const boardDist = Math.abs(characterX - this.boardX);
    const nearBoard = boardDist < this.boardInteractionRange;

    if (this.boardPrompt) {
      this.boardPrompt.visible = nearBoard;
      if (nearBoard) {
        this.boardPrompt.y = this.floorY - 140 + Math.sin(Date.now() * 0.004) * 2;
      }
    }

    if (nearBoard && isInteracting && this.interactCooldownMs <= 0) {
      this.interactCooldownMs = 500;
      this._shouldNavigate = "/colm-paper/demo";
      return;
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
