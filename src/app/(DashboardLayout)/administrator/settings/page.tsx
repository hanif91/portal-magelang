"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

// Layout
import PageContainer from "@/components/container/PageContainer";
import DashboardCard from "@/components/shared/DashboardCard";

// Hooks
import { useDesktopSettings } from "@/features/portal-settings/PortalSettingsHooks";
import type { DesktopSettingsPayload } from "@/features/portal-settings/PortalSettingsEntity";

// UI MUI
import {
    Alert,
    Box,
    CircularProgress,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import Grid from "@mui/material/Grid";

// -------------------------------------------------------------
// 1. Form Values
// -------------------------------------------------------------
type SettingsFormValues = DesktopSettingsPayload;

// -------------------------------------------------------------
// 2. Default Values
// -------------------------------------------------------------
const defaultValues: SettingsFormValues = {
    headerlap1: "",
    headerlap2: "",
    alamat1: "",
    alamat2: "",
    footerkota: "",
};

// -------------------------------------------------------------
// 3. Main Component
// -------------------------------------------------------------
const AdministratorSettingsPage = () => {
    const { data, error, isLoading, updateSettings } = useDesktopSettings();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<SettingsFormValues>({ defaultValues });

    // Load data into form when available
    useEffect(() => {
        if (data) {
            reset({
                headerlap1: data.headerlap1 || "",
                headerlap2: data.headerlap2 || "",
                alamat1: data.alamat1 || "",
                alamat2: data.alamat2 || "",
                footerkota: data.footerkota || "",
            });
        }
    }, [data, reset]);

    const handleSubmitForm = async (values: SettingsFormValues) => {
        try {
            await updateSettings(values);
            toast.success("Pengaturan berhasil diperbarui.");
            reset(values); // Reset dirty state with new values
        } catch (submitError: any) {
            toast.error(
                submitError.response?.data?.message || "Gagal menyimpan pengaturan",
            );
        }
    };

    const onError = () => {
        toast.error("Mohon lengkapi data form dengan benar.");
    };

    if (isLoading) {
        return (
            <PageContainer title="Pengaturan Aplikasi">
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer title="Pengaturan Aplikasi">
                <Alert severity="error">Gagal memuat pengaturan aplikasi.</Alert>
            </PageContainer>
        );
    }

    return (
        <PageContainer title="Pengaturan Aplikasi">
            <Stack spacing={3}>
                <DashboardCard title="Konfigurasi Desktop">
                    <Box
                        component="form"
                        onSubmit={handleSubmit(handleSubmitForm, onError)}
                        noValidate
                    >
                        <Stack spacing={3}>
                            <Typography variant="subtitle1" fontWeight={600}>
                                Header Laporan
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Controller
                                        name="headerlap1"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Header Baris 1"
                                                fullWidth
                                                error={Boolean(errors.headerlap1)}
                                                helperText={errors.headerlap1?.message}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Controller
                                        name="headerlap2"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Header Baris 2"
                                                fullWidth
                                                error={Boolean(errors.headerlap2)}
                                                helperText={errors.headerlap2?.message}
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>

                            <Typography variant="subtitle1" fontWeight={600}>
                                Alamat Kantor
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Controller
                                        name="alamat1"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Alamat Baris 1"
                                                fullWidth
                                                error={Boolean(errors.alamat1)}
                                                helperText={errors.alamat1?.message}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Controller
                                        name="alamat2"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Alamat Baris 2"
                                                fullWidth
                                                error={Boolean(errors.alamat2)}
                                                helperText={errors.alamat2?.message}
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>

                            <Typography variant="subtitle1" fontWeight={600}>
                                Footer Laporan
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Controller
                                        name="footerkota"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Kota (Footer)"
                                                fullWidth
                                                error={Boolean(errors.footerkota)}
                                                helperText={errors.footerkota?.message}
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>

                            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                                <LoadingButton
                                    type="submit"
                                    variant="contained"
                                    loading={isSubmitting}
                                    disabled={!isDirty && !isSubmitting}
                                >
                                    Simpan Perubahan
                                </LoadingButton>
                            </Box>
                        </Stack>
                    </Box>
                </DashboardCard>
            </Stack>
        </PageContainer>
    );
};

export default AdministratorSettingsPage;
