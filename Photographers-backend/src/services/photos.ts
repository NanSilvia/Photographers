import { In } from "typeorm";
import { AppDataSource } from "../databaseHelper/dataSource";
import { Photo } from "../model/photo";
import { tr } from "@faker-js/faker";

const photoRepo = AppDataSource.getRepository(Photo);

//get all photos from the db with the tag TagName
export async function getPhotosByTagName(tagName: string): Promise<Photo[]> {
  const photos = await photoRepo.find({
    relations: {
      tags: true,
      ratings: {
        user: true,
      },
    },
  });

  // Filter photos that include the specified tag
  return photos.filter((photo) =>
    photo.tags.some((tag) => tag.name === tagName)
  );
}

export async function getPhotoById(id: number): Promise<Photo> {
  const photo = await photoRepo.findOneBy({ id });
  if (!photo) {
    throw Error("photo with this id " + id + " doesn't exist");
  }
  return photo;
}
