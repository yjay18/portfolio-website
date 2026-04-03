import {
  Container,
  Graphics,
  Sprite,
  Assets,
  Texture,
  AnimatedSprite,
  Text,
  TextStyle,
} from "pixi.js";
import {
  VIEWPORT_WIDTH,
  VIEWPORT_HEIGHT,
  GROUND_Y,
  CHARACTER_SCALE,
} from "@/data/buildings";
import { DialogBox } from "./DialogBox";
import { ChoiceDialog } from "./ChoiceDialog";

type Floor = "ground" | "upper";

interface InteractionPoint {
  id: string;
  x: number;
  floor: Floor;
  range: number;
  promptText: string;
  type: "npc" | "navigate" | "choice";
  dialogLine?: string;
  route?: string;
  externalUrl?: string;
}

export class LibraryScene {
  container: Container;
  roomContainer: Container;

  // Room geometry
  private readonly roomWidth = 500;
  private readonly groundFloorHeight = 144;
  private readonly upperFloorHeight = 120;
  private readonly beamThickness = 8;
  private readonly ceilingBeam = 6;
  private readonly totalRoomHeight: number;
  readonly roomLeft: number;
  readonly roomRight: number;
  readonly floorY = GROUND_Y;

  // Upper floor Y position
  private readonly upperFloorY: number;
  private readonly upperPlatformY: number;

  // Camera Y panning
  private currentFloor: Floor = "ground";
  private cameraY = 0;
  private cameraTargetY = 0;
  private readonly cameraPanSpeed = 0.004; // lerp factor per ms
  private isTransitioning = false;

  // Character bounds per floor
  charMinX: number;
  charMaxX: number;
  private readonly groundMinX: number;
  private readonly groundMaxX: number;
  private readonly upperMinX: number;
  private readonly upperMaxX: number;

  // Staircase
  private readonly staircaseX: number;
  private readonly staircaseRange = 40;
  private stairUpPrompt: Container | null = null;
  private stairDownPrompt: Container | null = null;

  // Interaction points
  private interactionPoints: InteractionPoint[] = [];
  private prompts: Map<string, Container> = new Map();

  // NPC
  private npcContainer: Container | null = null;
  private npcX = 0;

  // Dialogs
  private dialog: DialogBox | null = null;
  private choiceDialog: ChoiceDialog | null = null;
  private interactCooldownMs = 0;

  // Door exit
  private doorX = 0;
  private readonly doorInteractionRange = 40;
  private doorPrompt: Container | null = null;

  // State
  private _shouldExit = false;
  private _shouldNavigate: string | null = null;
  private _shouldOpenExternal: string | null = null;

  // Glow animations
  private glowSprites: { sprite: Graphics; baseAlpha: number }[] = [];

  // Key state for choice dialog
  private keys: Record<string, boolean> = {};
  private onKeyDown: (e: KeyboardEvent) => void;
  private onKeyUp: (e: KeyboardEvent) => void;

  constructor() {
    this.totalRoomHeight =
      this.groundFloorHeight +
      this.beamThickness +
      this.upperFloorHeight +
      this.ceilingBeam;

    this.container = new Container();
    this.roomContainer = new Container();
    this.container.addChild(this.roomContainer);

    // Center room horizontally
    this.roomLeft = (VIEWPORT_WIDTH - this.roomWidth) / 2;
    this.roomRight = this.roomLeft + this.roomWidth;

    // Upper floor platform Y (where upper floor characters stand)
    this.upperPlatformY =
      this.floorY - this.groundFloorHeight - this.beamThickness;
    this.upperFloorY = this.upperPlatformY;

    // Staircase center X
    this.staircaseX = this.roomLeft + 225; // center of room

    // Character bounds
    this.groundMinX = this.roomLeft + 40; // past the door
    this.groundMaxX = this.roomLeft + 365; // before reception desk NPC
    this.upperMinX = this.roomLeft + 20;
    this.upperMaxX = this.roomLeft + 470;

    this.charMinX = this.groundMinX;
    this.charMaxX = this.groundMaxX;

    // Door position
    this.doorX = this.roomLeft + 20;

    // Define interaction points
    this.interactionPoints = [
      {
        id: "receptionist",
        x: this.roomLeft + 410,
        floor: "ground",
        range: 90,
        promptText: "Press E to talk",
        type: "npc",
        dialogLine: "Here is Yuuv's Thesis...",
        route: "/thesis",
      },
      {
        id: "kiosk",
        x: this.roomLeft + 250,
        floor: "upper",
        range: 60,
        promptText: "Press E to view demo",
        type: "navigate",
        route: "/thesis", // placeholder — will be updated
      },
      {
        id: "laptop",
        x: this.roomLeft + 355,
        floor: "upper",
        range: 60,
        promptText: "Press E to interact",
        type: "choice",
        dialogLine: "Go to project GitHub?",
        externalUrl: "https://github.com/yjay18", // placeholder
      },
    ];

    // Key listeners for choice dialog
    this.onKeyDown = (e) => {
      this.keys[e.key.toLowerCase()] = true;
    };
    this.onKeyUp = (e) => {
      this.keys[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);

    this.drawRoom();
  }

  private drawRoom(): void {
    const g = new Graphics();

    // -- Cobblestone walls (both floors) --
    this.drawCobblestoneWall(
      g,
      this.roomLeft,
      this.floorY - this.groundFloorHeight,
      this.roomWidth,
      this.groundFloorHeight,
    );
    this.drawCobblestoneWall(
      g,
      this.roomLeft,
      this.upperPlatformY - this.upperFloorHeight,
      this.roomWidth,
      this.upperFloorHeight,
    );

    // -- Wood floor (ground floor) --
    this.drawWoodFloor(
      g,
      this.roomLeft,
      this.floorY,
      this.roomWidth,
      VIEWPORT_HEIGHT - this.floorY,
    );

    // Floor highlight
    g.rect(this.roomLeft, this.floorY, this.roomWidth, 1);
    g.fill(0x4a3520);

    // -- Upper floor platform --
    this.drawWoodFloor(
      g,
      this.roomLeft,
      this.upperPlatformY,
      this.roomWidth,
      this.beamThickness,
    );

    // Platform underside detail (visible beam supports)
    for (let i = 0; i < 5; i++) {
      const bx = this.roomLeft + 40 + i * 110;
      g.rect(bx, this.upperPlatformY + this.beamThickness, 6, 12);
      g.fill(0x2d1a0c);
    }

    // Upper floor surface highlight
    g.rect(this.roomLeft, this.upperPlatformY - 1, this.roomWidth, 1);
    g.fill(0x4a3520);

    // -- Asymmetric Ceiling (Tower left, Gable right) --
    const ceilingTop = this.upperPlatformY - this.upperFloorHeight - this.ceilingBeam;
    const towerWidth = 140;
    const towerX = this.roomLeft + towerWidth;
    const peakX = towerX + (this.roomRight - towerX) / 2;
    const peakY = ceilingTop - 75; // taller apex for right side

    // Tower ceiling section (left side is flat and high)
    g.rect(this.roomLeft, ceilingTop - 75, towerWidth, 75);
    g.fill(0x1a1a24);
    // Flat rafter under tower ceiling
    g.rect(this.roomLeft, ceilingTop, towerWidth, this.ceilingBeam);
    g.fill(0x150b05); // very dark wood

    // Triangular area for the gable (right side)
    g.moveTo(towerX, ceilingTop);
    g.lineTo(peakX, peakY);
    g.lineTo(this.roomRight, ceilingTop);
    g.closePath();
    g.fill(0x1a1a24);

    // Left rafter (gable)
    g.moveTo(towerX, ceilingTop);
    g.lineTo(peakX, peakY);
    g.lineTo(peakX, peakY + 6);
    g.lineTo(towerX, ceilingTop + 6);
    g.closePath();
    g.fill(0x150b05);

    // Right rafter (gable)
    g.moveTo(this.roomRight, ceilingTop);
    g.lineTo(peakX, peakY);
    g.lineTo(peakX, peakY + 6);
    g.lineTo(this.roomRight, ceilingTop + 6);
    g.closePath();
    g.fill(0x150b05);

    // Ceiling beam under gable
    g.rect(towerX, ceilingTop, this.roomRight - towerX, this.ceilingBeam);
    g.fill(0x150b05);

    // -- Wall edges --
    g.rect(
      this.roomLeft,
      peakY,
      3,
      this.floorY - peakY + (VIEWPORT_HEIGHT - this.floorY),
    );
    g.fill(0x0a0b0e);

    g.rect(
      this.roomRight - 3,
      peakY,
      3,
      this.floorY - peakY + (VIEWPORT_HEIGHT - this.floorY),
    );
    g.fill(0x0a0b0e);

    this.roomContainer.addChild(g);
  }

  /** Draw a high detail mossy cobblestone wall */
  private drawCobblestoneWall(
    g: Graphics,
    x: number,
    y: number,
    w: number,
    h: number,
  ): void {
    // Very dark mortar back for contrast
    g.rect(x, y, w, h);
    g.fill(0x0e0f14);

    let seed = 12345;
    const rand = () => {
      seed = (seed * 16807 + 0) % 2147483647;
      return (seed & 0x7fffffff) / 0x7fffffff;
    };

    let rowY = y;
    let r = 0;
    while (rowY < y + h) {
      const rowH = 10 + Math.floor(rand() * 4); // 10-13px
      let stoneX = x;
      if (r % 2 === 1) stoneX -= 6 + Math.floor(rand() * 8);

      let c = 0;
      while (stoneX < x + w) {
        const stoneW = 16 + Math.floor(rand() * 12);
        const drawX = Math.max(x, stoneX);
        const drawW = Math.min(x + w - drawX, stoneX + stoneW - 1 - drawX + x);
        const drawY = Math.max(y, rowY);
        const drawH = Math.min(y + h - drawY, rowY + rowH - 1 - drawY + y);

        if (drawW > 0 && drawH > 0) {
          // Dark midnight-blue/grey base color shift
          let hex = 0x282a36;
          const shift = (r * 17 + c * 31) % 5;
          if (shift === 0) hex = 0x323544;
          else if (shift === 1) hex = 0x1d1f28;
          else if (shift === 2) hex = 0x242630;
          else if (shift === 3) hex = 0x2b2e3a;

          // Main block
          g.rect(drawX, drawY, drawW, drawH);
          g.fill(hex);

          // Subtle procedural top highlight (now darker)
          if (drawY === rowY && drawH > 1) {
            g.rect(drawX, drawY, drawW, 1);
            g.fill((hex & 0xfefefe) + 0x080808);
          }
          // Bottom shadow
          if (drawY + drawH === rowY + rowH - 1 && drawH > 2) {
            g.rect(drawX, drawY + drawH - 1, drawW, 1);
            g.fill((hex & 0xf0f0f0) - 0x101010);
          }

          // Moss overlay via procedural texture on the stone
          if ((r * 13 + c * 29) % 4 === 0) {
            const mossW = Math.min(drawW, 4 + Math.floor(rand() * 5));
            const mossH = Math.min(drawH, 2 + Math.floor(rand() * 4));
            g.rect(drawX, drawY, mossW, mossH);
            g.fill(0x1f3014); // Darker mossy green
          }
        }
        stoneX += stoneW;
        c++;
      }
      rowY += rowH;
      r++;
    }

    // Additional moss patches on the mortar
    for (let i = 0; i < 40; i++) {
        const mx = x + Math.floor(rand() * w);
        const my = y + Math.floor(rand() * h);
        g.rect(mx, my, 2 + Math.floor(rand() * 4), 2 + Math.floor(rand() * 3));
        g.fill(0x2a4020);
    }
  }

  /** Draw antique wood floor pattern */
  private drawWoodFloor(
    g: Graphics,
    x: number,
    y: number,
    w: number,
    h: number,
  ): void {
    // Very dark black wood base
    g.rect(x, y, w, h);
    g.fill(0x080402);

    let seed = 54321;
    const rand = () => {
      seed = (seed * 16807 + 0) % 2147483647;
      return (seed & 0x7fffffff) / 0x7fffffff;
    };

    let plankY = y;
    let r = 0;
    while (plankY < y + h) {
      const plankH = 6 + Math.floor(rand() * 3); // 6-8px
      const rowY = plankY;
      const drawY = Math.max(y, rowY);
      const drawH = Math.min(y + h - drawY, rowY + plankH - 1 - drawY + y);

      let plankX = x;
      if (r % 2 === 1) plankX -= 10 + Math.floor(rand() * 10);
      
      let c = 0;
      while (plankX < x + w) {
        const plankW = 40 + Math.floor(rand() * 30);
        const drawX = Math.max(x, plankX);
        const drawW = Math.min(x + w - drawX, plankX + plankW - 1 - drawX + x);

        if (drawW > 0 && drawH > 0) {
            // Antique dark oak wood colored shifts
            let color = 0x22130a;
            const shift = (r * 19 + c * 23) % 4;
            if (shift === 0) color = 0x2a180d;
            else if (shift === 1) color = 0x180d06;
            else if (shift === 2) color = 0x1e1008;
            else if (shift === 3) color = 0x24140a;

            g.rect(drawX, drawY, drawW, drawH);
            g.fill(color);

            // Rich wood grain texture inside each plank
            for(let gx = drawX; gx < drawX + drawW; gx += 3 + Math.floor(rand() * 5)) {
                if (rand() > 0.3 && drawH > 1) {
                    const grainY = drawY + 1 + Math.floor(rand() * (drawH - 2));
                    const grainW = Math.min(drawX + drawW - gx, 4 + Math.floor(rand() * 8));
                    g.rect(gx, grainY, grainW, 1);
                    g.fill({ color: 0x0f0703, alpha: 0.5 });
                }
            }

            // Subtle top edge sheen
            if (drawY === rowY && drawH > 1) {
                g.rect(drawX, drawY, drawW, 1);
                g.fill({ color: 0xffffff, alpha: 0.02 });
            }
        }
        plankX += plankW;
        c++;
      }
      plankY += plankH;
      r++;
    }
  }

  async loadAssets(): Promise<void> {
    const basePath = "/assets/interiors/university-library";

    // Walls and floors are drawn programmatically in drawRoom()

    // --- Ground floor props ---
    await this.loadProp(basePath, "door.png", 20, 20, 1.0, "ground");
    await this.loadProp(basePath, "coat-rack.png", 50, 5, 0.9, "ground");
    await this.loadProp(basePath, "tall-bookshelf-1.png", 90, 8, 1.0, "ground", true);
    await this.loadProp(basePath, "globe.png", 135, 10, 0.68, "ground");
    await this.loadProp(basePath, "potted-fern.png", 178, 5, 0.68, "ground");
    await this.loadProp(basePath, "spiral-staircase.png", 225, 21, 1.15, "both");
    await this.loadProp(basePath, "candelabra.png", 470, 5, 0.63, "upper");
    await this.loadProp(basePath, "tall-bookshelf-3.png", 310, 8, 1.0, "ground", true);
    await this.loadProp(basePath, "book-stack.png", 360, 0, 0.9, "ground");
    await this.loadProp(basePath, "reception-desk.png", 400, 24, 0.96, "ground");

    // Ground wall-mounted
    await this.loadWallProp(basePath, "notice-board.png", 445, 40, 0.8, "ground");
    await this.loadWallProp(basePath, "wall-lantern.png", 485, 20, 0.7, "ground", true);
    await this.loadWallProp(basePath, "round-window.png", 390, 30, 0.9, "ground");
    await this.loadWallProp(basePath, "ivy.png", 55, 0, 0.8, "ground");

    // --- Upper floor props ---
    await this.loadProp(basePath, "short-bookshelf-1.png", 25, 5, 0.63, "upper");
    await this.loadProp(basePath, "reading-chair.png", 85, 5, 0.85, "upper");
    await this.loadProp(basePath, "short-bookshelf-2.png", 100, 5, 0.9, "upper");
    await this.loadProp(basePath, "potted-plant.png", 165, 5, 0.7, "upper");
    await this.loadProp(basePath, "kiosk-monitor.png", 250, 5, 0.5, "upper");
    // crates-books removed — too cluttered between kiosk and desk
    await this.loadProp(basePath, "laptop-desk.png", 355, 13, 0.88, "upper");

    // Upper wall-mounted
    await this.loadWallProp(basePath, "tapestry.png", 150, 10, 0.8, "upper");
    await this.loadWallProp(basePath, "wall-lantern.png", 15, 14, 0.7, "upper");

    // Arched window in the A-frame peak
    await this.loadAFrameWindow(basePath);

    // Vignette / Shadow Overlay (darkens corners and borders)
    const overlay = new Graphics();
    overlay.rect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
    overlay.fill({ color: 0x000000, alpha: 0.25 });
    overlay.blendMode = "multiply";
    this.container.addChild(overlay); // add after room for global darkening

    // --- NPC (receptionist/librarian) ---
    await this.loadNpc(basePath);

    // --- Glow effects ---
    // Ground floor: lantern on right wall — warm glow from flame
    this.addGlowEffect(this.roomLeft + 485, this.floorY - this.groundFloorHeight + 50, 0xffcc66, 50, "ground");
    
    // Moonlight from round window (Fixed position from 250 -> 390 to align with window prop)
    this.addGlowEffect(this.roomLeft + 390, this.floorY - 95, 0x88bbff, 55, "ground"); 
    
    // Upper floor: lantern on left wall
    this.addGlowEffect(this.roomLeft + 15, this.upperPlatformY - this.upperFloorHeight + 44, 0xffcc66, 50, "upper");
    
    // Upper floor: candelabra on far right
    this.addGlowEffect(this.roomLeft + 470, this.upperPlatformY - 55, 0xffcc66, 40, "upper");

    // Ceiling arch window golden glow (from outside)
    const ceilingTop = this.upperPlatformY - this.upperFloorHeight - this.ceilingBeam;
    const towerWidth = 140;
    const towerX = this.roomLeft + towerWidth;
    const peakX = towerX + (this.roomRight - towerX) / 2;
    this.addGlowEffect(peakX, ceilingTop - 45, 0xffbb66, 70, "upper");

    // CRT glow
    this.addGlowEffect(this.roomLeft + 250, this.upperPlatformY - 50, 0x66ccaa, 35, "upper");
    // Laptop glow
    this.addGlowEffect(this.roomLeft + 355, this.upperPlatformY - 40, 0x88aaff, 30, "upper");

    // --- Interaction prompts ---
    this.createInteractionPrompts();
    this.createStaircasePrompts();
    this.createDoorPrompt();
  }

  private async loadProp(
    basePath: string,
    file: string,
    x: number,
    yOffset: number,
    scale: number,
    floor: Floor | "both",
    wallBacked = false,
  ): Promise<void> {
    try {
      const texture = await Assets.load(`${basePath}/${file}`);
      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5, 1);
      sprite.scale.set(scale);

      if (floor === "ground" || floor === "both") {
        sprite.x = this.roomLeft + x;
        sprite.y = this.floorY + yOffset;
        if (floor === "both") {
          // Staircase spans both floors — position at ground, extends up
          sprite.y = this.floorY + yOffset;
        }
      } else {
        sprite.x = this.roomLeft + x;
        sprite.y = this.upperPlatformY + yOffset;
      }

      this.roomContainer.addChild(sprite);
    } catch {
      console.warn(`Failed to load library prop: ${file}`);
    }
  }

  private async loadWallProp(
    basePath: string,
    file: string,
    x: number,
    yFromWallTop: number,
    scale: number,
    floor: Floor,
    flipX = false,
  ): Promise<void> {
    try {
      const texture = await Assets.load(`${basePath}/${file}`);
      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5, 0);
      sprite.scale.set(flipX ? -scale : scale, scale);

      const wallTop =
        floor === "ground"
          ? this.floorY - this.groundFloorHeight
          : this.upperPlatformY - this.upperFloorHeight;

      sprite.x = this.roomLeft + x;
      sprite.y = wallTop + yFromWallTop;

      this.roomContainer.addChild(sprite);
    } catch {
      console.warn(`Failed to load wall prop: ${file}`);
    }
  }

  private async loadAFrameWindow(basePath: string): Promise<void> {
    try {
      const texture = await Assets.load(`${basePath}/arched-window.png`);
      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5, 0.5);
      sprite.scale.set(1.0);

      // Position at the center peak of the A-frame (now shifted to right)
      const ceilingTop =
        this.upperPlatformY - this.upperFloorHeight - this.ceilingBeam;
      const towerWidth = 140;
      const towerX = this.roomLeft + towerWidth;
      const peakX = towerX + (this.roomRight - towerX) / 2;
      const peakY = ceilingTop - 75; // must match drawRoom

      sprite.x = peakX;
      sprite.y = peakY + 30; // centered in the triangular area
      this.roomContainer.addChild(sprite);
    } catch {
      console.warn("Failed to load A-frame window");
    }
  }

  private async loadNpc(basePath: string): Promise<void> {
    this.npcContainer = new Container();
    this.npcX = this.roomLeft + 450;
    this.npcContainer.x = this.npcX;
    this.npcContainer.y = this.floorY + 20;

    try {
      const frames: Texture[] = [];
      for (let i = 0; i < 4; i++) {
        const tex = await Assets.load(
          `${basePath}/librarian-idle/frame_00${i}.png`,
        );
        frames.push(tex);
      }
      const anim = new AnimatedSprite(frames);
      anim.anchor.set(0.5, 1);
      anim.scale.set(CHARACTER_SCALE * 1.7);
      anim.animationSpeed = 0.08;
      anim.play();
      this.npcContainer.addChild(anim);
    } catch {
      const ph = new Graphics();
      ph.rect(-12, -40, 24, 40).fill(0x4444aa);
      this.npcContainer.addChild(ph);
    }

    this.roomContainer.addChild(this.npcContainer);
  }

  private addGlowEffect(
    x: number,
    y: number,
    color: number,
    radius: number,
    floor: Floor,
  ): void {
    const glow = new Graphics();
    const layers = 35;
    const maxAlpha = 0.10; // Reduced per-layer maximum alpha

    // Draw from largest (progress 1) to smallest (progress 0)
    for (let i = layers; i >= 1; i--) {
      const progress = i / layers;
      const r = radius * progress;
      const a = maxAlpha * Math.pow(1 - progress, 1.5);
      glow.circle(0, 0, r);
      glow.fill({ color, alpha: a });
    }
    glow.x = x;
    glow.y = y;
    
    // Add additive blending for a more natural light emission
    glow.blendMode = "add";

    this.roomContainer.addChild(glow);
    // Restore baseAlpha lower so the assembled solid object scales down gracefully
    this.glowSprites.push({ sprite: glow, baseAlpha: 0.30 });
  }

  private createInteractionPrompts(): void {
    for (const point of this.interactionPoints) {
      const prompt = this.createPrompt(point.promptText);
      prompt.visible = false;

      const yBase =
        point.floor === "ground" ? this.floorY : this.upperPlatformY;
      prompt.x = point.x;
      prompt.y = yBase - (point.floor === "upper" ? 75 : 55);

      this.roomContainer.addChild(prompt);
      this.prompts.set(point.id, prompt);
    }
  }

  private createStaircasePrompts(): void {
    // "Press W to go up" on ground floor
    this.stairUpPrompt = this.createPrompt("Press W to go up");
    this.stairUpPrompt.visible = false;
    this.stairUpPrompt.x = this.staircaseX;
    this.stairUpPrompt.y = this.floorY - 55;
    this.roomContainer.addChild(this.stairUpPrompt);

    // "Press S to go down" on upper floor
    this.stairDownPrompt = this.createPrompt("Press S to go down");
    this.stairDownPrompt.visible = false;
    this.stairDownPrompt.x = this.staircaseX;
    this.stairDownPrompt.y = this.upperPlatformY - 75;
    this.roomContainer.addChild(this.stairDownPrompt);
  }

  private createDoorPrompt(): void {
    this.doorPrompt = this.createPrompt("Press E to exit");
    this.doorPrompt.visible = false;
    this.doorPrompt.x = this.doorX;
    this.doorPrompt.y = this.floorY - 75;
    this.roomContainer.addChild(this.doorPrompt);
  }

  private createPrompt(text: string): Container {
    const c = new Container();

    const bg = new Graphics();
    const width = text.length * 5.5 + 16;
    bg.roundRect(-width / 2, -14, width, 18, 4).fill({
      color: 0x000000,
      alpha: 0.75,
    });
    c.addChild(bg);

    const style = new TextStyle({
      fontFamily: "monospace",
      fontSize: 9,
      fill: "#ffffff",
      align: "center",
    });
    const t = new Text({ text, style });
    t.anchor.set(0.5, 0.5);
    t.y = -5;
    c.addChild(t);

    return c;
  }

  get shouldExit(): boolean {
    return this._shouldExit;
  }

  get shouldNavigate(): string | null {
    return this._shouldNavigate;
  }

  get shouldOpenExternal(): string | null {
    return this._shouldOpenExternal;
  }

  clearOpenExternal(): void {
    this._shouldOpenExternal = null;
  }

  /** Returns the current floor's Y for character positioning */
  getFloorY(): number {
    return this.currentFloor === "ground"
      ? this.floorY
      : this.upperPlatformY;
  }

  update(
    deltaMs: number,
    characterX: number,
    characterY: number,
    isInteracting: boolean,
    isPressingUp: boolean,
    isPressingDown: boolean,
  ): void {
    if (this.interactCooldownMs > 0) {
      this.interactCooldownMs -= deltaMs;
    }

    // --- Camera pan ---
    this.updateCamera(deltaMs);

    // --- Glow animation ---
    this.updateGlows();

    // --- Active dialog ---
    if (this.dialog) {
      this.dialog.update(deltaMs, isInteracting && this.interactCooldownMs <= 0);
      if (this.dialog.isDismissed) {
        this.dialog.destroy();
        this.roomContainer.removeChild(this.dialog.container);
        const point = this.interactionPoints.find(
          (p) => p.type === "npc" && p.dialogLine,
        );
        this.dialog = null;
        if (point?.route) {
          this._shouldNavigate = point.route;
        }
      }
      return;
    }

    // --- Active choice dialog ---
    if (this.choiceDialog) {
      this.choiceDialog.update(deltaMs, this.keys);
      if (this.choiceDialog.isDismissed) {
        const chosenYes = this.choiceDialog.chosenYes;
        const point = this.interactionPoints.find((p) => p.type === "choice");
        this.choiceDialog.destroy();
        this.roomContainer.removeChild(this.choiceDialog.container);
        this.choiceDialog = null;

        if (chosenYes && point?.externalUrl) {
          this._shouldOpenExternal = point.externalUrl;
        }
      }
      return;
    }

    // --- Skip interaction checks during floor transition ---
    if (this.isTransitioning) return;

    // --- Staircase interaction ---
    const nearStaircase =
      Math.abs(characterX - this.staircaseX) < this.staircaseRange;

    if (this.stairUpPrompt) {
      this.stairUpPrompt.visible =
        nearStaircase && this.currentFloor === "ground";
      if (this.stairUpPrompt.visible) {
        this.stairUpPrompt.y =
          this.floorY - 55 + Math.sin(Date.now() * 0.004) * 2;
      }
    }
    if (this.stairDownPrompt) {
      this.stairDownPrompt.visible =
        nearStaircase && this.currentFloor === "upper";
      if (this.stairDownPrompt.visible) {
        this.stairDownPrompt.y =
          this.upperPlatformY - 75 + Math.sin(Date.now() * 0.004) * 2;
      }
    }

    if (nearStaircase && this.interactCooldownMs <= 0) {
      if (this.currentFloor === "ground" && isPressingUp) {
        this.transitionToFloor("upper");
        return;
      }
      if (this.currentFloor === "upper" && isPressingDown) {
        this.transitionToFloor("ground");
        return;
      }
    }

    // --- Interaction point proximity ---
    for (const point of this.interactionPoints) {
      const prompt = this.prompts.get(point.id);
      if (!prompt) continue;

      // Only show prompts for current floor
      if (point.floor !== this.currentFloor) {
        prompt.visible = false;
        continue;
      }

      const dist = Math.abs(characterX - point.x);
      const inRange = dist < point.range;
      prompt.visible = inRange;

      if (inRange) {
        const baseY =
          point.floor === "ground"
            ? this.floorY - 55
            : this.upperPlatformY - 75;
        prompt.y = baseY + Math.sin(Date.now() * 0.004) * 2;
      }

      if (
        inRange &&
        isInteracting &&
        this.interactCooldownMs <= 0
      ) {
        this.interactCooldownMs = 500;
        this.handleInteraction(point);
      }
    }

    // --- Door exit ---
    if (this.currentFloor === "ground") {
      const doorDist = Math.abs(characterX - this.doorX);
      const nearDoor = doorDist < this.doorInteractionRange;

      if (this.doorPrompt) {
        this.doorPrompt.visible = nearDoor;
        if (nearDoor) {
          this.doorPrompt.y =
            this.floorY - 75 + Math.sin(Date.now() * 0.004) * 2;
        }
      }

      if (nearDoor && isInteracting && this.interactCooldownMs <= 0) {
        this.interactCooldownMs = 500;
        this._shouldExit = true;
      }
    }
  }

  private handleInteraction(point: InteractionPoint): void {
    switch (point.type) {
      case "npc":
        if (point.dialogLine) {
          this.dialog = new DialogBox(
            point.dialogLine,
            point.x,
            (point.floor === "ground" ? this.floorY : this.upperPlatformY) -
              60,
          );
          this.roomContainer.addChild(this.dialog.container);
        }
        break;
      case "navigate":
        if (point.route) {
          this._shouldNavigate = point.route;
        }
        break;
      case "choice":
        if (point.dialogLine) {
          this.choiceDialog = new ChoiceDialog(
            point.dialogLine,
            point.x,
            (point.floor === "ground" ? this.floorY : this.upperPlatformY) -
              60,
          );
          this.roomContainer.addChild(this.choiceDialog.container);
        }
        break;
    }
  }

  private transitionToFloor(target: Floor): void {
    this.isTransitioning = true;
    this.interactCooldownMs = 600;
    this.currentFloor = target;

    if (target === "upper") {
      this.cameraTargetY = 120;
      this.charMinX = this.upperMinX;
      this.charMaxX = this.upperMaxX;
    } else {
      this.cameraTargetY = 0;
      this.charMinX = this.groundMinX;
      this.charMaxX = this.groundMaxX;
    }
  }

  private updateCamera(deltaMs: number): void {
    const diff = this.cameraTargetY - this.cameraY;
    if (Math.abs(diff) < 0.5) {
      this.cameraY = this.cameraTargetY;
      if (this.isTransitioning) {
        this.isTransitioning = false;
      }
    } else {
      // Smooth ease
      this.cameraY += diff * this.cameraPanSpeed * deltaMs;
    }

    this.roomContainer.y = this.cameraY;
  }

  private updateGlows(): void {
    const t = Date.now() * 0.003;
    for (const { sprite, baseAlpha } of this.glowSprites) {
      sprite.alpha = baseAlpha + Math.sin(t) * 0.05;
    }
  }

  destroy(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    if (this.dialog) {
      this.dialog.destroy();
      this.dialog = null;
    }
    if (this.choiceDialog) {
      this.choiceDialog.destroy();
      this.choiceDialog = null;
    }
    this.container.destroy({ children: true });
  }
}
