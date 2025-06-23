// import { create } from 'zustand';
// import PhotographerList from '../service/PhotographersApi';
// import Photographer from '../model/Photographer';

// // Define and export the store state and actions
// export interface PhotographerStoreState {
//     opened: boolean;
//     photographers: Photographer[];
//     selectedPhotographer: Photographer | null;
//     handleOpen: (p?: Photographer) => void;
//     handleClose: () => void;
//     addPhotographer: (p: Photographer) => void;
//     editPhotographer: (p: Photographer) => void;
//     deletePhotographer: (pId: number) => void;
// }

// // Zustand store for managing photographers
// const usePhotographerStore = create<PhotographerStoreState>((set) => ({
//     opened: false,
//     selectedPhotographer: null,
//     photographers: PhotographerList,

//     handleOpen: (p?: Photographer) => set({ opened: true, selectedPhotographer: p || null }),

//     handleClose: () => set({ opened: false, selectedPhotographer: null }),

//     addPhotographer: (p: Photographer) =>
//         set((state) => ({
//             photographers: [...state.photographers, p],
//         })),

//     editPhotographer: (p: Photographer) =>
//         set((state) => ({
//             photographers: state.photographers.map((photog) =>
//                 photog.id === p.id ? p : photog
//             ),
//             selectedPhotographer: state.selectedPhotographer?.id === p.id ? p : state.selectedPhotographer,
//         })),

//     deletePhotographer: (pId: number) =>
//         set((state) => ({
//             photographers: state.photographers.filter((photog) => photog.id !== pId),
//             selectedPhotographer: state.selectedPhotographer?.id === pId ? null : state.selectedPhotographer,
//         })),
// }));

// export default usePhotographerStore;
import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";
import PhotographersApi from "../service/PhotographersApi";
import Photographer from "../model/Photographer";
import useConnectionStatusStore from "./connectionStatus";
import broadcastApi from "../service/BroadcastApi";
import { AxiosError } from "axios";

interface Operation {
  type: string;
  payload: unknown;
  id: string;
}

export interface PhotographerStoreState {
  opened: boolean;
  photographers: Photographer[];
  selectedPhotographer: Photographer | null;
  currentPage: number;
  filterAlive: boolean;
  hasMore: boolean;
  loading: boolean;
  operationQueue: Operation[];
  handleOpen: (p?: Photographer) => void;
  handleClose: () => void;
  fetchMore: () => Promise<void>;
  addPhotographer: (p: Omit<Photographer, "id">) => Promise<void>;
  editPhotographer: (p: Photographer) => Promise<void>;
  deletePhotographer: (pId: number) => Promise<void>;
  toggleFilter: () => Promise<void>;
  recommendPhotographer: (
    photographerId: number,
    friendId: number
  ) => Promise<void>;
}

// Set up broadcast listeners
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setupBroadcastListeners = (set: any, _get: any) => {
  // Listen for new photographers
  broadcastApi.on<Photographer>("photographerAdded", (newPhotographer) => {
    set((state: PhotographerStoreState) => {
      // if photographer already exists, do not add it again
      if (
        state.photographers.find(
          (photog) => photog.id === newPhotographer.id
        ) !== undefined
      ) {
        return {};
      }
      return {
        photographers: [
          ...state.photographers,
          {
            ...newPhotographer,
            birth: new Date(newPhotographer.birth),
            death: newPhotographer.death
              ? new Date(newPhotographer.death)
              : null,
          },
        ],
      };
    });
  });

  // Listen for updated photographers
  broadcastApi.on<Photographer>(
    "photographerUpdated",
    (updatedPhotographer) => {
      set((state: PhotographerStoreState) => ({
        photographers: state.photographers.map((photog) =>
          photog.id === updatedPhotographer.id
            ? {
                ...updatedPhotographer,
                birth: new Date(updatedPhotographer.birth),
                death: updatedPhotographer.death
                  ? new Date(updatedPhotographer.death)
                  : null,
              }
            : photog
        ),
      }));
    }
  );

  // Listen for deleted photographers
  broadcastApi.on<number>("photographerDeleted", (deletedId) => {
    set((state: PhotographerStoreState) => ({
      photographers: state.photographers.filter(
        (photog) => photog.id !== deletedId
      ),
    }));
  });
};

const usePhotographerStore = create<PhotographerStoreState>()(
  persist(
    (set, get) => {
      // Set up broadcast listeners when the store is created
      setupBroadcastListeners(set, get);

      return {
        opened: false,
        photographers: [],
        selectedPhotographer: null,
        currentPage: 0,
        filterAlive: false,
        hasMore: true,
        loading: false,
        operationQueue: [],

        handleOpen: (p?: Photographer) =>
          set({ opened: true, selectedPhotographer: p || null }),

        handleClose: () => set({ opened: false, selectedPhotographer: null }),

        fetchMore: async () => {
          try {
            set(() => ({ loading: true }));
            const photog = await PhotographersApi.getMore(
              get().currentPage,
              get().filterAlive
            );
            const data = [...get().photographers, ...photog];
            set((state) => ({
              photographers: data,
              currentPage: state.currentPage + 1,
              hasMore: photog.length !== 0,
              loading: false,
            }));
          } catch (error) {
            if (error instanceof AxiosError) {
              set(() => ({ hasMore: false, loading: false }));
              return;
            }
            console.error("Error fetching photographers:", error);
            set(() => ({ loading: false }));
          }
        },

        toggleFilter: async () => {
          set((state) => ({
            filterAlive: !state.filterAlive,
            photographers: [],
            currentPage: 0,
            hasMore: true,
          }));
          // Fetch first page after filter change
          await get().fetchMore();
        },

        addPhotographer: async (p) => {
          try {
            if (useConnectionStatusStore.getState().isOnline) {
              const newPhotographer = await PhotographersApi.add(p);
              set((state) => ({
                photographers: [...state.photographers, newPhotographer],
              }));
            } else {
              // If offline, add to operation queue
              const operation: Operation = {
                type: "add",
                payload: p,
                id: new Date().toISOString(),
              };
              set((state) => ({
                operationQueue: [...state.operationQueue, operation],
              }));
            }
          } catch (error) {
            console.error("Error adding photographer:", error);
          }
        },

        editPhotographer: async (p) => {
          try {
            if (useConnectionStatusStore.getState().isOnline) {
              const updatedPhotographer = await PhotographersApi.update(p);
              set((state) => ({
                photographers: state.photographers.map((photog) =>
                  photog.id === p.id ? updatedPhotographer : photog
                ),
                selectedPhotographer: updatedPhotographer,
              }));
            } else {
              const operation: Operation = {
                type: "edit",
                payload: p,
                id: p.id.toString(),
              };
              set((state) => ({
                operationQueue: [...state.operationQueue, operation],
              }));
            }
          } catch (error) {
            console.error("Error updating photographer:", error);
          }
        },

        deletePhotographer: async (pId) => {
          try {
            if (useConnectionStatusStore.getState().isOnline) {
              await PhotographersApi.delete(pId);
              set((state) => ({
                photographers: state.photographers.filter(
                  (photog) => photog.id !== pId
                ),
                selectedPhotographer:
                  state.selectedPhotographer?.id === pId
                    ? null
                    : state.selectedPhotographer,
              }));
            } else {
              const operation: Operation = {
                type: "delete",
                payload: pId,
                id: pId.toString(),
              };
              set((state) => ({
                operationQueue: [...state.operationQueue, operation],
              }));
            }
          } catch (error) {
            console.error("Error deleting photographer:", error);
          }
        },

        recommendPhotographer: async (
          photographerId: number,
          friendId: number
        ) => {
          try {
            await PhotographersApi.recommendPhotographer(
              photographerId,
              friendId
            );
          } catch (error) {
            console.error("Error recommending photographer:", error);
            throw error;
          }
        },
      };
    },
    {
      name: "photographerStore",
      version: 1,
      storage: createJSONStorage(() => sessionStorage, {
        reviver: (_, value) => {
          if (typeof value === "string") {
            // Try to parse ISO date strings
            const dateRegex =
              /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
            if (dateRegex.test(value)) {
              return new Date(value);
            }
          }
          return value;
        },
        replacer: (_, value) => {
          if (value instanceof Date) {
            return value.toISOString();
          }
          return value;
        },
      }),
      partialize: (state) => {
        // Only persist the photographers and opened state
        // Check online status to determine what to persist
        const isOnline = useConnectionStatusStore.getState().isOnline;

        if (isOnline) {
          // If online, don't persist photographers (will fetch from backend)
          return {
            opened: state.opened,
            filterAlive: state.filterAlive,
            operationQueue: state.operationQueue,
          };
        } else {
          // If offline, persist photographers too
          return {
            photographers: state.photographers,
            opened: state.opened,
            currentPage: state.currentPage,
            filterAlive: state.filterAlive,
            operationQueue: state.operationQueue,
          };
        }
      },
      migrate: (persistedState) => {
        // Migration logic if needed when store version changes
        return persistedState as PhotographerStoreState;
      },
    }
  )
);

export default usePhotographerStore;
