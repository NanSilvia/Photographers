import { Request, Response } from "express";
import { getPhotoById } from "../services/photos";
import { AppDataSource } from "../databaseHelper/dataSource";
import { User } from "../model/user";
import { Rating } from "../model/rating";
import { NamingStrategyNotFoundError, Repository } from "typeorm";
import { fakerMK } from "@faker-js/faker";

const ratingsRepo = AppDataSource.getRepository(Rating);

export const likeAPhoto = async (req: Request, res: Response) => {
  if (!req.user)
    throw new Error("User not defined but passed hasRole middleware");

  const photoId: number = Number.parseInt(req.body.photoId);
  if (!photoId) {
    res.status(400).json({ error: "NO photo ID" });
    return;
  }

  const rating: number = Number.parseInt(req.body.rating);
  if (!rating || rating < 0 || rating > 5) {
    res.status(400).json("Invalid rating");
    return;
  }
  try {
    const photo = await getPhotoById(photoId);
    const currentUser = await AppDataSource.getRepository(User).findOneBy({
      id: req.user._id,
    });
    if (!currentUser) throw new Error("User not found but session is defined");
    const r = new Rating();
    r.user = currentUser;
    r.photo = photo;
    r.rating = rating;
    ratingsRepo.save(r);
    res.status(200).json({
      ...r,
      user: {
        ...r.user,
        password: undefined,
        twoFactorSecreat: undefined,
      },
    });
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
};

export const updateRating = async (req: Request, res: Response) => {
  if (!req.user || !req.user._id)
    throw new Error("User not defined but passed hasRole middleware");

  const photoId: number = Number.parseInt(req.body.photoId);
  if (!photoId) {
    res.status(400).json({ error: "NO photo ID" });
    return;
  }

  const rating: number = Number.parseInt(req.body.rating);
  if (!rating || rating < 0 || rating > 5) {
    res.status(400).json("Invalid rating");
    return;
  }
  try {
    const r = await ratingsRepo.findOne({
      where: {
        photo: {
          id: photoId,
        },
        user: {
          id: req.user._id,
        },
      },
    });
    if (!r) {
      res.status(400).json("no rating to update");
      return;
    }
    r.rating = rating;
    ratingsRepo.update(
      {
        id: r.id,
      },
      r
    );
    res.status(200).json({
      ...r,
      user: {
        ...r.user,
        password: undefined,
        twoFactorSecreat: undefined,
      },
    });
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
};
