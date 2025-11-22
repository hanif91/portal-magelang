"use client";

import React from "react";
import useMenuItems from "./MenuItems";
import { Box, Typography } from "@mui/material";
import { Sidebar as MUI_Sidebar, MenuItem, Submenu } from "react-mui-sidebar";
import { IconPoint } from "@tabler/icons-react";
import * as TablerIcons from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "../shared/logo/Logo";

// =========================================
// UTIL ICON
// =========================================
const getIcon = (name: string) => {
  if (!name || typeof name !== "string") return IconPoint;

  const safe = name.replace(/[^a-zA-Z0-9]/g, "");
  const formatted = "Icon" + safe.charAt(0).toUpperCase() + safe.slice(1);

  return (TablerIcons as any)[formatted] || IconPoint;
};

// =========================================
// RENDER MENU ITEMS
// =========================================
const renderMenuItems = (menus: any[], pathname: string) => {
  return menus.map((item) => {
    const Icon = getIcon(item.icon);
    const hasChildren = Array.isArray(item.details) && item.details.length > 0;

    if (!hasChildren) return null;

    return (
      <Box
        sx={{
          transition: "all 0.3s ease",
          width: "90%", // Membatasi lebar jadi 90% dari sidebar
          mx: "auto", // (Margin X Auto) Otomatis menengahkan elemen kiri-kanan
          mb: 3,
          justifyContent: {
            xs: "center", // Di HP (Extra Small): Logo di Tengah
            lg: "flex-start", // Di Desktop (Large): Logo di Kiri (Awal)
          },
          pr: {
            xs: 0,
            lg: 5,
          },
        }}
        key={item.url} // Pindahkan key ke wrapper terluar agar React tidak bingung
      >
        <Submenu
          title={item.nama}
          icon={<Icon stroke={1.5} size="1.3rem" />}
          borderRadius="7px"
        >
          {item.details.map((child: any) => {
            const ChildIcon = getIcon(child.icon);

            return (
              <Box px={3} key={child.url} mb={1}>
                <MenuItem
                  isSelected={pathname === child.url}
                  borderRadius="8px"
                  icon={<ChildIcon stroke={1.5} size="1.2rem" />}
                  link={child.url}
                  component={Link}
                >
                  {child.nama}
                </MenuItem>
              </Box>
            );
          })}
        </Submenu>
      </Box>
    );
  });
};

// =========================================
// COMPONEN SIDE BAR
// =========================================
const SidebarItems = () => {
  const pathname = usePathname();
  const menuItems = useMenuItems();

  // === BLOCK RENDER JIKA MENU KOSONG ===
  if (!menuItems || menuItems.length === 0) {
    return null; // sidebar hilang total
  }

  return (
    <MUI_Sidebar
      width="300px"
      showProfile={false}
      themeColor="#5D87FF"
      themeSecondaryColor="#49beff"
    >
      {/*<Typography variant="h4" align="center" p={5}>
        pdam-takalar-logo
      </Typography>*/}
      <Box
        sx={{
          display: "flex",
          justifyContent: {
            xs: "center", // Di HP (Extra Small): Logo di Tengah
            lg: "flex-start", // Di Desktop (Large): Logo di Kiri (Awal)
          },
          alignItems: "center",
          pt: 3,
          pl: {
            xs: 0,
            lg: 5,
          },
        }}
      >
        <Logo useLink />
      </Box>

      {renderMenuItems(menuItems, pathname)}

      <Box px={2} />
    </MUI_Sidebar>
  );
};

export default SidebarItems;
