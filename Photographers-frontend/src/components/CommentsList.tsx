import { Box, Typography, TextField, Button, Paper } from "@mui/material";
import { useState } from "react";
import Comment from "../model/Comment";
import CommentCard from "./CommentCard";

interface CommentsListProps {
  comments: Comment[];
  onAddComment: (content: string) => void;
  onDeleteComment: (commentId: number) => void;
  loading?: boolean;
  addingComment?: boolean;
}

const CommentsList = ({
  comments,
  onAddComment,
  onDeleteComment,
  loading,
  addingComment,
}: CommentsListProps) => {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment("");
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Comments ({comments.length})
      </Typography>

      {/* Add comment form */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={!newComment.trim() || addingComment}
            sx={{ float: "right" }}
          >
            {addingComment ? "Adding..." : "Add Comment"}
          </Button>
          <Box sx={{ clear: "both" }} />
        </form>
      </Paper>

      {/* Comments list */}
      {loading ? (
        <Typography variant="body2" color="text.secondary">
          Loading comments...
        </Typography>
      ) : comments.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No comments yet. Be the first to comment!
        </Typography>
      ) : (
        <Box>
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              onDelete={onDeleteComment}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default CommentsList;
