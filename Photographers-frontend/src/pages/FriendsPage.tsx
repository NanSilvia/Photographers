import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Box,
  CircularProgress,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import SearchIcon from "@mui/icons-material/Search";
import { InputAdornment } from "@mui/material";
import { authedFetch } from "../helpers/authedFetch";

interface User {
  id: number;
  username: string;
  isFriend: boolean;
}

export const FriendsPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchFriends = async () => {
    try {
      const response = await authedFetch("/api/me/friends");
      const data = await response.json();
      setFriends(data);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await authedFetch(
        `/api/me/profiles?search=${encodeURIComponent(search)}`
      );
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleAddFriend = async (userId: number) => {
    try {
      await authedFetch(`/api/me/friends/${userId}`, {
        method: "POST",
      });
      // Refresh both lists
      fetchFriends();
      fetchUsers();
    } catch (error) {
      console.error("Error adding friend:", error);
    }
  };

  const handleRemoveFriend = async (userId: number) => {
    try {
      await authedFetch(`/api/me/friends/${userId}`, {
        method: "DELETE",
      });
      // Refresh both lists
      fetchFriends();
      fetchUsers();
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Friends
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={handleTabChange} centered>
          <Tab label="Friends" />
          <Tab label="Find Users" />
        </Tabs>
      </Paper>

      {tab === 1 && (
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper>
          <List>
            {tab === 0 ? (
              friends.length > 0 ? (
                friends.map((friend) => (
                  <ListItem key={friend.id} divider>
                    <ListItemText primary={friend.username} />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveFriend(friend.id)}
                        color="error"
                      >
                        <PersonRemoveIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No friends yet. Start adding some!" />
                </ListItem>
              )
            ) : (
              users.map((user) => (
                <ListItem key={user.id} divider>
                  <ListItemText primary={user.username} />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() =>
                        user.isFriend
                          ? handleRemoveFriend(user.id)
                          : handleAddFriend(user.id)
                      }
                      color={user.isFriend ? "error" : "primary"}
                    >
                      {user.isFriend ? <PersonRemoveIcon /> : <PersonAddIcon />}
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))
            )}
          </List>
        </Paper>
      )}
    </Container>
  );
};
