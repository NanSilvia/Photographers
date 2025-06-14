import { Router } from "express";
import { addPhotographerPhotoController, deletePhotographerPhotoController, getPhotographerPhotosController, updatePhotographerPhotoController } from "../controllers/photos";
import multer from "multer";

export const photosRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

photosRouter.get("/", getPhotographerPhotosController);
photosRouter.post("/", upload.single("file"), addPhotographerPhotoController);
photosRouter.put("/:photoId", updatePhotographerPhotoController);
photosRouter.delete("/:photoId", deletePhotographerPhotoController);
