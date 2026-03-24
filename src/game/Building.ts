import { Container, Sprite, Texture, Text, TextStyle } from "pixi.js";
import { type BuildingConfig, GROUND_Y, BUILDING_SCALE } from "@/data/buildings";

export class Building {
  container: Container;
  config: BuildingConfig;
  sprite: Sprite;

  constructor(config: BuildingConfig, texture: Texture) {
    this.config = config;
    this.container = new Container();

    const scale = config.scale ?? BUILDING_SCALE;

    this.sprite = new Sprite(texture);
    this.sprite.anchor.set(0.5, 1);
    this.sprite.scale.set(scale);
    this.container.addChild(this.sprite);

    // Building name sign above
    const nameStyle = new TextStyle({
      fontFamily: "monospace",
      fontSize: 10,
      fill: "#ffffff",
      align: "center",
      dropShadow: {
        color: "#000000",
        blur: 3,
        distance: 1,
      },
    });
    const nameText = new Text({ text: config.name, style: nameStyle });
    nameText.anchor.set(0.5, 1);
    nameText.y = -texture.height * scale + config.yOffset - 8;
    this.container.addChild(nameText);

    this.container.x = config.doorX;
    this.container.y = GROUND_Y + config.yOffset + 10;
  }
}
