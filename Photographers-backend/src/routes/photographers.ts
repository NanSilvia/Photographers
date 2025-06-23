import { Router } from "express";
import { hasRole } from "../middleware/authorization";
import {
  createPhotographerController,
  deletePhotographerController,
  getPhotographerByIdController,
  getPhotographersController,
  recommendPhotographerController,
  updatePhotographerController,
} from "../controllers/photographers";
import { photosRouter } from "./photos";
import {
  createAlbumController,
  getAlbumsPhotographer,
} from "../controllers/albums";
import {
  getCommentsController,
  createCommentController,
  deleteCommentController,
} from "../controllers/comments";

export const photographersRouter = Router({
  mergeParams: true,
});

photographersRouter.get("/", getPhotographersController);

photographersRouter.get("/:id", getPhotographerByIdController);

photographersRouter.post("/", createPhotographerController);

photographersRouter.put("/:id", updatePhotographerController);

photographersRouter.delete("/:id", deletePhotographerController);

photographersRouter.use("/:id/photos", hasRole("user"), photosRouter);

// Get all albums for a photographer
photographersRouter.get("/:id/albums", getAlbumsPhotographer);
// Create a new album for a photographer
photographersRouter.post("/:id/albums", createAlbumController);

// Comments routes
photographersRouter.get("/:id/comments", getCommentsController);
photographersRouter.post("/:id/comments", hasRole("user"), createCommentController);

photographersRouter.post(
  "/:id/recommend/:recommendeeId",
  recommendPhotographerController
);
