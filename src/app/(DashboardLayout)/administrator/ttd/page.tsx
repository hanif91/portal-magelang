"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
    Box,
    Stack,
    Typography,
    TextField,
    Autocomplete,
    Checkbox,
    FormControlLabel,
    Alert,
    CircularProgress,
    MenuItem,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { LoadingButton } from "@mui/lab";
import toast from "react-hot-toast";

import PageContainer from "@/components/container/PageContainer";
import DashboardCard from "@/components/shared/DashboardCard";

import {
    useAplikasiList,
    useTtdLaporan,
    useTtdParafList,
} from "@/features/portal-settings/PortalSettingsHooks";
import {
    TtdLaporanApiResponseItem,
    TtdParafItem,
    UpdateTtdLaporanPayload,
} from "@/features/portal-settings/PortalSettingsEntity";

// --- Configuration Constants ---

const signerConfigs = [
    {
        index: 1,
        header: "header1" as const,
        name: "nama1" as const,
        position: "jabatan1" as const,
        nik: "nik1" as const,
        visible: "isId1" as const,
        identifier: "id1" as const,
    },
    {
        index: 2,
        header: "header2" as const,
        name: "nama2" as const,
        position: "jabatan2" as const,
        nik: "nik2" as const,
        visible: "isId2" as const,
        identifier: "id2" as const,
    },
    {
        index: 3,
        header: "header3" as const,
        name: "nama3" as const,
        position: "jabatan3" as const,
        nik: "nik3" as const,
        visible: "isId3" as const,
        identifier: "id3" as const,
    },
    {
        index: 4,
        header: "header4" as const,
        name: "nama4" as const,
        position: "jabatan4" as const,
        nik: "nik4" as const,
        visible: "isId4" as const,
        identifier: "id4" as const,
    },
] as const;

type TtdLaporanFormValues = UpdateTtdLaporanPayload;

// --- Helper Functions ---

const mapToFormValues = (
    item: TtdLaporanApiResponseItem,
): TtdLaporanFormValues => ({
    header1: item.header1,
    header2: item.header2,
    header3: item.header3,
    header4: item.header4,
    nama1: item.nama1,
    jabatan1: item.jabatan1,
    nik1: item.nik1,
    nama2: item.nama2,
    jabatan2: item.jabatan2,
    nik2: item.nik2,
    nama3: item.nama3,
    jabatan3: item.jabatan3,
    nik3: item.nik3,
    nama4: item.nama4,
    jabatan4: item.jabatan4,
    nik4: item.nik4,
    // Map 1/0 or true/false to boolean
    isId1: Boolean(item.is_id_1),
    isId2: Boolean(item.is_id_2),
    isId3: Boolean(item.is_id_3),
    isId4: Boolean(item.is_id_4),
    id1: item.id1,
    id2: item.id2,
    id3: item.id3,
    id4: item.id4,
});

// --- Components ---

type TtdLaporanCardProps = {
    kode: string;
    namalap: string;
    parafOptions: TtdParafItem[];
    isParafLoading: boolean;
    onSubmit: (payload: TtdLaporanFormValues) => Promise<void>;
    defaultValues: TtdLaporanFormValues;
};

const TtdLaporanCard = ({
    kode,
    namalap,
    parafOptions,
    isParafLoading,
    onSubmit,
    defaultValues,
}: TtdLaporanCardProps) => {
    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { isDirty, isSubmitting },
    } = useForm<TtdLaporanFormValues>({
        defaultValues,
    });

    const parafMap = useMemo(() => {
        return parafOptions.reduce<Record<number, TtdParafItem>>((acc, item) => {
            acc[item.id] = item;
            return acc;
        }, {});
    }, [parafOptions]);

    const handleReset = useCallback(
        (values: TtdLaporanFormValues) => {
            reset(values, { keepDirty: false });
        },
        [reset],
    );

    const handleValid = useCallback(
        async (values: TtdLaporanFormValues) => {
            try {
                await onSubmit(values);
                toast.success("TTD laporan berhasil diperbarui");
                handleReset(values);
            } catch (error: any) {
                toast.error(
                    error.response?.data?.message || "Gagal mengambil data",
                );
            }
        },
        [handleReset, onSubmit],
    );

    const handleFormSubmit = useMemo(
        () => handleSubmit(handleValid),
        [handleSubmit, handleValid],
    );

    useEffect(() => {
        handleReset(defaultValues);
    }, [defaultValues, handleReset]);

    return (
        <DashboardCard title={`${kode} - ${namalap}`}>
            <Box component="form" onSubmit={handleFormSubmit} noValidate>
                <Stack spacing={3}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {signerConfigs.map((config) => (
                            <Stack
                                key={config.index}
                                spacing={2}
                                sx={{
                                    border: "1px solid",
                                    borderColor: "divider",
                                    borderRadius: 2,
                                    p: 2,
                                }}
                            >
                                <Typography variant="subtitle1" fontWeight={600}>
                                    Penandatangan {config.index}
                                </Typography>
                                <Controller
                                    name={config.header}
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Header"
                                            fullWidth
                                            value={field.value ?? ""}
                                        />
                                    )}
                                />
                                <Controller
                                    name={config.identifier}
                                    control={control}
                                    render={({ field }) => {
                                        const value = field.value;
                                        const parsedValue =
                                            typeof value === "number"
                                                ? value
                                                : value != null
                                                    ? Number(value)
                                                    : null;
                                        const normalizedValue =
                                            parsedValue != null && Number.isFinite(parsedValue)
                                                ? parsedValue
                                                : null;
                                        const selectedParaf =
                                            normalizedValue != null
                                                ? parafMap[normalizedValue]
                                                : undefined;

                                        return (
                                            <Autocomplete<TtdParafItem, false, false, false>
                                                value={selectedParaf ?? null}
                                                onChange={(_, option) => {
                                                    const selected = option ?? null;
                                                    field.onChange(selected ? selected.id : null);
                                                    setValue(config.name, selected?.nama ?? "", {
                                                        shouldDirty: true,
                                                    });
                                                    setValue(config.position, selected?.jabatan ?? "", {
                                                        shouldDirty: true,
                                                    });
                                                    setValue(config.nik, selected?.nik ?? "", {
                                                        shouldDirty: true,
                                                    });
                                                }}
                                                onBlur={field.onBlur}
                                                options={parafOptions}
                                                loading={isParafLoading}
                                                disabled={isParafLoading && parafOptions.length === 0}
                                                loadingText="Memuat daftar paraf..."
                                                getOptionLabel={(option) =>
                                                    option.jabatan
                                                        ? `${option.nama} - ${option.jabatan}`
                                                        : option.nama
                                                }
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Pilih Paraf"
                                                        fullWidth
                                                        inputRef={field.ref}
                                                    />
                                                )}
                                                noOptionsText="Paraf tidak ditemukan"
                                            />
                                        );
                                    }}
                                />
                                <Controller
                                    name={config.name}
                                    control={control}
                                    render={({ field }) => (
                                        <input type="hidden" {...field} value={field.value ?? ""} />
                                    )}
                                />
                                <Controller
                                    name={config.position}
                                    control={control}
                                    render={({ field }) => (
                                        <input type="hidden" {...field} value={field.value ?? ""} />
                                    )}
                                />
                                <Controller
                                    name={config.nik}
                                    control={control}
                                    render={({ field }) => (
                                        <input type="hidden" {...field} value={field.value ?? ""} />
                                    )}
                                />
                                <Controller
                                    name={config.visible}
                                    control={control}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    {...field}
                                                    checked={Boolean(field.value)}
                                                    onChange={(event) =>
                                                        field.onChange(event.target.checked)
                                                    }
                                                />
                                            }
                                            label="Tampilkan"
                                        />
                                    )}
                                />
                            </Stack>
                        ))}
                    </div>
                    <LoadingButton
                        type="submit"
                        variant="contained"
                        loading={isSubmitting}
                        disabled={!isDirty && !isSubmitting}
                    >
                        Simpan Perubahan
                    </LoadingButton>
                </Stack>
            </Box>
        </DashboardCard>
    );
};

// --- Main Page Component ---

const AdministratorTtdLaporanPage = () => {
    const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const {
        data: appList,
        error: appError,
        isLoading: isAppLoading,
    } = useAplikasiList();

    const {
        data: ttdData,
        error: ttdError,
        isLoading: isTtdLoading,
        isValidating: isTtdValidating,
        updateTtdLaporan,
    } = useTtdLaporan(selectedAppId ?? undefined);

    const {
        data: parafList,
        error: parafError,
        isLoading: isParafLoading,
        isValidating: isParafValidating,
    } = useTtdParafList();

    const handleUpdate = useCallback(
        async (id: string, payload: TtdLaporanFormValues) => {
            await updateTtdLaporan(id, payload);
        },
        [updateTtdLaporan],
    );

    const loading =
        isTtdLoading || isTtdValidating || isParafLoading || isParafValidating;

    const filteredData = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();

        if (!term) {
            return ttdData;
        }

        return ttdData.filter((item: any) => {
            const kodeMatch = item.kode.toLowerCase().includes(term);
            const namaMatch = item.namalap.toLowerCase().includes(term);
            return kodeMatch || namaMatch;
        });
    }, [ttdData, searchTerm]);

    return (
        <PageContainer title="TTD Laporan">
            <Stack spacing={3}>
                <Typography variant="h4" fontWeight={600}>
                    Manajemen TTD Laporan
                </Typography>

                {/* Application Selection */}
                <DashboardCard title="Pilih Aplikasi">
                    {appError ? (
                        <Alert severity="error">
                            Gagal memuat daftar aplikasi
                        </Alert>
                    ) : (
                        <TextField
                            select
                            label="Aplikasi"
                            fullWidth
                            value={selectedAppId ?? ""}
                            onChange={(e) => setSelectedAppId(Number(e.target.value))}
                            disabled={isAppLoading}
                            helperText="Pilih aplikasi untuk melihat konfigurasi TTD laporan"
                        >
                            {appList.map((app: any) => (
                                <MenuItem key={app.id} value={app.id}>
                                    {app.nama}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                </DashboardCard>

                {/* TTD Configuration Section */}
                {selectedAppId && (
                    <>
                        <TextField
                            label="Cari TTD Laporan"
                            placeholder="Cari berdasarkan kode atau nama laporan"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                        />

                        {ttdError ? (
                            <Alert severity="error">Gagal memuat daftar TTD laporan</Alert>
                        ) : null}

                        {parafError ? (
                            <Alert severity="error">Gagal memuat daftar TTD paraf</Alert>
                        ) : null}

                        {loading ? (
                            <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <Grid container spacing={3}>
                                {filteredData.length === 0 ? (
                                    <Grid size={{ xs: 12 }}>
                                        <Alert severity="info">
                                            {ttdData.length === 0
                                                ? "Belum ada data TTD laporan untuk aplikasi ini."
                                                : "Tidak ada TTD laporan yang sesuai dengan pencarian."}
                                        </Alert>
                                    </Grid>
                                ) : (
                                    filteredData.map((item: any) => {
                                        const defaultValues = mapToFormValues(item);
                                        return (
                                            <Grid size={{ xs: 12, lg: 6 }} key={item.id}>
                                                <TtdLaporanCard
                                                    kode={item.kode}
                                                    namalap={item.namalap}
                                                    parafOptions={parafList}
                                                    isParafLoading={isParafLoading || isParafValidating}
                                                    defaultValues={defaultValues}
                                                    onSubmit={(values) => handleUpdate(String(item.id), values)}
                                                />
                                            </Grid>
                                        );
                                    })
                                )}
                            </Grid>
                        )}
                    </>
                )}
            </Stack>
        </PageContainer>
    );
};

export default AdministratorTtdLaporanPage;
