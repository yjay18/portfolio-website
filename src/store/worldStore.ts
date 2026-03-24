import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  SPAWN_X,
  VIEWPORT_WIDTH,
  getZoneAt,
  type Zone,
} from "@/data/buildings";

interface TeleportRequest {
  buildingId: string;
  timestamp: number;
}

interface WorldStore {
  characterX: number;
  currentZone: Zone;
  nearbyBuilding: string | null;
  cameraX: number;
  isCanvasActive: boolean;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  teleportRequest: TeleportRequest | null;
  interiorId: string | null;
  interiorCharX: number;

  setCharacterX: (x: number) => void;
  setNearbyBuilding: (id: string | null) => void;
  setCameraX: (x: number) => void;
  setCanvasActive: (active: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  requestTeleport: (buildingId: string) => void;
  clearTeleport: () => void;
  setInteriorId: (id: string | null) => void;
  setInteriorCharX: (x: number) => void;
}

export const useWorldStore = create<WorldStore>()(
  persist(
    (set) => ({
      characterX: SPAWN_X,
      currentZone: "projects" as Zone,
      nearbyBuilding: null,
      cameraX: SPAWN_X - VIEWPORT_WIDTH / 2,
      isCanvasActive: true,
      sidebarOpen: false,
      sidebarCollapsed: false,
      teleportRequest: null,
      interiorId: null,
      interiorCharX: 0,

      setCharacterX: (x) =>
        set({ characterX: x, currentZone: getZoneAt(x) }),
      setNearbyBuilding: (id) => set({ nearbyBuilding: id }),
      setCameraX: (x) => set({ cameraX: x }),
      setCanvasActive: (active) => set({ isCanvasActive: active }),
      toggleSidebar: () =>
        set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebarCollapsed: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      requestTeleport: (buildingId) =>
        set({
          teleportRequest: { buildingId, timestamp: Date.now() },
        }),
      clearTeleport: () => set({ teleportRequest: null }),
      setInteriorId: (id) => set({ interiorId: id }),
      setInteriorCharX: (x) => set({ interiorCharX: x }),
    }),
    {
      name: "world-store",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? sessionStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            },
      ),
      partialize: (state) => ({
        characterX: state.characterX,
        cameraX: state.cameraX,
        currentZone: state.currentZone,
        sidebarCollapsed: state.sidebarCollapsed,
        interiorId: state.interiorId,
        interiorCharX: state.interiorCharX,
      }),
    },
  ),
);
