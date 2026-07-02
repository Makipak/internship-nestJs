import { useEffect, useRef } from 'react';

export default function AnimatedBackground() {
    const headerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (headerRef.current && typeof window !== 'undefined') {
            import('finisher-header').then(() => {
                if (window.FinisherHeader) {
                    try {
                        new window.FinisherHeader({
                            className: 'finisher-header',
                            count: 6,
                            size: {
                                min: 1300,
                                max: 1500,
                                pulse: 1.1
                            },
                            speed: {
                                x: {
                                    min: 0.6,
                                    max: 3
                                },
                                y: {
                                    min: 0.6,
                                    max: 3
                                }
                            },
                            colors: {
                                background: "#0a0a0a",
                                particles: [
                                    "#0572ff",
                                    "#012340"
                                ]
                            },
                            blending: "lighten",
                            opacity: {
                                center: 0.6,
                                edge: 0
                            },
                            skew: 0,
                            shapes: ["c"]
                        });
                        
                        setTimeout(() => {
                            const canvas = document.getElementById('finisher-canvas') as HTMLCanvasElement;
                            if (canvas) {
                                canvas.style.position = 'absolute';
                                canvas.style.top = '0';
                                canvas.style.left = '0';
                                canvas.style.width = '100%';
                                canvas.style.height = '100%';
                                canvas.style.pointerEvents = 'none';
                            }
                        }, 100);
                    } catch {
                        // Silent error
                    }
                }
            }).catch(() => {
                // Silent error
            });
        }
    }, []);

    return <div ref={headerRef} className="finisher-header absolute inset-0 w-full h-full pointer-events-none" style={{ minHeight: '100vh', width: '100%', height: '100%', zIndex: 0 }} />;
}
