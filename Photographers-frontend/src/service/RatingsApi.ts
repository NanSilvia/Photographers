import { authedFetch } from "../helpers/authedFetch";
import Photo from "../model/Photo";
import Rating from "../model/Rating";

export async function addPhotoRating(
  photoId: number,
  rating: number
): Promise<Rating> {
  const res = await authedFetch(`/api/rating/addRating`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ photoId, rating }),
  });
  if (!res.ok) {
    throw new Error("Failed to add rating");
  }
  return await res.json();
}

export async function updatePhotoRating(
  photoId: number,
  rating: number
): Promise<Rating> {
  const res = await authedFetch(`/api/rating/updateRating`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ photoId, rating }),
  });
  if (!res.ok) {
    throw new Error("Failed to update rating");
  }
  return await res.json();
}
