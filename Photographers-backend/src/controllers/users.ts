import { Request, Response } from "express";
import { AppDataSource } from "../databaseHelper/dataSource";
import { User } from "../model/user";
import { Photographer } from "../model/photographer";
import { hash } from "argon2";

export const getUsersController = async (req: Request, res: Response) => {
  const users = await AppDataSource.getRepository(User).find();
  res.json(users);
};

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
};

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
};

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
};

export const getFriends = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const user = await AppDataSource.getRepository(User).findOne({
    where: { id: req.user._id },
    relations: ["friends"],
  });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json(
    user.friends.map((friend) => ({
      id: friend.id,
      username: friend.username,
      isFriend: true,
    }))
  );
};

export const addFriend = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const userId = req.user._id;
  const friendId = parseInt(req.params.friendId);
  if (isNaN(friendId)) {
    res.status(400).json({ error: "Invalid friend ID format" });
    return;
  }
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({
    where: { id: userId },
    relations: {
      friends: true,
    },
  });

  const friend = await userRepo.findOne({
    where: { id: friendId },
    relations: {
      friends: true,
    },
  });

  if (!user || !friend) {
    res.status(404).json({ error: "User or friend not found" });
    return;
  }

  if (user.friends.some((f) => f.id === friendId)) {
    res.status(400).json({ error: "Already friends" });
    return;
  }

  user.friends.push(friend);
  await userRepo.save(user);

  res.json({ message: "Friend added successfully", friend });
};

export const removeFriend = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const userId = req.user._id;
  const friendId = parseInt(req.params.friendId);
  if (isNaN(friendId)) {
    res.status(400).json({ error: "Invalid friend ID format" });
    return;
  }
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOneBy({ id: userId });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  user.friends = user.friends.filter((f) => f.id !== friendId);
  await userRepo.save(user);

  res.json({ message: "Friend removed successfully" });
};

export const getProfiles = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const userId = req.user._id;
  const search = (req.query.search as string)?.toLowerCase() || "";

  const currentUser = await AppDataSource.getRepository(User).findOne({
    where: { id: userId },
    relations: {
      friends: true,
    },
  });

  if (!currentUser) {
    res.status(404).json({ message: "Current user not found" });
    return;
  }

  const users = await AppDataSource.getRepository(User).find({
    relations: {
      friends: true,
    },
  });

  if (!users || users.length === 0) {
    res.status(404).json({ message: "No profiles found" });
    return;
  }

  const profiles = users
    .filter((user) => user.id !== userId) // Exclude current user
    .filter((user) => !search || user.username.toLowerCase().includes(search))
    .map((user) => ({
      id: user.id,
      username: user.username,
      isFriend: currentUser.friends.some((f) => f.id === user.id),
    }))
    .sort((a, b) => {
      // Sort friends first, then by username
      if (a.isFriend && !b.isFriend) return -1;
      if (!a.isFriend && b.isFriend) return 1;
      return a.username.localeCompare(b.username);
    });
  console.log("Profiles:", profiles);
  res.json(profiles);
};

export const addPhotographerToUserController = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const userId = req.user._id;
  const photographerId = parseInt(req.params.photographerId);

  if (isNaN(photographerId)) {
    res.status(400).json({ error: "Invalid photographer ID format" });
    return;
  }

  try {
    // Get user with photographers relation
    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: userId },
      relations: ["photographers"],
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Get photographer
    const photographer = await AppDataSource.getRepository(
      Photographer
    ).findOneBy({
      id: photographerId,
    });

    if (!photographer) {
      res.status(404).json({ error: "Photographer not found" });
      return;
    }

    // Check if photographer is already in user's list
    const isAlreadyAdded = user.photographers.some(
      (p) => p.id === photographerId
    );
    if (isAlreadyAdded) {
      res.status(400).json({ error: "Photographer already in your list" });
      return;
    }

    // Add photographer to user's list
    user.photographers.push(photographer);
    await AppDataSource.getRepository(User).save(user);

    res.json({ message: "Photographer added to your list successfully" });
  } catch (error) {
    console.error("Error adding photographer to user list:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
