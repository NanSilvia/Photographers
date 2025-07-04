import {
  Avatar,
  Box,
  Card,
  CardActions,
  IconButton,
  Tooltip,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import TagList from "./TagList";
import { API_URL } from "../api";
import { Delete, Edit, PhotoLibrary, MoreVert } from "@mui/icons-material";
import Photo from "../model/Photo";
import { useEffect, useState } from "react";
import { CurrentUser } from "../service/AuthenticationService";
import { addPhotoRating, updatePhotoRating } from "../service/RatingsApi";
import StarRating from "./StarRating";
import User from "../model/User";

export interface PhotoCardProps {
  photo: Photo;
  setSelectedPhoto?: (photo: Photo | null) => void;
  setIsFormOpen?: (isOpen: boolean) => void;
  handleDeletePhoto?: (photoId: number) => void;
  onAddToAlbum?: (photoId: number, photoTitle: string) => void;
}

export const PhotoCard = ({
  photo,
  setSelectedPhoto,
  setIsFormOpen,
  handleDeletePhoto,
  onAddToAlbum,
}: PhotoCardProps) => {
  const [localPhoto, setLocalPhoto] = useState(photo);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState(0);
  const [usersWhoRated, setUsersWhoRated] = useState<User[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const menuOpen = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    if (setSelectedPhoto && setIsFormOpen) {
      setSelectedPhoto(photo);
      setIsFormOpen(true);
    }
    handleMenuClose();
  };

  const handleAddToAlbumClick = () => {
    if (onAddToAlbum) {
      onAddToAlbum(photo.id, photo.title);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    if (window.confirm("Are you sure you want to delete this photo?")) {
      if (handleDeletePhoto) {
        handleDeletePhoto(photo.id);
      }
    }
  };
  useEffect(() => {
    CurrentUser().then((user) => setUserId(user.id));
  }, []);

  useEffect(() => {
    setAverageRating(
      localPhoto.ratings && localPhoto.ratings.length > 0
        ? localPhoto.ratings.reduce((sum, r) => sum + r.rating, 0) /
            localPhoto.ratings.length
        : 0
    );
    setUsersWhoRated(localPhoto.ratings?.map((r) => r.user) || []);

    setUserRating(
      localPhoto.ratings.find((r) => r.user.id === userId)?.rating || 0
    );
  }, [localPhoto, userId]);

  const handleRate = async (value: number) => {
    if (!userId || submitting) return;
    setSubmitting(true);
    try {
      let updatedRating;
      const existingRating = localPhoto.ratings.find(
        (r) => r.user.id === userId
      );
      if (existingRating) {
        updatedRating = await updatePhotoRating(localPhoto.id, value);
        // Update the existing rating in localPhoto.ratings
        existingRating.rating = updatedRating.rating;
      } else {
        updatedRating = await addPhotoRating(localPhoto.id, value);
        localPhoto.ratings.push(updatedRating);
      }
      setLocalPhoto({ ...localPhoto });
    } catch (e) {
      // Optionally show error
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card
      key={photo.id}
      sx={{
        width: "100%",
        height: "auto",
        marginTop: 2,
        padding: 2,
        backgroundColor: "#f5f5f5",
        borderRadius: "8px",
      }}
    >
      <img
        src={`${API_URL}/file/${photo.imageUrl}`}
        alt={photo.title}
        style={{ width: "100%", height: "auto", borderRadius: "8px" }}
      />
      <Typography variant="h6" color="black" sx={{ marginTop: 1 }}>
        {photo.title}
      </Typography>
      <Typography variant="body2" color="black" sx={{ marginTop: 1 }}>
        {photo.description}
      </Typography>
      <TagList tags={photo.tags} />
      <CardActions
        sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {averageRating !== null
              ? `Average Rating: ${averageRating.toFixed(2)} (${
                  localPhoto.ratings.length
                } rating${localPhoto.ratings.length !== 1 ? "s" : ""})`
              : "No ratings yet"}
          </Typography>
          <Box sx={{ mt: 1, mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Your Rating:
            </Typography>
            <StarRating
              value={userRating}
              onChange={handleRate}
              disabled={submitting}
            />
          </Box>
          {usersWhoRated.length > 0 && (
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                Liked by:
              </Typography>
              {usersWhoRated.map((user) => (
                <Tooltip key={user.id} title={user.username}>
                  <Avatar sx={{ width: 24, height: 24, mr: 0.5 }}>
                    {user.username.charAt(0).toUpperCase()}
                  </Avatar>
                </Tooltip>
              ))}
            </Box>
          )}
        </Box>

        {/* Three dots menu */}
        {(setSelectedPhoto || handleDeletePhoto || onAddToAlbum) && (
          <Box>
            <IconButton onClick={handleMenuClick} size="small" sx={{ mt: 1 }}>
              <MoreVert />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              MenuListProps={{
                "aria-labelledby": "photo-menu-button",
              }}
            >
              {setSelectedPhoto && setIsFormOpen && (
                <MenuItem onClick={handleEditClick}>
                  <ListItemIcon>
                    <Edit fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Edit</ListItemText>
                </MenuItem>
              )}
              {onAddToAlbum && (
                <MenuItem onClick={handleAddToAlbumClick}>
                  <ListItemIcon>
                    <PhotoLibrary fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Add to Album</ListItemText>
                </MenuItem>
              )}
              {handleDeletePhoto && (
                <MenuItem onClick={handleDeleteClick}>
                  <ListItemIcon>
                    <Delete fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Delete</ListItemText>
                </MenuItem>
              )}
            </Menu>
          </Box>
        )}
      </CardActions>
    </Card>
  );
};
