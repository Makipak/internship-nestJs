import { useState } from 'react';

interface AdminHeaderProps {
    onExport: () => void;
    onLogout: () => void;
    selectedCount: number;
}

export default function AdminHeader({ onExport, onLogout, selectedCount }: AdminHeaderProps) {
    const [showModal, setShowModal] = useState(false);

    const handleExportClick = () => {
        if (selectedCount === 0) {
            setShowModal(true);
            return;
        }
        onExport();
    };

    return (
        <>
            <div className="border-b border-white/10 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                            <p className="text-white/50 text-sm mt-1">Manage internship applications</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleExportClick}
                                className="w-full sm:w-auto px-6 py-2.5 bg-[#0572FF] hover:bg-blue-700 rounded-lg font-medium text-sm transition-colors"
                            >
                                {selectedCount > 0 ? `Export ${selectedCount} Selected` : 'Export to Excel'}
                            </button>
                            <button
                                onClick={onLogout}
                                className="w-full sm:w-auto px-6 py-2.5 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 rounded-lg font-medium text-sm transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4 text-center">
                        <div className="text-3xl mb-3">☑️</div>
                        <h3 className="text-white font-semibold text-lg mb-2">No Data Selected</h3>
                        <p className="text-white/50 text-sm mb-6">Please select at least one application before exporting.</p>
                        <button
                            onClick={() => setShowModal(false)}
                            className="px-6 py-2.5 bg-[#0572FF] hover:bg-blue-700 rounded-lg font-medium text-sm transition-colors"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
