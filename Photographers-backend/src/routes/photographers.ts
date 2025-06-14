import { Router} from "express";
import { hasRole } from "../middleware/authorization";
import { createPhotographerController, deletePhotographerController, getPhotographerByIdController, getPhotographersController, updatePhotographerController } from "../controllers/photographers";
import { photosRouter } from "./photos";

export const photographersRouter = Router({
    mergeParams: true,
});

photographersRouter.get("/", getPhotographersController);

photographersRouter.get('/:id', getPhotographerByIdController);

photographersRouter.post("/", createPhotographerController);

photographersRouter.put("/:id", updatePhotographerController);

photographersRouter.delete("/:id", deletePhotographerController);

photographersRouter.use('/:id/photos', hasRole("user"), photosRouter);
