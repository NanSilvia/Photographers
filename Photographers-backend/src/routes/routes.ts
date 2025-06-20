import * as express from "express";
import { authRouter } from "./auth";
import { hasRole } from "../middleware/authorization";
import { photographersRouter } from "./photographers";
import { usersRouter } from "./users";
import { tagsRouter } from "./tags";
import { getFriends } from "../controllers/users";
import { profileRouter } from "./profile";

export const router = express.Router({
  mergeParams: true,
});
router.use("/auth", authRouter);
router.use("/photographers", hasRole("user"), photographersRouter);
router.use("/users", usersRouter);
router.use("/me", hasRole("user"), profileRouter);
router.use("/tags", tagsRouter);
