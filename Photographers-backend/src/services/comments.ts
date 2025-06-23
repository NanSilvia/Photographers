import { AppDataSource } from "../databaseHelper/dataSource";
import { Comment } from "../model/comment";
import { User } from "../model/user";
import { Photographer } from "../model/photographer";

const commentRepo = AppDataSource.getRepository(Comment);
const userRepo = AppDataSource.getRepository(User);
const photographerRepo = AppDataSource.getRepository(Photographer);

export const getCommentsForPhotographer = async (
  photographerId: number
): Promise<Comment[]> => {
  // First check if photographer exists
  const photographer = await photographerRepo.findOne({
    where: { id: photographerId },
  });

  if (!photographer) {
    throw new Error("Photographer not found");
  }

  const comments = await commentRepo.find({
    relations: {
      user: true,
    },
    where: {
      photographer: {
        id: photographerId,
      },
    },
    order: {
      createdAt: "DESC",
    },
  });

  return comments;
};

export const createComment = async (
  photographerId: number,
  userId: number,
  content: string
): Promise<Comment> => {
  // Validate photographer exists
  const photographer = await photographerRepo.findOne({
    where: { id: photographerId },
  });

  if (!photographer) {
    throw new Error("Photographer not found");
  }

  // Validate user exists
  const user = await userRepo.findOne({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const comment = new Comment();
  comment.content = content.trim();
  comment.user = user;
  comment.photographer = photographer;

  const savedComment = await commentRepo.save(comment);

  // Return comment with user relation loaded
  return await commentRepo.findOne({
    relations: {
      user: true,
    },
    where: { id: savedComment.id },
  });
};

export const deleteComment = async (
  commentId: number,
  userId: number
): Promise<{ photographerId: number }> => {
  const comment = await commentRepo.findOne({
    relations: {
      user: true,
      photographer: true,
    },
    where: { id: commentId },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  // Only allow user to delete their own comments
  if (comment.user.id !== userId) {
    throw new Error("Unauthorized to delete this comment");
  }

  const photographerId = comment.photographer.id;
  await commentRepo.remove(comment);

  return { photographerId };
};
