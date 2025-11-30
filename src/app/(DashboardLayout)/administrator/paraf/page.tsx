"use client";

import { useCallback, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

// Layout
import PageContainer from "@/components/container/PageContainer";
import DashboardCard from "@/components/shared/DashboardCard";

import {
    useTtdParafList,
    useParafMutations,
} from "@/features/portal-settings/PortalSettingsHooks";
import type {
    TtdParafItem,
    ParafPayload,
} from "@/features/portal-settings/PortalSettingsEntity";

// UI MUI
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Typography,
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
// 1. Form Values
// -------------------------------------------------------------
type ParafFormValues = ParafPayload;

// -------------------------------------------------------------
// 2. Default Values
// -------------------------------------------------------------
const defaultValues: ParafFormValues = {
    nama: "",
    jabatan: "",
    nik: "",
};

// -------------------------------------------------------------
// 3. Main Component
// -------------------------------------------------------------
const AdministratorParafPage = () => {
    const { data, error, isLoading, isValidating } = useTtdParafList();
    const { createParaf, updateParaf, deleteParaf } = useParafMutations();

    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<TtdParafItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<TtdParafItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ParafFormValues>({ defaultValues });

    const rows = useMemo(() => data || [], [data]);

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
        (item: TtdParafItem) => {
            setFormMode("edit");
            setEditingItem(item);

            reset({
                nama: item.nama,
                jabatan: item.jabatan,
                nik: item.nik,
            });

            setDialogOpen(true);
        },
        [reset],
    );

    const handleCloseDialog = useCallback(() => {
        if (isSubmitting) return;
        setDialogOpen(false);
    }, [isSubmitting]);

    const handleSubmitForm = async (values: ParafFormValues) => {
        try {
            if (formMode === "edit" && editingItem) {
                await updateParaf(editingItem.id, values);
                toast.success("Data paraf berhasil diperbarui.");
            } else {
                await createParaf(values);
                toast.success("Paraf baru berhasil ditambahkan.");
            }

            setDialogOpen(false);
        } catch (submitError: any) {
            toast.error(
                submitError.response?.data?.message || "Gagal menyimpan data",
            );
        }
    };

    const onError = () => {
        toast.error("Mohon lengkapi data form dengan benar.");
    };

    const handleOpenDelete = useCallback((item: TtdParafItem) => {
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
            await deleteParaf(deleteTarget.id);
            toast.success("Paraf berhasil dihapus.");
            setDeleteTarget(null);
        } catch (deleteError: any) {
            toast.error(
                deleteError.response?.data?.message || "Gagal menghapus data",
            );
        } finally {
            setIsDeleting(false);
        }
    }, [deleteTarget, deleteParaf]);

    // -------------------------------------------------------------
    // DataGrid Columns
    // -------------------------------------------------------------
    const columns = useMemo<GridColDef<TtdParafItem>[]>(
        () => [
            {
                field: "actions",
                type: "actions",
                headerName: "Aksi",
                width: 100,
                getActions: (params) => [
                    <GridActionsCellItem
                        key="edit"
                        icon={<EditIcon />}
                        label="Ubah"
                        onClick={() => handleOpenEdit(params.row)}
                    />,
                    <GridActionsCellItem
                        key="delete"
                        icon={<DeleteIcon />}
                        label="Hapus"
                        onClick={() => handleOpenDelete(params.row)}
                    />,
                ],
            },
            { field: "nama", headerName: "Nama", flex: 1, minWidth: 200 },
            { field: "jabatan", headerName: "Jabatan", flex: 1, minWidth: 200 },
            { field: "nik", headerName: "NIK", width: 150 },
        ],
        [handleOpenEdit, handleOpenDelete],
    );

    // -------------------------------------------------------------
    // Render
    // -------------------------------------------------------------
    return (
        <PageContainer title="Manajemen Paraf">
            <Stack spacing={3}>
                {error && (
                    <Alert severity="error">
                        Gagal memuat data paraf
                    </Alert>
                )}

                <DashboardCard
                    title="Daftar Paraf"
                    action={
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleOpenCreate}
                        >
                            Tambah Paraf
                        </Button>
                    }
                >
                    <DataGridPro
                        autoHeight
                        rows={rows}
                        columns={columns}
                        disableRowSelectionOnClick
                        loading={isLoading || isValidating}
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
                    {formMode === "edit" ? "Ubah Paraf" : "Tambah Paraf"}
                </DialogTitle>

                <Box
                    component="form"
                    onSubmit={handleSubmit(handleSubmitForm, onError)}
                    noValidate
                >
                    <DialogContent dividers>
                        <Stack spacing={2}>
                            {/* NAMA */}
                            <Controller
                                name="nama"
                                control={control}
                                rules={{ required: "Nama wajib diisi" }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Nama Lengkap"
                                        required
                                        fullWidth
                                        error={Boolean(errors.nama)}
                                        helperText={errors.nama?.message}
                                    />
                                )}
                            />

                            {/* JABATAN */}
                            <Controller
                                name="jabatan"
                                control={control}
                                rules={{ required: "Jabatan wajib diisi" }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Jabatan"
                                        required
                                        fullWidth
                                        error={Boolean(errors.jabatan)}
                                        helperText={errors.jabatan?.message}
                                    />
                                )}
                            />

                            {/* NIK */}
                            <Controller
                                name="nik"
                                control={control}
                                rules={{ required: "NIK wajib diisi" }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="NIK"
                                        required
                                        fullWidth
                                        error={Boolean(errors.nik)}
                                        helperText={errors.nik?.message}
                                    />
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
                <DialogTitle>Hapus Paraf</DialogTitle>
                <DialogContent dividers>
                    <Typography>
                        Yakin ingin menghapus paraf <strong>{deleteTarget?.nama}</strong>?
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
        </PageContainer>
    );
};

export default AdministratorParafPage;
