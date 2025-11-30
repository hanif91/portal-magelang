import useSWR, { mutate } from "swr";
import { PortalSettingsRepository } from "./PortalSettingsRepository";
import { UpdateTtdLaporanPayload } from "./PortalSettingsEntity";

export const useAplikasiList = () => {
    const { data, error, isLoading } = useSWR(
        "/portal/manajemen-aplikasi",
        PortalSettingsRepository.getAplikasiList,
    );

    return {
        data: data?.data || [],
        isLoading,
        error,
    };
};

export const useTtdLaporan = (aplikasiId?: number) => {
    const key = aplikasiId ? `/portal/settings/ttd-lap?aplikasi_id=${aplikasiId}` : null;

    const { data, error, isLoading, isValidating } = useSWR(
        key,
        () => PortalSettingsRepository.getTtdLaporan(aplikasiId!),
    );

    const updateTtdLaporan = async (id: string, payload: UpdateTtdLaporanPayload) => {
        await PortalSettingsRepository.updateTtdLaporan(id, payload);
        mutate(key);
    };

    return {
        data: data?.data || [],
        isLoading,
        isValidating,
        error,
        updateTtdLaporan,
    };
};

export const useTtdParafList = () => {
    const { data, error, isLoading, isValidating, mutate } = useSWR(
        "/portal/settings/paraf",
        PortalSettingsRepository.getParafList,
    );

    return {
        data: data?.data || [],
        isLoading,
        isValidating,
        error,
        refresh: mutate,
    };
};

export const useParafMutations = () => {
    const { refresh } = useTtdParafList();

    const createParaf = async (payload: {
        nama: string;
        jabatan: string;
        nik: string;
    }) => {
        await PortalSettingsRepository.createParaf(payload);
        refresh();
    };

    const updateParaf = async (
        id: number,
        payload: { nama: string; jabatan: string; nik: string },
    ) => {
        await PortalSettingsRepository.updateParaf(id, payload);
        refresh();
    };

    const deleteParaf = async (id: number) => {
        await PortalSettingsRepository.deleteParaf(id);
        refresh();
    };

    return {
        createParaf,
        updateParaf,
        deleteParaf,
    };
};

export const useDesktopSettings = () => {
    const { data, error, isLoading, isValidating, mutate } = useSWR(
        "/portal/settings/desktop",
        PortalSettingsRepository.getDesktopSettings,
    );

    const updateSettings = async (payload: {
        headerlap1?: string;
        headerlap2?: string;
        alamat1?: string;
        alamat2?: string;
        footerkota?: string;
    }) => {
        await PortalSettingsRepository.updateDesktopSettings(payload);
        mutate();
    };

    return {
        data: data?.data || null,
        isLoading,
        isValidating,
        error,
        updateSettings,
    };
};
