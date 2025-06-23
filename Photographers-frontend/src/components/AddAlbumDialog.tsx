import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { useState } from "react";

interface AddAlbumDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  loading?: boolean;
}

const AddAlbumDialog = ({
  open,
  onClose,
  onSubmit,
  loading,
}: AddAlbumDialogProps) => {
  const [albumName, setAlbumName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!albumName.trim()) {
      setError("Album name is required");
      return;
    }

    onSubmit(albumName.trim());
    handleClose();
  };

  const handleClose = () => {
    setAlbumName("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Album</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Album Name"
            value={albumName}
            onChange={(e) => {
              setAlbumName(e.target.value);
              if (error) setError("");
            }}
            error={!!error}
            helperText={error}
            autoFocus
            variant="outlined"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !albumName.trim()}
        >
          {loading ? "Creating..." : "Create Album"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddAlbumDialog;
