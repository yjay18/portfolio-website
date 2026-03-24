import { Container } from "pixi.js";
import { ParallaxLayer } from "./ParallaxLayer";

export class ParallaxScene {
  container: Container;
  layers: ParallaxLayer[];

  constructor() {
    this.container = new Container();

    this.layers = [
      new ParallaxLayer(0),    // sky — static
      new ParallaxLayer(0.1),  // distant city
      new ParallaxLayer(0.3),  // mid buildings
      new ParallaxLayer(1.0),  // main street
      new ParallaxLayer(1.0),  // foreground (same scroll as main)
    ];

    for (const layer of this.layers) {
      this.container.addChild(layer.container);
    }
  }

  get sky() { return this.layers[0]; }
  get distant() { return this.layers[1]; }
  get mid() { return this.layers[2]; }
  get main() { return this.layers[3]; }
  get foreground() { return this.layers[4]; }

  update(cameraX: number) {
    // Each layer scrolls at its own speed
    // Parallax layers (distant, mid) scroll slower than camera
    this.distant.container.x = -cameraX * this.distant.speed;
    this.mid.container.x = -cameraX * this.mid.speed;

    // Main and foreground scroll 1:1 with camera
    this.main.container.x = -cameraX;
    this.foreground.container.x = -cameraX;
  }
}
