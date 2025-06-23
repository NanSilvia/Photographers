import React, { useEffect, useState } from "react";
import {
  Popover,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Box,
  Button,
  Badge,
  CircularProgress,
} from "@mui/material";
import { Check, Clear } from "@mui/icons-material";
import { authedFetch } from "../helpers/authedFetch";

interface Notification {
  id: number;
  photographer: {
    id: number;
    name: string;
  };
  user: {
    id: number;
    username: string;
  };
}

interface NotificationsPopupProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

export const NotificationsPopup: React.FC<NotificationsPopupProps> = ({
  anchorEl,
  onClose,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await authedFetch("/api/notifications");
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (anchorEl) {
      fetchNotifications();
    }
  }, [anchorEl]);

  const handleAccept = async (notificationId: number) => {
    try {
      await authedFetch(`/api/notifications/accept/${notificationId}`, {
        method: "POST",
      });
      // Remove the notification from the list
      setNotifications(notifications.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error("Error accepting recommendation:", error);
    }
  };

  const handleDelete = async (notificationId: number) => {
    try {
      await authedFetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      });
      // Remove the notification from the list
      setNotifications(notifications.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      <Box sx={{ width: 300, maxHeight: 400, overflow: "auto" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length > 0 ? (
          <List>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                secondaryAction={
                  <Box>
                    <IconButton
                      edge="end"
                      color="primary"
                      onClick={() => handleAccept(notification.id)}
                      title="Accept"
                      size="small"
                    >
                      <Check />
                    </IconButton>
                    <IconButton
                      edge="end"
                      color="error"
                      onClick={() => handleDelete(notification.id)}
                      title="Delete"
                      size="small"
                    >
                      <Clear />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={`Photographer recommendation: ${notification.photographer.name}`}
                  secondary={`Recommended by ${notification.user.username}`}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box p={2}>
            <Typography variant="body2" color="text.secondary" align="center">
              No notifications
            </Typography>
          </Box>
        )}
      </Box>
    </Popover>
  );
};
