import * as express from "express";
import { Request, Response } from "express";
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
import { recommendationRoutes } from "./recommendations";
import { AppDataSource } from "../databaseHelper/dataSource";
import { Photographer } from "../model/photographer";

export const router = express.Router({
  mergeParams: true,
});
router.use("/auth", authRouter);

// Public routes (no authentication required)
router.get("/photographers/:id/public", async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid photographer ID format" });
    }

    const photographer = await AppDataSource.getRepository(
      Photographer
    ).findOne({
      where: { id },
      relations: {
        photos: {
          tags: true,
        },
      },
    });

    if (!photographer) {
      return res.status(404).json({ error: "Photographer not found" });
    }

    res.json({
      id: photographer.id,
      name: photographer.name,
      description: photographer.description,
      profilepicUrl: photographer.profilepicUrl,
      photos: photographer.photos.map((photo: any) => ({
        id: photo.id,
        title: photo.title,
        imageUrl: photo.imageUrl,
        description: photo.description,
        tags: photo.tags,
      })),
    });
  } catch (error) {
    console.error("Error fetching public photographer:", error);
    res.status(500).json({ error: "Failed to fetch photographer" });
  }
});

// Authenticated routes
router.use("/photographers", hasRole("user"), photographersRouter);
router.use("/users", usersRouter);
router.use("/me", hasRole("user"), profileRouter);
router.use("/notifications", hasRole("user"), notificationsRouter);
router.use("/tags", tagsRouter);
router.use("/rating", hasRole("user"), ratingRouter);
router.use("/albums", hasRole("user"), albumsRouter);

// Recommendations routes
router.use("/users", recommendationRoutes);

// Comment delete route (needs to be outside photographer routes due to different ID structure)
router.delete("/comments/:commentId", hasRole("user"), deleteCommentController);
