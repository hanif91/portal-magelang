import axios from "axios";
import Cookie from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL, // https://backend-mrk.vercel.app
  headers: {
    "Content-Type": "application/json",
  },
});

export function asErrorMessage(e: any): string {
  console.log(e);
  return e?.response?.data?.message ?? e?.message ?? "Unknown error";
}

api.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? Cookie.get("token") : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,

  (error) => {
    // Jika token expired atau unauthorized
    if (
      error.response &&
      error.response?.status === 401 &&
      !error.config.url.includes("/login")
    ) {
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/auth/login")
      ) {
        Cookie.remove("token");
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
