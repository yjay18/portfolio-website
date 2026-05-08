import { Assets, Sprite, Texture } from "pixi.js";
import { Building } from "./Building";
import {
  visibleBuildings as buildingConfigs,
  GROUND_Y,
} from "@/data/buildings";
import { ParallaxScene } from "./ParallaxScene";
import { type BgBuildingDef } from "./ParallaxLayer";
import { streetObjects } from "./constants";

// Background building sprites and their measured bottom padding (px)
// apartment.png:     200px tall, 0px bottom padding
// office-tower.png:  220px tall, 0px bottom padding
// highrise.png:      180px tall, 43px bottom padding
// brick-narrow.png:  180px tall, 6px bottom padding
// skyscraper.png:    250px tall, 0px bottom padding
const BG_SPRITES = [
  "apartment.png",
  "office-tower.png",
  "highrise.png",
  "brick-narrow.png",
  "skyscraper.png",
];

// yOffset = bottomPadding * scale for each sprite
// Distant layer (0.1x scroll) — towering dark silhouettes
const DISTANT_BUILDINGS: BgBuildingDef[] = [
  { sprite: "skyscraper.png", x: 50, scale: 4.0, tint: 0x222244, yOffset: 0 },
  { sprite: "apartment.png", x: 250, scale: 3.5, tint: 0x1e1e3a, yOffset: 0 },
  { sprite: "office-tower.png", x: 450, scale: 3.5, tint: 0x222244, yOffset: 0 },
  { sprite: "highrise.png", x: 650, scale: 3.5, tint: 0x1e1e3a, yOffset: 150 }, // 43 * 3.5
  { sprite: "brick-narrow.png", x: 820, scale: 4.0, tint: 0x222244, yOffset: 24 }, // 6 * 4
  { sprite: "apartment.png", x: 1000, scale: 3.0, tint: 0x1e1e3a, yOffset: 0 },
  { sprite: "skyscraper.png", x: 1200, scale: 3.5, tint: 0x222244, yOffset: 0 },
];

// Mid layer (0.3x scroll) — closer, more visible detail
const MID_BUILDINGS: BgBuildingDef[] = [
  { sprite: "office-tower.png", x: 60, scale: 2.5, tint: 0x445566, yOffset: 0 },
  { sprite: "brick-narrow.png", x: 230, scale: 2.8, tint: 0x4a4a66, yOffset: 17 }, // 6 * 2.8
  { sprite: "apartment.png", x: 400, scale: 2.5, tint: 0x445566, yOffset: 0 },
  { sprite: "skyscraper.png", x: 580, scale: 3.0, tint: 0x4a4a66, yOffset: 0 },
  { sprite: "highrise.png", x: 750, scale: 2.5, tint: 0x445566, yOffset: 108 }, // 43 * 2.5
  { sprite: "office-tower.png", x: 920, scale: 2.8, tint: 0x4a4a66, yOffset: 0 },
  { sprite: "brick-narrow.png", x: 1100, scale: 2.5, tint: 0x445566, yOffset: 15 }, // 6 * 2.5
  { sprite: "apartment.png", x: 1280, scale: 2.5, tint: 0x4a4a66, yOffset: 0 },
  { sprite: "skyscraper.png", x: 1450, scale: 3.0, tint: 0x445566, yOffset: 0 },
  { sprite: "highrise.png", x: 1620, scale: 2.5, tint: 0x4a4a66, yOffset: 108 }, // 43 * 2.5
];

export class WorldBuilder {
  buildings: Building[] = [];

  async build(scene: ParallaxScene) {
    await this.placeParallaxBackgrounds(scene);
    await this.placeBuildings(scene);
    await this.placeStreetObjects(scene);
    await this.placeBirds(scene);
  }

  private async placeBuildings(scene: ParallaxScene) {
    for (const config of buildingConfigs) {
      let texture: Texture;
      try {
        texture = await Assets.load(
          `/assets/buildings/${config.spriteFile}`,
        );
      } catch {
        console.warn(
          `Failed to load building sprite: ${config.spriteFile}`,
        );
        continue;
      }

      const building = new Building(config, texture);
      this.buildings.push(building);
      scene.main.container.addChild(building.container);
    }
  }

  private async placeParallaxBackgrounds(scene: ParallaxScene) {
    // Load all background building textures
    const texMap = new Map<string, Texture>();
    for (const file of BG_SPRITES) {
      try {
        const tex = await Assets.load(`/assets/bg-buildings/${file}`);
        texMap.set(file, tex);
      } catch {
        // Skip missing sprites — some may not have generated
        console.warn(`Skipping bg building: ${file}`);
      }
    }

    // Place buildings on distant layer (tinted very dark for depth)
    scene.distant.placeBuildings(texMap, DISTANT_BUILDINGS);

    // Place buildings on mid layer (less dark, closer feel)
    scene.mid.placeBuildings(texMap, MID_BUILDINGS);
  }

  // Per-object scale and ground offset — tuned from screenshots
  private static objectConfig: Record<string, { scale: number; yExtra: number }> = {
    "bench.png": { scale: 0.8, yExtra: 10 },         // bench stays same height
    "bicycle.png": { scale: 1.4, yExtra: 12 },       // +4px down onto street
    "dustbin.png": { scale: 0.8, yExtra: 10 },       // +4px down
    "fire-hydrant.png": { scale: 0.7, yExtra: 8 },   // +4px down
    "lamp-post.png": { scale: 1.2, yExtra: 9 },      // +4px down
    "parked-scooter.png": { scale: 1.1, yExtra: 12 },// +4px down
    "potted-plant.png": { scale: 0.6, yExtra: 8 },   // keep (on sidewalk)
    "street-sign.png": { scale: 0.8, yExtra: 8 },    // +4px down
    "vending-machine.png": { scale: 1.05, yExtra: 10 },// +4px down
  };

  private async placeStreetObjects(scene: ParallaxScene) {
    for (const obj of streetObjects) {
      try {
        const texture = await Assets.load(
          `/assets/objects/${obj.sprite}`,
        );
        const cfg = WorldBuilder.objectConfig[obj.sprite] ?? { scale: 0.8, yExtra: 5 };
        const sprite = new Sprite(texture);
        sprite.anchor.set(0.5, 1);
        sprite.scale.set(cfg.scale);
        sprite.x = obj.x;
        sprite.y = GROUND_Y + cfg.yExtra;

        if (obj.layer === "foreground") {
          scene.foreground.container.addChild(sprite);
        } else {
          scene.main.container.addChild(sprite);
        }
      } catch {
        console.warn(`Failed to load street object: ${obj.sprite}`);
      }
    }
  }

  private async placeBirds(scene: ParallaxScene) {
    // Birds on the ground near buildings (not floating)
    const birdPositions = [
      { x: 500, y: GROUND_Y + 12 },
      { x: 2350, y: GROUND_Y + 10 },
      { x: 4500, y: GROUND_Y + 12 },
    ];

    try {
      const birdTex = await Assets.load("/assets/creatures/bird.png");
      for (const pos of birdPositions) {
        const bird = new Sprite(birdTex);
        bird.anchor.set(0.5, 1);
        bird.x = pos.x;
        bird.y = pos.y;
        bird.scale.set(0.6);
        scene.main.container.addChild(bird);
      }
    } catch {
      console.warn("Failed to load bird sprite");
    }
  }
}
