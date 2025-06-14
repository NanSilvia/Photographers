import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { Button } from "@mui/material";
import useUserStore from "../stores/UserStore";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Notifications } from "@mui/icons-material";

export default function HeaderBar() {
  const { logout, fetchStatus } = useUserStore();
  const authenticated = useUserStore((state) => state.authenticated);
  const user = useUserStore((state) => state.user);

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
        <div style={{ marginLeft: "auto" }}>
          {authenticated && user?.role === "admin" && (
            <Button color="inherit" onClick={() => navigate("/admin")}>
              Admin
            </Button>
          )}
          {authenticated && (
            <>
              <Button color="inherit" onClick={() => navigate("/friends")}>
                Friends
              </Button>
              <Button color="inherit" onClick={() => navigate("/tags")}>
                Tags
              </Button>
              {/* <Button color="inherit" onClick={() => navigate("/notifications")}>
                <Notifications />
              </Button> */}
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
