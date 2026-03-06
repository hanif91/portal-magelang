"use client";

import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Button,
    Stack,
    Card,
    CardContent,
    TextField,
    InputAdornment,
    IconButton,
    CircularProgress,
} from "@mui/material";
import { IconEye, IconEyeOff, IconLock } from "@tabler/icons-react";
import Swal from "sweetalert2";
import api from "@/core/lib/api";
import PageContainer from "@/components/container/PageContainer";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";


interface UserData {
    id: number;
    username: string;
    nama: string;
    email?: string;
}

const ProfilePage = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Ambil data user dari localStorage
        const userDataString = localStorage.getItem("user");
        if (userDataString) {
            try {
                const user = JSON.parse(userDataString);
                setUserData(user);
            } catch (error) {
                console.error("Error parsing user data:", error);
            }
        }
    }, []);

    const router = useRouter();

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validasi
        if (!newPassword || !confirmPassword) {
            Swal.fire({
                icon: "warning",
                title: "Peringatan",
                text: "Password baru dan konfirmasi password harus diisi!",
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Password baru dan konfirmasi password tidak sama!",
            });
            return;
        }

        if (newPassword.length < 4) {
            Swal.fire({
                icon: "warning",
                title: "Peringatan",
                text: "Password minimal 4 karakter!",
            });
            return;
        }

        if (!userData?.id) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "User ID tidak ditemukan!",
            });
            return;
        }

        setLoading(true);

        try {
            const response = await api.put(
                `/api/portal/manajemen-user/users/${userData.id}/reset-password`,
                {
                    newPassword,
                    confirmPassword,
                }
            );

            Swal.fire({
                icon: response.data.success ? "success" : "error",
                title: response.data.success ? "Berhasil" : "Gagal",
                text: response.data.message,
            });

            if (response.data.success) {
                // Reset form setelah berhasil
                setNewPassword("");
                setConfirmPassword("");
            }

            Cookies.remove("token");
            router.push("/");
        } catch (error: any) {
            console.error("Error resetting password:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text:
                    error.response?.data?.message ||
                    "Terjadi kesalahan saat mereset password!",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer title="Profile" description="Halaman Profile Pengguna">
            <Typography variant="h5" fontWeight={600} mb={2} justifyContent="center">
                Reset Password
            </Typography>
            <Typography variant="body1" mb={2} justifyContent="center">
                Reset password untuk mengubah password Anda.
            </Typography>
            <Box sx={{ maxWidth: "100%", mx: "auto", mt: 4 }}>
                {/* User Info Card */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h5" fontWeight={600} mb={2}>
                            Informasi Pengguna
                        </Typography>
                        <Stack spacing={1}>
                            <Typography>
                                <strong>Nama:</strong> {userData?.nama || "-"}
                            </Typography>
                            <Typography>
                                <strong>Username:</strong> {userData?.username || "-"}
                            </Typography>
                            {userData?.email && (
                                <Typography>
                                    <strong>Email:</strong> {userData.email}
                                </Typography>
                            )}
                        </Stack>
                    </CardContent>
                </Card>

                {/* Reset Password Card */}
                <Card>
                    <CardContent>
                        <Typography variant="h5" fontWeight={600} mb={3}>
                            <IconLock size={24} style={{ marginRight: 8, verticalAlign: "middle" }} />
                            Reset Password
                        </Typography>

                        <form onSubmit={handleResetPassword}>
                            <Stack spacing={3}>
                                {/* New Password */}
                                <TextField
                                    label="Password Baru"
                                    type={showNewPassword ? "text" : "password"}
                                    fullWidth
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Masukkan password baru"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    edge="end"
                                                >
                                                    {showNewPassword ? (
                                                        <IconEyeOff size={20} />
                                                    ) : (
                                                        <IconEye size={20} />
                                                    )}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                {/* Confirm Password */}
                                <TextField
                                    label="Konfirmasi Password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    fullWidth
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Masukkan ulang password baru"
                                    error={confirmPassword !== "" && newPassword !== confirmPassword}
                                    helperText={
                                        confirmPassword !== "" && newPassword !== confirmPassword
                                            ? "Password tidak sama"
                                            : ""
                                    }
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    edge="end"
                                                >
                                                    {showConfirmPassword ? (
                                                        <IconEyeOff size={20} />
                                                    ) : (
                                                        <IconEye size={20} />
                                                    )}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    disabled={loading || !newPassword || !confirmPassword}
                                    startIcon={
                                        loading ? <CircularProgress size={20} color="inherit" /> : null
                                    }
                                >
                                    {loading ? "Memproses..." : "Reset Password"}
                                </Button>
                            </Stack>
                        </form>
                    </CardContent>
                </Card>
            </Box>
        </PageContainer>
    );
};

export default ProfilePage;
