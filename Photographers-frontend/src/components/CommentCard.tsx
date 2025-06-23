import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Card,
  CardContent,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import Comment from "../model/Comment";
import { CurrentUser } from "../service/AuthenticationService";
import { useEffect, useState } from "react";

interface CommentCardProps {
  comment: Comment;
  onDelete: (commentId: number) => void;
}

const CommentCard = ({ comment, onDelete }: CommentCardProps) => {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    CurrentUser().then((user) => setCurrentUserId(user.id));
  }, []);

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      onDelete(comment.id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  return (
    <Card sx={{ mb: 1, backgroundColor: "#f5f5f5" }}>
      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32, fontSize: "0.875rem" }}>
            {comment.user.username.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
            >
              <Typography variant="subtitle2" fontWeight="bold">
                {comment.user.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(comment.createdAt)}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.primary">
              {comment.content}
            </Typography>
          </Box>
          {currentUserId === comment.user.id && (
            <IconButton
              size="small"
              onClick={handleDelete}
              sx={{ color: "text.secondary" }}
            >
              <Delete fontSize="small" />
            </IconButton>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default CommentCard;
