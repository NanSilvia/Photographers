import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Album from "../model/Album";
import { API_URL } from "../api";

interface AlbumCardProps {
  album: Album;
}

const AlbumCard = ({ album }: AlbumCardProps) => {
  const navigate = useNavigate();

  const handleAlbumClick = () => {
    navigate(`/albums/${album.id}`);
  };

  // Get the first photo as thumbnail, or use a placeholder
  const thumbnailUrl =
    album.photos.length > 0
      ? `${API_URL}/file/${album.photos[0].imageUrl}`
      : "/placeholder-album.jpg";

  return (
    <Card
      sx={{
        height: "100%",
        cursor: "pointer",
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          transform: "scale(1.02)",
        },
      }}
      onClick={handleAlbumClick}
    >
      <CardMedia
        component="img"
        height="180"
        image={thumbnailUrl}
        alt={album.name}
        sx={{ objectFit: "cover" }}
      />
      <CardContent>
        <Typography variant="h6" color="black" sx={{ marginBottom: 1 }}>
          {album.name}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            label={`${album.photos.length} photo${
              album.photos.length !== 1 ? "s" : ""
            }`}
            size="small"
            variant="outlined"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default AlbumCard;
