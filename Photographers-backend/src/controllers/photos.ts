import { Request, Response } from "express";
import {
  getPhotographerById,
  updatePhotographer,
} from "../services/photographers";
import { Photo } from "../model/photo";
import { notifyClients } from "../server";
import { getTagsByNames } from "../services/tagService";
import { getPhotosByTagName } from "../services/photos";

export const getPhotographerPhotosController = async (
  req: Request,
  res: Response
) => {
  if (!req.user)
    throw new Error("User not defined but passed hasRole middleware");
  const photographerId = parseInt(req.params.id);
  if (isNaN(photographerId)) {
    res.status(400).json({ error: "Invalid photo ID format" });
    return;
  }
  const photographer = await getPhotographerById(req.user._id, photographerId);
  if (!photographer) {
    res.status(404).json({ error: "Photographer photo not found" });
    return;
  }
  res.json(
    photographer.photos.map((photo) => ({
      ...photo,
      tags: photo.tags.map((tag) => tag.name),
    }))
  );
};
export const addPhotographerPhotoController = async (
  req: Request,
  res: Response
) => {
  if (!req.user)
    throw new Error("User not defined but passed hasRole middleware");
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid photo ID format" });
    return;
  }
  const photographer = await getPhotographerById(req.user._id, id);
  if (!photographer) {
    res.status(404).json({ error: "Photographer not found" });
    return;
  }

  const photo = new Photo();
  photo.imageUrl = req.body.imageUrl;
  photo.title = req.body.title;
  photo.description = req.body.description;

  const tagNames: string[] = req.body.tags || [];

  photo.tags = await getTagsByNames(tagNames);

  photographer.photos.push(photo);
  const updatedPhotographer = await updatePhotographer(id, photographer);
  if (!updatedPhotographer) {
    res.status(404).json({ error: "Photographer not found" });
    return;
  }
  res.json(
    updatedPhotographer.photos.find((p) => p.imageUrl === photo.imageUrl)
  );
  notifyClients("photoAdded", { photographerId: id, photo });
};

export const updatePhotographerPhotoController = async (
  req: Request,
  res: Response
) => {
  if (!req.user)
    throw new Error("User not defined but passed hasRole middleware");
  const photographerId = parseInt(req.params.id);
  const photoId = parseInt(req.params.photoId);
  if (isNaN(photographerId)) {
    res.status(400).json({ error: "Invalid photo ID format" });
    return;
  }
  const photographer = await getPhotographerById(req.user._id, photographerId);
  if (!photographer) {
    res.status(404).json({ error: "Photographer not found" });
    return;
  }
  const photo = photographer.photos.find((p) => p.id === photoId);
  if (!photo) {
    res.status(404).json({ error: "Photo not found" });
    return;
  }
  photo.title = req.body.title;
  photo.description = req.body.description;
  const tagNames: string[] = req.body.tags || [];

  photo.tags = await getTagsByNames(tagNames);
  const updatedPhotographer = await updatePhotographer(
    photographerId,
    photographer
  );
  if (!updatedPhotographer) {
    res.status(404).json({ error: "Photographer not found" });
    return;
  }
  res.json(updatedPhotographer.photos.find((p) => p.id === photoId));
};

export const deletePhotographerPhotoController = async (
  req: Request,
  res: Response
) => {
  if (!req.user)
    throw new Error("User not defined but passed hasRole middleware");
  const photographerId = parseInt(req.params.id);
  const photoId = parseInt(req.params.photoId);
  if (isNaN(photographerId)) {
    res.status(400).json({ error: "Invalid photo ID format" });
    return;
  }
  const photographer = await getPhotographerById(req.user._id, photographerId);
  if (!photographer) {
    res.status(404).json({ error: "Photographer not found" });
    return;
  }
  const photoIndex = photographer.photos.findIndex((p) => p.id === photoId);
  if (photoIndex === -1) {
    res.status(404).json({ error: "Photo not found" });
    return;
  }
  photographer.photos.splice(photoIndex, 1); // Remove the photo from the array
  const updatedPhotographer = await updatePhotographer(
    photographerId,
    photographer
  );
  if (!updatedPhotographer) {
    res.status(404).json({ error: "Photographer not found" });
    return;
  }
  res.json(updatedPhotographer.photos.find((p) => p.id === photoId));
};

export const getPhotosByTagController = async (req: Request, res: Response) => {
  const tagName = req.params.name;
  if (!tagName) {
    res.status(400).json({ error: "Tag name is required" });
    return;
  }
  const photos = await getPhotosByTagName(tagName);
  if (!photos || photos.length === 0) {
    res.status(404).json({ error: "No photos found for this tag" });
    return;
  }
  res.json(
    photos.map((photo) => ({
      ...photo,
      tags: photo.tags.map((tag) => tag.name),
    }))
  );
};
