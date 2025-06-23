import { Grid, Typography, Box } from "@mui/material";
import Album from "../model/Album";
import AlbumCard from "./AlbumCard";

interface AlbumsListProps {
  albums: Album[];
  loading?: boolean;
}

const AlbumsList = ({ albums, loading }: AlbumsListProps) => {
  if (loading) {
    return (
      <Box sx={{ marginBottom: 4 }}>
        <Typography variant="h4" color="black" sx={{ marginBottom: 2 }}>
          Albums
        </Typography>
        <Typography variant="body1" color="black">
          Loading albums...
        </Typography>
      </Box>
    );
  }

  if (albums.length === 0) {
    return (
      <Box sx={{ marginBottom: 4 }}>
        <Typography variant="h4" color="black" sx={{ marginBottom: 2 }}>
          Albums
        </Typography>
        <Typography variant="body1" color="text.secondary">
          No albums yet. Create your first album!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ marginBottom: 4 }}>
      <Typography variant="h4" color="black" sx={{ marginBottom: 2 }}>
        Albums ({albums.length})
      </Typography>
      <Grid container spacing={3}>
        {albums.map((album) => (
          <Grid item xs={12} sm={6} md={3} key={album.id}>
            <AlbumCard album={album} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AlbumsList;
