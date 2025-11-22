"use client";

import { useMediaQuery, Box, Drawer } from "@mui/material";
import SidebarItems from "./SidebarItems";
import useMenuItems from "./MenuItems";

interface ItemType {
  isMobileSidebarOpen: boolean;
  onSidebarClose: (event: React.MouseEvent<HTMLElement>) => void;
  isSidebarOpen: boolean;
}

const MSidebar = ({
  isMobileSidebarOpen,
  onSidebarClose,
  isSidebarOpen,
}: ItemType) => {
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));
  const sidebarWidth = "270px";

  const menuItems = useMenuItems(); // ambil data menu

  // === JIKA MENU KOSONG → JANGAN TAMPILKAN SIDEBAR SAMA SEKALI ===
  if (!menuItems || menuItems.length === 0) {
    return null;
  }

  const scrollbarStyles = {
    "&::-webkit-scrollbar": { width: "7px" },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "#eff2f7",
      borderRadius: "15px",
    },
  };

  // DESKTOP
  if (lgUp) {
    return (
      <Box sx={{ width: sidebarWidth, flexShrink: 0 }}>
        <Drawer
          anchor="left"
          variant="permanent"
          slotProps={{
            paper: {
              sx: {
                width: sidebarWidth,
                boxSizing: "border-box",
                ...scrollbarStyles,
              },
            },
          }}
        >
          <Box sx={{ height: "100%", overflowY: "auto", ...scrollbarStyles }}>
            <SidebarItems />
          </Box>
        </Drawer>
      </Box>
    );
  }

  // MOBILE
  return (
    <Drawer
      anchor="left"
      open={isMobileSidebarOpen}
      onClose={onSidebarClose}
      variant="temporary"
      slotProps={{
        paper: {
          sx: {
            boxShadow: (theme) => theme.shadows[8],
            ...scrollbarStyles,
          },
        },
      }}
    >
      <Box sx={{ height: "100%", overflowY: "auto", ...scrollbarStyles }}>
        <SidebarItems />
      </Box>
    </Drawer>
  );
};

export default MSidebar;
