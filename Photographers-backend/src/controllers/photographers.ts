import { Request, Response } from "express";
import { addPhotographer, deletePhotographer, getPhotographerById, getPhotographersByPage, updatePhotographer } from "../model/photographers";
import { Photographer } from "../model/photographer";
import { AppDataSource } from "../databaseHelper/dataSource";
import { User } from "../model/user";
import { notifyClients } from "../server";
// Get all photographers
// app.get(
//   "/photographers",
//   hasRole("user"),
export const getPhotographersController =  async (req: Request, res: Response) => {
    if (!req.user?._id)
      throw new Error("User not defined but passed hasRole middleware");
    const aliveOnly = req.query.alive === "true";
    const pageNr = Number.parseInt((req.query.pageNr as string) ?? "0");

    let photographers = await getPhotographersByPage(
      req.user._id,
      pageNr,
      aliveOnly
    );

    res.json(photographers);
}
// );

// Get a specific photographer by ID
// app.get(
//   "/photographers/:id",
//   hasRole("user"),
export const getPhotographerByIdController = async (req: Request, res: Response) => {
    if (!req.user?._id)
      throw new Error("User not defined but passed hasRole middleware");
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid photographer ID format" });
      return;
    }

    const photographer = await getPhotographerById(req.user._id, id);
    if (!photographer) {
      res.status(404).json({ error: "Photographer not found" });
      return;
    }

    res.json(photographer);
  }
// );

// Add a new photographer
// app.post(
//   "/photographers",
//   hasRole("user"),
export const createPhotographerController = async (req: Request, res: Response) => {
    if (!req.user)
      throw new Error("User not defined but passed hasRole middleware");
    const { name, birth, death, profilepicUrl, description } = req.body;
    if (!name || !birth || !profilepicUrl || !description) {
      res.status(400).json({ error: "Missing required fields" });
    }
    const photographertobeAdded = new Photographer();
    photographertobeAdded.name = name;
    photographertobeAdded.birth = new Date(birth);
    photographertobeAdded.death = death ? new Date(death) : null;
    photographertobeAdded.profilepicUrl = profilepicUrl;
    photographertobeAdded.description = description;
    const currentUser = await AppDataSource.getRepository(User).findOneBy({
      id: req.user._id,
    });
    if (!currentUser) throw new Error("User not found but session is defined");
    photographertobeAdded.user = currentUser;

    const newPhotographer = await addPhotographer(photographertobeAdded);
    res.status(201).json(newPhotographer);
    notifyClients("photographerAdded", newPhotographer);
  }
// );

// Update a photographer by ID
// app.put("/photographers/:id", 
export const updatePhotographerController = async (req: Request, res: Response) => {
  const updatedPhotographer = await updatePhotographer(
    parseInt(req.params.id),
    req.body
  );
  if (!updatedPhotographer) {
    res.status(404).json({ error: "Photographer not found" });
    return;
  }
  res.json(updatedPhotographer);
  notifyClients("photographerUpdated", updatedPhotographer);
}
// );

// Delete a photographer by ID
// app.delete(
//   "/photographers/:id",
//   hasRole("user"),
export const deletePhotographerController = async (req: Request, res: Response) => {
    if (!req.user)
      throw new Error("User not defined but passed hasRole middleware");
    const deletedPhotographer = await deletePhotographer(
      req.user._id,
      parseInt(req.params.id)
    );
    if (!deletedPhotographer) {
      res.status(404).json({ error: "Photographer not found" });
      return;
    }
    res.json({
      message: "Photographer deleted successfully",
      deletedPhotographer,
    });
    notifyClients("photographerDeleted", deletedPhotographer.id);
  }
// );
