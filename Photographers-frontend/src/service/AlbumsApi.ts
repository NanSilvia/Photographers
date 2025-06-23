import { API_URL } from "../api";
import { authedFetch } from "../helpers/authedFetch";
import Album from "../model/Album";

class AlbumsApi {
  async getAlbumsForPhotographer(photographerId: number): Promise<Album[]> {
    const response = await authedFetch(
      `${API_URL}/photographers/${photographerId}/albums`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch albums");
    }
    return response.json();
  }

  async getAlbumById(albumId: number): Promise<Album> {
    const response = await authedFetch(`${API_URL}/albums/${albumId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch album");
    }
    return response.json();
  }

  async createAlbum(photographerId: number, name: string): Promise<void> {
    const response = await authedFetch(
      `${API_URL}/photographers/${photographerId}/albums`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      }
    );
    if (!response.ok) {
      throw new Error("Failed to create album");
    }
  }

  async addPhotoToAlbum(albumId: number, photoId: number): Promise<void> {
    const response = await authedFetch(
      `${API_URL}/albums/${albumId}/photos/${photoId}`,
      {
        method: "POST",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to add photo to album");
    }
  }

  async removePhotoFromAlbum(albumId: number, photoId: number): Promise<void> {
    const response = await authedFetch(
      `${API_URL}/albums/${albumId}/photos/${photoId}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to remove photo from album");
    }
  }
}

export default new AlbumsApi();
