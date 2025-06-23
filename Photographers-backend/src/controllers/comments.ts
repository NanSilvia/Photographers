import { Request, Response } from "express";
import {
  getCommentsForPhotographer,
  createComment,
  deleteComment,
} from "../services/comments";
import { notifyClients } from "../server";

export const getCommentsController = async (req: Request, res: Response) => {
  if (!req.params.id) {
    res.status(400).json("photographer doesn't exist");
    return;
  }

  try {
    const comments = await getCommentsForPhotographer(
      Number.parseInt(req.params.id)
    );

    // Remove sensitive user data
    res.json(
      comments.map((comment) => ({
        ...comment,
        user: {
          ...comment.user,
          password: undefined,
          twoFactorSecret: undefined,
        },
      }))
    );
  } catch (error) {
    console.error("Error fetching comments:", error);
    if (error.message === "Photographer not found") {
      res.status(404).json("Photographer not found");
    } else {
      res.status(500).json("Failed to fetch comments");
    }
  }
};

export const createCommentController = async (req: Request, res: Response) => {
  if (!req.params.id) {
    res.status(400).json("photographer doesn't exist");
    return;
  }

  if (!req.body.content || !req.body.content.trim()) {
    res.status(400).json("comment content is required");
    return;
  }

  // Get user ID from session/auth middleware
  const userId = req.user?._id;
  if (!userId) {
    res.status(401).json("authentication required");
    return;
  }

  try {
    const comment = await createComment(
      Number.parseInt(req.params.id),
      userId,
      req.body.content
    );

    // Remove sensitive user data
    const responseComment = {
      ...comment,
      user: {
        ...comment.user,
        password: undefined,
        twoFactorSecret: undefined,
      },
    };

    // Notify all clients about the new comment
    notifyClients("comment_created", {
      photographerId: Number.parseInt(req.params.id),
      comment: responseComment,
    });

    res.status(201).json(responseComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    if (error.message === "Photographer not found") {
      res.status(404).json("Photographer not found");
    } else if (error.message === "User not found") {
      res.status(404).json("User not found");
    } else {
      res.status(500).json("Failed to create comment");
    }
  }
};

export const deleteCommentController = async (req: Request, res: Response) => {
  if (!req.params.commentId) {
    res.status(400).json("comment ID is required");
    return;
  }

  // Get user ID from session/auth middleware
  const userId = req.user?._id;
  if (!userId) {
    res.status(401).json("authentication required");
    return;
  }

  try {
    const { photographerId } = await deleteComment(
      Number.parseInt(req.params.commentId),
      userId
    );

    // Notify all clients about the deleted comment
    notifyClients("comment_deleted", {
      photographerId,
      commentId: Number.parseInt(req.params.commentId),
    });

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    if (error.message === "Comment not found") {
      res.status(404).json("Comment not found");
    } else if (error.message === "Unauthorized to delete this comment") {
      res.status(403).json("Unauthorized to delete this comment");
    } else {
      res.status(500).json("Failed to delete comment");
    }
  }
};
