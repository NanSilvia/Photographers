import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { Badge, Button, IconButton } from "@mui/material";
import useUserStore from "../stores/UserStore";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Notifications } from "@mui/icons-material";
import { NotificationsPopup } from "./NotificationsPopup";

export default function HeaderBar() {
  const { logout, fetchStatus } = useUserStore();
  const authenticated = useUserStore((state) => state.authenticated);
  const user = useUserStore((state) => state.user);
  const [notificationsAnchor, setNotificationsAnchor] =
    useState<HTMLElement | null>(null);
  const [hasNotifications, setHasNotifications] = useState(false);

  // Check for notifications periodically
  useEffect(() => {
    const checkNotifications = async () => {
      if (authenticated) {
        try {
          const response = await fetch("/api/notifications", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
            },
          });
          const data = await response.json();
          setHasNotifications(data.length > 0);
        } catch (error) {
          console.error("Error checking notifications:", error);
        }
      }
    };

    // Check immediately and then every 30 seconds
    checkNotifications();
    const interval = setInterval(checkNotifications, 30000);
    return () => clearInterval(interval);
  }, [authenticated]);

  // on authenticated change log to console for debugging
  useEffect(() => {
    console.log("Authenticated changed:", authenticated);
  }, [authenticated]);

  const navigate = useNavigate();
  Promise.resolve(fetchStatus());

  const handleLogin = () => {
    navigate("/login"); // Redirect to login page
  };

  const handleLogout = () => {
    logout().then(() => {
      document.location.href = "/login"; // Redirect to login page after logout
    });
  };

  return (
    <AppBar>
      <Toolbar variant="dense">
        <Button color="inherit" onClick={() => navigate("/photographers")}>
          Home
        </Button>
        <div style={{ marginLeft: "auto" }}>
          {authenticated && user?.role === "admin" && (
            <Button color="inherit" onClick={() => navigate("/admin")}>
              Admin
            </Button>
          )}
          {authenticated && (
            <>
              <Button
                color="inherit"
                onClick={() => navigate("/recommendations")}
              >
                For You
              </Button>
              <Button color="inherit" onClick={() => navigate("/friends")}>
                Friends
              </Button>{" "}
              <Button color="inherit" onClick={() => navigate("/tags")}>
                Tags
              </Button>
              <IconButton
                color="inherit"
                onClick={(e) => setNotificationsAnchor(e.currentTarget)}
                size="large"
              >
                <Badge
                  color="error"
                  variant="dot"
                  invisible={!hasNotifications}
                >
                  <Notifications />
                </Badge>
              </IconButton>
              <NotificationsPopup
                anchorEl={notificationsAnchor}
                onClose={() => setNotificationsAnchor(null)}
              />
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}

          {!authenticated && (
            <Button color="inherit" onClick={handleLogin}>
              Login
            </Button>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
}
