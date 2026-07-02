// finisher-header tidak menyediakan type declaration sendiri; ditambahkan
// secara manual karena cuma dipakai untuk side effect (animasi background).
declare module 'finisher-header';

declare global {
    interface Window {
        FinisherHeader?: new (options: Record<string, unknown>) => unknown;
    }
}

export {};
