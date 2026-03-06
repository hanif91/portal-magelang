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

import { IconKey } from "@tabler/icons-react";
import Cookies from "js-cookie"; // install: npm i js-cookie
import { useRouter } from "next/navigation";
import api from "@/core/lib/api";

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
      await api.post("/api/auth/logout");
      
    } catch (err) {
      console.warn("Logout backend gagal, melanjutkan logout lokal:", err);
    } finally {
      // 2) BERSIH-BERSIH LOKAL (Pasti dieksekusi, sukses atau gagal)
      
      // Hapus token
      Cookies.remove("token"); 
      
      // Hapus semua cache localStorage
      localStorage.clear(); 

      // Tutup menu
      setAnchorEl2(null);

      // 3) Redirect
      router.push("/auth/login");
      
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
            <IconKey width={20} />
          </ListItemIcon>
          <ListItemText onClick={() => router.push("/profile")}>Reset PWD</ListItemText>
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
