// Flash messages dari Laravel controller via Inertia shared props
export interface PageProps {
    flash: {
        success?: string;
        error?: string;
    };
    [key: string]: unknown;
}

// Struktur field form sesuai validasi backend
export interface ApplicationForm {
    first_name: string;
    last_name:  string;
    email:      string;
    phone:      string;
    about:      string;
    resume:     File | null;
}

// Struktur data aplikasi dari database
export interface InternshipApplication {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    about: string;
    resume_path: string;
    resume_text?: string;
    created_at: string;
    updated_at: string;
}

// Response paginated dari API
export interface PaginatedResponse {
    data: InternshipApplication[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}