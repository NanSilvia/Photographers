import * as express from "express";
import {
  getAlbumByIdController,
  addPhotoToAlbumController,
  removePhotoFromAlbumController,
} from "../controllers/albums";

export const albumsRouter = express.Router({
  mergeParams: true,
});

// Get individual album by ID
albumsRouter.get("/:id", getAlbumByIdController);

// Add photo to album
albumsRouter.post("/:albumId/photos/:photoId", addPhotoToAlbumController);

// Remove photo from album
albumsRouter.delete(
  "/:albumId/photos/:photoId",
  removePhotoFromAlbumController
);
