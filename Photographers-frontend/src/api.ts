import axios from "axios";
import { authedFetch } from "./helpers/authedFetch";

export interface Photographer {
  id: string;
  name: string;
  birth: Date;
  death: Date | null;
  profilepicUrl: string;
  description: string;
}

export const API_URL = "http://localhost:5000"; // Base URL for backend API

// Get all photographers
export const getPhotographers = async (): Promise<Photographer[]> => {
  const response = await fetch(`${API_URL}/photographers`);
  const data = await response.json();
  return data;
};

// Add a new photographer
export const addPhotographer = async (
  photographerData: Photographer
): Promise<Photographer> => {
  const response = await fetch(`${API_URL}/photographers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(photographerData),
  });
  const data = await response.json();
  return data;
};

// Update a photographer
export const updatePhotographer = async (
  id: string,
  photographerData: Photographer
): Promise<Photographer> => {
  const response = await fetch(`${API_URL}/photographers/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(photographerData),
  });
  const data = await response.json();
  return data;
};

// Delete a photographer
export const deletePhotographer = async (
  id: string
): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/photographers/${id}`, {
    method: "DELETE",
  });
  const data = await response.json();
  return data;
};

export const uploadFile = async (file: File): Promise<{ fileId: string }> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to upload file");
  }
};

export const getFile = async (fileId: string): Promise<Blob> => {
  try {
    const response = await axios.get(`${API_URL}/file/${fileId}`, {
      responseType: "blob",
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to retrieve file");
  }
};

// Add a photographer to user's list (creates relationship)
export const addPhotographerToUserList = async (
  photographerId: number
): Promise<{ message: string }> => {
  const response = await authedFetch(
    `/api/photographers/${photographerId}/add-to-list`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to add photographer to list: ${response.statusText}`
    );
  }

  const data = await response.json();
  return data;
};
