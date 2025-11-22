import React, { useEffect } from "react";
import { useState } from "react";
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Button,
  Stack,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import api from "@/core/lib/api";

import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import toast from "react-hot-toast";
import { set } from "react-hook-form";

interface loginType {
  title?: string;
  subtitle?: React.ReactNode;
  subtext?: React.ReactNode;
}

const AuthLogin = ({ title, subtitle, subtext }: loginType) => {
  const router = useRouter();

  // state untuk input user
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // function login utama
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", {
        username,
        password,
      });

      // ambil token dari backend
      const token = res.data.token;
      const user = res.data.user;

      // simpan token ke Cookie
      Cookies.set("token", token, {
        expires: 7,
        secure: true,
        sameSite: "strict",
        path: "/",
      });

      localStorage.setItem("user", JSON.stringify(user));

      Swal.fire({
        title: "Login Berhasil!",
        icon: "success",
        text: "Username dan Password Sesuai!",
        timer: 1000,
        showConfirmButton: false,
      });
      router.refresh();
      router.push("/");
    } catch (error: any) {
      console.log(error);
      toast.error(
        error.response?.data?.message || "Login Gagal! Cek username/password.",
      );
      setLoading(false);
    }
  };

  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h2" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}

      <form onSubmit={handleLogin}>
        <Stack>
          {/* Username */}
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="username"
              mb="5px"
            >
              Username
            </Typography>
            <CustomTextField
              variant="outlined"
              fullWidth
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setUsername(e.target.value)
              }
            />
          </Box>

          {/* Password */}
          <Box mt="25px">
            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="password"
              mb="5px"
            >
              Password
            </Typography>
            <CustomTextField
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
            />
          </Box>

          {/* Remember Me + Forgot */}
          <Stack
            justifyContent="space-between"
            direction="row"
            alignItems="center"
            my={2}
          >
            <FormGroup>
              <FormControlLabel
                control={<Checkbox defaultChecked />}
                label="Ingat Perangkat ini"
              />
            </FormGroup>

            <Typography
              component={Link}
              href="/"
              fontWeight="500"
              sx={{
                textDecoration: "none",
                color: "primary.main",
              }}
            >
              Lupa Password?
            </Typography>
          </Stack>
        </Stack>

        {/* BUTTON LOGIN */}
        <Box>
          <Button
            color="primary"
            variant="contained"
            size="large"
            type="submit"
            disabled={loading} // Disable tombol saat loading agar tidak di-spam klik
            startIcon={
              loading ? <CircularProgress size={20} color="inherit" /> : null
            }
            fullWidth
          >
            {loading ? "Memproses..." : "Masuk"}
          </Button>
        </Box>
      </form>

      {subtitle}
    </>
  );
};

export default AuthLogin;
