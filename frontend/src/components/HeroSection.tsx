import logo from '@/components/assets/LogoType/Aissential Logotype Assets_Logotype 2.svg';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import AnimatedBackground from './AnimatedBackground';

// Props: callback untuk scroll ke section form saat tombol CTA diklik
interface HeroSectionProps {
    onScrollToForm: () => void;
}

export default function HeroSection({ onScrollToForm }: HeroSectionProps) {
    // Animasi fade saja tanpa translate untuk hero
    const { ref: heroRef, isVisible } = useScrollAnimation(0);

    return (
        <section className="relative min-h-[100dvh] h-[100dvh] flex items-center justify-center overflow-hidden py-12 sm:py-0">

            {/* background */}
            <AnimatedBackground />

            {/* Konten hero dengan animasi scroll */}
            { }
            <div
                ref={heroRef}
                className={`relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto w-full my-auto pb-16 sm:pb-20 tablet:pb-28 md:pb-24 lg:pb-20 transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            >

                {/* Label brand */}
                <div className='mb-3 xs:mb-4 sm:mb-6 tablet:mb-10 md:mb-8 lg:mb-12 flex justify-center'>
                    <img
                        src={logo}
                        alt='aissentialLogo'
                        className='h-4 xs:h-5 sm:h-5 tablet:h-7 md:h-6 w-auto opacity-90'
                    />
                </div>

                {/* Heading utama */}
                <h1 className="text-[2rem] xs:text-[2.5rem] sm:text-5xl tablet:text-6xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.15] xs:leading-[1.12] sm:leading-[1.1] tablet:leading-[1.08] md:leading-[1.05] mb-3 xs:mb-4 sm:mb-6 tablet:mb-10 md:mb-8 lg:mb-12">
                    Join Our Team
                    <br />
                    <span className="text-white/40">as an Intern</span>
                </h1>

                {/* Subtitle deskripsi */}
                <p className="text-xs xs:text-sm sm:text-base tablet:text-lg md:text-lg text-white/55 max-w-[280px] xs:max-w-[320px] sm:max-w-lg tablet:max-w-2xl mx-auto leading-relaxed mb-2 xs:mb-3 sm:mb-2 tablet:mb-3 px-2">
                    Shape the future of AI with us. We're looking for curious minds ready to build, learn, and make a real impact.
                </p>

                {/* Badge status pendaftaran */}
                <div className='mb-4 xs:mb-5 sm:mb-8 tablet:mb-10 md:mb-10 flex justify-center'>
                    <div className="inline-flex items-center gap-1.5 xs:gap-2 px-2.5 xs:px-3 sm:px-4 tablet:px-5 py-1 xs:py-1.5 tablet:py-2 rounded-full border border-white/15 bg-white/5 text-[9px] xs:text-[10px] sm:text-xs tablet:text-sm tracking-[0.12em] xs:tracking-[0.15em] sm:tracking-[0.2em] uppercase text-white/60 mb-2 xs:mb-3">
                    <span className="w-1.5 h-1.5 tablet:w-2 tablet:h-2 rounded-full bg-[#0572FF] animate-pulse" />
                    Now Accepting Applications
                    </div>
                </div>

                {/* Tombol CTA — trigger smooth scroll ke form */}
                <button
                    onClick={onScrollToForm}
                    className="group inline-flex items-center gap-2 xs:gap-2.5 sm:gap-3 tablet:gap-3.5 px-5 xs:px-6 sm:px-8 tablet:px-10 py-2.5 xs:py-3 sm:py-4 tablet:py-5 bg-[#0572FF] text-white font-semibold rounded-full hover:bg-[#0572FF]/90 active:scale-95 transition-all duration-300 hover:scale-105 text-xs xs:text-sm tablet:text-base tracking-wide shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                >
                    Apply Now
                    <svg
                        className="w-3.5 xs:w-4 h-3.5 xs:h-4 tablet:w-5 tablet:h-5 transition-transform duration-300 group-hover:translate-x-1"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </button>
            </div>

            {/* Indikator scroll dengan animasi bounce */}
            <div className="absolute bottom-4 xs:bottom-5 sm:bottom-6 tablet:bottom-12 md:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 xs:gap-2 text-white/25">
                <span className="text-[9px] xs:text-[10px] tablet:text-xs tracking-[0.3em] uppercase">Scroll</span>
                <svg
                    className="w-4 xs:w-5 h-4 xs:h-5 tablet:w-6 tablet:h-6 animate-bounce"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {/* Gradient fade ke section berikutnya */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
        </section>
    );
}
