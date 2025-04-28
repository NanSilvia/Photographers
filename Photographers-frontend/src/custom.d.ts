// custom.d.ts (TypeScript declaration file)
declare module "../api" {
    export interface Photographer {
      name: string;
      birth: Date;
      death: Date | null;
      profilepicUrl: string;
      description: string;
    }
  
    export const getPhotographers: () => Promise<Photographer[]>;
    export const addPhotographer: (photographerData: Photographer) => Promise<Photographer>;
    export const updatePhotographer: (id: string, photographerData: Photographer) => Promise<Photographer>;
    export const deletePhotographer: (id: string) => Promise<{ message: string }>;
  }
  