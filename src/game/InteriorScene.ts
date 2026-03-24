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
  type BuildingConfig,
  VIEWPORT_WIDTH,
  VIEWPORT_HEIGHT,
  GROUND_Y,
  CHARACTER_SCALE,
} from "@/data/buildings";
import { DialogBox } from "./DialogBox";

export class InteriorScene {
  container: Container;
  private config;
  private buildingId: string;
  private roomContainer: Container;

  // Room positioning — centered in viewport
  readonly roomLeft: number;
  readonly roomRight: number;
  readonly floorY = GROUND_Y;

  // NPC
  private npcContainer: Container | null = null;
  private npcX = 0;
  private dialog: DialogBox | null = null;
  private npcInteractionRange = 90;
  private promptContainer: Container | null = null;

  // Door exit
  private doorX: number = 0;
  private doorInteractionRange = 40;
  private doorPrompt: Container | null = null;
  readonly charMinX: number;
  readonly charMaxX: number;

  // State
  private _shouldExit = false;
  private _shouldNavigate: string | null = null;
  private interactCooldownMs = 0;

  constructor(building: BuildingConfig) {
    const interior = building.interior!;
    this.config = interior;
    this.buildingId = building.id;

    this.container = new Container();
    this.roomContainer = new Container();
    this.container.addChild(this.roomContainer);

    // Center the room in the viewport
    this.roomLeft = (VIEWPORT_WIDTH - interior.roomWidth) / 2;
    this.roomRight = this.roomLeft + interior.roomWidth;
    this.charMinX = this.roomLeft + 15;

    // Clamp player to the desk position so they can't walk past it
    const deskProp = interior.props.find((p) => p.id === "desk");
    this.charMaxX = deskProp
      ? this.roomLeft + deskProp.x - 15
      : this.roomRight - 15;

    // Find the door prop position for exit interaction
    const doorProp = interior.props.find((p) => p.id === "door");
    if (doorProp) {
      this.doorX = this.roomLeft + doorProp.x;
    }

    this.drawRoom();
  }

  private drawRoom(): void {
    const { roomWidth, roomHeight } = this.config;
    const g = new Graphics();

    // Back wall
    g.rect(this.roomLeft, this.floorY - roomHeight, roomWidth, roomHeight);
    g.fill(0x5c3a21);

    // Floor
    g.rect(this.roomLeft, this.floorY, roomWidth, VIEWPORT_HEIGHT - this.floorY);
    g.fill(0x8b6914);

    // Floor highlight line
    g.rect(this.roomLeft, this.floorY, roomWidth, 1);
    g.fill(0xa07828);

    // Ceiling beam
    g.rect(this.roomLeft, this.floorY - roomHeight - 6, roomWidth, 6);
    g.fill(0x3d2510);

    // Left wall edge
    g.rect(this.roomLeft, this.floorY - roomHeight - 6, 3, roomHeight + 6 + (VIEWPORT_HEIGHT - this.floorY));
    g.fill(0x2a1a0e);

    // Right wall edge
    g.rect(this.roomRight - 3, this.floorY - roomHeight - 6, 3, roomHeight + 6 + (VIEWPORT_HEIGHT - this.floorY));
    g.fill(0x2a1a0e);

    this.roomContainer.addChild(g);
  }

  async loadAssets(): Promise<void> {
    const basePath = `/assets/interiors/${this.buildingId}`;

    // Load props
    for (const prop of this.config.props) {
      try {
        // Animated clock — load 4 frames
        if (prop.id === "clock") {
          const frames: Texture[] = [];
          for (let i = 0; i < 4; i++) {
            const tex = await Assets.load(`${basePath}/clock-frame-${i}.png`);
            frames.push(tex);
          }
          const anim = new AnimatedSprite(frames);
          anim.anchor.set(0.5, 0);
          anim.scale.set(prop.scale ?? 1.0);
          anim.animationSpeed = 0.02;
          anim.play();
          anim.x = this.roomLeft + prop.x;
          anim.y = this.floorY - this.config.roomHeight + Math.abs(prop.y);
          this.roomContainer.addChild(anim);
          continue;
        }

        const texture = await Assets.load(`${basePath}/${prop.spriteFile}`);
        const sprite = new Sprite(texture);
        sprite.anchor.set(0.5, 1);
        sprite.scale.set(prop.scale ?? 1.0);

        if (prop.wallMounted) {
          sprite.anchor.set(0.5, 0);
          sprite.x = this.roomLeft + prop.x;
          sprite.y = this.floorY - this.config.roomHeight + Math.abs(prop.y);
        } else {
          sprite.x = this.roomLeft + prop.x;
          sprite.y = this.floorY + prop.y;
        }

        this.roomContainer.addChild(sprite);
      } catch {
        console.warn(`Failed to load interior prop: ${prop.spriteFile}`);
      }
    }

    // Load NPC
    if (this.config.npc) {
      const npc = this.config.npc;
      this.npcContainer = new Container();
      const deskProp = this.config.props.find((p) => p.id === "desk");
      this.npcX = this.roomLeft + (deskProp ? deskProp.x + 55 : this.config.roomWidth - 60);
      this.npcContainer.x = this.npcX;
      this.npcContainer.y = this.floorY + 8;

      try {
        if (npc.idleFrames && npc.idleFrames > 0) {
          const frames: Texture[] = [];
          for (let i = 0; i < npc.idleFrames; i++) {
            const tex = await Assets.load(
              `${basePath}/clerk-idle-west/frame_00${i}.png`,
            );
            frames.push(tex);
          }
          const anim = new AnimatedSprite(frames);
          anim.anchor.set(0.5, 1);
          anim.scale.set(CHARACTER_SCALE * 1.7);
          anim.animationSpeed = 0.08;
          anim.play();
          this.npcContainer.addChild(anim);
        } else {
          const tex = await Assets.load(`${basePath}/${npc.spriteFile}`);
          const sprite = new Sprite(tex);
          sprite.anchor.set(0.5, 1);
          sprite.scale.set(CHARACTER_SCALE * 1.7);
          this.npcContainer.addChild(sprite);
        }
      } catch {
        const ph = new Graphics();
        ph.rect(-12, -40, 24, 40).fill(0x4444aa);
        this.npcContainer.addChild(ph);
      }

      this.roomContainer.addChild(this.npcContainer);

      // Interaction prompt
      this.promptContainer = new Container();
      this.promptContainer.visible = false;

      const bg = new Graphics();
      bg.roundRect(-40, -14, 80, 18, 4).fill({ color: 0x000000, alpha: 0.75 });
      this.promptContainer.addChild(bg);

      const style = new TextStyle({
        fontFamily: "monospace",
        fontSize: 9,
        fill: "#ffffff",
        align: "center",
      });
      const text = new Text({ text: "Press E to talk", style });
      text.anchor.set(0.5, 0.5);
      text.y = -5;
      this.promptContainer.addChild(text);

      this.promptContainer.x = this.npcX;
      this.promptContainer.y = this.floorY - 55;
      this.roomContainer.addChild(this.promptContainer);
    }

    // Door exit prompt
    if (this.doorX) {
      this.doorPrompt = new Container();
      this.doorPrompt.visible = false;

      const doorBg = new Graphics();
      doorBg.roundRect(-36, -14, 72, 18, 4).fill({ color: 0x000000, alpha: 0.75 });
      this.doorPrompt.addChild(doorBg);

      const doorStyle = new TextStyle({
        fontFamily: "monospace",
        fontSize: 9,
        fill: "#ffffff",
        align: "center",
      });
      const doorText = new Text({ text: "Press E to exit", style: doorStyle });
      doorText.anchor.set(0.5, 0.5);
      doorText.y = -5;
      this.doorPrompt.addChild(doorText);

      this.doorPrompt.x = this.doorX;
      this.doorPrompt.y = this.floorY - 75;
      this.roomContainer.addChild(this.doorPrompt);
    }
  }

  get shouldNavigate(): string | null {
    return this._shouldNavigate;
  }

  get shouldExit(): boolean {
    return this._shouldExit;
  }

  update(deltaMs: number, characterX: number, isInteracting: boolean): void {
    if (this.interactCooldownMs > 0) {
      this.interactCooldownMs -= deltaMs;
    }

    // Dialog active
    if (this.dialog) {
      this.dialog.update(deltaMs, isInteracting && this.interactCooldownMs <= 0);
      if (this.dialog.isDismissed) {
        this.dialog.destroy();
        this.roomContainer.removeChild(this.dialog.container);
        this.dialog = null;
        if (this.config.npc) {
          this._shouldNavigate = this.config.npc.interactionRoute;
        }
      }
      return;
    }

    // NPC proximity check
    if (this.config.npc && this.npcContainer) {
      const dist = Math.abs(characterX - this.npcX);
      const inRange = dist < this.npcInteractionRange;

      if (this.promptContainer) {
        this.promptContainer.visible = inRange;
        if (inRange) {
          this.promptContainer.y = this.floorY - 55 + Math.sin(Date.now() * 0.004) * 2;
        }
      }

      if (inRange && isInteracting && this.interactCooldownMs <= 0) {
        this.interactCooldownMs = 500;
        this.dialog = new DialogBox(
          this.config.npc.dialogLine,
          this.npcX,
          this.floorY - 60,
        );
        this.roomContainer.addChild(this.dialog.container);
        if (this.promptContainer) this.promptContainer.visible = false;
      }
    }

    // Door exit check
    if (this.doorX) {
      const doorDist = Math.abs(characterX - this.doorX);
      const nearDoor = doorDist < this.doorInteractionRange;

      if (this.doorPrompt) {
        this.doorPrompt.visible = nearDoor;
        if (nearDoor) {
          this.doorPrompt.y = this.floorY - 75 + Math.sin(Date.now() * 0.004) * 2;
        }
      }

      if (nearDoor && isInteracting && this.interactCooldownMs <= 0) {
        this.interactCooldownMs = 500;
        this._shouldExit = true;
      }
    }
  }

  destroy(): void {
    if (this.dialog) {
      this.dialog.destroy();
      this.dialog = null;
    }
    this.container.destroy({ children: true });
  }
}
