import { useRef, useState } from 'react';
import FormSection from '@/components/FormSection';
import HeroSection from '@/components/HeroSection';
import PopupModal from '@/components/PopupModal';

/** Halaman utama: form pendaftaran internship publik. */
export default function HomePage() {
    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState<'success' | 'error'>('success');

    // Ref untuk smooth scroll ke section form
    const formSectionRef = useRef<HTMLElement>(null);

    // Scroll halus ke section form
    const scrollToForm = () => {
        const el = formSectionRef.current;
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top, behavior: 'smooth' });
    };

    // Tampilkan popup sukses setelah submit berhasil
    const handleSuccess = () => {
        setPopupType('success');
        setShowPopup(true);
    };

    // Tampilkan popup error saat submit gagal
    const handleError = () => {
        setPopupType('error');
        setShowPopup(true);
    };

    return (
        <>
            <title>Aissential Internship</title>

            {/* Layout utama — dark theme */}
            <div className="min-h-screen bg-[#0a0a0a] text-white font-sans scroll-smooth">

                {/* Section 1: Welcome / Hero */}
                <HeroSection onScrollToForm={scrollToForm} />

                {/* Section 2: Form pendaftaran internship */}
                <FormSection
                    ref={formSectionRef}
                    onSuccess={handleSuccess}
                    onError={handleError}
                />

                {/* Footer */}
                <footer className="border-t border-white/[0.07] py-8 text-center">
                    <p className="text-white/25 text-sm tracking-wide">
                        © 2026 aissential · Transforming Ideas into Impact
                    </p>
                </footer>
            </div>

            {/* Popup modal — dirender di luar layout utama */}
            {showPopup && (
                <PopupModal
                    type={popupType}
                    onClose={() => setShowPopup(false)}
                />
            )}
        </>
    );
}
