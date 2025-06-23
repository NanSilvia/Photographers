import { AppDataSource } from "../databaseHelper/dataSource";
import { Album } from "../model/album";
import { Photo } from "../model/photo";
import { Photographer } from "../model/photographer";

const albumRepo = AppDataSource.getRepository(Album);
const photos = AppDataSource.getRepository(Photo);
const photographersRepo = AppDataSource.getRepository(Photographer);

export const getAllAlbumsPhotographer = async (
  photographerId: number
): Promise<Album[]> => {
  const albums = await albumRepo.find({
    relations: {
      photos: {
        ratings: {
          user: true,
        },
        tags: true,
      },
    },
    where: {
      photographer: {
        id: photographerId,
      },
    },
  });

  return albums;
};

export const addPhotoToAlbum = async (photoId: number, albumId: number) => {
  const photo = await photos.findOne({
    where: {
      id: photoId,
    },
  });
  if (!photo) {
    throw Error("this photo doesn't exist");
  }
  const album = await albumRepo.findOne({
    where: {
      id: albumId,
    },
  });

  if (!album) {
    throw Error("this album doesn't exist");
  }

  album.photos.push(photo);
  albumRepo.save(album);
};

export const removePhotoFromAlbum = async (
  photoId: number,
  albumId: number
) => {
  const photo = await photos.findOne({
    where: {
      id: photoId,
    },
  });
  if (!photo) {
    throw Error("this photo doesn't exist");
  }
  const album = await albumRepo.findOne({
    where: {
      id: albumId,
    },
  });

  if (!album) {
    throw Error("this album doesn't exist");
  }

  album.photos.splice(album.photos.indexOf(photo), 1);
  albumRepo.save(album);
};

export const createAnAlbum = async (photogId: number, name: string) => {
  const photographer = await photographersRepo.findOne({
    where: {
      id: photogId,
    },
  });
  if (!photographer) {
    throw Error("photographer doesn't exist");
    return;
  }
  const album = new Album();
  album.name = name;
  album.photographer = photographer;
  album.photos = [];
  albumRepo.save(album);
};
