import { In } from "typeorm";
import { AppDataSource } from "../databaseHelper/dataSource";
import { Photo } from "../model/photo";

const photoRepo = AppDataSource.getRepository(Photo);

//get all photos from the db with the tag TagName
export async function getPhotosByTagName(tagName: string): Promise<Photo[]> {
  const photos = await photoRepo.find({
    relations: {
      tags: true,
    },
  });

  // Filter photos that include the specified tag
  return photos.filter((photo) =>
    photo.tags.some((tag) => tag.name === tagName)
  );
}
