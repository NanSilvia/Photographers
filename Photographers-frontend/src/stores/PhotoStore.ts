import { create } from "zustand"
import Photo from "../model/Photo"

interface PhotoStore{
    photos: Photo[];
    selectedPhotographerId: number | undefined;
    addPhoto: (p: Omit<Omit<Photo, 'id'>, 'photographer'>) => Promise<void>;
    updatePhoto: (p: Photo) => Promise<void>;
    deletePhoto: (id: number) => Promise<void>;
    setPhotographer: (photographer: number) => void;
}

const usePhotoStore = create<PhotoStore>()((set, get) => ({
    photos: [],
    selectedPhotographerId: undefined,
    setPhotographer: async (photographerId: number) => {
        set({ selectedPhotographerId: photographerId });
        const photoRes = await fetch(`/api/photographers/${photographerId}/photos`);
        set({ photos: await photoRes.json() });
    },

    addPhoto: async (p: Omit<Omit<Photo, 'id'>, 'photographer'>) : Promise<void> => {
        const newPhoto = await fetch(`/api/photographers/${get().selectedPhotographerId}/photos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(p),
        });
        const photo = await newPhoto.json();
        set((state) => ({ photos: [...state.photos, photo] }));
    },

    updatePhoto: async (p: Photo): Promise<void> => {
        const updatedPhoto = await fetch(`/api/photographers/${get().selectedPhotographerId}/photos/${p.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(p),
        });
        const photo = await updatedPhoto.json();
        set((state) => ({
            photos: state.photos.map((p) =>
                p.id === photo.id ? photo : photo
            ),
        }));
    },

    deletePhoto: async (id:number) : Promise<void>=> {
        await fetch(`/api/photographers/${get().selectedPhotographerId}/photos/${id}`, {
            method: "DELETE",  
            headers: {
                "Content-Type": "application/json",
            },
        });
        set((state) => ({
            photos: state.photos.filter((photo) => photo.id !== id),
        }));
    },
}));

export default usePhotoStore;