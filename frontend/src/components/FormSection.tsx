import { forwardRef, useState } from 'react';
import ResumeUpload from '@/components/ResumeUpload';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import type { ApplicationForm } from '@/types/internship';

// Props: callback ke parent saat submit sukses atau gagal
interface FormSectionProps {
    onSuccess: () => void;
    onError:   () => void;
}

const initialData: ApplicationForm = {
    first_name: '',
    last_name:  '',
    email:      '',
    phone:      '',
    about:      '',
    resume:     null,
};

// forwardRef agar parent bisa scroll ke section ini via ref
const FormSection = forwardRef<HTMLElement, FormSectionProps>(({ onSuccess, onError }, ref) => {
    const { ref: formRef, animClass: formAnimClass } = useScrollAnimation(150);
    const [fileName, setFileName] = useState('');

    // State form manual + error validasi (pengganti useForm Inertia)
    const [data, setDataState] = useState<ApplicationForm>(initialData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const setData = <K extends keyof ApplicationForm>(key: K, value: ApplicationForm[K]) => {
        setDataState((prev) => ({ ...prev, [key]: value }));
    };

    // Update state resume saat file dipilih dari ResumeUpload
    const handleResumeChange = (file: File) => {
        setData('resume', file);
        setFileName(file.name);
    };

    // Submit form via fetch multipart, pengganti post() Inertia
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const formData = new FormData();
        formData.append('first_name', data.first_name);
        formData.append('last_name', data.last_name);
        formData.append('email', data.email);
        formData.append('phone', data.phone);
        formData.append('about', data.about);
        if (data.resume) {
            formData.append('resume', data.resume);
        }

        try {
            const response = await fetch('/apply', {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            if (!response.ok) {
                const body = await response.json().catch(() => null);
                setErrors(body?.errors ?? {});
                onError();
                return;
            }

            setDataState(initialData);
            setFileName('');
            // Trigger event ke admin dashboard via localStorage
            localStorage.setItem('internship_app_submitted', Date.now().toString());
            onSuccess();
        } catch {
            onError();
        } finally {
            setProcessing(false);
        }
    };

    return (
        <section
            ref={ref}
            className="relative min-h-screen flex items-center justify-center py-24 px-4 sm:px-6"
        >
            {/* Garis konektor tipis dari section hero */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-white/15 to-transparent" />

            {/* Wrapper form dengan animasi fade+slide-up */}
            { }
            <div
                ref={formRef}

                className={`w-full max-w-2xl ${formAnimClass}`}
            >
                {/* Header section form */}
                <div className="text-center mb-10">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-3">Internship Application</h2>
                    <p className="text-white/45 text-sm">Fill out the form below to apply for an internship position.</p>
                </div>

                {/* Card form dengan background semi-transparan */}
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
                    <form onSubmit={handleSubmit}>

                        {/* Baris First Name + Last Name */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-[10px] uppercase tracking-[0.2em] text-white/45 mb-2">
                                    First Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.first_name}
                                    onChange={(e) => setData('first_name', e.target.value)}
                                    placeholder="John"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/25 focus:bg-white/[0.07] transition-all duration-200"
                                />
                                {errors.first_name && <p className="text-red-400 text-xs mt-1.5">{errors.first_name}</p>}
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase tracking-[0.2em] text-white/45 mb-2">
                                    Last Name <span className="text-white/30 text-[9px] normal-case tracking-normal">(Optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.last_name}
                                    onChange={(e) => setData('last_name', e.target.value)}
                                    placeholder="Doe"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/25 focus:bg-white/[0.07] transition-all duration-200"
                                />
                                {errors.last_name && <p className="text-red-400 text-xs mt-1.5">{errors.last_name}</p>}
                            </div>
                        </div>

                        {/* Field Email */}
                        <div className="mb-4">
                            <label className="block text-[10px] uppercase tracking-[0.2em] text-white/45 mb-2">
                                Email Address <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="john@example.com"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/25 focus:bg-white/[0.07] transition-all duration-200"
                            />
                            {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>}
                        </div>

                        {/* Field Phone dengan prefix Indonesia */}
                        <div className="mb-4">
                            <label className="block text-[10px] uppercase tracking-[0.2em] text-white/45 mb-2">
                                Phone Number <span className="text-red-400">*</span>
                            </label>
                            <div className="flex gap-2">
                                {/* Badge kode negara Indonesia */}
                                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-3 text-sm text-white/60 whitespace-nowrap select-none">
                                    🇮🇩 <span className="text-white/40">+62</span>
                                </div>
                                <input
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="812-3456-7890"
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/25 focus:bg-white/[0.07] transition-all duration-200"
                                />
                            </div>
                            <p className="text-white/25 text-xs mt-1.5">Indonesian phone number format</p>
                            {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                        </div>

                        {/* Textarea About Yourself */}
                        <div className="mb-4">
                            <label className="block text-[10px] uppercase tracking-[0.2em] text-white/45 mb-2">
                                About Yourself <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                value={data.about}
                                onChange={(e) => setData('about', e.target.value)}
                                placeholder="Tell us about yourself, your skills, and why you want to join AISSENTIAL..."
                                rows={4}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/25 focus:bg-white/[0.07] transition-all duration-200 resize-none"
                            />
                            {errors.about && <p className="text-red-400 text-xs mt-1.5">{errors.about}</p>}
                        </div>

                        {/* Upload resume — didelegasikan ke component ResumeUpload */}
                        <div className="mb-8">
                            <label className="block text-[10px] uppercase tracking-[0.2em] text-white/45 mb-2">
                                Resume <span className="text-red-400">*</span>
                            </label>
                            <ResumeUpload
                                fileName={fileName}
                                error={errors.resume}
                                onChange={handleResumeChange}
                            />
                        </div>

                        {/* Tombol submit dengan loading state */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="group w-full py-4 bg-[#0572FF] text-white font-semibold rounded-xl hover:bg-[#0572FF]/90 active:scale-[0.98] transition-all duration-200 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-sm tracking-wide shadow-[0_0_40px_rgba(255,255,255,0.08)]"
                        >
                            {processing ? (
                                // Spinner saat request sedang berjalan
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Submitting...
                                </>
                            ) : (
                                'Submit Application →'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
});

// Nama untuk React DevTools
FormSection.displayName = 'FormSection';

export default FormSection;
