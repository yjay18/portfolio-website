import {
  AnimatedSprite,
  Assets,
  Container,
  Graphics,
  Sprite,
  Text,
  TextStyle,
  Texture,
} from "pixi.js";
import {
  CHARACTER_SCALE,
  VIEWPORT_WIDTH,
  VIEWPORT_HEIGHT,
  GROUND_Y,
} from "@/data/buildings";
import { DialogBox } from "./DialogBox";

type GlowSprite = {
  sprite: Graphics;
  baseAlpha: number;
  speed: number;
  color: number;
};

export class LegalClassifierScene {
  container: Container;
  roomContainer: Container;

  // Room geometry
  private readonly roomWidth = 600;
  private readonly roomHeight = 300;
  readonly roomLeft: number;
  readonly roomRight: number;
  readonly floorY = GROUND_Y;

  // Layout anchors
  private readonly wallTop: number;
  private readonly doorX: number;
  private readonly chalkboardX: number;
  private readonly chalkboardY: number;
  private readonly chandelierX: number;
  private readonly chandelierY: number;
  private readonly statueLeftX: number;
  private readonly statueRightX: number;
  private readonly deskX: number;
  private readonly judgeX: number;
  private readonly judgeY: number;
  private readonly chalkboardInteractionX: number;
  private readonly deskInteractionX: number;

  // Character bounds
  charMinX: number;
  charMaxX: number;

  // Interaction
  private readonly doorInteractionRange = 48;
  private readonly chalkboardInteractionRange = 56;
  private readonly deskInteractionRange = 72;
  private doorPrompt: Container | null = null;
  private chalkboardPrompt: Container | null = null;
  private deskPrompt: Container | null = null;

  // Judge NPC
  private judgeContainer: Container | null = null;
  private judgeIdleSprite: Sprite | null = null;
  private judgeReadingSprite: AnimatedSprite | null = null;

  // State
  private _shouldExit = false;
  private _shouldNavigate: string | null = null;
  private interactCooldownMs = 0;
  private dialog: DialogBox | null = null;

  // Lighting
  private glowSprites: GlowSprite[] = [];

  constructor() {
    this.container = new Container();
    this.roomContainer = new Container();
    this.roomContainer.sortableChildren = true;
    this.container.addChild(this.roomContainer);

    this.roomLeft = (VIEWPORT_WIDTH - this.roomWidth) / 2;
    this.roomRight = this.roomLeft + this.roomWidth;
    this.wallTop = this.floorY - this.roomHeight;

    this.doorX = this.roomLeft + 68;
    this.chalkboardX = this.roomLeft + 188;
    this.chalkboardY = this.wallTop + 108;
    this.chandelierX = this.roomLeft + 419;
    this.chandelierY = this.wallTop + 4;
    this.statueLeftX = this.roomLeft + 302;
    this.statueRightX = this.roomLeft + 536;
    this.deskX = this.roomLeft + 419;
    this.judgeX = this.roomLeft + 488;
    this.judgeY = this.floorY + 12;
    this.chalkboardInteractionX = this.chalkboardX;
    this.deskInteractionX = this.roomLeft + 470;

    this.charMinX = this.roomLeft + 20;
    this.charMaxX = this.roomLeft + 548;

    this.drawRoom();
  }

  private drawRoom(): void {
    const g = new Graphics();
    const floorH = VIEWPORT_HEIGHT - this.floorY;

    // Back wall
    g.rect(this.roomLeft, this.wallTop, this.roomWidth, this.roomHeight);
    g.fill(0x170f12);

    const panelW = 80;
    const panelH = 120;
    for (let c = 0; c < Math.ceil(this.roomWidth / panelW); c++) {
      const x = this.roomLeft + c * panelW;
      const panelRight = Math.min(this.roomRight, x + panelW);
      const panelWidth = panelRight - x;
      if (panelWidth <= 0) continue;

      const baseWidth = panelWidth - 4;
      if (baseWidth > 0) {
        g.rect(x + 2, this.floorY - panelH, baseWidth, panelH);
        g.fill(0x2a171d);
      }

      const accentWidth = panelWidth - 16;
      if (accentWidth > 0) {
        g.rect(x + 8, this.floorY - panelH + 8, accentWidth, panelH - 16);
        g.fill(0x3b212a);
      }

      g.rect(x, this.floorY - panelH - 10, panelWidth, 10);
      g.fill(0x1b1014);
      g.rect(x, this.floorY - panelH - 12, panelWidth, 2);
      g.fill(0x56313b);
    }

    // Upper wall and columns
    g.rect(this.roomLeft, this.wallTop, this.roomWidth, this.roomHeight - panelH - 12);
    g.fill(0x121417);

    const colW = 30;
    for (let c = 0; c <= Math.ceil(this.roomWidth / (panelW * 2)); c++) {
      const x = this.roomLeft + c * panelW * 2 + 25;
      if (x + colW > this.roomRight) continue;
      g.rect(x, this.wallTop, colW, this.roomHeight - panelH - 12);
      g.fill(0x1a1d22);
      g.rect(x + 10, this.wallTop, colW - 20, this.roomHeight - panelH - 12);
      g.fill(0x101217);
    }

    // Baseboard
    g.rect(this.roomLeft, this.floorY - 14, this.roomWidth, 14);
    g.fill(0x10080a);
    g.rect(this.roomLeft, this.floorY - 14, this.roomWidth, 2);
    g.fill(0x2e1a21);

    // Marble floor
    g.rect(this.roomLeft, this.floorY, this.roomWidth, floorH);
    g.fill(0x0a0c10);

    const tile = 40;
    for (let r = 0; r < Math.ceil(floorH / tile); r++) {
      for (let c = 0; c < Math.ceil(this.roomWidth / tile); c++) {
        const x = this.roomLeft + c * tile;
        const y = this.floorY + r * tile;
        const drawX = Math.max(this.roomLeft, x);
        const finalW = Math.min(tile, this.roomRight - drawX);
        if (finalW <= 0) continue;

        const isDark = (r + c) % 2 === 0;
        const color = isDark ? 0x0c0d12 : 0x12141a;
        g.rect(drawX + 1, y + 1, finalW - 2, tile - 2);
        g.fill(color);

        if (!isDark) {
          g.rect(drawX + 2, y + 2, finalW - 4, 1);
          g.fill(0x1c1e26);
        }
      }
    }

    g.rect(this.roomLeft, this.floorY, this.roomWidth, 2);
    g.fill(0x050608);

    // Ceiling beam
    g.rect(this.roomLeft, this.wallTop - 12, this.roomWidth, 12);
    g.fill(0x0a0b0e);
    g.rect(this.roomLeft, this.wallTop - 2, this.roomWidth, 2);
    g.fill(0x1c1e26);

    // Wall edges
    const totalH = this.roomHeight + 12 + floorH;
    g.rect(this.roomLeft, this.wallTop - 12, 6, totalH);
    g.fill(0x0a0b0e);
    g.rect(this.roomLeft + 6, this.wallTop - 12, 2, totalH);
    g.fill(0x1a1c22);
    g.rect(this.roomRight - 6, this.wallTop - 12, 6, totalH);
    g.fill(0x0a0b0e);
    g.rect(this.roomRight - 8, this.wallTop - 12, 2, totalH);
    g.fill(0x1a1c22);
    g.zIndex = 0;

    const ambiance = new Graphics();
    ambiance.rect(this.roomLeft + 8, this.wallTop, 54, this.roomHeight);
    ambiance.fill({ color: 0x000000, alpha: 0.4 });
    ambiance.rect(this.roomRight - 62, this.wallTop, 54, this.roomHeight);
    ambiance.fill({ color: 0x000000, alpha: 0.4 });
    ambiance.rect(this.roomLeft, this.wallTop, this.roomWidth, 74);
    ambiance.fill({ color: 0x000000, alpha: 0.55 });
    ambiance.rect(this.chandelierX - 116, this.wallTop + 86, 232, 76);
    ambiance.fill({ color: 0xffcc66, alpha: 0.025 });
    ambiance.zIndex = 1;

    this.roomContainer.addChild(g);
    this.roomContainer.addChild(ambiance);
  }

  async loadAssets(): Promise<void> {
    const basePath = "/assets/interiors/legal-classifier";

    // Wall props first
    await this.addSceneSprite(`${basePath}/chalkboard.png`, {
      anchorX: 0.5,
      anchorY: 0,
      scale: 2.0,
      x: this.chalkboardX,
      y: this.chalkboardY,
      zIndex: 2,
      warningLabel: "chalkboard",
    });

    this.addGlowEffect(this.chandelierX, this.wallTop + 96, 0xfff2b3, 24, 0.86, 0.85);
    this.addGlowEffect(this.chandelierX, this.wallTop + 110, 0xffd27a, 54, 0.58, 0.95);
    this.addGlowEffect(this.chandelierX, this.wallTop + 126, 0xffcc66, 88, 0.28, 1.1);

    await this.addSceneSprite(`${basePath}/chandelier.png`, {
      anchorX: 0.5,
      anchorY: 0,
      scale: 1.7,
      x: this.chandelierX,
      y: this.chandelierY,
      zIndex: 5,
      warningLabel: "chandelier",
    });

    // Floor props
    await this.addSceneSprite(`${basePath}/door.png`, {
      anchorX: 0.5,
      anchorY: 1,
      scale: 2.0,
      x: this.doorX,
      y: this.floorY + 10,
      zIndex: 4,
      warningLabel: "door",
    });

    await this.addSceneSprite(`${basePath}/statue-left.png`, {
      anchorX: 0.5,
      anchorY: 1,
      scale: 1.7,
      x: this.statueLeftX,
      y: this.floorY + 18,
      zIndex: 4,
      warningLabel: "left statue",
    });

    await this.addSceneSprite(`${basePath}/statue-right.png`, {
      anchorX: 0.5,
      anchorY: 1,
      scale: 1.7,
      x: this.statueRightX,
      y: this.floorY + 18,
      zIndex: 4,
      warningLabel: "right statue",
    });

    await this.loadJudge(basePath);

    await this.addSceneSprite(`${basePath}/judge-desk.png`, {
      anchorX: 0.5,
      anchorY: 1,
      scale: 1.85,
      x: this.deskX,
      y: this.floorY + 26,
      zIndex: 7,
      warningLabel: "judge desk",
    });

    this.doorPrompt = this.createPrompt("Press E to exit");
    this.doorPrompt.visible = false;
    this.doorPrompt.x = this.doorX;
    this.doorPrompt.y = this.floorY - 120;
    this.doorPrompt.zIndex = 20;
    this.roomContainer.addChild(this.doorPrompt);

    this.chalkboardPrompt = this.createPrompt("Press E for demo");
    this.chalkboardPrompt.visible = false;
    this.chalkboardPrompt.x = this.chalkboardInteractionX;
    this.chalkboardPrompt.y = this.floorY - 156;
    this.chalkboardPrompt.zIndex = 20;
    this.roomContainer.addChild(this.chalkboardPrompt);

    this.deskPrompt = this.createPrompt("Press E to hear ruling");
    this.deskPrompt.visible = false;
    this.deskPrompt.x = this.deskInteractionX + 24;
    this.deskPrompt.y = this.floorY - 128;
    this.deskPrompt.zIndex = 20;
    this.roomContainer.addChild(this.deskPrompt);
  }

  private async loadJudge(basePath: string): Promise<void> {
    this.judgeContainer = new Container();
    this.judgeContainer.x = this.judgeX;
    this.judgeContainer.y = this.judgeY;
    this.judgeContainer.zIndex = 8;

    try {
      const idleTex = await Assets.load(`${basePath}/judge-idle/frame_000.png`);
      this.judgeIdleSprite = new Sprite(idleTex);
      this.judgeIdleSprite.anchor.set(0.5, 1);
      this.judgeIdleSprite.scale.set(CHARACTER_SCALE * 1.05);
      this.judgeContainer.addChild(this.judgeIdleSprite);

      const readingFrames: Texture[] = [];
      for (let i = 0; i < 9; i++) {
        const tex = await Assets.load(
          `${basePath}/judge-reading/frame_${i.toString().padStart(3, "0")}.png`,
        );
        readingFrames.push(tex);
      }

      this.judgeReadingSprite = new AnimatedSprite(readingFrames);
      this.judgeReadingSprite.anchor.set(0.5, 1);
      this.judgeReadingSprite.scale.set(CHARACTER_SCALE * 1.05);
      this.judgeReadingSprite.animationSpeed = 0.12;
      this.judgeReadingSprite.loop = true;
      this.judgeReadingSprite.visible = false;
      this.judgeReadingSprite.gotoAndStop(0);
      this.judgeContainer.addChild(this.judgeReadingSprite);
    } catch {
      const placeholder = new Graphics();
      placeholder.rect(-14, -44, 28, 44).fill(0x2b2f39);
      this.judgeContainer.addChild(placeholder);
    }

    this.roomContainer.addChild(this.judgeContainer);
  }

  private async addSceneSprite(
    path: string,
    options: {
      anchorX: number;
      anchorY: number;
      scale: number;
      x: number;
      y: number;
      zIndex: number;
      warningLabel: string;
    },
  ): Promise<void> {
    try {
      const texture = await Assets.load(path);
      const sprite = new Sprite(texture);
      sprite.anchor.set(options.anchorX, options.anchorY);
      sprite.scale.set(options.scale);
      sprite.x = options.x;
      sprite.y = options.y;
      sprite.zIndex = options.zIndex;
      this.roomContainer.addChild(sprite);
    } catch {
      console.warn(`Failed to load ${options.warningLabel} sprite`);
    }
  }

  private addGlowEffect(
    x: number,
    y: number,
    color: number,
    radius: number,
    baseAlpha: number,
    speed: number,
  ): void {
    const glow = new Graphics();
    const layers = 5;

    for (let i = layers; i >= 1; i--) {
      const progress = i / layers;
      const r = radius * progress;
      const alpha = 0.03 * Math.pow(1 - progress, 1.5);
      glow.circle(0, 0, r);
      glow.fill({ color, alpha });
    }

    glow.x = x;
    glow.y = y;
    glow.zIndex = 3;
    this.roomContainer.addChild(glow);
    this.glowSprites.push({ sprite: glow, baseAlpha, speed, color });
  }

  private updateGlows(): void {
    const t = Date.now() * 0.003;
    for (const { sprite, baseAlpha, speed, color } of this.glowSprites) {
      if (color === 0xffdd88) {
        sprite.alpha = baseAlpha + Math.sin(t * speed) * 0.04;
      } else {
        sprite.alpha = baseAlpha + Math.sin(t * speed) * 0.05;
      }
    }
  }

  private setJudgeReading(reading: boolean): void {
    if (!this.judgeIdleSprite || !this.judgeReadingSprite) return;

    this.judgeIdleSprite.visible = !reading;
    this.judgeReadingSprite.visible = reading;

    if (reading) {
      if (!this.judgeReadingSprite.playing) {
        this.judgeReadingSprite.gotoAndPlay(0);
      }
    } else {
      this.judgeReadingSprite.stop();
      this.judgeReadingSprite.gotoAndStop(0);
    }
  }

  private createPrompt(text: string): Container {
    const prompt = new Container();

    const bg = new Graphics();
    bg.roundRect(-58, -14, 116, 18, 4).fill({ color: 0x000000, alpha: 0.75 });
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

    this.updateGlows();

    if (this.dialog) {
      this.setJudgeReading(true);
      this.dialog.update(deltaMs, isInteracting && this.interactCooldownMs <= 0);
      if (this.dialog.isDismissed) {
        this.dialog.destroy();
        this.roomContainer.removeChild(this.dialog.container);
        this.dialog = null;
        this.setJudgeReading(false);
        this._shouldNavigate = "/legal-classifier";
      }
      return;
    }

    this.setJudgeReading(false);

    const doorDist = Math.abs(characterX - this.doorX);
    const nearDoor = doorDist < this.doorInteractionRange;
    if (this.doorPrompt) {
      this.doorPrompt.visible = nearDoor;
      if (nearDoor) {
        this.doorPrompt.y = this.floorY - 120 + Math.sin(Date.now() * 0.004) * 2;
      }
    }

    if (nearDoor && isInteracting && this.interactCooldownMs <= 0) {
      this.interactCooldownMs = 500;
      this._shouldExit = true;
      return;
    }

    const chalkboardDist = Math.abs(characterX - this.chalkboardInteractionX);
    const nearChalkboard = chalkboardDist < this.chalkboardInteractionRange;
    if (this.chalkboardPrompt) {
      this.chalkboardPrompt.visible = nearChalkboard;
      if (nearChalkboard) {
        this.chalkboardPrompt.y = this.floorY - 156 + Math.sin(Date.now() * 0.004) * 2;
      }
    }

    if (nearChalkboard && isInteracting && this.interactCooldownMs <= 0) {
      this.interactCooldownMs = 500;
      this._shouldNavigate = "/legal-classifier";
      return;
    }

    const deskDist = Math.abs(characterX - this.deskInteractionX);
    const nearDesk = deskDist < this.deskInteractionRange;
    if (this.deskPrompt) {
      this.deskPrompt.visible = nearDesk;
      if (nearDesk) {
        this.deskPrompt.y = this.floorY - 128 + Math.sin(Date.now() * 0.004) * 2;
      }
    }

    if (nearDesk && isInteracting && this.interactCooldownMs <= 0) {
      this.interactCooldownMs = 500;
      this.setJudgeReading(true);
      this.dialog = new DialogBox(
        "Predicting State Law Passage: Analyzing 32,000+ bills using AI embeddings...",
        this.judgeX,
        this.floorY - 118,
      );
      this.dialog.container.zIndex = 25;
      this.roomContainer.addChild(this.dialog.container);
      if (this.deskPrompt) this.deskPrompt.visible = false;
    }
  }

  destroy(): void {
    if (this.dialog) {
      this.dialog.destroy();
      this.dialog = null;
    }
    if (this.judgeReadingSprite) {
      this.judgeReadingSprite.stop();
    }
    this.container.destroy({ children: true });
  }
}
