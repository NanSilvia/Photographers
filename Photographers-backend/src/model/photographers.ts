//In-memory storage for photographers
// import myPhotographers from "./photogdb.js";
import { Photographer } from "./photographer";
//let photographers: Photographer[] = myPhotographers;
// export const photographers = [];

import { AppDatatSource } from "../databaseHelper/dataSource";
import { IsNull, Not } from "typeorm";

const photographersRepo = AppDatatSource.getRepository(Photographer);

// Get all photographers
export async function getAllPhotographers(): Promise<Photographer[]> {
    return await photographersRepo.find();
}

export async function getPhotographersByPage(pageNr: number, aliveOnly: boolean): Promise<Photographer[]> {
    return await photographersRepo.find({
        skip: pageNr * 8,
        take: 8,
        where: aliveOnly ? {
            death: IsNull(),
        } : {},
    });
}
// Get a single photographer by ID
export async function getPhotographerById(id: number): Promise<Photographer | null> {
    return await photographersRepo.findOne({
        where: {
            id,
        },
        relations: {
            photos: true,
        },
    });
}

// Add a new photographer
export async function addPhotographer(photographer: Photographer): Promise<Photographer> {
    const newPhotographer = photographersRepo.create(photographer);

    return await photographersRepo.save(newPhotographer);
}

// Update a photographer by ID
export async function updatePhotographer(id: number, updatedData:Partial<Photographer>): Promise<Photographer | null> {
    const photographerToUpdate = await photographersRepo.findOne({
        where: { id },
        relations: {
            photos: true,
        }
    })

    if (!photographerToUpdate) return null;

    console.log("photographerToUpdate", photographerToUpdate);
    console.log("updatedData", updatedData);
    
    const updatedPhotographer = { ...photographerToUpdate, ...updatedData };
    return await photographersRepo.save(updatedPhotographer);
}

// Delete a photographer by ID
export async function deletePhotographer(id: number):Promise<Photographer | null> {
    const photographerToDelete = await photographersRepo.findOneBy({ id });
    if (!photographerToDelete) return null;
    await photographersRepo.remove(photographerToDelete);
    return photographerToDelete;
}


// module.exports = {
//     photographers,
//     getAllPhotographers,
//     addPhotographer,
//     getPhotographerById,
//     updatePhotographer,
//     deletePhotographer
// };