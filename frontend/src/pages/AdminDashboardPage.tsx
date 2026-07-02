import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '@/components/admin/AdminHeader';
import ApplicationsCard from '@/components/admin/ApplicationsCard';
import ApplicationsTable from '@/components/admin/ApplicationsTable';
import DeleteConfirmationDialog from '@/components/admin/DeleteConfirmationDialog';
import DetailModal from '@/components/admin/DetailModal';
import PaginationControls from '@/components/admin/PaginationControls';
import ResumeModal from '@/components/admin/ResumeModal';
import type { InternshipApplication, PaginatedResponse } from '@/types/internship';

type SortDir = 'asc' | 'desc';

async function fetchApplications(
    page: number,
    sortBy: string,
    sortDir: SortDir,
): Promise<PaginatedResponse> {
    const response = await fetch(
        `/api/admin/internships?page=${page}&sort_by=${sortBy}&sort_dir=${sortDir}`,
        { credentials: 'include' },
    );
    if (!response.ok) throw new Error('Failed to fetch applications');
    return response.json();
}

/** Halaman dashboard admin: list, sort, hapus, export, dan lihat resume lamaran. */
export default function AdminDashboardPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [error, setError] = useState<string | null>(null);
    const [selectedApp, setSelectedApp] = useState<InternshipApplication | null>(null);
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('first_name');
    const [sortDir, setSortDir] = useState<SortDir>('asc');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Daftar lamaran via react-query. Polling otomatis tiap 3 detik selama
    // masih ada lamaran yang resume_text-nya belum diekstrak worker.
    const { data: applications, isLoading: loading } = useQuery({
        queryKey: ['admin', 'internships', currentPage, sortBy, sortDir],
        queryFn: () => fetchApplications(currentPage, sortBy, sortDir),
        refetchInterval: (query) => {
            const hasPending = query.state.data?.data.some((app) => !app.resume_text);
            return hasPending ? 3000 : 5000;
        },
    });

    // Trigger refetch saat ada submit baru dari HomePage (event localStorage)
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'internship_app_submitted') {
                setCurrentPage(1);
                void queryClient.invalidateQueries({ queryKey: ['admin', 'internships'] });
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [queryClient]);

    const deleteMutation = useMutation({
        mutationFn: async (ids: number[]) => {
            const responses = await Promise.all(
                ids.map((id) =>
                    fetch(`/api/admin/internships/${id}`, {
                        method: 'DELETE',
                        credentials: 'include',
                    }),
                ),
            );
            for (const response of responses) {
                if (!response.ok) {
                    const body = await response.json();
                    throw new Error(body.message || 'Failed to delete');
                }
            }
            return ids;
        },
        onSuccess: (ids) => {
            setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
            void queryClient.invalidateQueries({ queryKey: ['admin', 'internships'] });
            setShowDeleteDialog(false);
            setDeleteId(null);
        },
        onError: (err) => {
            setError(err instanceof Error ? err.message : 'Delete failed');
        },
    });

    const logoutMutation = useMutation({
        mutationFn: async () => {
            await fetch('/auth/logout', { method: 'POST', credentials: 'include' });
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
            navigate('/login', { replace: true });
        },
    });

    // Handle column header click untuk sorting
    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDir('asc');
        }
    };

    // toggle select satu item
    const handleSelectOne = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );
    };

    // toggle select semua item
    const handleSelectAll = () => {
        if (!applications) return;
        const currentIds = applications.data.map((app) => app.id);
        const allSelected = currentIds.every((id) => selectedIds.includes(id));
        if (allSelected) {
            setSelectedIds((prev) => prev.filter((id) => !currentIds.includes(id)));
        } else {
            setSelectedIds((prev) => [...new Set([...prev, ...currentIds])]);
        }
    };

    // View resume dalam modal
    const handleViewResume = (app: InternshipApplication) => {
        setSelectedApp(app);
        setShowResumeModal(true);
    };

    // View detail dalam modal
    const handleRowClick = (app: InternshipApplication) => {
        setSelectedApp(app);
        setShowDetailModal(true);
    };

    // Download resume
    const handleDownloadResume = (id: number) => {
        window.location.href = `/api/admin/internships/${id}/resume`;
    };

    // Konfirmasi delete
    const handleDeleteClick = (id: number) => {
        setDeleteId(id);
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (!deleteId) return;
        const idsToDelete =
            selectedIds.includes(deleteId) && selectedIds.length > 1
                ? selectedIds
                : [deleteId];
        deleteMutation.mutate(idsToDelete);
    };

    // Export ke CSV
    const handleExport = async () => {
        if (selectedIds.length === 0) return;
        try {
            const ids = selectedIds.join(',');
            const response = await fetch(`/api/admin/internships/export?ids=${ids}`, {
                credentials: 'include',
            });
            if (!response.ok) throw new Error('Export failed');
            const { csv, fileName } = await response.json();

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            link.click();

            URL.revokeObjectURL(link.href);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Export failed');
        }
    };

    const handlePrevPage = () => {
        if (applications && currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (applications && currentPage < applications.meta.last_page) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <>
            <title>Admin Dashboard</title>
            <div className="min-h-screen bg-[#0a0a0a] text-white">
                {/* Header */}
                <AdminHeader
                    onExport={handleExport}
                    onLogout={() => logoutMutation.mutate()}
                    selectedCount={selectedIds.length}
                />

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {error && (
                        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-16">
                            <div className="inline-block w-12 h-12 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin"></div>
                            <p className="text-white/50 mt-4">Loading applications...</p>
                        </div>
                    ) : !applications || applications.data.length === 0 ? (
                        <div className="text-center py-16 border border-white/10 rounded-xl">
                            <p className="text-white/50">no participants found</p>
                        </div>
                    ) : (
                        <>
                            {/* Table for desktop */}
                            <ApplicationsTable
                                applications={applications.data}
                                sortBy={sortBy}
                                sortDir={sortDir}
                                onSort={handleSort}
                                onViewResume={handleViewResume}
                                onDelete={handleDeleteClick}
                                onRowClick={handleRowClick}
                                selectedIds={selectedIds}
                                onSelectOne={handleSelectOne}
                                onSelectAll={handleSelectAll}
                            />

                            {/* Card view for mobile */}
                            <ApplicationsCard
                                applications={applications.data}
                                onViewResume={handleViewResume}
                                onDelete={handleDeleteClick}
                                onRowClick={handleRowClick}
                                selectedIds={selectedIds}
                                onSelectOne={handleSelectOne}
                            />

                            {/* Pagination */}
                            <PaginationControls
                                meta={applications.meta}
                                onPrevious={handlePrevPage}
                                onNext={handleNextPage}
                            />
                        </>
                    )}
                </div>

                {/* Resume Modal */}
                <ResumeModal
                    isOpen={showResumeModal}
                    selectedApp={selectedApp}
                    onClose={() => setShowResumeModal(false)}
                    onDownload={handleDownloadResume}
                />

                {/* Detail Modal */}
                <DetailModal
                    isOpen={showDetailModal}
                    selectedApp={selectedApp}
                    onClose={() => setShowDetailModal(false)}
                    onViewResume={() => {
                        setShowDetailModal(false);
                        handleViewResume(selectedApp!);
                    }}
                    onDelete={() => {
                        setShowDetailModal(false);
                        handleDeleteClick(selectedApp!.id);
                    }}
                />

                {/* Delete Confirmation Dialog */}
                <DeleteConfirmationDialog
                    isOpen={showDeleteDialog}
                    onConfirm={confirmDelete}
                    onCancel={() => setShowDeleteDialog(false)}
                />
            </div>
        </>
    );
}
