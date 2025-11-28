"use client";

import React, { useState } from "react";
import useMenuItems from "./MenuItems";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { IconPoint } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "../shared/logo/Logo";
import { IconMapping } from "./IconMapping";

// =========================================
// UTIL ICON
// =========================================
const getIcon = (name: string) => {
  if (!name || typeof name !== "string") return IconPoint;

  const safe = name.replace(/[^a-zA-Z0-9]/g, "");
  const formatted = "Icon" + safe.charAt(0).toUpperCase() + safe.slice(1);

  return IconMapping[formatted] || IconPoint;
};

// =========================================
// COMPONEN SIDE BAR
// =========================================
const SidebarItems = () => {
  const pathname = usePathname();
  const menuItems = useMenuItems();
  const theme = useTheme();

  // State untuk mengontrol accordion yang terbuka
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  // === BLOCK RENDER JIKA MENU KOSONG ===
  if (!menuItems || menuItems.length === 0) {
    return null; // sidebar hilang total
  }

  return (
    <Box sx={{ px: 3, py: 3, pl: 4 }}>
      {/* LOGO */}
      <Box
        sx={{
          display: "flex",
          justifyContent: { xs: "center", lg: "flex-start" },
          alignItems: "center",
          mb: 3,
        }}
      >
        <Logo useLink />
      </Box>

      {/* MENU ITEMS */}
      <Box>
        {menuItems.map((item) => {
          const Icon = getIcon(item.icon || "");
          const hasChildren =
            Array.isArray(item.details) && item.details.length > 0;

          if (!hasChildren) return null;

          // Cek apakah salah satu child aktif untuk auto-expand (opsional, bisa ditambahkan logic nanti)
          const isChildActive = item.details.some(
            (child) => child.url === pathname
          );

          return (
            <Accordion
              key={item.url}
              expanded={expanded === item.url || isChildActive} // Auto expand jika child aktif atau diklik
              onChange={handleChange(item.url)}
              disableGutters
              elevation={0}
              sx={{
                mb: 1,
                borderRadius: "8px",
                "&:before": { display: "none" }, // Hilangkan garis border default Accordion
                backgroundColor: "transparent",
                "&.Mui-expanded": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${item.nama}-content`}
                id={`${item.nama}-header`}
                sx={{
                  borderRadius: "8px",
                  "& .MuiAccordionSummary-content": {
                    alignItems: "center",
                  },
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Icon stroke={1.5} size="1.3rem" />
                  <Typography variant="body1" fontWeight={600}>
                    {item.nama}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0, mt: 1 }}>
                <List component="div" disablePadding>
                  {item.details.map((child: any) => {
                    const ChildIcon = getIcon(child.icon);
                    const isSelected = pathname === child.url;

                    return (
                      <ListItemButton
                        key={child.url}
                        component={Link}
                        href={child.url}
                        selected={isSelected}
                        sx={{
                          pl: 4,
                          py: 1.5,
                          borderRadius: "8px",
                          mb: 0.5,
                          "&.Mui-selected": {
                            backgroundColor: theme.palette.primary.main,
                            color: "white",
                            "&:hover": {
                              backgroundColor: theme.palette.primary.dark,
                            },
                            "& .MuiListItemIcon-root": {
                              color: "white",
                            },
                          },
                          "&:hover": {
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.1
                            ),
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: "30px",
                            color: isSelected ? "white" : "inherit",
                          }}
                        >
                          <ChildIcon stroke={1.5} size="1.1rem" />
                        </ListItemIcon>
                        <ListItemText
                          primary={child.nama}
                          primaryTypographyProps={{
                            fontSize: "0.875rem",
                            fontWeight: isSelected ? 600 : 400,
                          }}
                        />
                      </ListItemButton>
                    );
                  })}
                </List>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    </Box>
  );
};

export default SidebarItems;
