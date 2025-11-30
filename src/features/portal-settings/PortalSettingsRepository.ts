import api from "@/core/lib/api";
import {
    AplikasiListResponse,
    TtdLaporanListResponse,
    TtdParafListResponse,
    UpdateTtdLaporanPayload,
    DesktopSettingsResponse,
    DesktopSettingsPayload,
} from "./PortalSettingsEntity";

const MANAJEMEN_APLIKASI_URL = "/api/portal/manajemen-aplikasi";
const TTD_LAPORAN_URL = "/api/portal/settings/ttd-lap";
const PARAF_URL = "/api/portal/settings/paraf";

export const PortalSettingsRepository = {
    getAplikasiList: async () => {
        const response = await api.get<AplikasiListResponse>(
            MANAJEMEN_APLIKASI_URL,
        );
        return response.data;
    },

    getTtdLaporan: async (aplikasiId: number) => {
        const response = await api.get<TtdLaporanListResponse>(
            TTD_LAPORAN_URL,
            {
                params: { aplikasi_id: aplikasiId },
            },
        );
        return response.data;
    },

    updateTtdLaporan: async (id: string, payload: UpdateTtdLaporanPayload) => {
        // Map payload to API expected format
        const apiPayload = {
            id1: payload.id1,
            id2: payload.id2,
            id3: payload.id3,
            id4: payload.id4,
            header1: payload.header1,
            header2: payload.header2,
            header3: payload.header3,
            header4: payload.header4,
            is_id_1: payload.isId1,
            is_id_2: payload.isId2,
            is_id_3: payload.isId3,
            is_id_4: payload.isId4,
        };

        const response = await api.put(
            `${TTD_LAPORAN_URL}/${id}`,
            apiPayload,
        );
        return response.data;
    },

    getParafList: async () => {
        const response = await api.get<TtdParafListResponse>(PARAF_URL);
        return response.data;
    },

    createParaf: async (payload: { nama: string; jabatan: string; nik: string }) => {
        const response = await api.post(PARAF_URL, payload);
        return response.data;
    },

    updateParaf: async (
        id: number,
        payload: { nama: string; jabatan: string; nik: string },
    ) => {
        const response = await api.put(`${PARAF_URL}/${id}`, payload);
        return response.data;
    },

    deleteParaf: async (id: number) => {
        const response = await api.delete(`${PARAF_URL}/${id}`);
        return response.data;
    },

    getDesktopSettings: async () => {
        const response = await api.get<DesktopSettingsResponse>(
            "/api/portal/settings/desktop",
        );
        return response.data;
    },

    updateDesktopSettings: async (payload: DesktopSettingsPayload) => {
        const response = await api.put(
            "/api/portal/settings/desktop",
            payload,
        );
        return response.data;
    },
};
