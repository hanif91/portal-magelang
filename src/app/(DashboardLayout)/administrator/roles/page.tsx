"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

// Layout
import PageContainer from "@/components/container/PageContainer";
import DashboardCard from "@/components/shared/DashboardCard";

// Utilities
import { asErrorMessage } from "@/core/lib/api";

// Hooks & Entity & Repository
import { useRolesList } from "@/features/roles/RolesHooks";
import RolesRepository from "@/features/roles/RolesRepository";
import type { RoleItem } from "@/features/roles/RolesEntity";

// UI MUI
import {
    Alert,
    Button,
    Stack,
    Chip,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Typography,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    OutlinedInput,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";

// Icons
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

// Data Grid
import {
    DataGridPro,
    GridActionsCellItem,
    type GridColDef,
} from "@mui/x-data-grid-pro";

// -------------------------------------------------------------
// 1. Types & Interfaces
// -------------------------------------------------------------
interface AppItem {
    id: number;
    nama: string;
    icon: string;
    url: string;
}

interface AppCache {
    data: AppItem[];
    timestamp: number;
}

type RoleFormValues = {
    nama: string;
    aplikasi_ids: number[];
};

const defaultValues: RoleFormValues = {
    nama: "",
    aplikasi_ids: [],
};

// -------------------------------------------------------------
// 2. Helper Hook for App Cache
// -------------------------------------------------------------
const useAppsCache = () => {
    const [apps, setApps] = useState<AppItem[]>([]);

    useEffect(() => {
        try {
            const cache = localStorage.getItem("app_cache");
            if (cache) {
                const parsed: AppCache = JSON.parse(cache);
                if (parsed && Array.isArray(parsed.data)) {
                    setApps(parsed.data);
                }
            }
        } catch (error) {
            console.error("Failed to parse app_cache", error);
        }
    }, []);

    const getAppName = useCallback(
        (id: number | null) => {
            if (id === null) return null;
            const app = apps.find((a) => a.id === id);
            return app ? app.nama : `ID: ${id}`;
        },
        [apps]
    );

    return { apps, getAppName };
};

// -------------------------------------------------------------
// 3. Main Component
// -------------------------------------------------------------
const RolesPage = () => {
    const { data, error, isLoading, isValidating, refresh } = useRolesList();
    const repository = useMemo(() => new RolesRepository(), []);
    const { apps, getAppName } = useAppsCache();

    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<RoleItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<RoleItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    // STATE BARU: Menyimpan data aplikasi yang sedang diklik user
    const [selectedAppDetail, setSelectedAppDetail] = useState<{ id: number; name: string } | null>(null);

    // Handler saat Chip Aplikasi diklik
    const handleAppClick = (event: React.MouseEvent, id: number, name: string) => {
        event.stopPropagation(); // PENTING: Agar baris tabel tidak ikut terpilih
        setSelectedAppDetail({ id, name });
    };

    // Handler tutup modal
    const handleCloseAppDetail = () => {
        setSelectedAppDetail(null);
    };

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<RoleFormValues>({ defaultValues });

    const rows = useMemo(() => data || [], [data]);

    const loadErrorMessage = useMemo(() => {
        if (!error) return null;
        return asErrorMessage(error);
    }, [error]);

    // -------------------------------------------------------------
    // Handlers
    // -------------------------------------------------------------
    const handleOpenCreate = useCallback(() => {
        setFormMode("create");
        setEditingItem(null);
        reset(defaultValues);
        setDialogOpen(true);
    }, [reset]);

    const handleOpenEdit = useCallback(
        (item: RoleItem) => {
            setFormMode("edit");
            setEditingItem(item);
            reset({
                nama: item.nama,
                aplikasi_ids: item.aplikasi_ids.filter((id): id is number => id !== null),
            });
            setDialogOpen(true);
        },
        [reset]
    );

    const handleCloseDialog = useCallback(() => {
        if (isSubmitting) return;
        setDialogOpen(false);
    }, [isSubmitting]);

const handleSubmitForm = async (values: RoleFormValues) => {
        // 1. Sanitasi & Type Casting
        // Kita pastikan array tidak null, membuang value yang false/null, 
        // dan memaksa konversi ke Number agar aman.
        const cleanAplikasiIds = (values.aplikasi_ids || [])
            .filter((id) => id !== null && id !== undefined)
            .map((id) => Number(id));

        // 2. Cek Validasi Array Kosong (Opsional - Tergantung Backend)
        // Jika backend mewajibkan minimal 1 aplikasi, Anda harus handle di sini 
        // atau biarkan error validasi muncul dari backend.
        
        const payload = {
            nama: values.nama.trim(),
            aplikasi_ids: cleanAplikasiIds,
        };

        // Debugging: Lihat apa yang benar-benar dikirim di Console
        console.log("Payload yang dikirim:", payload);

        try {
            if (formMode === "edit" && editingItem) {
                await repository.update(editingItem.id, payload);
                toast.success("Role berhasil diperbarui.");
            } else {
                await repository.create(payload);
                toast.success("Role baru berhasil ditambahkan.");
            }
            setDialogOpen(false);
            await refresh();
        } catch (error) {
            // Error 400 biasanya masuk ke sini
            console.error("Error submit:", error); 
            toast.error(asErrorMessage(error));
        }
    };

    const handleOpenDelete = useCallback((item: RoleItem) => {
        setDeleteTarget(item);
    }, []);

    const handleCloseDelete = useCallback(() => {
        if (isDeleting) return;
        setDeleteTarget(null);
    }, [isDeleting]);

    const handleConfirmDelete = useCallback(async () => {
        if (!deleteTarget) return;
        try {
            setIsDeleting(true);
            await repository.delete(deleteTarget.id);
            toast.success("Role berhasil dihapus.");
            setDeleteTarget(null);
            await refresh();
        } catch (error) {
            toast.error(asErrorMessage(error));
        } finally {
            setIsDeleting(false);
        }
    }, [deleteTarget, refresh, repository]);

    // -------------------------------------------------------------
    // DataGrid Columns
    // -------------------------------------------------------------
const columns = useMemo<GridColDef<RoleItem>[]>(
        () => [
            {
                field: "actions",
                type: "actions",
                headerName: "Aksi",
                width: 100,
                headerAlign: "center", // Judul kolom rata tengah
                align: "center",       // Isi ikon rata tengah
                getActions: (params) => [
                    <GridActionsCellItem
                        key="edit"
                        icon={<EditIcon/>}
                        label="Ubah"
                        onClick={() => handleOpenEdit(params.row)}
                    />,
                    <GridActionsCellItem
                        key="delete"
                        icon={<DeleteIcon/>}
                        label="Hapus"
                        onClick={() => handleOpenDelete(params.row)}
                    />,
                ],
            },
            { 
                field: "nama", 
                headerName: "Nama Role", 
                flex: 1, 
                minWidth: 180,
                // Render cell agar teksnya lebih tegas (Semi Bold)
                renderCell: (params) => (
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', display: 'flex', alignItems: 'center', height: '100%' }}>
                        {params.value}
                    </Typography>
                )
            },
            {
                field: "aplikasi_ids",
                headerName: "Akses Aplikasi",
                flex: 2,
                minWidth: 300,
                renderCell: (params) => {
                    const ids = (params.value as (number | null)[] || []).filter((id) => id !== null);

                    if (ids.length === 0) {
                        return <Typography variant="caption" color="text.secondary">Tidak ada akses</Typography>;
                    }

                    return (
                        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", py: 1 }}>
                            {ids.map((id) => {
                                const appName = getAppName(id); // Ambil nama aplikasi
                                return (
                                    <Chip
                                        key={id}
                                        label={appName}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                        // SAAT DIKLIK: Panggil handler & bawa datanya
                                        onClick={(e) => handleAppClick(e, Number(id), String(appName))}
                                        sx={{ 
                                            cursor: 'pointer',
                                            '&:hover': { backgroundColor: '#e3f2fd' } 
                                        }}
                                    />
                                );
                            })}
                        </Box>
                    );
                },
            },
        ],
        [handleOpenEdit, handleOpenDelete, getAppName]
    );

    return (
        <PageContainer
            title="Manajemen Roles - Portal PDAM MRK"
            description="Pengelolaan data roles sistem"
        >
            <Stack spacing={3}>
                {loadErrorMessage && <Alert severity="error">{loadErrorMessage}</Alert>}

                <DashboardCard
                    title="Daftar Roles"
                    action={
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleOpenCreate}
                        >
                            Tambah Role
                        </Button>
                    }
                >
                    <DataGridPro
                        autoHeight
                        rows={rows}
                        columns={columns}
                        disableRowSelectionOnClick
                        loading={isLoading || isValidating}
                        getRowHeight={() => "auto"}
                        sx={{
                            "& .MuiDataGrid-cell": {
                                py: 1,
                            },
                        }}
                    />
                </DashboardCard>
            </Stack>

            {/* FORM DIALOG */}
            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    {formMode === "edit" ? "Ubah Role" : "Tambah Role"}
                </DialogTitle>
                <Box
                    component="form"
                    onSubmit={handleSubmit(handleSubmitForm)}
                    noValidate
                >
                    <DialogContent dividers>
                        <Stack spacing={2}>
                            <Controller
                                name="nama"
                                control={control}
                                rules={{ required: "Nama Role wajib diisi" }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Nama Role"
                                        required
                                        fullWidth
                                        error={Boolean(errors.nama)}
                                        helperText={errors.nama?.message}
                                    />
                                )}
                            />

                            <Controller
                                name="aplikasi_ids"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth>
                                        <InputLabel id="aplikasi-label">Aplikasi</InputLabel>
                                        <Select
                                            {...field}
                                            labelId="aplikasi-label"
                                            multiple
                                            input={<OutlinedInput label="Aplikasi" />}
                                            renderValue={(selected) => (
                                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                                    {selected.map((value) => (
                                                        <Chip
                                                            key={value}
                                                            label={getAppName(value)}
                                                            size="small"
                                                        />
                                                    ))}
                                                </Box>
                                            )}
                                        >
                                            {apps.map((app) => (
                                                <MenuItem key={app.id} value={app.id}>
                                                    {app.nama}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} disabled={isSubmitting}>
                            Batal
                        </Button>
                        <LoadingButton
                            type="submit"
                            variant="contained"
                            loading={isSubmitting}
                        >
                            {formMode === "edit" ? "Simpan Perubahan" : "Simpan"}
                        </LoadingButton>
                    </DialogActions>
                </Box>
            </Dialog>

            {/* DELETE DIALOG */}
            <Dialog
                open={Boolean(deleteTarget)}
                onClose={handleCloseDelete}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Hapus Role</DialogTitle>
                <DialogContent dividers>
                    <Typography>
                        Yakin ingin menghapus role <strong>{deleteTarget?.nama}</strong>?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDelete} disabled={isDeleting}>
                        Batal
                    </Button>
                    <LoadingButton
                        onClick={handleConfirmDelete}
                        color="error"
                        variant="contained"
                        loading={isDeleting}
                    >
                        Hapus
                    </LoadingButton>
                </DialogActions>
            </Dialog>

            {/* --- MODAL DETAIL APLIKASI (DUMMY) --- */}
            <Dialog
                open={Boolean(selectedAppDetail)} // Muncul jika ada aplikasi yang dipilih
                onClose={handleCloseAppDetail}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>
                    Detail: {selectedAppDetail?.name}
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            🚧
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                            Fitur dalam tahap development
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Konfigurasi distrik untuk {selectedAppDetail?.name} belum tersedia.
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAppDetail}>Tutup</Button>
                </DialogActions>
            </Dialog>
        </PageContainer>
    );
};

export default RolesPage;
