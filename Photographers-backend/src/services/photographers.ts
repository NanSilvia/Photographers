//In-memory storage for photographers
// import myPhotographers from "./photogdb.js";
import { Photographer } from "../model/photographer";
//let photographers: Photographer[] = myPhotographers;
// export const photographers = [];

import { AppDataSource } from "../databaseHelper/dataSource";
import { IsNull, Not } from "typeorm";
import { User } from "../model/user";
import { Photo } from "../model/photo";
import { Notification } from "../model/notification";

const photographersRepo = AppDataSource.getRepository(Photographer);

// Get all photographers
export async function getAllPhotographers(): Promise<Photographer[]> {
  return await photographersRepo.find();
}

export async function getPhotographersByPage(
  userId: number,
  pageNr: number,
  aliveOnly: boolean
): Promise<Photographer[]> {
  return await photographersRepo.find({
    skip: pageNr * 8,
    take: 8,
    where: {
      users: {
        id: userId,
      },
      ...(aliveOnly
        ? {
            death: IsNull(),
          }
        : {}),
    },
  });
}
// Get a single photographer by ID
export async function getPhotographerById(
  userId: number,
  id: number
): Promise<Photographer | null> {
  return await photographersRepo.findOne({
    where: {
      id,
      users: {
        id: userId,
      },
    },
    relations: {
      photos: {
        tags: true,
        ratings: {
          user: true,
        },
      },
    },
  });
}

// Add a new photographer
export async function addPhotographer(
  photographer: Photographer
): Promise<Photographer> {
  const newPhotographer = photographersRepo.create(photographer);

  return await photographersRepo.save(newPhotographer);
}

// Update a photographer by ID
export async function updatePhotographer(
  id: number,
  updatedData: Partial<Photographer>
): Promise<Photographer | null> {
  const photographerToUpdate = await photographersRepo.findOne({
    where: { id },
    relations: {
      photos: true,
    },
  });

  if (!photographerToUpdate) return null;

  console.log("photographerToUpdate", photographerToUpdate);
  console.log("updatedData", updatedData);

  const updatedPhotographer = { ...photographerToUpdate, ...updatedData };
  return await photographersRepo.save(updatedPhotographer);
}

// Delete a photographer by ID
export async function deletePhotographer(
  userId: number,
  id: number
): Promise<Photographer | null> {
  const photographerToDelete = await photographersRepo.findOne({
    where: {
      id,
      users: {
        id: userId,
      },
    },
  });
  if (!photographerToDelete) return null;
  await photographersRepo.remove(photographerToDelete);
  return photographerToDelete;
}

// make a notification function to notify user about this photographer
export async function recommendPhotographer(
  userId: number,
  photographerId: number
): Promise<void> {
  const photographer = await photographersRepo.findOne({
    where: {
      id: photographerId,
    },
    relations: {
      users: true,
    },
  });

  if (!photographer) {
    throw new Error("Photographer not found");
  }

  const user = await AppDataSource.getRepository(User).findOne({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const notification: Notification = new Notification();
  notification.user = user;
  notification.photographer = photographer;
  notification.createdAt = new Date();

  await AppDataSource.getRepository(Notification).save(notification);
}

export async function addPhotographerToUser(
  userId: number,
  photographerId: number
): Promise<void> {
  const user = await AppDataSource.getRepository(User).findOne({
    where: { id: userId },
    relations: ["photographers"],
  });

  if (!user) {
    throw new Error("User not found");
  }

  const photographer = await photographersRepo.findOne({
    relations: {
      users: true,
    },
    where: { id: photographerId },
  });

  if (!photographer) {
    throw new Error("Photographer not found");
  }

  if (!user.photographers) {
    user.photographers = [];
  }

  user.photographers.push(photographer);
  await AppDataSource.getRepository(User).save(user);
}

// module.exports = {
//     photographers,
//     getAllPhotographers,
//     addPhotographer,
//     getPhotographerById,
//     updatePhotographer,
//     deletePhotographer
// };
