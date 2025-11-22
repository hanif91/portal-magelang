// 1. Definisi UserItem sesuai respons JSON backend
export interface UserItem {
  id: number; // Perhatikan di JSON id-nya angka (2, 3, dst)
  username: string;
  nama: string;
  roleId: number;
  jabatan: string;
  rolePortal: string; // "SUPER ADMIN" | "ADMIN" | "USER"
  isUserPpob: boolean;
  isUserTimtagih: boolean;
  isActive: boolean;
  noHp: string | null;
  password: string; // Bisa null sesuai data JSON
}

// 2. Definisi Response wrapper dari backend (untuk GET)
export interface UserListResponse {
  message: string;
  users: UserItem[];
}

// 3. Definisi Payload (Data yang dikirim saat Create/Update)
// Saya asumsikan field ini yang bisa diedit. Sesuaikan jika ada password.
export interface UserPayload {
  nama: string;
  username: string;
  jabatan: string;
  rolePortal: string;
  roleId: number;
  noHp: string | null;
  isUserPpob: boolean;
  isActive: boolean;
  isUserTimtagih: boolean;
  // Tambahkan password di sini jika fitur create butuh password
  password?: string;
}

export function mapFormValuesToPayload(values: any): UserPayload {
  return {
    username: values.username.trim(),
    nama: values.nama.trim(),
    roleId: Number(values.roleId),
    rolePortal: values.rolePortal,
    isUserPpob: Boolean(values.isUserPpob),
    isActive: Boolean(values.isActive),
    isUserTimtagih: Boolean(values.isUserTimtagih),
    jabatan: values.jabatan.trim(),
    noHp: values.noHp.trim(),
  };
}
