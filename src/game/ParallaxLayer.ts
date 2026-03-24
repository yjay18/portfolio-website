import { Container, Sprite, Texture } from "pixi.js";
import { GROUND_Y } from "@/data/buildings";

export interface BgBuildingDef {
  sprite: string;
  x: number;
  scale: number;
  tint?: number;
  yOffset: number; // = bottomPadding * scale — sinks sprite to ground
}

export class ParallaxLayer {
  container: Container;
  speed: number;

  constructor(speed: number) {
    this.container = new Container();
    this.speed = speed;
  }

  placeBuildings(textures: Map<string, Texture>, defs: BgBuildingDef[]) {
    for (const def of defs) {
      const tex = textures.get(def.sprite);
      if (!tex) continue;

      const sprite = new Sprite(tex);
      sprite.anchor.set(0.5, 1);
      sprite.scale.set(def.scale);
      sprite.x = def.x;
      // Sink deep below ground — ground cover on this layer hides the base
      sprite.y = GROUND_Y + def.yOffset + 15;
      if (def.tint !== undefined) {
        sprite.tint = def.tint;
      }
      this.container.addChild(sprite);
    }
  }

  update(_cameraX: number) {
    // Scrolling handled by ParallaxScene
  }
}
