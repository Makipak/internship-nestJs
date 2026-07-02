// Modal popup yang muncul setelah form submit (sukses atau gagal)
interface PopupModalProps {
    type: 'success' | 'error';
    onClose: () => void;
}

export default function PopupModal({ type, onClose }: PopupModalProps) {
    const isSuccess = type === 'success';

    return (
        // Overlay fullscreen dengan backdrop blur
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            {/* Backdrop gelap — klik di luar untuk menutup */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Card modal */}
            <div className="relative bg-[#111111] border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">

                {/* Lingkaran ikon status */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 ${
                    isSuccess
                        ? 'bg-emerald-500/10 border border-emerald-500/30'
                        : 'bg-red-500/10 border border-red-500/30'
                }`}>
                    {isSuccess ? (
                        // Ikon centang untuk sukses
                        <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        // Ikon X untuk error
                        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )}
                </div>

                {/* Judul popup */}
                <h3 className="text-xl font-bold text-white mb-2">
                    {isSuccess ? 'Application Submitted!' : 'Submission Failed'}
                </h3>

                {/* Pesan deskripsi */}
                <p className="text-white/50 text-sm mb-6 leading-relaxed">
                    {isSuccess
                        ? "Thank you for applying. We'll review your application and get back to you soon."
                        : 'Something went wrong. Please check the form and try again.'}
                </p>

                {/* Tombol aksi */}
                <button
                    onClick={onClose}
                    className="w-full py-3 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-all duration-200 text-sm tracking-wide"
                >
                    {isSuccess ? 'Done' : 'Try Again'}
                </button>
            </div>
        </div>
    );
}