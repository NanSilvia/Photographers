import axios from "axios";
import { authedFetch } from "../helpers/authedFetch";
import Photographer from "../model/Photographer";

const API_URL = "/api/photographers";
const PhotographersApi = {
  // getAll: async (): Promise<Photographer[]> => {
  //     const response = await axios.get(API_URL);
  //     return response.data.map((p: any) => ({
  //         ...p,
  //         birth: new Date(p.birth),
  //         death: p.death ? new Date(p.death) : null
  //     }));
  // },

  getMore: async (
    currentPage: number,
    filter: boolean
  ): Promise<Photographer[]> => {
    const response = await axios.get(API_URL, {
      params: { pageNr: currentPage, alive: filter },
    });
    return response.data.map((p: any) => ({
      ...p,
      birth: new Date(p.birth),
      death: p.death ? new Date(p.death) : null,
    }));
  },

  add: async (photographer: Omit<Photographer, "id">) => {
    const response = await axios.post(API_URL, photographer, {
      withCredentials: true,
    });
    return {
      birth: new Date(response.data.birth),
      death: response.data.death ? new Date(response.data.death) : null,
      name: response.data.name,
      description: response.data.description,
      id: response.data.id,
      profilepicUrl: response.data.profilepicUrl,
    } as Photographer;
  },

  update: async (photographer: Photographer) => {
    const response = await axios.put(
      `${API_URL}/${photographer.id}`,
      photographer,
      {
        withCredentials: true,
      }
    );
    return {
      birth: new Date(response.data.birth),
      death: response.data.death ? new Date(response.data.death) : null,
      name: response.data.name,
      description: response.data.description,
      id: response.data.id,
      profilepicUrl: response.data.profilepicUrl,
    } as Photographer;
  },

  delete: async (id: number) => {
    await axios.delete(`${API_URL}/${id}`, {
      withCredentials: true,
    });
  },

  getById: async (id: number): Promise<Photographer | undefined> => {
    try {
      const response = await axios.get(`${API_URL}/${id}`, {
        withCredentials: true,
      });
      if (response.data) {
        return {
          ...response.data,
          birth: new Date(response.data.birth),
          death: response.data.death ? new Date(response.data.death) : null,
        };
      }
      return undefined;
    } catch (error) {
      console.error("Error fetching photographer:", error);
      return undefined;
    }
  },

  async recommendPhotographer(
    photographerId: number,
    friendId: number
  ): Promise<void> {
    try {
      const response = await authedFetch(
        `/api/photographers/${photographerId}/recommend/${friendId}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to recommend photographer");
      }
    } catch (error) {
      console.error("Error recommending photographer:", error);
      throw error;
    }
  },
};

export default PhotographersApi;
