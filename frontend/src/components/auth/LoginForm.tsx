import { useState } from 'react';

interface LoginFormProps {
    status?: string;
    data: {
        username: string;
        password: string;
    };
    setData: (key: string, value: string) => void;
    errors: Record<string, string>;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
}

export default function LoginForm({
    status,
    data,
    setData,
    errors,
    processing,
    onSubmit
}: LoginFormProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
            {status && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                    {status}
                </div>
            )}

            <form onSubmit={onSubmit} className="space-y-6">
                {/* Username Field */}
                <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-white/45 mb-3">
                        Username
                    </label>
                    <input
                        type="text"
                        value={data.username}
                        onChange={(e) => setData('username', e.target.value)}
                        placeholder="admin"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/25 focus:bg-white/[0.07] transition-all duration-200"
                        required
                    />
                    {errors.username && (
                        <p className="text-red-400 text-xs mt-2">{errors.username}</p>
                    )}
                </div>

                {/* Password Field */}
                <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-white/45 mb-3">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Enter your password"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/25 focus:bg-white/[0.07] transition-all duration-200 pr-12"
                            required
                        />
                        {/* Toggle password visibility */}
                        <button
                            type="button"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                        >
                            {showPassword ? (
                                // Eye icon
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm7.938 0C21.673 16.053 17.523 19 12 19c-5.523 0-9.673-2.947-10.938-7C2.327 7.947 6.477 5 12 5c5.523 0 9.673 2.947 10.938 7z"/>
                                </svg>
                            ):(
                                // Eye-off icon
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-11-7a11.05 11.05 0 012.38-3.36M6.18 6.18A9.956 9.956 0 0112 5c5 0 9.27 3.11 11 7a10.96 10.96 0 01-4.04 4.58M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 6L3 3"/>
                                </svg>
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-red-400 text-xs mt-2">{errors.password}</p>
                    )}
                </div>

                {/* Login Button */}
                <button
                    type="submit"
                    disabled={processing}
                    className="w-full mt-8 px-6 py-3 bg-gradient-to-r from-[#0572FF] to-[#0356cc] hover:from-[#0356cc] hover:to-[#0245a3] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium text-sm transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20"
                >
                    {processing ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
}
