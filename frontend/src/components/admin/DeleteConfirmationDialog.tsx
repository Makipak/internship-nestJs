interface DeleteConfirmationDialogProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function DeleteConfirmationDialog({ isOpen, onConfirm, onCancel }: DeleteConfirmationDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl max-w-sm w-full p-6">
                <h3 className="text-lg font-bold mb-2">Delete Application</h3>
                <p className="text-white/60 text-sm mb-6">Are you sure you want to delete this application? This action cannot be undone.</p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
