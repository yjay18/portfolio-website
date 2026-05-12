import {
  Container,
  Graphics,
  Sprite,
  Assets,
  Text,
  TextStyle,
} from "pixi.js";
import { VIEWPORT_WIDTH, VIEWPORT_HEIGHT, GROUND_Y } from "@/data/buildings";

export class ApartmentScene {
  container: Container;
  roomContainer: Container;
  foregroundContainer: Container;
  
  readonly charMinX: number;
  readonly charMaxX: number;
  
  private _shouldExit = false;
  private _shouldNavigate: string | null = null;
  private interactCooldownMs = 0;

  // Layout bounds (it's a wide side-scroller)
  private roomLeft = 0;
  private roomWidth = 1000;
  private floorY = GROUND_Y;
  
  // Interaction positions
  private doorX: number;
  private deskX: number;
  
  private doorPrompt: Container | null = null;
  private deskPrompt: Container | null = null;

  constructor() {
    this.container = new Container();
    this.roomContainer = new Container();
    this.foregroundContainer = new Container();
    
    this.container.addChild(this.roomContainer);
    this.container.addChild(this.foregroundContainer);

    // Move the whole room up slightly as requested
    this.container.y = -35;

    // Give it a fixed start, but it might scroll if camera follows character
    // Center it somewhat or let it start at 0
    this.roomLeft = 0; 
    
    this.charMinX = this.roomLeft + 20;
    this.charMaxX = this.roomLeft + this.roomWidth - 40; // up to balcony

    this.doorX = this.roomLeft + 45;
    this.deskX = this.roomLeft + 600;

    this.drawRoom();
  }

  private drawRoom(): void {
    this.drawExteriorBackdrop();

    const g = new Graphics();

    // High detail procedural wall (stop before balcony)
    const balconyX = this.roomLeft + 900;
    const terraceEndX = this.roomWidth - 28;
    this.drawBrickWall(g, this.roomLeft, this.floorY - 200, balconyX, 200);

    // Baseboard (stop before balcony)
    g.rect(this.roomLeft, this.floorY - 12, balconyX, 12);
    g.fill(0x1a1a1c);
    g.rect(this.roomLeft, this.floorY - 12, balconyX, 1);
    g.fill(0x2a2a2c); // baseboard highlight

    // High detail procedural wood floor (stops at balcony)
    this.drawWoodFloor(g, this.roomLeft, this.floorY, balconyX - this.roomLeft, VIEWPORT_HEIGHT - this.floorY);

    // Concrete floor for balcony
    g.rect(balconyX, this.floorY, terraceEndX - balconyX, VIEWPORT_HEIGHT - this.floorY);
    g.fill(0x1a1c20); // Dark grey concrete
    g.rect(balconyX, this.floorY, terraceEndX - balconyX, 2);
    g.fill(0x2a2c30); // Edge highlight
    g.rect(terraceEndX - 4, this.floorY, 4, VIEWPORT_HEIGHT - this.floorY);
    g.fill(0x0e1014); // exposed slab edge
    
    this.roomContainer.addChild(g);

    // Wall division between kitchen and own room (added to foreground)
    const fg = new Graphics();
    const wallX = this.roomLeft + 480;
    fg.rect(wallX, this.floorY - 200, 40, 200 + (VIEWPORT_HEIGHT - this.floorY));
    fg.fill(0x0e0e11); // Thick black structural column
    
    // Wood framing on the edge of the partition
    fg.rect(wallX - 5, this.floorY - 200, 5, 200 + (VIEWPORT_HEIGHT - this.floorY));
    fg.fill(0x22130a); 
    fg.rect(wallX + 40, this.floorY - 200, 5, 200 + (VIEWPORT_HEIGHT - this.floorY));
    fg.fill(0x22130a);
    
    this.foregroundContainer.addChild(fg);

    // Balcony structure and glass
    const bgG = new Graphics();
    
    // Balcony separation (glass door frame)
    bgG.rect(balconyX, this.floorY - 200, 8, 200 + (VIEWPORT_HEIGHT - this.floorY));
    bgG.fill(0x0a0a0e);
    
    // Full-height balcony glass tint; the star field itself is drawn by the exterior backdrop.
    bgG.rect(balconyX + 8, 0, this.roomWidth - balconyX - 8, VIEWPORT_HEIGHT + 40);
    bgG.fill({ color: 0x334455, alpha: 0.12 });

    this.roomContainer.addChild(bgG);

    // Balcony Railing (Foreground)
    const railG = new Graphics();
    const railY = this.floorY - 45;
    railG.rect(balconyX, railY, terraceEndX - balconyX, 4);
    railG.fill(0x0e0e11);
    for(let bx = balconyX + 10; bx < terraceEndX; bx += 20) {
      railG.rect(bx, railY + 4, 3, this.floorY - railY - 4);
      railG.fill(0x0e0e11);
    }
    this.foregroundContainer.addChild(railG);
  }

  private drawExteriorBackdrop(): void {
    const g = new Graphics();
    const backdropHeight = VIEWPORT_HEIGHT + 40;
    const balconyX = this.roomLeft + 900;
    const boxes = this.getInactiveApartmentBoxes(balconyX);

    g.rect(this.roomLeft, 0, this.roomWidth, backdropHeight);
    g.fill(0x04060f);

    const terracePlaneX = balconyX + 8;
    let seed = 314159;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed & 0x7fffffff) / 0x7fffffff;
    };

    for (let i = 0; i < 150; i++) {
      const sx = this.roomLeft + rand() * this.roomWidth;
      const sy = rand() * backdropHeight;
      if (sx < terracePlaneX) {
        continue;
      }
      if (boxes.some((box) => sx >= box.x && sx <= box.x + box.w && sy >= box.y && sy <= box.y + box.h)) {
        continue;
      }
      const size = rand() > 0.86 ? 2 : 1;
      const alpha = 0.24 + rand() * 0.6;
      g.rect(sx, sy, size, size);
      g.fill({ color: 0xffffff, alpha });
    }

    for (const box of boxes) {
      this.drawInactiveApartmentBox(g, box.x, box.y, box.w, box.h);
    }

    const rows = [
      { y: 12, h: 58 },
      { y: 86, h: 62 },
    ];
    for (const row of rows) {
      g.rect(this.roomLeft, row.y + row.h + 8, balconyX - this.roomLeft, 3);
      g.fill({ color: 0x000000, alpha: 0.65 });
    }

    this.roomContainer.addChild(g);
  }

  private getInactiveApartmentBoxes(maxX: number) {
    const rows = [
      { y: 12, h: 58, offset: 0 },
      { y: 86, h: 62, offset: 48 },
    ];
    const widths = [170, 210, 185, 230];
    const boxes: Array<{ x: number; y: number; w: number; h: number }> = [];

    for (const row of rows) {
      let x = this.roomLeft + 18 - row.offset;
      let i = 0;
      while (x < maxX - 16) {
        const w = widths[i % widths.length];
        if (x + w > this.roomLeft) {
          const boxX = Math.max(this.roomLeft + 8, x);
          boxes.push({ x: boxX, y: row.y, w: Math.min(w, maxX - boxX), h: row.h });
        }
        x += w + 18;
        i++;
      }
    }

    return boxes;
  }

  private drawInactiveApartmentBox(g: Graphics, x: number, y: number, w: number, h: number): void {
    g.rect(x, y, w, h);
    g.fill({ color: 0x000000, alpha: 0.78 });
    g.rect(x, y, w, 1);
    g.fill({ color: 0x586078, alpha: 0.24 });
    g.rect(x, y + h - 1, w, 1);
    g.fill({ color: 0x000000, alpha: 0.75 });
    g.rect(x + w * 0.45, y + 8, 1, h - 16);
    g.fill({ color: 0x4e556a, alpha: 0.2 });
  }

  /** Draw a high detail modern dark brick/painted wall */
  private drawBrickWall(g: Graphics, x: number, y: number, w: number, h: number): void {
    // Very dark mortar back for contrast
    g.rect(x, y, w, h);
    g.fill(0x1a1a1c);

    let seed = 98765;
    const rand = () => {
      seed = (seed * 16807 + 0) % 2147483647;
      return (seed & 0x7fffffff) / 0x7fffffff;
    };

    let rowY = y;
    let r = 0;
    while (rowY < y + h) {
      const rowH = 8 + Math.floor(rand() * 2); // 8-9px bricks
      let brickX = x;
      if (r % 2 === 1) brickX -= 10;

      let c = 0;
      while (brickX < x + w) {
        const brickW = 20 + Math.floor(rand() * 4); // 20-23px bricks
        const drawX = Math.max(x, brickX);
        const drawW = Math.min(x + w - drawX, brickX + brickW - 1 - drawX + x);
        const drawY = Math.max(y, rowY);
        const drawH = Math.min(y + h - drawY, rowY + rowH - 1 - drawY + y);

        if (drawW > 0 && drawH > 0) {
          // Sleek dark gray/blue tones for modern apartment
          let hex = 0x24262b;
          const shift = (r * 11 + c * 23) % 4;
          if (shift === 0) hex = 0x2a2c33;
          else if (shift === 1) hex = 0x1d1e22;
          else if (shift === 2) hex = 0x212328;
          else if (shift === 3) hex = 0x27292f;

          g.rect(drawX, drawY, drawW, drawH);
          g.fill(hex);

          // Subtle highlight and shadow
          if (drawY === rowY && drawH > 1) {
            g.rect(drawX, drawY, drawW, 1);
            g.fill((hex & 0xfefefe) + 0x060606);
          }
          if (drawY + drawH === rowY + rowH - 1 && drawH > 2) {
            g.rect(drawX, drawY + drawH - 1, drawW, 1);
            g.fill((hex & 0xf0f0f0) - 0x080808);
          }
        }
        brickX += brickW;
        c++;
      }
      rowY += rowH;
      r++;
    }
  }

  /** Draw antique wood floor pattern */
  private drawWoodFloor(g: Graphics, x: number, y: number, w: number, h: number): void {
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
      const plankH = 6 + Math.floor(rand() * 3);
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
          // Warm medium dark oak
          let color = 0x2c1b10;
          const shift = (r * 19 + c * 23) % 4;
          if (shift === 0) color = 0x332014;
          else if (shift === 1) color = 0x24150b;
          else if (shift === 2) color = 0x28180c;
          else if (shift === 3) color = 0x2f1d12;

          g.rect(drawX, drawY, drawW, drawH);
          g.fill(color);

          for (let gx = drawX; gx < drawX + drawW; gx += 3 + Math.floor(rand() * 5)) {
            if (rand() > 0.3 && drawH > 1) {
              const grainY = drawY + 1 + Math.floor(rand() * (drawH - 2));
              const grainW = Math.min(drawX + drawW - gx, 4 + Math.floor(rand() * 8));
              g.rect(gx, grainY, grainW, 1);
              g.fill({ color: 0x150b05, alpha: 0.5 });
            }
          }

          if (drawY === rowY && drawH > 1) {
            g.rect(drawX, drawY, drawW, 1);
            g.fill({ color: 0xffffff, alpha: 0.03 });
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
    const basePath = "/assets/interiors/apartment";
    
    // Add yellow ambient lighting / glows BEFORE props so they render on the wall behind the furniture/lanterns
    this.addYellowLighting();

    // Generic door from post-office (or we just draw it if not exists, but we'll try load it)
    try {
      const texDoor = await Assets.load("/assets/interiors/post-office/door.png");
      const door = new Sprite(texDoor);
      door.anchor.set(0.5, 1);
      door.x = this.doorX;
      door.y = this.floorY + 4;
      door.scale.set(1.35);
      this.roomContainer.addChild(door);
    } catch {
      // Fallback drawn door
      const g = new Graphics();
      g.rect(this.doorX - 25, this.floorY - 84, 50, 80).fill(0x3e2723);
      this.roomContainer.addChild(g);
    }

    // The apartment assets have transparent padding at the bottom of their canvases.
    // Ground floor props by visible pixels so they sit on the same floor line as the character.
    await this.loadFloorProp(basePath, "kitchen.png", this.roomLeft + 320, 4, 1.35, 23);
    
    await this.loadFloorProp(basePath, "desk.png", this.deskX, 4, 0.95, 13);

    await this.loadFloorProp(basePath, "couch.png", this.roomLeft + 765, 3, 0.9, 42);
    
    await this.loadWallProp(basePath, "tv.png", this.roomLeft + 765, this.floorY - 110, 0.82);

    // Load decorative props from university library
    const libPath = "/assets/interiors/university-library";
    await this.loadFloorProp(libPath, "potted-fern.png", this.roomLeft + 205, 3, 0.62, 3); // near kitchen
    await this.loadFloorProp(libPath, "potted-plant.png", this.roomLeft + 870, 3, 0.72, 4); // near balcony
    
    // Wall Lanterns
    const lights = this.getLightPositions();
    await this.loadWallProp(libPath, "wall-lantern.png", lights.left.spriteX, lights.left.spriteY, lights.scale); // left wall lantern
    await this.loadWallProp(libPath, "wall-lantern.png", lights.right.spriteX, lights.right.spriteY, lights.scale); // partition wall lantern
    await this.loadWallProp(libPath, "round-window.png", this.roomLeft + 845, this.floorY - 96, 0.75); // living room window

    // Prompts
    this.createPrompts();
  }

  private async loadFloorProp(
    basePath: string,
    file: string,
    x: number,
    visibleBottomOffset: number,
    scale: number,
    transparentBottomPadding: number,
  ) {
    try {
      const tex = await Assets.load(`${basePath}/${file}`);
      const sprite = new Sprite(tex);
      sprite.anchor.set(0.5, 1);
      sprite.x = x;
      sprite.y = this.floorY + visibleBottomOffset + transparentBottomPadding * scale;
      sprite.scale.set(scale);
      this.roomContainer.addChild(sprite);
    } catch {
      console.warn(`Missing prop: ${file}`);
    }
  }

  private async loadWallProp(basePath: string, file: string, x: number, y: number, scale: number) {
    try {
      const tex = await Assets.load(`${basePath}/${file}`);
      const sprite = new Sprite(tex);
      sprite.anchor.set(0.5, 0.5);
      sprite.x = x;
      sprite.y = y;
      sprite.scale.set(scale);
      this.roomContainer.addChild(sprite);
    } catch {
      console.warn(`Missing prop: ${file}`);
    }
  }

  private addYellowLighting() {
    const addGlow = (x: number, y: number, color: number, radius: number, maxAlpha: number) => {
      const glow = new Graphics();
      const layers = 60; // Increased for even softer banding
      
      // Draw from largest (progress 1) to smallest (progress 0)
      for (let i = layers; i >= 1; i--) {
        const progress = i / layers;
        const r = radius * progress;
        const a = maxAlpha * Math.pow(1 - progress, 2.0); // Softer curve
        glow.circle(0, 0, r);
        glow.fill({ color, alpha: a });
      }
      glow.x = x;
      glow.y = y;
      glow.blendMode = "add";
      this.roomContainer.addChild(glow);
    };

    // Center glows on the lantern flame, not the whole wall-mounted sprite.
    const lights = this.getLightPositions();
    addGlow(lights.left.flameX, lights.left.flameY, 0xffd54f, 150, 0.05); // left wall lantern
    addGlow(lights.right.flameX, lights.right.flameY, 0xffd54f, 150, 0.05); // partition wall lantern
    
    // Removed blue lights as requested
  }

  private getLightPositions() {
    const scale = 0.68;
    const canvasAnchorX = 24;
    const canvasAnchorY = 32;
    const opaqueLeftX = 5;
    const flameX = 25;
    const flameY = 38;
    const centerFromMount = (canvasAnchorX - opaqueLeftX) * scale;
    const flameOffsetX = (flameX - canvasAnchorX) * scale;
    const flameOffsetY = (flameY - canvasAnchorY) * scale;

    const makeLight = (mountX: number, spriteY: number) => {
      const spriteX = mountX + centerFromMount;
      return {
        spriteX,
        spriteY,
        flameX: spriteX + flameOffsetX,
        flameY: spriteY + flameOffsetY,
      };
    };

    return {
      scale,
      left: makeLight(this.roomLeft, this.floorY - 126),
      right: makeLight(this.roomLeft + 520, this.floorY - 126),
    };
  }

  private createPrompts() {
    const createPrompt = (text: string, x: number, y: number) => {
      const container = new Container();
      container.visible = false;
      const bg = new Graphics();
      bg.roundRect(-40, -14, 80, 18, 4).fill({ color: 0x000000, alpha: 0.75 });
      container.addChild(bg);

      const style = new TextStyle({
        fontFamily: "monospace",
        fontSize: 9,
        fill: "#ffffff",
        align: "center",
      });
      const t = new Text({ text, style });
      t.anchor.set(0.5, 0.5);
      t.y = -5;
      container.addChild(t);

      container.x = x;
      container.y = y;
      this.roomContainer.addChild(container);
      return container;
    };

    this.doorPrompt = createPrompt("Press F to exit", this.doorX, this.floorY - 90);
    this.deskPrompt = createPrompt("Press F for CV", this.deskX, this.floorY - 90);
  }

  get shouldNavigate(): string | null { return this._shouldNavigate; }
  get shouldExit(): boolean { return this._shouldExit; }

  update(deltaMs: number, characterX: number, isInteracting: boolean): void {
    if (this.interactCooldownMs > 0) this.interactCooldownMs -= deltaMs;

    // Ensure the foreground container is drawn on top of the character
    if (this.foregroundContainer.parent) {
      this.container.setChildIndex(this.foregroundContainer, this.container.children.length - 1);
    }

    // Camera follow logic (side-scrolling)
    const halfWidth = VIEWPORT_WIDTH / 2;
    let targetX = halfWidth - characterX;
    
    // Clamp the camera so it doesn't show out-of-bounds black space
    const minCamX = VIEWPORT_WIDTH - this.roomWidth;
    const maxCamX = 0;
    targetX = Math.max(minCamX, Math.min(maxCamX, targetX));

    // Smooth lerp for the camera
    this.container.x += (targetX - this.container.x) * 0.1;

    // Door check
    const nearDoor = Math.abs(characterX - this.doorX) < 40;
    if (this.doorPrompt) {
      this.doorPrompt.visible = nearDoor;
      if (nearDoor) this.doorPrompt.y = this.floorY - 90 + Math.sin(Date.now() * 0.004) * 2;
    }
    if (nearDoor && isInteracting && this.interactCooldownMs <= 0) {
      this.interactCooldownMs = 500;
      this._shouldExit = true;
    }

    // Desk check
    const nearDesk = Math.abs(characterX - this.deskX) < 50;
    if (this.deskPrompt) {
      this.deskPrompt.visible = nearDesk;
      if (nearDesk) this.deskPrompt.y = this.floorY - 90 + Math.sin(Date.now() * 0.004) * 2;
    }
    if (nearDesk && isInteracting && this.interactCooldownMs <= 0) {
      this.interactCooldownMs = 500;
      this._shouldNavigate = "/cv";
    }
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
