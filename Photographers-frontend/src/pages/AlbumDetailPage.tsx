import {
  Grid,
  Typography,
  Box,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  CardActions,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Album from "../model/Album";
import AlbumsApi from "../service/AlbumsApi";
import { ArrowBack, Delete } from "@mui/icons-material";
import ConfirmationDialog from "./ModalPopup";
import TagList from "../components/TagList";
import { API_URL } from "../api";

const AlbumDetailPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAlbum = async () => {
      try {
        setLoading(true);
        if (params.id) {
          const albumData = await AlbumsApi.getAlbumById(parseInt(params.id));
          setAlbum(albumData);
        }
      } catch (err) {
        setError("Failed to load album");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadAlbum();
  }, [params.id]);

  const handleRemovePhoto = async (photoId: number) => {
    if (!album) return;

    try {
      await AlbumsApi.removePhotoFromAlbum(album.id, photoId);
      // Update local state
      setAlbum({
        ...album,
        photos: album.photos.filter((photo) => photo.id !== photoId),
      });
    } catch (error) {
      console.error("Failed to remove photo from album:", error);
    }
  };

  const handleGoBack = () => {
    if (album) {
      navigate(`/photographers/${album.photographer.id}`);
    } else {
      navigate("/photographers");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!album) return <div>Album not found</div>;

  return (
    <Box sx={{ padding: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", marginBottom: 3 }}>
        <IconButton onClick={handleGoBack} sx={{ marginRight: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h3" color="black">
          {album.name}
        </Typography>
      </Box>

      {/* Photographer info */}
      <Typography variant="h5" color="black" sx={{ marginBottom: 2 }}>
        by {album.photographer.name}
      </Typography>

      {/* Photos count */}
      <Typography variant="body1" color="black" sx={{ marginBottom: 3 }}>
        {album.photos.length} photo{album.photos.length !== 1 ? "s" : ""}
      </Typography>

      {/* Photos Grid - 4 columns */}
      <Grid container spacing={3}>
        {album.photos.map((photo) => (
          <Grid item xs={12} sm={6} md={3} key={photo.id}>
            <Card sx={{ height: "100%" }}>
              <CardMedia
                component="img"
                height="200"
                image={`${API_URL}/file/${photo.imageUrl}`}
                alt={photo.title}
                sx={{ objectFit: "cover" }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" color="black" sx={{ marginBottom: 1 }}>
                  {photo.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="black"
                  sx={{ marginBottom: 1 }}
                >
                  {photo.description}
                </Typography>
                <TagList tags={photo.tags} />

                {/* Rating display */}
                {photo.ratings && photo.ratings.length > 0 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Average Rating:{" "}
                    {(
                      photo.ratings.reduce((sum, r) => sum + r.rating, 0) /
                      photo.ratings.length
                    ).toFixed(2)}{" "}
                    ({photo.ratings.length} rating
                    {photo.ratings.length !== 1 ? "s" : ""})
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <ConfirmationDialog
                  title="Remove Photo from Album"
                  description="Are you sure you want to remove this photo from the album?"
                  response={() => handleRemovePhoto(photo.id)}
                >
                  {(onClick) => (
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        onClick();
                      }}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  )}
                </ConfirmationDialog>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Empty state */}
      {album.photos.length === 0 && (
        <Box sx={{ textAlign: "center", marginTop: 4 }}>
          <Typography variant="h6" color="text.secondary">
            This album is empty
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Add photos to this album from the photographer's page
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AlbumDetailPage;
