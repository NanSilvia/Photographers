import { API_URL } from "../api";
import { authedFetch } from "../helpers/authedFetch";
import Comment from "../model/Comment";

class CommentsApi {
  async getCommentsForPhotographer(photographerId: number): Promise<Comment[]> {
    const response = await authedFetch(
      `${API_URL}/photographers/${photographerId}/comments`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch comments");
    }
    return response.json();
  }

  async createComment(photographerId: number, content: string): Promise<Comment> {
    const response = await authedFetch(
      `${API_URL}/photographers/${photographerId}/comments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      }
    );
    if (!response.ok) {
      throw new Error("Failed to create comment");
    }
    return response.json();
  }

  async deleteComment(commentId: number): Promise<void> {
    const response = await authedFetch(
      `${API_URL}/comments/${commentId}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to delete comment");
    }
  }
}

export default new CommentsApi();
