import { Application } from "pixi.js";
import {
  VIEWPORT_WIDTH,
  VIEWPORT_HEIGHT,
  GROUND_Y,
  getBuildingById,
  getBuildingWithInterior,
} from "@/data/buildings";
import { InteriorScene } from "./InteriorScene";
import { LibraryScene } from "./LibraryScene";
import { FightingRingScene } from "./FightingRingScene";
import { LegalClassifierScene } from "./LegalClassifierScene";
import { ParallaxScene } from "./ParallaxScene";
import { Sky } from "./Sky";
import { Character } from "./Character";
import { Camera } from "./Camera";
import { Ground } from "./Ground";
import { WorldBuilder } from "./WorldBuilder";
import { InteractionZone } from "./InteractionZone";
import { Creature } from "./Creature";
import { FireflyEmitter } from "./Particles";
import { Transition } from "./Transition";
import { NeonSigns } from "./NeonSigns";
import {
  Rain, LampGlows, ShootingStars, DustMotes,
  FootstepDust, FogWisps, DoorGlows, HeadlightSweep,
} from "./Effects";
import { useWorldStore } from "@/store/worldStore";

type SceneMode = "world" | "interior";

export class Game {
  app: Application;
  parallaxScene!: ParallaxScene;
  sky!: Sky;
  character!: Character;
  camera!: Camera;
  worldBuilder!: WorldBuilder;
  transition!: Transition;
  interactionZones: InteractionZone[] = [];
  private cat!: Creature;
  private neonSigns!: NeonSigns;
  private rain!: Rain;
  private lampGlows!: LampGlows;
  private shootingStars!: ShootingStars;
  private dustMotes!: DustMotes;
  private footstepDust!: FootstepDust;
  private fogWisps!: FogWisps;
  private doorGlows!: DoorGlows;
  private headlightSweep!: HeadlightSweep;
  private fireflies!: FireflyEmitter;
  private containerEl: HTMLElement;
  private navigateFn: ((route: string) => void) | null = null;
  private unsubscribeStore: (() => void) | null = null;
  private _destroyed = false;
  private _initialized = false;
  private _navigating = false; // prevents input during transition
  private sceneMode: SceneMode = "world";
  private interiorScene: InteriorScene | null = null;
  private libraryScene: LibraryScene | null = null;
  private fightingRingScene: FightingRingScene | null = null;
  private legalClassifierScene: LegalClassifierScene | null = null;
  private elapsed = 0;
  private interactCooldownMs = 0;
  private storeSyncTimer = 0;

  constructor(container: HTMLElement) {
    this.containerEl = container;
    this.app = new Application();
  }

  setNavigate(fn: (route: string) => void) {
    this.navigateFn = fn;
  }

  async init() {
    if (this._destroyed || this._initialized) return;
    this._initialized = true;

    await this.app.init({
      width: VIEWPORT_WIDTH,
      height: VIEWPORT_HEIGHT,
      backgroundColor: 0x0a0e27,
      antialias: false,
      roundPixels: true,
    });

    if (this._destroyed) return;

    const canvas = this.app.canvas;
    canvas.style.imageRendering = "pixelated";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.objectFit = "contain";
    this.containerEl.appendChild(canvas);

    // Enable sortableChildren for z-index on stage
    this.app.stage.sortableChildren = true;

    // Parallax scene
    this.parallaxScene = new ParallaxScene();
    this.app.stage.addChild(this.parallaxScene.container);

    // Sky
    this.sky = new Sky();
    this.parallaxScene.sky.container.addChild(this.sky.container);

    if (this._destroyed) return;

    // World — bg buildings + enterable buildings + objects
    this.worldBuilder = new WorldBuilder();
    await this.worldBuilder.build(this.parallaxScene);

    // Ground rendered AFTER buildings — covers messy sprite bases
    const ground = new Ground();
    ground.createGround();
    this.parallaxScene.main.container.addChild(ground.container);
    // Also add ground cover to bg layers so bg building bases are hidden
    ground.addCoverTo(this.parallaxScene.distant.container);
    ground.addCoverTo(this.parallaxScene.mid.container);

    // Neon zone signs on the road
    this.neonSigns = new NeonSigns();
    this.parallaxScene.main.container.addChild(this.neonSigns.container);

    // Lamp post radial glows (on main layer, behind character)
    this.lampGlows = new LampGlows();
    this.parallaxScene.main.container.addChild(this.lampGlows.container);

    // Dust motes (floating between mid and main layers)
    this.dustMotes = new DustMotes();
    this.parallaxScene.mid.container.addChild(this.dustMotes.container);

    // Rain (on top of everything except UI)
    this.rain = new Rain(80);
    this.app.stage.addChild(this.rain.container);

    // Shooting stars (in sky layer)
    this.shootingStars = new ShootingStars();
    this.parallaxScene.sky.container.addChild(this.shootingStars.container);

    // Footstep dust (on main layer, near character feet)
    this.footstepDust = new FootstepDust();
    this.parallaxScene.main.container.addChild(this.footstepDust.container);

    // Fog wisps (between mid and main)
    this.fogWisps = new FogWisps(4);
    this.parallaxScene.mid.container.addChild(this.fogWisps.container);

    // Door glow (warm light near enterable building doors)
    this.doorGlows = new DoorGlows();
    this.parallaxScene.main.container.addChild(this.doorGlows.container);

    // Headlight sweep across background (on distant layer)
    this.headlightSweep = new HeadlightSweep();
    this.parallaxScene.distant.container.addChild(this.headlightSweep.container);

    if (this._destroyed) return;

    // Interaction zones
    for (const building of this.worldBuilder.buildings) {
      const zone = new InteractionZone(
        building.config,
        this.parallaxScene.main.container,
      );
      this.interactionZones.push(zone);
    }

    // Creatures — updated for wider world
    this.cat = new Creature(2000, 1700, 3500, 0.6);
    await this.cat.loadCatSprites();
    this.parallaxScene.main.container.addChild(this.cat.container);

    this.fireflies = new FireflyEmitter(4000, 4800, 280, 370, 20);
    this.parallaxScene.main.container.addChild(this.fireflies.container);

    if (this._destroyed) return;

    // Character
    const store = useWorldStore.getState();
    this.character = new Character(store.characterX);
    await this.character.loadSprites();
    this.parallaxScene.main.container.addChild(this.character.container);

    if (this._destroyed) {
      this.character.destroy();
      return;
    }

    // Camera
    this.camera = new Camera(store.characterX);
    if (store.cameraX !== store.characterX - VIEWPORT_WIDTH / 2) {
      this.camera.x = store.cameraX;
    }

    // Transition overlay (on top of everything)
    this.transition = new Transition();
    this.app.stage.addChild(this.transition.container);

    // If returning from a project page, start blacked out and fade in
    const isReturning =
      store.characterX !== 1800 ||
      store.cameraX !== 1800 - VIEWPORT_WIDTH / 2;
    if (isReturning) {
      this.transition.setBlack();
      // Small delay so the canvas renders a frame first
      setTimeout(() => {
        if (!this._destroyed) {
          this.transition.fadeIn(400);
        }
      }, 50);
    }

    // Check if returning to an interior (e.g., back from /contact or /thesis)
    const activeInterior = store.interiorId;
    if (activeInterior && isReturning) {
      const building = getBuildingWithInterior(activeInterior);
      if (building) {
        this.parallaxScene.container.visible = false;
        this.rain.container.visible = false;
        this.app.renderer.background.color = 0x000000;

        let sceneContainer: import("pixi.js").Container;
        let minX: number;
        let maxX: number;

        if (activeInterior === "university-library") {
          this.libraryScene = new LibraryScene();
          await this.libraryScene.loadAssets();
          sceneContainer = this.libraryScene.container;
          minX = this.libraryScene.charMinX;
          maxX = this.libraryScene.charMaxX;
        } else if (activeInterior === "fighting-ring") {
          this.fightingRingScene = new FightingRingScene();
          await this.fightingRingScene.loadAssets();
          sceneContainer = this.fightingRingScene.container;
          minX = this.fightingRingScene.charMinX;
          maxX = this.fightingRingScene.charMaxX;
        } else if (activeInterior === "legal-classifier") {
          this.legalClassifierScene = new LegalClassifierScene();
          await this.legalClassifierScene.loadAssets();
          sceneContainer = this.legalClassifierScene.container;
          minX = this.legalClassifierScene.charMinX;
          maxX = this.legalClassifierScene.charMaxX;
        } else {
          this.interiorScene = new InteriorScene(building);
          await this.interiorScene.loadAssets();
          sceneContainer = this.interiorScene.container;
          minX = this.interiorScene.charMinX;
          maxX = this.interiorScene.charMaxX;
        }

        if (this._destroyed) return;

        this.app.stage.addChild(sceneContainer);

        this.character.container.parent?.removeChild(this.character.container);
        if (this.libraryScene) {
          this.libraryScene.roomContainer.addChild(this.character.container);
        } else {
          sceneContainer.addChild(this.character.container);
        }

        this.character.snapTo(store.interiorCharX || minX + 20);
        this.character.setBounds(minX, maxX);
        this.sceneMode = "interior";
      }
    }

    // Teleport subscription
    this.unsubscribeStore = useWorldStore.subscribe((state, prevState) => {
      if (
        state.teleportRequest &&
        state.teleportRequest !== prevState.teleportRequest
      ) {
        this.handleTeleport(state.teleportRequest.buildingId);
      }
    });

    // Game loop
    this.app.ticker.add((ticker) => {
      if (this._destroyed) return;
      this.elapsed += ticker.deltaMS;
      this.update(ticker.deltaMS);
    });
  }

  private update(deltaMs: number) {
    // Skip character input during transition
    const dx = this._navigating ? 0 : this.character.update();

    if (this.sceneMode === "world") {
      this.sky.update(this.elapsed);
      this.cat.update(deltaMs, this.character.x);
      this.fireflies.update(this.elapsed);
      this.neonSigns.update(this.elapsed);
      this.rain.update();
      this.lampGlows.update(this.elapsed);
      this.shootingStars.update(deltaMs);
      this.dustMotes.update(this.elapsed);
      this.fogWisps.update(this.elapsed);
      this.headlightSweep.update(deltaMs);
      this.doorGlows.update(this.character.x);

      this.camera.update(this.character.x, dx);
      this.parallaxScene.update(this.camera.x);
      this.footstepDust.update(deltaMs, this.character.x, dx !== 0);

      // Interaction zones
      let nearbyId: string | null = null;
      for (const zone of this.interactionZones) {
        zone.update(this.character.x);
        if (zone.isPlayerInRange) {
          nearbyId = zone.config.id;
        }
      }

      const store = useWorldStore.getState();
      if (nearbyId !== store.nearbyBuilding) {
        store.setNearbyBuilding(nearbyId);
      }

      // E key interaction
      if (this.interactCooldownMs > 0) {
        this.interactCooldownMs -= deltaMs;
      }
      if (
        !this._navigating &&
        this.character.isInteracting() &&
        nearbyId &&
        this.interactCooldownMs <= 0
      ) {
        this.interactCooldownMs = 500;
        const building = getBuildingById(nearbyId);
        if (building) {
          if (building.interior) {
            this.enterInterior(building.id);
          } else if (this.navigateFn) {
            this.enterBuilding(building.route);
          }
        }
      }

      // Throttled store sync
      this.storeSyncTimer += deltaMs;
      if (dx !== 0 && this.storeSyncTimer > 250) {
        this.storeSyncTimer = 0;
        store.setCharacterX(this.character.x);
        store.setCameraX(this.camera.x);
      }

    } else if (this.sceneMode === "interior" && this.libraryScene) {
      // --- Library interior ---
      const isInteracting = !this._navigating && this.character.isInteracting();
      const isPressingUp = this.character.isPressingUp();
      const isPressingDown = this.character.isPressingDown();

      const prevFloorY = this.libraryScene.getFloorY();

      this.libraryScene.update(
        deltaMs,
        this.character.x,
        this.character.container.y,
        isInteracting,
        isPressingUp,
        isPressingDown,
      );

      // Update character bounds if floor changed
      this.character.setBounds(this.libraryScene.charMinX, this.libraryScene.charMaxX);

      // Snap character Y to current floor
      const newFloorY = this.libraryScene.getFloorY();
      if (newFloorY !== prevFloorY) {
        this.character.container.y = newFloorY + 17;
        // Snap character X to staircase position on new floor
        this.character.snapTo(
          Math.max(this.libraryScene.charMinX,
            Math.min(this.libraryScene.charMaxX, this.character.x)),
        );
      }

      // Check navigation
      if (this.libraryScene.shouldNavigate && this.navigateFn) {
        this._navigating = true;
        const route = this.libraryScene.shouldNavigate;
        const store = useWorldStore.getState();
        store.setInteriorCharX(this.character.x);
        this.transition.fadeOut(400).then(() => {
          if (!this._destroyed && this.navigateFn) {
            this.navigateFn(route);
          }
        });
      }

      // Check external URL
      if (this.libraryScene.shouldOpenExternal) {
        const url = this.libraryScene.shouldOpenExternal;
        this.libraryScene.clearOpenExternal();
        window.open(url, "_blank");
      }

      // Check exit
      if (this.libraryScene.shouldExit) {
        this.exitInterior();
      }

      // Sync position
      this.storeSyncTimer += deltaMs;
      if (dx !== 0 && this.storeSyncTimer > 250) {
        this.storeSyncTimer = 0;
        const store = useWorldStore.getState();
        store.setInteriorCharX(this.character.x);
      }

    } else if (this.sceneMode === "interior" && this.fightingRingScene) {
      // --- Fighting ring interior ---
      const isInteracting = !this._navigating && this.character.isInteracting();
      this.fightingRingScene.update(deltaMs, this.character.x, isInteracting);

      if (this.fightingRingScene.shouldNavigate && this.navigateFn) {
        this._navigating = true;
        const route = this.fightingRingScene.shouldNavigate;
        const store = useWorldStore.getState();
        store.setInteriorCharX(this.character.x);
        this.transition.fadeOut(400).then(() => {
          if (!this._destroyed && this.navigateFn) {
            this.navigateFn(route);
          }
        });
      }

      if (this.fightingRingScene.shouldExit) {
        this.exitInterior();
      }

      this.storeSyncTimer += deltaMs;
      if (dx !== 0 && this.storeSyncTimer > 250) {
        this.storeSyncTimer = 0;
        const store = useWorldStore.getState();
        store.setInteriorCharX(this.character.x);
      }

    } else if (this.sceneMode === "interior" && this.legalClassifierScene) {
      // --- Legal Classifier interior ---
      const isInteracting = !this._navigating && this.character.isInteracting();
      this.legalClassifierScene.update(deltaMs, this.character.x, isInteracting);

      if (this.legalClassifierScene.shouldNavigate && this.navigateFn) {
        this._navigating = true;
        const route = this.legalClassifierScene.shouldNavigate;
        const store = useWorldStore.getState();
        store.setInteriorCharX(this.character.x);
        this.transition.fadeOut(400).then(() => {
          if (!this._destroyed && this.navigateFn) {
            this.navigateFn(route);
          }
        });
      }

      if (this.legalClassifierScene.shouldExit) {
        this.exitInterior();
      }

      this.storeSyncTimer += deltaMs;
      if (dx !== 0 && this.storeSyncTimer > 250) {
        this.storeSyncTimer = 0;
        const store = useWorldStore.getState();
        store.setInteriorCharX(this.character.x);
      }

    } else if (this.sceneMode === "interior" && this.interiorScene) {
      const isInteracting = !this._navigating && this.character.isInteracting();
      this.interiorScene.update(deltaMs, this.character.x, isInteracting);

      // Check if NPC triggered navigation
      if (this.interiorScene.shouldNavigate && this.navigateFn) {
        this._navigating = true;
        const route = this.interiorScene.shouldNavigate;
        const store = useWorldStore.getState();
        store.setInteriorCharX(this.character.x);
        this.transition.fadeOut(400).then(() => {
          if (!this._destroyed && this.navigateFn) {
            this.navigateFn(route);
          }
        });
      }

      // Check if player wants to exit
      if (this.interiorScene.shouldExit) {
        this.exitInterior();
      }

      // Sync interior position to store
      this.storeSyncTimer += deltaMs;
      if (dx !== 0 && this.storeSyncTimer > 250) {
        this.storeSyncTimer = 0;
        const store = useWorldStore.getState();
        store.setInteriorCharX(this.character.x);
      }
    }
  }

  /** Transition animation → navigate to building page */
  private async enterBuilding(route: string) {
    if (this._navigating || this._destroyed) return;
    this._navigating = true;

    // Save position before navigating
    const store = useWorldStore.getState();
    store.setCharacterX(this.character.x);
    store.setCameraX(this.camera.x);

    // Fade to black
    await this.transition.fadeOut(400);

    // Navigate
    if (!this._destroyed && this.navigateFn) {
      this.navigateFn(route);
    }
  }

  /** Zoom-in transition -> swap to interior scene */
  private async enterInterior(buildingId: string) {
    if (this._navigating || this._destroyed) return;

    const building = getBuildingWithInterior(buildingId);
    if (!building) return;

    this._navigating = true;

    // Save world position
    const store = useWorldStore.getState();
    store.setCharacterX(this.character.x);
    store.setCameraX(this.camera.x);

    // --- Zoom phase (~600ms) ---
    const doorScreenX = building.doorX - this.camera.x;
    const doorScreenY = GROUND_Y;
    const zoomTarget = 2.5;
    const zoomDuration = 600;

    await new Promise<void>((resolve) => {
      const startTime = performance.now();
      const animate = () => {
        if (this._destroyed) { resolve(); return; }
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / zoomDuration, 1);
        const eased = progress * progress;

        const scale = 1 + (zoomTarget - 1) * eased;
        this.parallaxScene.container.scale.set(scale);
        this.parallaxScene.container.x = -(doorScreenX * (scale - 1));
        this.parallaxScene.container.y = -(doorScreenY * (scale - 1));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });

    // --- Fade phase (~300ms) ---
    await this.transition.fadeOut(300);

    if (this._destroyed) return;

    // --- Scene swap ---
    this.parallaxScene.container.scale.set(1);
    this.parallaxScene.container.x = 0;
    this.parallaxScene.container.y = 0;

    this.parallaxScene.container.visible = false;
    this.rain.container.visible = false;

    this.app.renderer.background.color = 0x000000;

    // Instantiate the right scene type
    let scene: { container: import("pixi.js").Container; charMinX: number; charMaxX: number; loadAssets(): Promise<void> };
    if (buildingId === "university-library") {
      this.libraryScene = new LibraryScene();
      scene = this.libraryScene;
    } else if (buildingId === "fighting-ring") {
      this.fightingRingScene = new FightingRingScene();
      scene = this.fightingRingScene;
    } else if (buildingId === "legal-classifier") {
      this.legalClassifierScene = new LegalClassifierScene();
      scene = this.legalClassifierScene;
    } else {
      this.interiorScene = new InteriorScene(building);
      scene = this.interiorScene;
    }
    await scene.loadAssets();

    if (this._destroyed) return;

    this.app.stage.addChild(scene.container);

    // Reparent character into interior (roomContainer for library so camera pan moves character)
    this.character.container.parent?.removeChild(this.character.container);
    if (this.libraryScene) {
      this.libraryScene.roomContainer.addChild(this.character.container);
    } else {
      scene.container.addChild(this.character.container);
    }

    const entryX = scene.charMinX + 20;
    this.character.snapTo(entryX);
    this.character.setBounds(scene.charMinX, scene.charMaxX);

    this.sceneMode = "interior";
    store.setInteriorId(buildingId);
    store.setInteriorCharX(entryX);

    // --- Fade in (~400ms) ---
    await this.transition.fadeIn(400);

    this._navigating = false;
  }

  /** Fade transition -> return to world from interior */
  private async exitInterior() {
    if (this._navigating || this._destroyed) return;
    this._navigating = true;

    await this.transition.fadeOut(300);

    if (this._destroyed) return;

    // Reparent character back to world
    this.character.container.parent?.removeChild(this.character.container);
    this.parallaxScene.main.container.addChild(this.character.container);

    // Restore character to building door position
    const store = useWorldStore.getState();
    const buildingId = store.interiorId;
    if (buildingId) {
      const building = getBuildingWithInterior(buildingId);
      if (building) {
        this.character.snapTo(building.doorX);
        this.camera.snapTo(building.doorX);
        store.setCharacterX(building.doorX);
        store.setCameraX(this.camera.x);
      }
    }

    this.character.resetBounds();

    if (this.interiorScene) {
      this.app.stage.removeChild(this.interiorScene.container);
      this.interiorScene.destroy();
      this.interiorScene = null;
    }
    if (this.libraryScene) {
      this.app.stage.removeChild(this.libraryScene.container);
      this.libraryScene.destroy();
      this.libraryScene = null;
    }
    if (this.fightingRingScene) {
      this.app.stage.removeChild(this.fightingRingScene.container);
      this.fightingRingScene.destroy();
      this.fightingRingScene = null;
    }
    if (this.legalClassifierScene) {
      this.app.stage.removeChild(this.legalClassifierScene.container);
      this.legalClassifierScene.destroy();
      this.legalClassifierScene = null;
    }

    // Reset character Y to world ground level
    this.character.container.y = GROUND_Y + 17;

    this.parallaxScene.container.visible = true;
    this.rain.container.visible = true;
    this.app.renderer.background.color = 0x0a0e27;

    this.sceneMode = "world";
    store.setInteriorId(null);

    await this.transition.fadeIn(400);

    this._navigating = false;
  }

  private handleTeleport(buildingId: string) {
    if (this._destroyed || this._navigating) return;

    const building = getBuildingById(buildingId);
    if (!building) return;

    this.character.snapTo(building.doorX);
    this.camera.snapTo(building.doorX);

    const store = useWorldStore.getState();
    store.setCharacterX(building.doorX);
    store.setCameraX(this.camera.x);
    store.clearTeleport();

    // Teleport navigates directly after a brief pause
    this.enterBuilding(building.route);
  }

  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;

    this.unsubscribeStore?.();
    this.unsubscribeStore = null;
    this.navigateFn = null;
    if (this.interiorScene) {
      this.interiorScene.destroy();
      this.interiorScene = null;
    }
    if (this.libraryScene) {
      this.libraryScene.destroy();
      this.libraryScene = null;
    }
    if (this.fightingRingScene) {
      this.fightingRingScene.destroy();
      this.fightingRingScene = null;
    }
    if (this.legalClassifierScene) {
      this.legalClassifierScene.destroy();
      this.legalClassifierScene = null;
    }
    this.character?.destroy();

    // PixiJS v8 can throw _cancelResize errors during cleanup
    try {
      this.app.stop();
      this.app.canvas?.parentElement?.removeChild(this.app.canvas);
      this.app.destroy(true, { children: true });
    } catch {
      // Safe to ignore — PixiJS v8 internal cleanup
    }
  }
}
