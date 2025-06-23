import { Request, Response } from "express";
import {
  addPhotoToAlbum,
  createAnAlbum,
  getAllAlbumsPhotographer,
  getAlbumById,
  removePhotoFromAlbum,
} from "../services/albumsService";
import { addPhotographer } from "../services/photographers";

export const getAlbumsPhotographer = async (req: Request, res: Response) => {
  if (!req.params.id) {
    res.status(400).json("photographer doesn't exist");
    return;
  }

  try {
    const albumPhotos = await getAllAlbumsPhotographer(
      Number.parseInt(req.params.id)
    );
    res.json(
      albumPhotos.map((a) => ({
        ...a,
        photos: a.photos.map((photo) => ({
          ...photo,
          ratings: photo.ratings.map((r) => ({
            ...r,
            user: {
              ...r.user,
              password: undefined,
              twoFactorSecret: undefined,
            },
          })),
          tags: photo.tags.map((t) => t.name),
        })),
      }))
    );
  } catch (error) {
    console.error("Error fetching albums:", error);
    if (error.message === "Photographer not found") {
      res.status(404).json("Photographer not found");
    } else {
      res.status(500).json("Failed to fetch albums");
    }
  }
};

export const getAlbumByIdController = async (req: Request, res: Response) => {
  if (!req.params.id) {
    res.status(400).json("album doesn't exist");
    return;
  }
  try {
    const album = await getAlbumById(Number.parseInt(req.params.id));
    res.json({
      ...album,
      photos: album.photos.map((photo) => ({
        ...photo,
        ratings: photo.ratings.map((r) => ({
          ...r,
          user: {
            ...r.user,
            password: undefined,
            twoFactorSecret: undefined,
          },
        })),
        tags: photo.tags.map((t) => t.name),
      })),
    });
  } catch (error) {
    res.status(404).json("album not found");
  }
};

export const addPhotoToAlbumController = async (
  req: Request,
  res: Response
) => {
  if (!req.params.photoId) {
    res.status(400).json("no photo selected");
    return;
  }
  if (!req.params.albumId) {
    res.status(400).json("no album selected");
    return;
  }

  await addPhotoToAlbum(
    Number.parseInt(req.params.photoId),
    Number.parseInt(req.params.albumId)
  );

  res.status(200).json();
};

export const removePhotoFromAlbumController = async (
  req: Request,
  res: Response
) => {
  if (!req.params.photoId) {
    res.status(400).json("no photo selected");
    return;
  }
  if (!req.params.albumId) {
    res.status(400).json("no album selected");
    return;
  }

  await removePhotoFromAlbum(
    Number.parseInt(req.params.photoId),
    Number.parseInt(req.params.albumId)
  );

  res.status(200).json();
};

export const createAlbumController = async (req: Request, res: Response) => {
  if (!req.params.id) {
    res.status(400).json("no photographer selected");
    return;
  }
  if (!req.body.name) {
    res.status(400).json("no name for the album selected");
    return;
  }

  await createAnAlbum(Number.parseInt(req.params.id), req.body.name);
  res.status(200).json();
};
