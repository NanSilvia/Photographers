import { getPhotosByTagController } from "../controllers/photos";
import { getTagsController } from "../controllers/tags";

import { Router } from "express";

export const tagsRouter = Router({
  mergeParams: true,
});

tagsRouter.get("/", getTagsController);
tagsRouter.get("/:name", getPhotosByTagController);
