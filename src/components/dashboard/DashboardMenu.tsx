"use client";
import {
  Card,
  CardContent,
  Stack,
  Typography,
  Box,
  Grid,
  Avatar,
  Skeleton,
  Chip,
  alpha,
} from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import api from "@/core/lib/api";
import LaunchIcon from "@mui/icons-material/Launch";
import { useRedirectToApp } from "../../core/hooks/useRedirectToApp";
// import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
// import TrendingUpIcon from "@mui/icons-material/TrendingUp";
// import AccessTimeIcon from "@mui/icons-material/AccessTime";
// import StarIcon from "@mui/icons-material/Star";

interface Menu {
  id: number;
  nama: string;
  url: string;
  description?: string;
  icon?: string;
  color?: string;
}

export default function DashboardMenus() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const { triggerRedirect, isLoading: isRedirecting } = useRedirectToApp();

  const CACHE_KEY = "app_cache"; // Key unik untuk cache
  const CACHE_EXPIRY = 60 * 60 * 1000; // 1 jam dalam milidetik (sesuaikan jika perlu)

  const fetchMenus = useCallback(async () => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          console.log("Menggunakan data dari cache");
          setMenus(data);
          setLoading(false);
          return;
        }
      }

      const res = await api.get("/api/portal/get-dashboard", {});
      const data = res.data;

      setMenus(data.applications);

      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data: data.applications,
          timestamp: Date.now(),
        }),
      );
    } catch (error) {
      console.error("Error fetching menus:", error);
      setMenus([
        {
          id: 1,
          nama: "Dashboard 1",
          url: "/dashboard-1",
          description: "Dasbor utama untuk analitik dan laporan",
        },
        {
          id: 2,
          nama: "Dashboard 2",
          url: "/dashboard-2",
          description: "Alat monitoring tambahan",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [CACHE_EXPIRY]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const gradients = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
    "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        py: 4,
        px: 3,
      }}
    >
      <Stack spacing={4}>
        {/* HERO SECTION */}
        <Card
          elevation={0}
          sx={{
            position: "relative",
            overflow: "hidden",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            borderRadius: 4,
            minHeight: 240,
          }}
        >
          {/* Decorative circles */}
          <Box
            sx={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: alpha("#ffffff", 0.1),
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: -30,
              right: 100,
              width: 150,
              height: 150,
              borderRadius: "50%",
              background: alpha("#ffffff", 0.08),
            }}
          />

          <CardContent sx={{ position: "relative", zIndex: 1, py: 5, px: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              {/*<RocketLaunchIcon sx={{ fontSize: 40, mr: 2 }} />*/}
              <Typography variant="h2" sx={{ fontWeight: 700 }}>
                Selamat Datang!
              </Typography>
            </Box>
            <Typography
              variant="h6"
              sx={{ maxWidth: 600, opacity: 0.95, fontWeight: 400 }}
            >
              Akses semua aplikasi Anda di satu tempat. Pilih aplikasi di bawah
              untuk memulai.
            </Typography>
          </CardContent>
        </Card>

        {/* APPLICATIONS GRID */}
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 3,
              color: "#1e293b",
              display: "flex",
              alignItems: "center",
            }}
          >
            Pilih Aplikasi
            <Box
              component="span"
              sx={{
                ml: 2,
                px: 2,
                py: 0.5,
                bgcolor: "#667eea",
                color: "white",
                borderRadius: 2,
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              {menus.length}
            </Box>
          </Typography>

          <Grid container spacing={3}>
            {loading
              ? Array.from(new Array(6)).map((_, index) => (
                  <Grid key={index} size={{ xs: 12, md: 4 }}>
                    <Skeleton
                      variant="rectangular"
                      height={280}
                      sx={{ borderRadius: 3 }}
                    />
                  </Grid>
                ))
              : menus.map((menu, index) => (
                  <Grid key={menu.id} size={{ xs: 12, md: 4 }}>
                    <Card
                      onClick={() => triggerRedirect(menu.nama)}
                      elevation={0}
                      sx={{
                        cursor: "pointer",
                        position: "relative",
                        overflow: "hidden",
                        borderRadius: 3,
                        height: "100%",
                        minHeight: 280,
                        background: "#ffffff",
                        border: "1px solid",
                        borderColor: alpha("#000000", 0.08),
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        "&:hover": {
                          transform: "translateY(-8px)",
                          boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
                          borderColor: alpha("#667eea", 0.3),
                          "& .gradient-bar": {
                            height: "8px",
                          },
                          "& .launch-icon": {
                            transform: "translate(4px, -4px)",
                            opacity: 1,
                          },
                        },
                      }}
                    >
                      {/* Gradient Top Bar */}
                      <Box
                        className="gradient-bar"
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: "6px",
                          background: gradients[index % gradients.length],
                          transition: "all 0.3s ease",
                        }}
                      />

                      <CardContent
                        sx={{
                          position: "relative",
                          p: 3,
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        {/* Header with Icon and Status */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            mb: 2,
                          }}
                        >
                          <Avatar
                            sx={{
                              background: gradients[index % gradients.length],
                              width: 56,
                              height: 56,
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            }}
                          >
                            <LaunchIcon sx={{ fontSize: 28 }} />
                          </Avatar>

                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            <LaunchIcon
                              className="launch-icon"
                              sx={{
                                fontSize: 20,
                                color: alpha("#000000", 0.4),
                                transition: "all 0.3s ease",
                                opacity: 0,
                              }}
                            />
                          </Box>
                        </Box>

                        {/* Title */}
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            mb: 1.5,
                            color: "#1e293b",
                            fontSize: "1.25rem",
                          }}
                        >
                          {menu.nama}
                        </Typography>

                        {/* Description */}
                        <Typography
                          variant="body2"
                          sx={{
                            color: alpha("#000000", 0.6),
                            mb: 3,
                            lineHeight: 1.6,
                            flexGrow: 1,
                          }}
                        >
                          {menu.description ||
                            "Akses alat dan fitur untuk mengelola pekerjaan Anda dengan efisien."}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
          </Grid>
        </Box>
      </Stack>
    </Box>
  );
}
