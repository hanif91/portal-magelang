import React, { useState } from "react";
import Link from "next/link";
import {
  Avatar,
  Box,
  Menu,
  Button,
  IconButton,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

import { IconListCheck, IconMail, IconUser } from "@tabler/icons-react";
import Cookies from "js-cookie"; // install: npm i js-cookie
import { useRouter } from "next/navigation";

const Profile = () => {
  const router = useRouter();

  const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);

  const handleClick2 = (event: any) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  // =====================================
  // LOGOUT FUNCTION
  // =====================================
  const handleLogout = async () => {
    try {
      // 1) Jika backend menyediakan endpoint logout, panggil di sini:
      /*
      await api.post("/api/auth/logout", {}, { withCredentials: true });
      */

      // 2) Hapus token di cookie frontend (jika Anda menyimpan token manual)
      Cookies.remove("token"); // contoh

      // 3) Hapus di localStorage
      localStorage.removeItem("app_cache");
      localStorage.removeItem("menus_cache");
      localStorage.removeItem("user");

      // 4) Tutup menu
      setAnchorEl2(null);

      // 5) Redirect ke halaman login
      router.push("/auth/login");
    } catch (err) {
      console.log("Logout error:", err);
    }
  };

  return (
    <Box>
      <IconButton
        size="large"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        onClick={handleClick2}
        sx={{
          ...(typeof anchorEl2 === "object" && {
            color: "primary.main",
          }),
        }}
      >
        <Avatar
          src="/images/profile/user-1.jpg"
          alt="image"
          sx={{ width: 35, height: 35 }}
        />
      </IconButton>

      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        sx={{
          "& .MuiMenu-paper": {
            width: "200px",
          },
        }}
      >
        <MenuItem>
          <ListItemIcon>
            <IconUser width={20} />
          </ListItemIcon>
          <ListItemText>My Profile</ListItemText>
        </MenuItem>

        <MenuItem>
          <ListItemIcon>
            <IconMail width={20} />
          </ListItemIcon>
          <ListItemText>My Account</ListItemText>
        </MenuItem>

        <MenuItem>
          <ListItemIcon>
            <IconListCheck width={20} />
          </ListItemIcon>
          <ListItemText>My Tasks</ListItemText>
        </MenuItem>

        <Box mt={1} py={1} px={2}>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Profile;
