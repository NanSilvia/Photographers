import { Router } from "express";
import { deleteUserController, getCurrentUserController, getUsersController, updateUserController } from "../controllers/users";
import { hasRole } from "../middleware/authorization";
import passport from "passport";

export const usersRouter = Router();

usersRouter.get("/me", passport.authenticate('jwt', {session:false}), getCurrentUserController);
usersRouter.get("/", hasRole("admin"), getUsersController);
usersRouter.put("/:id", hasRole("admin"), updateUserController);
usersRouter.delete("/:id",hasRole("admin"), deleteUserController);