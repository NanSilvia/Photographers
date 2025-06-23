import { Router } from "express";
import { likeAPhoto, updateRating } from "../controllers/ratings";

export const ratingRouter = Router({
  mergeParams: true,
});

ratingRouter.post("/addRating", likeAPhoto);
ratingRouter.put("/updateRating", updateRating);
