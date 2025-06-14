import { Request, Response } from "express";
import { AppDataSource } from "../databaseHelper/dataSource";
import { User } from "../model/user";
import { hash } from "argon2";

export const getUsersController = async (req: Request, res: Response) => {
    const users = await AppDataSource.getRepository(User).find();
    res.json(users);
}

export const updateUserController = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const { username, password, role } = req.body;
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID format" });
    return;
  }
  const user = await AppDataSource.getRepository(User).findOneBy({
    id: userId,
  });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  if (username) user.username = username;
  if (password) {
    user.password = await hash(password);
  }
  if (role) user.role = role;
  await AppDataSource.getRepository(User).save(user);
  res.json(user);
}
 
export const deleteUserController = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID format" });
      return;
    }
    const user = await AppDataSource.getRepository(User).findOneBy({
      id: userId,
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    await AppDataSource.getRepository(User).remove(user);
    res.json({ message: "User deleted successfully" });
}

export const getCurrentUserController = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const user = await AppDataSource.getRepository(User).findOneBy({
    id: req.user._id,
  });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json({
    ...user,
    password: undefined, // Exclude password from the response
  });
}