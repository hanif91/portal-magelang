export interface AplikasiItem {
    id: number;
    nama: string;
    url: string;
    deskripsi?: string;
    icon?: string;
    status?: number;
}

export interface AplikasiListResponse {
    success: boolean;
    data: AplikasiItem[];
}

export interface TtdLaporanItem {
    id: number;
    kode: string;
    namalap: string;
    id1: number;
    id2: number;
    id3: number;
    id4: number;
    header1: string;
    header2: string;
    header3: string;
    header4: string;
    isId1: boolean;
    isId2: boolean;
    isId3: boolean;
    isId4: boolean;
    nama1: string;
    jabatan1: string;
    nik1: string;
    nama2: string;
    jabatan2: string;
    nik2: string;
    nama3: string;
    jabatan3: string;
    nik3: string;
    nama4: string;
    jabatan4: string;
    nik4: string;
}

// Response from API might use snake_case for some fields based on the user request example
// "is_id_1": 1 -> mapped to boolean in frontend usually, but let's match the API response first then map it
export interface TtdLaporanApiResponseItem {
    id: number;
    kode: string;
    namalap: string;
    id1: number;
    id2: number;
    id3: number;
    id4: number;
    header1: string;
    header2: string;
    header3: string;
    header4: string;
    is_id_1: number | boolean;
    is_id_2: number | boolean;
    is_id_3: number | boolean;
    is_id_4: number | boolean;
    nama1: string;
    jabatan1: string;
    nik1: string;
    nama2: string;
    jabatan2: string;
    nik2: string;
    nama3: string;
    jabatan3: string;
    nik3: string;
    nama4: string;
    jabatan4: string;
    nik4: string;
}

export interface TtdLaporanListResponse {
    success: boolean;
    data: TtdLaporanApiResponseItem[];
}

export interface UpdateTtdLaporanPayload {
    id1: number | null;
    id2: number | null;
    id3: number | null;
    id4: number | null;
    header1: string;
    header2: string;
    header3: string;
    header4: string;
    isId1: boolean;
    isId2: boolean;
    isId3: boolean;
    isId4: boolean;
    // Additional fields for UI state management, might not be sent to API
    nama1?: string;
    jabatan1?: string;
    nik1?: string;
    nama2?: string;
    jabatan2?: string;
    nik2?: string;
    nama3?: string;
    jabatan3?: string;
    nik3?: string;
    nama4?: string;
    jabatan4?: string;
    nik4?: string;
}

export interface TtdParafItem {
    id: number;
    nama: string;
    jabatan: string;
    nik: string;
}

export interface TtdParafListResponse {
    success: boolean;
    data: TtdParafItem[];
}

export interface ParafPayload {
    nama: string;
    jabatan: string;
    nik: string;
}

export interface DesktopSettingsItem {
    headerlap1: string;
    headerlap2: string;
    alamat1: string;
    alamat2: string;
    footerkota: string;
    latitude?: string;
    longitude?: string;
    no_telp?: string;
    no_whatsapp?: string;
    email?: string;
    link_maps?: string;
    link_ig?: string;
    link_bacameter?: string;
}

export interface DesktopSettingsResponse {
    success: boolean;
    data: DesktopSettingsItem;
}

export interface DesktopSettingsPayload {
    headerlap1?: string;
    headerlap2?: string;
    alamat1?: string;
    alamat2?: string;
    footerkota?: string;
}
