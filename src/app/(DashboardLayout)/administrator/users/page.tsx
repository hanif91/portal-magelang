"use client";

import { useCallback, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

// Layout
import PageContainer from "@/components/container/PageContainer";
import DashboardCard from "@/components/shared/DashboardCard";

// Utilities
import { asErrorMessage } from "@/core/lib/api";

// Hooks & Repository
import { useUserList } from "@/features/user/UserHooks";
import UserRepository from "@/features/user/UserRepository";
import type { UserItem } from "@/features/user/UserEntity";
import { useRolesList } from "@/features/roles/RolesHooks";

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
  Chip,
  Checkbox,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  FormHelperText,
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
  type GridRenderCellParams,
} from "@mui/x-data-grid-pro";

// -------------------------------------------------------------
// 1. Form Values (disesuaikan dengan UserPayload backend)
// -------------------------------------------------------------
type UserFormValues = {
  nama: string;
  username: string;
  jabatan: string;
  rolePortal: string;
  roleId: number;
  noHp: string | null;
  isUserPpob: boolean;
  isUserTimtagih: boolean;
  isActive: boolean;
  password: string;
};

// -------------------------------------------------------------
// 2. Default Values
// -------------------------------------------------------------
const defaultValues: UserFormValues = {
  nama: "",
  username: "",
  jabatan: "",
  rolePortal: "USER",
  roleId: 0,
  noHp: "",
  isUserPpob: false,
  isUserTimtagih: false,
  isActive: true,
  password: "",
};

// -------------------------------------------------------------
// 3. Mapper
// -------------------------------------------------------------
const mapFormValuesToPayload = (values: UserFormValues) => ({
  nama: values.nama.trim(),
  username: values.username.trim(),
  jabatan: values.jabatan.trim(),
  rolePortal: values.rolePortal.trim(),
  roleId: Number(values.roleId),
  noHp: values.noHp ? values.noHp.trim() : null,
  isUserPpob: values.isUserPpob === true,
  isUserTimtagih: values.isUserTimtagih === true,
  isActive: values.isActive === true,
  password: values.password,
});

// -------------------------------------------------------------
// 4. Main Component
// -------------------------------------------------------------
const UserManagementPage = () => {
  const { data, error, isLoading, isValidating, refresh } = useUserList();
  const { data: rolesData } = useRolesList(); // Fetch roles data

  const repository = useMemo(() => new UserRepository(), []);

  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UserItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({ defaultValues });

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
    (item: UserItem) => {
      setFormMode("edit");
      setEditingItem(item);

      reset({
        nama: item.nama,
        username: item.username,
        jabatan: item.jabatan,
        rolePortal: item.rolePortal,
        roleId: item.roleId,
        noHp: item.noHp ?? "",
        isUserPpob: item.isUserPpob,
        isUserTimtagih: item.isUserTimtagih,
        isActive: item.isActive,
        password: item.password,
      });

      setDialogOpen(true);
    },
    [reset],
  );

  const handleCloseDialog = useCallback(() => {
    if (isSubmitting) return;
    setDialogOpen(false);
  }, [isSubmitting]);

  const handleSubmitForm = async (values: UserFormValues) => {
    const payload = mapFormValuesToPayload(values);

    try {
      let result;

      if (formMode === "edit" && editingItem) {
        result = await repository.update(editingItem.id, payload);
        toast.success("Data user berhasil diperbarui.");
      } else {
        result = await repository.create(payload);
        toast.success("User baru berhasil ditambahkan.");
      }

      setDialogOpen(false);
      await refresh();
    } catch (submitError) {
      toast.error(asErrorMessage(submitError));
    }
  };

  const onError = () => {
    toast.error("Mohon lengkapi data form dengan benar.");
  };

  const handleOpenDelete = useCallback((item: UserItem) => {
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
      toast.success("User berhasil dihapus.");
      setDeleteTarget(null);
      await refresh();
    } catch (deleteError) {
      toast.error(asErrorMessage(deleteError));
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, refresh, repository]);

  // -------------------------------------------------------------
  // DataGrid Columns
  // -------------------------------------------------------------
  const columns = useMemo<GridColDef<UserItem>[]>(
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
      { field: "nama", headerName: "Nama", flex: 1, minWidth: 180 },
      { field: "username", headerName: "Username", width: 150 },
      { field: "jabatan", headerName: "Jabatan", width: 150 },
      {
        field: "rolePortal",
        headerName: "Role",
        width: 140,
        renderCell: (params) => {
          let color: any = "default";
          if (params.value === "SUPER ADMIN") color = "error";
          else if (params.value === "ADMIN") color = "warning";
          else if (params.value === "USER") color = "success";

          return (
            <Chip
              label={params.value}
              color={color}
              size="small"
              variant="outlined"
            />
          );
        },
      },
      {
        field: "noHp",
        headerName: "Nomor HP",
        width: 150,
        valueFormatter: (v) => v || "-",
      },
      {
        field: "keterangan",
        headerName: "Keterangan",
        width: 200,
        renderCell: (params) => (
          <Stack direction="row" spacing={1} alignItems="center" height="100%">
            {params.row.isUserPpob && (
              <Chip label="PPOB" color="info" size="small" variant="outlined" />
            )}
            {params.row.isUserTimtagih && (
              <Chip
                label="Tim Tagih"
                color="secondary"
                size="small"
                variant="outlined"
              />
            )}
          </Stack>
        ),
      },
      {
        field: "isActive",
        headerName: "Status",
        width: 130,
        renderCell: (params) => (
          <Chip
            label={params.value ? "Aktif" : "Non-Aktif"}
            color={params.value ? "success" : "default"}
            size="small"
          />
        ),
      },
    ],
    [handleOpenEdit, handleOpenDelete],
  );

  // -------------------------------------------------------------
  // Render
  // -------------------------------------------------------------
  return (
    <PageContainer
      title="Manajemen User - Portal PDAM MRK"
      description="Pengelolaan data user sistem"
    >
      <Stack spacing={3}>
        {loadErrorMessage && <Alert severity="error">{loadErrorMessage}</Alert>}

        <DashboardCard
          title="Daftar Pengguna"
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
            >
              Tambah User
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
          {formMode === "edit" ? "Ubah User" : "Tambah User"}
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

              {/* USERNAME */}
              <Controller
                name="username"
                control={control}
                rules={{ required: "Username wajib diisi" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Username"
                    required
                    fullWidth
                    error={Boolean(errors.username)}
                    helperText={errors.username?.message}
                  />
                )}
              />

              {/* PASSWORD */}
              {formMode == "create" && (
                <Controller
                  name="password"
                  control={control}
                  rules={{ required: "Password wajib diisi" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Password"
                      required
                      fullWidth
                      error={Boolean(errors.password)}
                      helperText={errors.password?.message}
                    />
                  )}
                />
              )}

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

              <Controller
                name="rolePortal"
                control={control}
                rules={{ required: "Role Portal wajib diisi" }}
                render={({ field }) => (
                  <>
                    <TextField
                      {...field}
                      select // <--- INI KUNCINYA (Ubah jadi dropdown)
                      label="Role Portal"
                      variant="outlined" // Pastikan varian sama dengan input lain
                      fullWidth
                      required
                      error={Boolean(errors.rolePortal)} // Error jadi merah otomatis
                      helperText={errors.rolePortal?.message} // Pesan error muncul di bawah otomatis
                    >
                      <MenuItem value="SUPER ADMIN">Super Admin</MenuItem>
                      <MenuItem value="ADMIN">Admin</MenuItem>
                      <MenuItem value="USER">User</MenuItem>
                    </TextField>

                    {errors.rolePortal && (
                      <Typography variant="caption" color="error">
                        {errors.rolePortal.message}
                      </Typography>
                    )}
                  </>
                )}
              />



              <Controller
                name="roleId"
                control={control}
                rules={{ required: "Role ID wajib dipilih" }}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.roleId)}>
                    <InputLabel id="role-select-label">Pilih Role</InputLabel>
                    <Select
                      {...field}
                      labelId="role-select-label"
                      label="Pilih Role"
                      value={field.value || ""} // Penting: Handle nilai awal agar tidak error
                    >
                      {/* Di sini bagian DINAMIS-nya */}
                      {rolesData?.map((role) => (
                        <MenuItem key={role.id} value={role.id}>
                          {role.nama}
                        </MenuItem>
                      ))}
                    </Select>
                    {/* Menampilkan pesan error jika ada */}
                    <FormHelperText>{errors.roleId?.message}</FormHelperText>
                  </FormControl>
                )}
              />

              {/* NO HP */}
              <Controller
                name="noHp"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Nomor HP" fullWidth />
                )}
              />

              {/* BOOLEAN FIELDS */}
              <Box sx={{ display: "flex" }}>
                <Controller
                  name="isUserPpob"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      }
                      label="User PPOB"
                    />
                  )}
                />

                <Controller
                  name="isUserTimtagih"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      }
                      label="User Tim Tagih"
                    />
                  )}
                />

                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      }
                      label="Aktif"
                    />
                  )}
                />
              </Box>
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
        <DialogTitle>Hapus User</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Yakin ingin menghapus user <strong>{deleteTarget?.nama}</strong>?
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

export default UserManagementPage;
