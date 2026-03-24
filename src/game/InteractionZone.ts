import { Container, Text, TextStyle, Graphics } from "pixi.js";
import {
  type BuildingConfig,
  GROUND_Y,
  INTERACTION_WIDTH,
  BUILDING_SCALE,
} from "@/data/buildings";

export class InteractionZone {
  config: BuildingConfig;
  isPlayerInRange = false;
  private prompt: Container;
  private baseY: number;

  constructor(config: BuildingConfig, parentContainer: Container) {
    this.config = config;

    this.prompt = new Container();
    this.prompt.visible = false;

    // Background pill
    const bg = new Graphics();
    bg.roundRect(-44, -14, 88, 18, 4).fill({
      color: 0x000000,
      alpha: 0.75,
    });
    this.prompt.addChild(bg);

    // Text
    const style = new TextStyle({
      fontFamily: "monospace",
      fontSize: 9,
      fill: "#ffffff",
      align: "center",
    });
    const text = new Text({ text: "Press E to enter", style });
    text.anchor.set(0.5, 0.5);
    text.y = -5;
    this.prompt.addChild(text);

    // Position above scaled building (use per-building scale if set)
    const scale = config.scale ?? BUILDING_SCALE;
    this.baseY = GROUND_Y - config.height * scale - 10;
    this.prompt.x = config.doorX;
    this.prompt.y = this.baseY;
    parentContainer.addChild(this.prompt);
  }

  update(characterX: number) {
    const dist = Math.abs(characterX - this.config.doorX);
    this.isPlayerInRange = dist < INTERACTION_WIDTH;
    this.prompt.visible = this.isPlayerInRange;

    if (this.isPlayerInRange) {
      this.prompt.y = this.baseY + Math.sin(Date.now() * 0.004) * 2;
    }
  }
}
