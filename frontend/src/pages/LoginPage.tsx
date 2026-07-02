import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '@/components/auth/AnimatedBackground';
import LoginFooter from '@/components/auth/LoginFooter';
import LoginForm from '@/components/auth/LoginForm';
import LoginHeader from '@/components/auth/LoginHeader';
import { useQueryClient } from '@tanstack/react-query';

/** Halaman login admin. */
export default function LoginPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [data, setDataState] = useState({ username: '', password: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const setData = (key: string, value: string) => {
        setDataState((prev) => ({ ...prev, [key]: value }));
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, []);

    // Submit login form via fetch, pengganti post() Inertia
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const body = await response.json().catch(() => null);

            if (!response.ok) {
                setErrors(body?.errors ?? { password: 'Username atau password salah.' });
                return;
            }

            // Isi cache useAuth langsung dari response login (bukan invalidate+refetch)
            // supaya ProtectedRoute tidak membaca cache lama (null/belum login) yang
            // masih sempat stale saat refetch background belum selesai.
            queryClient.setQueryData(['auth', 'me'], body.user);
            navigate('/admin', { replace: true });
        } catch {
            setErrors({ password: 'Tidak bisa terhubung ke server.' });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <>
            <title>Admin Login</title>
            <div className="h-screen overflow-hidden bg-[#0a0a0a] text-white flex items-center justify-center px-4 sm:px-6">
                {/* Animated background gradient */}
                <AnimatedBackground />

                {/* Login Container */}
                <div className="relative z-10 w-full max-w-md">
                    {/* Logo / Title Section */}
                    <LoginHeader />

                    {/* Form Card */}
                    <LoginForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        onSubmit={handleSubmit}
                    />

                    {/* Bottom decoration */}
                    <LoginFooter />
                </div>
            </div>
        </>
    );
}
