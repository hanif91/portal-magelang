"use client";

import { useState } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { encryptToken } from "@/app/actions/security";

interface AppData {
  id: number;
  nama: string;
  url: string;
}

interface CacheData {
  data: AppData[];
}

export const useRedirectToApp = () => {
  const [isLoading, setIsLoading] = useState(false); // State loading baru

  const triggerRedirect = async (appName: string) => {
    setIsLoading(true); // Mulai loading

    const userToken = Cookies.get("token");

    if (!userToken) {
      toast.error("Sesi Anda habis.");
      setIsLoading(false);
      return;
    }

    const appCacheString = localStorage.getItem("app_cache");
    if (!appCacheString) {
      toast.error("Konfigurasi aplikasi tidak ditemukan.");
      setIsLoading(false);
      return;
    }

    try {
      const secureToken = await encryptToken(userToken);
      const cache: CacheData = JSON.parse(appCacheString);
      const targetApp = cache.data.find((app) => app.nama === appName);

      if (!targetApp) {
        toast.error(`Aplikasi ${appName} belum terdaftar.`);
        return; // finally akan tetap jalan
      }

      const destination = `${targetApp.url}/authentication/receiver?data=${encodeURIComponent(secureToken)}`;

      // Redirect
      window.location.href = destination;
    } catch (error) {
      console.error("Redirect Error:", error);
      toast.error("Gagal mengamankan koneksi.");
      setIsLoading(false); // Stop loading jika error (jika sukses, biarkan true sampai pindah halaman)
    }
  };

  return { triggerRedirect, isLoading };
};
