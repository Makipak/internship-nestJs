import { useQuery } from '@tanstack/react-query';

export interface AuthUser {
    id: number;
    name: string;
    username: string;
    email: string;
}

async function fetchCurrentUser(): Promise<AuthUser | null> {
    const response = await fetch('/auth/me', { credentials: 'include' });
    if (response.status === 401) {
        return null;
    }
    if (!response.ok) {
        throw new Error('Gagal memeriksa status login');
    }
    const body = (await response.json()) as { user: AuthUser };
    return body.user;
}

/** Cek status login via GET /auth/me. Dipakai untuk protected route /admin. */
export function useAuth() {
    const { data, isLoading } = useQuery({
        queryKey: ['auth', 'me'],
        queryFn: fetchCurrentUser,
        retry: false,
        staleTime: 60_000,
    });

    return {
        user: data ?? null,
        isAuthenticated: Boolean(data),
        isLoading,
    };
}
