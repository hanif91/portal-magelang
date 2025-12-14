"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import api from "@/core/lib/api";

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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Checkbox,
    CircularProgress,
    IconButton
} from "@mui/material";
import { LoadingButton } from "@mui/lab";

// Icons
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";

// Data Grid
import {
    DataGridPro,
    GridActionsCellItem,
    type GridColDef,
} from "@mui/x-data-grid-pro";

// -------------------------------------------------------------
// 1. Types & Interfaces
// -------------------------------------------------------------

// Tipe data untuk Permission (Sesuai JSON yang kamu berikan)
type PermissionType = "create" | "read" | "update" | "delete";

interface MenuPermission {
    id: number;
    menu_name: string;
    link: string;
    icon: string;
    hak_akses_id: number | null;
    permission: PermissionType[]; // ["create", "read", ...]
}

interface GroupPermission {
    id: number;
    group_name: string;
    group_link: string;
    menus: MenuPermission[];
}

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
// 3. Sub-Component: Permission Config Modal (Logic Baru Disini)
// -------------------------------------------------------------
interface PermissionModalProps {
    open: boolean;
    onClose: () => void;
    roleId: number | null;
    appId: number | null;
    roleName: string;
    appName: string;
}

const PermissionConfigModal = ({
    open,
    onClose,
    roleId,
    appId,
    roleName,
    appName,
}: PermissionModalProps) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<GroupPermission[]>([]);
    const [updatingState, setUpdatingState] = useState<number | null>(null); // Track menuId being updated

    // Fetch Data saat Modal Dibuka
    useEffect(() => {
        if (open && roleId && appId) {
            fetchPermissions();
        } else {
            setData([]); // Reset saat tutup
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, roleId, appId]);

    const fetchPermissions = async () => {
        setLoading(true);
        try {
            const response = await api.get("/api/portal/manajemen-role/hak-akses", {
                params: { role_id: roleId, app_id: appId },
            });
            setData(response.data.data || []);
        } catch (error) {
            console.error("Error fetching permissions:", error);
            toast.error("Gagal mengambil data hak akses.");
        } finally {
            setLoading(false);
        }
    };

    const updatePermission = async (
        menuId: number,
        newPermissions: PermissionType[],
        groupId: number,
    ) => {
        if (updatingState === menuId) return;
        setUpdatingState(menuId);

        const oldData = [...data];

        // Optimistic Update
        setData((prevData) =>
            prevData.map((group) => {
                if (group.id !== groupId) return group;
                return {
                    ...group,
                    menus: group.menus.map((menu) => {
                        if (menu.id !== menuId) return menu;
                        return { ...menu, permission: newPermissions };
                    }),
                };
            }),
        );

        try {
            await api.put("/api/portal/manajemen-role/hak-akses", {
                role_id: roleId,
                menu_detail_id: menuId,
                permission: newPermissions,
            });
        } catch (error) {
            console.error("Update failed", error);
            toast.error("Gagal menyimpan perubahan hak akses.");
            setData(oldData); // Rollback
        } finally {
            setUpdatingState(null);
        }
    };

    const handleAccessChange = (
        groupId: number,
        menuId: number,
        isChecked: boolean,
    ) => {
        // If unchecked, clear permissions. If checked, maybe default to read? Or just empty but enabled.
        // User request: "kalau aksesnya kosong, maka checkbox nya itu false dan selectnya jadi disable"
        // "tapi kalau dia true dia bisa select"
        // "nah kalau posisinya dia punya 3 akses ya terus tiba tiba aksesnya di uncentang, nah otomatis ngeupdate ke endpoint dengan permissionnya kosong"

        // User request: "ketiika aksesnya diaktifkan otomatis aja permission terisi create"
        const newPermissions: PermissionType[] = isChecked ? ["create", "read", "update", "delete"] : [];

        updatePermission(menuId, newPermissions, groupId);
    };

    const handleMultiSelectChange = (
        groupId: number,
        menuId: number,
        event: any,
    ) => {
        const {
            target: { value },
        } = event;
        const newPermissions = typeof value === "string" ? value.split(",") : value;
        updatePermission(menuId, newPermissions, groupId);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Box>
                    <Typography variant="h6">Konfigurasi Hak Akses</Typography>
                    <Typography variant="caption" color="text.secondary">
                        Role: <strong>{roleName}</strong> | Aplikasi:{" "}
                        <strong>{appName}</strong>
                    </Typography>
                </Box>
                <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 0 }}>
                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer component={Paper} elevation={0}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell
                                        sx={{ fontWeight: "bold", bgcolor: "background.default" }}
                                    >
                                        Nama Menu
                                    </TableCell>
                                    <TableCell
                                        align="center"
                                        width="10%"
                                        sx={{ fontWeight: "bold", bgcolor: "background.default" }}
                                    >
                                        Akses
                                    </TableCell>
                                    <TableCell
                                        align="left"
                                        width="40%"
                                        sx={{ fontWeight: "bold", bgcolor: "background.default" }}
                                    >
                                        Permissions
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.map((group) => (
                                    <>
                                        {/* Group Header */}
                                        <TableRow
                                            key={`group-${group.id}`}
                                            sx={{ bgcolor: "#f5f5f5" }}
                                        >
                                            <TableCell
                                                colSpan={3}
                                                sx={{ fontWeight: "bold", color: "primary.main" }}
                                            >
                                                📂 {group.group_name}
                                            </TableCell>
                                        </TableRow>

                                        {/* Menus Loop */}
                                        {group.menus.map((menu) => {
                                            const hasAccess = menu.permission.length > 0;
                                            const isProcessing = updatingState === menu.id;

                                            return (
                                                <TableRow key={`menu-${menu.id}`} hover>
                                                    <TableCell sx={{ pl: 4 }}>{menu.menu_name}</TableCell>

                                                    {/* Akses Checkbox */}
                                                    <TableCell align="center">
                                                        {isProcessing ? (
                                                            <CircularProgress size={20} />
                                                        ) : (
                                                            <Checkbox
                                                                checked={hasAccess}
                                                                onChange={(e) =>
                                                                    handleAccessChange(
                                                                        group.id,
                                                                        menu.id,
                                                                        e.target.checked,
                                                                    )
                                                                }
                                                                color="primary"
                                                                size="small"
                                                            />
                                                        )}
                                                    </TableCell>

                                                    {/* Permissions Multi-Select */}
                                                    <TableCell>
                                                        <FormControl
                                                            fullWidth
                                                            size="small"
                                                            disabled={!hasAccess || isProcessing}
                                                        >
                                                            <Select
                                                                multiple
                                                                value={menu.permission}
                                                                onChange={(e) =>
                                                                    handleMultiSelectChange(group.id, menu.id, e)
                                                                }
                                                                input={<OutlinedInput />}
                                                                renderValue={(selected) => (
                                                                    <Box
                                                                        sx={{
                                                                            display: "flex",
                                                                            flexWrap: "wrap",
                                                                            gap: 0.5,
                                                                        }}
                                                                    >
                                                                        {selected.map((value) => (
                                                                            <Chip
                                                                                key={value}
                                                                                label={value}
                                                                                size="small"
                                                                            />
                                                                        ))}
                                                                    </Box>
                                                                )}
                                                            >
                                                                {["create", "read", "update", "delete"].map(
                                                                    (perm) => (
                                                                        <MenuItem key={perm} value={perm}>
                                                                            {perm}
                                                                        </MenuItem>
                                                                    ),
                                                                )}
                                                            </Select>
                                                        </FormControl>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </>
                                ))}
                                {data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                                            Tidak ada data menu tersedia.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>
        </Dialog>
    );
};

// -------------------------------------------------------------
// 4. Main Component (RolesPage)
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

    // STATE UPDATED: Menyimpan Role ID juga
    const [selectedAppDetail, setSelectedAppDetail] = useState<{
        roleId: number;
        roleName: string;
        appId: number;
        appName: string
    } | null>(null);

    // Handler saat Chip Aplikasi diklik
    const handleAppClick = (event: React.MouseEvent, role: RoleItem, appId: number, appName: string) => {
        event.stopPropagation();
        setSelectedAppDetail({
            roleId: role.id,
            roleName: role.nama,
            appId: appId,
            appName: appName
        });
    };

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

    // ... (Handlers CRUD Role tetap sama: handleOpenCreate, Edit, Delete, SubmitForm) ...
    // Saya persingkat bagian ini karena tidak berubah logicnya, hanya paste ulang dari kodemu
    const handleOpenCreate = useCallback(() => {
        setFormMode("create");
        setEditingItem(null);
        reset(defaultValues);
        setDialogOpen(true);
    }, [reset]);

    const handleOpenEdit = useCallback((item: RoleItem) => {
        setFormMode("edit");
        setEditingItem(item);
        reset({
            nama: item.nama,
            aplikasi_ids: item.aplikasi_ids.filter((id): id is number => id !== null),
        });
        setDialogOpen(true);
    }, [reset]);

    const handleCloseDialog = useCallback(() => {
        if (isSubmitting) return;
        setDialogOpen(false);
    }, [isSubmitting]);

    const handleSubmitForm = async (values: RoleFormValues) => {
        const cleanAplikasiIds = (values.aplikasi_ids || [])
            .filter((id) => id !== null && id !== undefined)
            .map((id) => Number(id));

        const payload = {
            nama: values.nama.trim(),
            aplikasi_ids: cleanAplikasiIds,
        };

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
    // DataGrid Columns (Updated RenderCell)
    // -------------------------------------------------------------
    const columns = useMemo<GridColDef<RoleItem>[]>(
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
            {
                field: "nama",
                headerName: "Nama Role",
                flex: 1,
                minWidth: 180,
                renderCell: (params) => (
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{params.value}</Typography>
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
                                const appName = getAppName(id);
                                return (
                                    <Chip
                                        key={id}
                                        label={appName}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                        // UPDATED: Kirim params.row (seluruh data role) ke handler
                                        onClick={(e) => handleAppClick(e, params.row, Number(id), String(appName))}
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
        <PageContainer title="Manajemen Roles" description="Pengelolaan data roles sistem">
            <Stack spacing={3}>
                {loadErrorMessage && <Alert severity="error">{loadErrorMessage}</Alert>}

                <DashboardCard
                    title="Daftar Roles"
                    action={
                        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
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
                        sx={{ "& .MuiDataGrid-cell": { py: 1 } }}
                    />
                </DashboardCard>
            </Stack>

            {/* FORM DIALOG (Sama seperti sebelumnya) */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle>{formMode === "edit" ? "Ubah Role" : "Tambah Role"}</DialogTitle>
                <Box component="form" onSubmit={handleSubmit(handleSubmitForm)} noValidate>
                    <DialogContent dividers>
                        <Stack spacing={2}>
                            <Controller
                                name="nama"
                                control={control}
                                rules={{ required: "Nama Role wajib diisi" }}
                                render={({ field }) => (
                                    <TextField {...field} label="Nama Role" required fullWidth error={!!errors.nama} helperText={errors.nama?.message} />
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
                                                        <Chip key={value} label={getAppName(value)} size="small" />
                                                    ))}
                                                </Box>
                                            )}
                                        >
                                            {apps.map((app) => (
                                                <MenuItem key={app.id} value={app.id}>{app.nama}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} disabled={isSubmitting}>Batal</Button>
                        <LoadingButton type="submit" variant="contained" loading={isSubmitting}>Simpan</LoadingButton>
                    </DialogActions>
                </Box>
            </Dialog>

            {/* DELETE DIALOG (Sama seperti sebelumnya) */}
            <Dialog open={Boolean(deleteTarget)} onClose={handleCloseDelete} maxWidth="xs" fullWidth>
                <DialogTitle>Hapus Role</DialogTitle>
                <DialogContent dividers>
                    <Typography>Yakin ingin menghapus role <strong>{deleteTarget?.nama}</strong>?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDelete} disabled={isDeleting}>Batal</Button>
                    <LoadingButton onClick={handleConfirmDelete} color="error" variant="contained" loading={isDeleting}>Hapus</LoadingButton>
                </DialogActions>
            </Dialog>

            {/* --- NEW MODAL PERMISSIONS --- */}
            {/* Modal ini menggantikan Modal Dummy yang lama */}
            <PermissionConfigModal
                open={Boolean(selectedAppDetail)}
                onClose={handleCloseAppDetail}
                roleId={selectedAppDetail?.roleId ?? null}
                appId={selectedAppDetail?.appId ?? null}
                roleName={selectedAppDetail?.roleName ?? ""}
                appName={selectedAppDetail?.appName ?? ""}
            />
        </PageContainer>
    );
};

export default RolesPage;