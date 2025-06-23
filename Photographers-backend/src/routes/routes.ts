import * as express from "express";
import { authRouter } from "./auth";
import { hasRole } from "../middleware/authorization";
import { photographersRouter } from "./photographers";
import { usersRouter } from "./users";
import { tagsRouter } from "./tags";
import { getFriends } from "../controllers/users";
import { profileRouter } from "./profile";
import { notificationsRouter } from "./notifications";
import { ratingRouter } from "./ratings";
import { albumsRouter } from "./albums";
import { deleteCommentController } from "../controllers/comments";

export const router = express.Router({
  mergeParams: true,
});
router.use("/auth", authRouter);
router.use("/photographers", hasRole("user"), photographersRouter);
router.use("/users", usersRouter);
router.use("/me", hasRole("user"), profileRouter);
router.use("/notifications", hasRole("user"), notificationsRouter);
router.use("/tags", tagsRouter);
router.use("/rating", hasRole("user"), ratingRouter);
router.use("/albums", hasRole("user"), albumsRouter);

// Comment delete route (needs to be outside photographer routes due to different ID structure)
router.delete("/comments/:commentId", hasRole("user"), deleteCommentController);
