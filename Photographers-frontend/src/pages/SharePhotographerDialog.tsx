import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
  InputAdornment,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { authedFetch } from "../helpers/authedFetch";
import usePhotographerStore from "../stores/PhotographerStore";

interface User {
  id: number;
  username: string;
  isFriend: boolean;
}

interface SharePhotographerDialogProps {
  open: boolean;
  onClose: () => void;
  photographerId: number;
}

export const SharePhotographerDialog = ({
  open,
  onClose,
  photographerId,
}: SharePhotographerDialogProps) => {
  const [friends, setFriends] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFriends = async () => {
    try {
      const response = await authedFetch("/api/me/friends");
      const data = await response.json();
      setFriends(data.filter((friend: User) => friend.isFriend));
    } catch (error) {
      console.error("Error fetching friends:", error);
      setError("Failed to load friends");
    }
  };

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetchFriends().finally(() => setLoading(false));
    }
  }, [open]);
  const store = usePhotographerStore();

  const handleShare = async (friendId: number) => {
    try {
      await store.recommendPhotographer(photographerId, friendId);
      onClose();
    } catch (error) {
      console.error("Error sharing photographer:", error);
      setError("Failed to share photographer");
    }
  };

  const filteredFriends = friends.filter((friend) =>
    friend.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Share Photographer</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search friends..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 3, mt: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">
            {error}
          </Typography>
        ) : filteredFriends.length === 0 ? (
          <Typography align="center">No friends found</Typography>
        ) : (
          <List>
            {filteredFriends.map((friend) => (
              <ListItem
                key={friend.id}
                onClick={() => handleShare(friend.id)}
                divider
                component="li"
              >
                <ListItemText primary={friend.username} />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SharePhotographerDialog;
