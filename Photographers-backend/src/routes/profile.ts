import { Router } from "express";
import {
  addFriend,
  getCurrentUserController,
  getFriends,
  getProfiles,
  removeFriend,
} from "../controllers/users";
import { profile } from "console";

export const profileRouter = Router({
  mergeParams: true,
});

profileRouter.get("/friends", getFriends);
profileRouter.post("/friends/:friendId", addFriend);
profileRouter.delete("/friends/:friendId", removeFriend);
profileRouter.get("/profiles", getProfiles);
