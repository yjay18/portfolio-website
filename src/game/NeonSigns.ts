import { Container, Text, TextStyle, Sprite, Texture } from "pixi.js";
import { GROUND_Y, VIEWPORT_HEIGHT } from "@/data/buildings";

interface NeonSign {
  text: Text;
  glow: Sprite;
  baseAlpha: number;
  flickerSpeed: number;
  flickerPhase: number;
}

const GROUND_MID_Y = GROUND_Y + (VIEWPORT_HEIGHT - GROUND_Y) / 2;

const SIGNS = [
  {
    label: "RESEARCH",
    x: 600,
    color: "#22ff44",
    glowR: 34, glowG: 255, glowB: 68,
  },
  {
    label: "PROJECTS",
    x: 2400,
    color: "#4488ff",
    glowR: 68, glowG: 136, glowB: 255,
  },
  {
    label: "ABOUT ME",
    x: 4300,
    color: "#ff3344",
    glowR: 255, glowG: 51, glowB: 68,
  },
];

function createGlowTexture(r: number, g: number, b: number): Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(128, 32, 0, 128, 32, 128);
  grad.addColorStop(0, `rgba(${r},${g},${b},0.35)`);
  grad.addColorStop(0.4, `rgba(${r},${g},${b},0.15)`);
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 64);
  return Texture.from(canvas);
}

export class NeonSigns {
  container: Container;
  private signs: NeonSign[] = [];

  constructor() {
    this.container = new Container();

    for (const def of SIGNS) {
      // Radial glow sprite
      const glowTex = createGlowTexture(def.glowR, def.glowG, def.glowB);
      const glow = new Sprite(glowTex);
      glow.anchor.set(0.5, 0.5);
      glow.x = def.x;
      glow.y = GROUND_MID_Y;
      glow.scale.set(1.35, 1.08);
      this.container.addChild(glow);

      // Neon text — 30% bigger
      const style = new TextStyle({
        fontFamily: "monospace",
        fontSize: 19,
        fontWeight: "bold",
        fill: def.color,
        letterSpacing: 6,
        dropShadow: {
          color: def.color,
          blur: 14,
          distance: 0,
          alpha: 0.9,
        },
      });
      const text = new Text({ text: def.label, style });
      text.anchor.set(0.5, 0.5);
      text.x = def.x;
      text.y = GROUND_MID_Y;
      this.container.addChild(text);

      this.signs.push({
        text,
        glow,
        baseAlpha: 0.8 + Math.random() * 0.2,
        flickerSpeed: 2 + Math.random() * 3,
        flickerPhase: Math.random() * Math.PI * 2,
      });
    }
  }

  update(time: number) {
    for (const sign of this.signs) {
      const wave = Math.sin(time * 0.001 * sign.flickerSpeed + sign.flickerPhase);
      const smoothFlicker = 0.7 + 0.3 * wave;
      const randomPop = Math.random() > 0.97 ? 0.3 : 1.0;
      const flash = Math.random() > 0.995 ? 1.3 : 1.0;

      const alpha = Math.min(1.0, sign.baseAlpha * smoothFlicker * randomPop * flash);

      sign.text.alpha = alpha;
      sign.glow.alpha = alpha * 0.7;
    }
  }
}
