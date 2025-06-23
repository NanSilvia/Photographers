import { Request, Response } from "express";
import {
  deleteNotificationById,
  getNotificationsByUserId,
} from "../services/notifications";
import {
  addPhotographer,
  addPhotographerToUser,
  recommendPhotographer,
} from "../services/photographers";

export const getNotifications = async (req: Request, res: Response) => {
  if (!req.user?._id) {
    throw new Error("User not defined but passed hasRole middleware");
  }

  const notifications = await getNotificationsByUserId(req.user._id);

  res.json(notifications);
};

export const deleteNotification = async (req: Request, res: Response) => {
  if (!req.user?._id) {
    throw new Error("User not defined but passed hasRole middleware");
  }
  const notificationId = parseInt(req.params.id);
  if (!notificationId || isNaN(notificationId)) {
    throw new Error("Invalid notification ID format");
  }
  await deleteNotificationById(notificationId);

  res.json({ message: "Notification deleted successfully" });
};

//should create a notification for the user
export const recommendPhotographerController = async (
  req: Request,
  res: Response
) => {
  if (!req.user?._id) {
    throw new Error("User not defined but passed hasRole middleware");
  }
  const photographerId = parseInt(req.params.id);
  if (!photographerId || isNaN(photographerId)) {
    throw new Error("Invalid photographer ID format");
  }

  await recommendPhotographer(req.user._id, photographerId);

  res.json({ message: `Recommended photographer with ID ${photographerId}` });
};

export const acceptRecommendation = async (req: Request, res: Response) => {
  if (!req.user?._id) {
    throw new Error("User not defined but passed hasRole middleware");
  }
  const notificationId = parseInt(req.params.id);
  if (!notificationId || isNaN(notificationId)) {
    throw new Error("Invalid notification ID format");
  }

  const notification = await deleteNotificationById(notificationId);
  if (!notification) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }

  await addPhotographerToUser(
    notification.user.id,
    notification.photographer.id
  );

  res.json({ message: `Accepted recommendation with ID ${notificationId}` });
};
