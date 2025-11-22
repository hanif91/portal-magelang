import useSWR from "swr";
import { useMemo } from "react";
import UserRepository from "./UserRepository";

export const useUserList = () => {
  // 1. Instansiasi Repository
  const repository = useMemo(() => new UserRepository(), []);

  // 2. Definisikan key SWR (sebagai ID unik cache) dan fetcher function
  const swrKey = "/users/list"; // Key unik terserah kamu, asalkan konsisten

  const fetcher = () => repository.getAll();

  // 3. Panggil SWR
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    swrKey,
    fetcher,
    {
      // Opsi SWR (Best Practice)
      revalidateOnFocus: false, // Jangan refresh kalau cuma pindah tab browser (opsional)
      errorRetryCount: 3, // Coba 3x kalau gagal
    },
  );

  // 4. Return data siap pakai ke Page
  return {
    data, // Array UserItem[]
    error, // Error object jika gagal
    isLoading, // Loading saat pertama kali fetch
    isValidating, // Loading saat refresh background
    refresh: mutate, // Fungsi untuk memaksa refresh data (dipakai setelah create/update/delete)
  };
};
