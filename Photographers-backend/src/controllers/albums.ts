import { Request, Response } from "express";
import {
  addPhotoToAlbum,
  createAnAlbum,
  getAllAlbumsPhotographer,
  removePhotoFromAlbum,
} from "../services/albumsService";
import { addPhotographer } from "../services/photographers";

export const getAlbumsPhotographer = async (req: Request, res: Response) => {
  if (!req.params.id) {
    res.status(400).json("photographer doesn't exist");
    return;
  }
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
          tags: photo.tags.map((t) => t.name),
        })),
      })),
    }))
  );
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
  if (!req.params.photogId) {
    res.status(400).json("no photographer selected");
    return;
  }
  if (!req.params.name) {
    res.status(400).json("no name for the album selected");
    return;
  }

  await createAnAlbum(Number.parseInt(req.params.photogId), req.params.name);
  res.status(200).json();
};
