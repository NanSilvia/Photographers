import { Request, Response } from "express";
import { getPhotographerById, updatePhotographer } from "../model/photographers";
import { Photo } from "../model/photo";
import { notifyClients } from "../server";

export const getPhotographerPhotosController = async (req: Request, res: Response) => {
    if (!req.user)
      throw new Error("User not defined but passed hasRole middleware");
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID format" });
      return;
    }
    const photographer = await getPhotographerById(req.user._id, id);
    if (!photographer) {
      res.status(404).json({ error: "Photographer not found" });
      return;
    }
    res.json(photographer.photos);
}
export const addPhotographerPhotoController = async (req: Request, res: Response) => {
    if (!req.user)
      throw new Error("User not defined but passed hasRole middleware");
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID format" });
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
}

export const updatePhotographerPhotoController = async (req: Request, res: Response) => {
    if (!req.user)
      throw new Error("User not defined but passed hasRole middleware");
    const photographerId = parseInt(req.params.id);
    const photoId = parseInt(req.params.photoId);
    if (isNaN(photographerId)) {
      res.status(400).json({ error: "Invalid ID format" });
      return;
    }
    const photographer = await getPhotographerById(
      req.user._id,
      photographerId
    );
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
    const updatedPhotographer = await updatePhotographer(
      photographerId,
      photographer
    );
    if (!updatedPhotographer) {
      res.status(404).json({ error: "Photographer not found" });
      return;
    }
    res.json(updatedPhotographer.photos.find((p) => p.id === photoId));
  }

export const deletePhotographerPhotoController = async (req: Request, res: Response) => {
    if (!req.user)
      throw new Error("User not defined but passed hasRole middleware");
    const photographerId = parseInt(req.params.id);
    const photoId = parseInt(req.params.photoId);
    if (isNaN(photographerId)) {
      res.status(400).json({ error: "Invalid ID format" });
      return;
    }
    const photographer = await getPhotographerById(
      req.user._id,
      photographerId
    );
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
}
