export type Zone = "publications" | "projects" | "personal";

export interface NpcConfig {
  spriteFile: string;
  idleFrames?: number;
  dialogLine: string;
  interactionRoute: string;
  facingLeft?: boolean;
}

export interface InteriorProp {
  id: string;
  spriteFile: string;
  x: number;
  y: number;
  scale?: number;
  wallMounted?: boolean;
}

export interface InteriorConfig {
  roomWidth: number;
  roomHeight: number;
  npc?: NpcConfig;
  props: InteriorProp[];
}

export interface BuildingConfig {
  id: string;
  name: string;
  zone: Zone;
  route: string;
  x: number;
  width: number;
  height: number;
  doorX: number;
  spriteFile: string;
  description: string;
  yOffset: number;
  scale?: number;
  interior?: InteriorConfig;
}

export const WORLD_WIDTH = 4800;
export const SPAWN_X = 2400;
export const GROUND_Y = 380;
export const VIEWPORT_WIDTH = 800;
export const VIEWPORT_HEIGHT = 450;
export const INTERACTION_WIDTH = 60;
export const BUILDING_SCALE = 1.3; // hi-res sprites (160-256px) need less scaling
export const CHARACTER_SCALE = 1.05; // HD 96px char, 20% smaller than before

export const ZONE_RANGES: Record<
  Zone,
  { start: number; end: number; tint: string }
> = {
  publications: { start: 0, end: 1200, tint: "#2d1b4e" },
  projects: { start: 1600, end: 3600, tint: "#1a4d2e" },
  personal: { start: 4000, end: 4800, tint: "#1e3a5f" },
};

// yOffset = measured bottom transparent padding * BUILDING_SCALE (1.3)
// Ground cover hides anything below GROUND_Y, so slight over-sink is fine
export const buildings: BuildingConfig[] = [
  // Publications Zone (hi-res sprites 160-256px)
  {
    id: "university-library",
    name: "University Library",
    zone: "publications",
    route: "/thesis",
    x: 200,
    width: 160,
    height: 192,
    doorX: 320,
    spriteFile: "university-library.png",
    description: "ICU Hypotension Early Warning System thesis",
    yOffset: 20, // 15px * 1.3
  },
  {
    id: "fighting-ring",
    name: "The Fighting Ring",
    zone: "publications",
    route: "/colm-paper",
    x: 700,
    width: 192,
    height: 192,
    doorX: 840,
    spriteFile: "fighting-ring.png",
    description: "COLM: Multi-Agent Social Simulation paper",
    yOffset: 39, // 30px * 1.3
  },
  // Projects Zone
  {
    id: "lora-surgeon-labs",
    name: "LoRA Surgeon Labs",
    zone: "projects",
    route: "/lorasurgeon",
    x: 1700,
    width: 160,
    height: 224,
    doorX: 1800,
    spriteFile: "lora-surgeon-labs.png",
    description: "LoRASurgeon — SAE + LoRA adapter analysis",
    yOffset: 31, // 24px * 1.3
  },
  {
    id: "neural-dungeon-arcade",
    name: "Neural Dungeon Arcade",
    zone: "projects",
    route: "/neural-dungeon",
    x: 2100,
    width: 160,
    height: 192,
    doorX: 2200,
    spriteFile: "neural-dungeon-arcade.png",
    description: "Neural Dungeon roguelike / The Fun Game",
    yOffset: 23, // 18px * 1.3
  },
  {
    id: "copybot-terminal",
    name: "CopyBot Terminal",
    zone: "projects",
    route: "/copybot",
    x: 2500,
    width: 160,
    height: 192,
    doorX: 2600,
    spriteFile: "copybot-terminal.png",
    description: "CopyBot Polymarket copy-trading bot",
    yOffset: 30, // 23px * 1.3
  },
  {
    id: "legal-classifier",
    name: "Legal Classifier Courthouse",
    zone: "projects",
    route: "/legal-classifier",
    x: 2900,
    width: 192,
    height: 224,
    doorX: 3020,
    spriteFile: "legal-classifier.png",
    description: "US state law passage probability predictor",
    yOffset: 114, // 57px padding * 2.0 scale
    scale: 2.0, // bigger than default — law office sprite is small
  },
  // Personal Zone (hi-res sprites 144-192px)
  {
    id: "yuuvs-apartment",
    name: "Yuuv's Apartment",
    zone: "personal",
    route: "/about",
    x: 4050,
    width: 160,
    height: 192,
    doorX: 4150,
    spriteFile: "yuuvs-apartment.png",
    description: "About Me — TCD, education, skills, tech stack",
    yOffset: 7, // 5px * 1.3
  },
  {
    id: "games-tracker",
    name: "Games Tracker Shop",
    zone: "personal",
    route: "/games-tracker",
    x: 4350,
    width: 160,
    height: 160,
    doorX: 4450,
    spriteFile: "games-tracker.png",
    description: "PS5/Switch/Laptop game backlog + reviews",
    yOffset: 26, // 20px * 1.3
  },
  {
    id: "post-office",
    name: "Post Office",
    zone: "personal",
    route: "/contact",
    x: 4600,
    width: 144,
    height: 160,
    doorX: 4690,
    spriteFile: "post-office.png",
    description: "Contact, social links, resume PDF",
    yOffset: 17, // 13px * 1.3
    interior: {
      roomWidth: 400,
      roomHeight: 180,
      npc: {
        spriteFile: "clerk-west.png",
        idleFrames: 4,
        dialogLine: "Got a message for Yuuv? Let me get the form...",
        interactionRoute: "/contact",
        facingLeft: true,
      },
      props: [
        { id: "door", spriteFile: "door.png", x: 30, y: 0, scale: 1.2 },
        { id: "plant", spriteFile: "potted-plant.png", x: 75, y: 50, scale: 0.9 },
        { id: "sorting-rack", spriteFile: "mail-sorting-rack.png", x: 120, y: 8, scale: 1.3 },
        { id: "side-table", spriteFile: "side-table-letters.png", x: 185, y: 0, scale: 1.0 },
        { id: "notice-board", spriteFile: "notice-board.png", x: 185, y: -40, scale: 0.85, wallMounted: true },
        { id: "shelves", spriteFile: "parcel-shelves.png", x: 250, y: 8, scale: 1.3 },
        { id: "desk", spriteFile: "desk-half.png", x: 320, y: 24, scale: 1.6 },
        { id: "clock", spriteFile: "wall-clock.png", x: 350, y: -20, scale: 0.8, wallMounted: true },
      ],
    },
  },
];

export function getBuildingByRoute(
  route: string,
): BuildingConfig | undefined {
  return buildings.find((b) => b.route === route);
}

export function getBuildingById(id: string): BuildingConfig | undefined {
  return buildings.find((b) => b.id === id);
}

export function getZoneAt(x: number): Zone {
  if (x < 1400) return "publications";
  if (x < 3800) return "projects";
  return "personal";
}

export function getBuildingWithInterior(id: string): BuildingConfig | undefined {
  return buildings.find((b) => b.id === id && b.interior);
}
