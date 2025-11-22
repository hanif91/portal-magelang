import api from "@/core/lib/api"; // Sesuaikan path import axios instance kamu
import type { UserItem, UserListResponse, UserPayload } from "./UserEntity";

export default class UserRepository {
  // Ganti dengan endpoint API backend kamu yang sebenarnya
  private readonly baseUrl = "/api/portal/manajemen-user/users";

  /**
   * Mengambil semua data user
   * return: Promise<UserItem[]> -> Langsung mengembalikan array users
   */
  async getAll(): Promise<UserItem[]> {
    // Menggunakan generic <UserListResponse> agar kita tahu bentuk responsenya
    const { data } = await api.get<UserListResponse>(this.baseUrl);

    // PENTING: Karena JSON backendmu membungkus array di dalam property "users",
    // kita harus return data.users, bukan data mentahnya.
    return data.users;
  }

  /**
   * Membuat user baru
   */
  async create(payload: UserPayload): Promise<void> {
    await api.post(this.baseUrl, payload);
  }

  /**
   * Mengupdate data user berdasarkan ID
   */
  async update(id: number, payload: UserPayload): Promise<void> {
    await api.put(`${this.baseUrl}/${id}`, payload);
  }

  /**
   * Menghapus user berdasarkan ID
   */
  async delete(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }
}
