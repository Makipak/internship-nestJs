import { useEffect, useRef, useState } from 'react';

// Custom hook: trigger animasi fade+slide-up saat elemen masuk viewport
export function useScrollAnimation(delay = 0) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Hanya trigger sekali — tidak balik ke hidden saat scroll keluar
                if (entry.isIntersecting) setIsVisible(true);
            },
            { threshold: 0.1 },
        );

        const el = ref.current;
        if (el) observer.observe(el);

        return () => {
            if (el) observer.unobserve(el);
        };
    }, []);

    // Class Tailwind berdasarkan state visibility
    const animClass = [
        'transition-all duration-700 ease-out',
        delay ? `delay-[${delay}ms]` : '',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10',
    ].join(' ');

    return { ref, isVisible, animClass };
}