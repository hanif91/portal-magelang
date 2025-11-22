"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/core/lib/api";

interface MenuDetail {
  nama: string;
  url: string;
  icon?: string;
}

interface Menu {
  nama: string;
  url: string;
  icon?: string;
  details: MenuDetail[];
}

const CACHE_KEY = "menus_cache";
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 jam

const useMenuItems = () => {
  const [menuItems, setMenuItems] = useState<Menu[]>([]);

  // === Filter menu valid ===
  const filterValidMenus = useCallback((menus: Menu[]) => {
    return menus.filter(
      (menu) => Array.isArray(menu.details) && menu.details.length > 0,
    );
  }, []);

  // === Fetch menus dengan cache ===
  const fetchMenus = useCallback(async () => {
    try {
      // 1. CEK CACHE
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);

        if (Date.now() - timestamp < CACHE_EXPIRY) {
          console.log("Menggunakan cache menu");
          setMenuItems(filterValidMenus(data));
          return;
        }
      }

      // 2. FETCH API
      const res = await api.get("/api/portal/menu");
      const data = res.data.menus;

      // simpan cache
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        }),
      );

      setMenuItems(filterValidMenus(data));
    } catch (err) {
      console.error("Fetch menu gagal:", err);
    }
  }, [filterValidMenus]);

  // === useEffect yang aman ===
  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  return menuItems;
};

export default useMenuItems;
