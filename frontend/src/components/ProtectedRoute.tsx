import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/** Bungkus route admin: redirect ke /login kalau belum login. */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <div className="w-10 h-10 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
