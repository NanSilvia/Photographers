import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from "@mui/material";
import { useState } from "react";
import Album from "../model/Album";

interface AddPhotoToAlbumDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (albumId: number) => void;
  albums: Album[];
  photoTitle?: string;
  loading?: boolean;
}

const AddPhotoToAlbumDialog = ({
  open,
  onClose,
  onSubmit,
  albums,
  photoTitle,
  loading,
}: AddPhotoToAlbumDialogProps) => {
  const [selectedAlbumId, setSelectedAlbumId] = useState<number | "">("");

  const handleSubmit = () => {
    if (selectedAlbumId && typeof selectedAlbumId === "number") {
      onSubmit(selectedAlbumId);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedAlbumId("");
    onClose();
  };

  if (albums.length === 0) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add Photo to Album</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body1" color="text.secondary">
              No albums available. Create an album first to add photos to it.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Photo to Album</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1, mb: 2 }}>
          {photoTitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Adding "{photoTitle}" to album
            </Typography>
          )}
          <FormControl fullWidth>
            <InputLabel>Select Album</InputLabel>
            <Select
              value={selectedAlbumId}
              onChange={(e) => setSelectedAlbumId(e.target.value as number)}
              label="Select Album"
            >
              {albums.map((album) => (
                <MenuItem key={album.id} value={album.id}>
                  {album.name} ({album.photos.length} photo
                  {album.photos.length !== 1 ? "s" : ""})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !selectedAlbumId}
        >
          {loading ? "Adding..." : "Add to Album"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPhotoToAlbumDialog;
