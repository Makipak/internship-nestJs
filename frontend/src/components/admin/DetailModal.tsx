import type { InternshipApplication } from '@/types/internship';

interface DetailModalProps {
    isOpen: boolean;
    selectedApp: InternshipApplication | null;
    onClose: () => void;
    onViewResume: () => void;
    onDelete: () => void;
}

export default function DetailModal({ isOpen, selectedApp, onClose, onViewResume, onDelete }: DetailModalProps) {
    if (!isOpen || !selectedApp) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="sticky top-0 bg-[#0a0a0a] border-b border-white/10 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold">Application Details</h2>
                        <p className="text-sm text-white/50">{selectedApp.first_name} {selectedApp.last_name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/60 hover:text-white text-2xl leading-none"
                    >
                        ×
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs uppercase tracking-wider text-white/50">First Name</label>
                            <p className="text-sm font-medium mt-1">{selectedApp.first_name}</p>
                        </div>
                        <div>
                            <label className="text-xs uppercase tracking-wider text-white/50">Last Name</label>
                            <p className="text-sm font-medium mt-1">{selectedApp.last_name}</p>
                        </div>
                        <div>
                            <label className="text-xs uppercase tracking-wider text-white/50">Email</label>
                            <p className="text-sm font-medium mt-1">{selectedApp.email}</p>
                        </div>
                        <div>
                            <label className="text-xs uppercase tracking-wider text-white/50">Phone</label>
                            <p className="text-sm font-medium mt-1">{selectedApp.phone}</p>
                        </div>
                        <div>
                            <label className="text-xs uppercase tracking-wider text-white/50">Submitted</label>
                            <p className="text-sm font-medium mt-1">
                                {new Date(selectedApp.created_at).toLocaleDateString('id-ID', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric', 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                })}
                            </p>
                        </div>
                    </div>

                    <div className="min-w-0">
                        <label className="text-xs uppercase tracking-wider text-white/50">About</label>
                        <p className="text-sm font-medium mt-2 whitespace-pre-wrap break-words leading-relaxed">{selectedApp.about}</p>
                    </div>

                    {selectedApp.resume_text && (
                        <div className="min-w-0">
                            <label className="text-xs uppercase tracking-wider text-white/50">Resume Content</label>
                            <p className="text-sm font-medium mt-2 whitespace-pre-wrap break-words leading-relaxed">
                                {selectedApp.resume_text}
                            </p>
                        </div>
)}

                    <div className="flex gap-3 pt-4 border-t border-white/10">
                        <button
                            onClick={onViewResume}
                            className="flex-1 px-4 py-2 bg-[#0572FF] hover:bg-blue-700 rounded-lg font-medium transition-colors"
                        >
                            View Resume
                        </button>
                        <button
                            onClick={onDelete}
                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
                        >
                            Delete
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
