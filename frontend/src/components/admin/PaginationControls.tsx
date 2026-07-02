interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface PaginationControlsProps {
    meta: PaginationMeta;
    onPrevious: () => void;
    onNext: () => void;
}

export default function PaginationControls({ meta, onPrevious, onNext }: PaginationControlsProps) {
    return (
        <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-white/50">
                Showing {meta.current_page} of {meta.last_page} pages
            </p>
            <div className="flex gap-2">
                <button
                    onClick={onPrevious}
                    disabled={meta.current_page === 1}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
                >
                    Previous
                </button>
                <button
                    onClick={onNext}
                    disabled={meta.current_page === meta.last_page}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
