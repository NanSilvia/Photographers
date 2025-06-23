import { Router } from "express";
import {
  acceptRecommendation,
  deleteNotification,
  getNotifications,
} from "../controllers/notifications";

export const notificationsRouter = Router({
  mergeParams: true,
});

notificationsRouter.get("/", getNotifications);
notificationsRouter.delete("/:id", deleteNotification);
notificationsRouter.post("/accept/:id", acceptRecommendation);
