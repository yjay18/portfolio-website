export interface StreetObjectDef {
  sprite: string;
  x: number;
  layer: "main" | "foreground";
}

export const streetObjects: StreetObjectDef[] = [
  // Publications zone (0-1400)
  { sprite: "lamp-post.png", x: 80, layer: "foreground" },
  { sprite: "bench.png", x: 450, layer: "main" },
  { sprite: "potted-plant.png", x: 580, layer: "main" },
  { sprite: "lamp-post.png", x: 950, layer: "foreground" },
  // Transition
  { sprite: "street-sign.png", x: 1300, layer: "main" },
  { sprite: "lamp-post.png", x: 1500, layer: "foreground" },
  // Projects zone (1600-3600)
  { sprite: "dustbin.png", x: 1950, layer: "main" },
  { sprite: "lamp-post.png", x: 2350, layer: "foreground" },
  { sprite: "fire-hydrant.png", x: 2400, layer: "main" },
  { sprite: "vending-machine.png", x: 2750, layer: "main" },
  { sprite: "bicycle.png", x: 3100, layer: "main" },
  { sprite: "lamp-post.png", x: 3300, layer: "foreground" },
  { sprite: "dustbin.png", x: 3500, layer: "main" },
  // Transition
  { sprite: "street-sign.png", x: 3850, layer: "main" },
  { sprite: "lamp-post.png", x: 3950, layer: "foreground" },
  // Personal zone (4000-4800)
  { sprite: "lamp-post.png", x: 4250, layer: "foreground" },
  { sprite: "potted-plant.png", x: 4300, layer: "main" },
  { sprite: "parked-scooter.png", x: 4530, layer: "main" },
  { sprite: "bench.png", x: 4780, layer: "main" }, // past the post office
];
