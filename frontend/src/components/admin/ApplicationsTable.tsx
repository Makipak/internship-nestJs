import type { InternshipApplication } from '@/types/internship';

interface ApplicationsTableProps {
    applications: InternshipApplication[];
    sortBy: string;
    sortDir: 'asc' | 'desc';
    onSort: (field: string) => void;
    onViewResume: (app: InternshipApplication) => void;
    onDelete: (id: number) => void;
    onRowClick: (app: InternshipApplication) => void;
    selectedIds: number[];
    onSelectOne: (id: number) => void;
    onSelectAll: () => void;
}

export default function ApplicationsTable({
    applications,
    sortBy,
    sortDir,
    onSort,
    onViewResume,
    onDelete,
    onRowClick,
    selectedIds,
    onSelectOne,
    onSelectAll,
}: ApplicationsTableProps) {
    const renderSortIndicator = (field: string) => {
        if (sortBy !== field) return '';
        return sortDir === 'asc' ? ' ↑' : ' ↓';
    };

    // cek semua udah di select
    const allSelected =
        applications.length > 0 && applications.every((app) => selectedIds.includes(app.id));

    // cek sebagian sudah di select
    const someSelected =
        applications.some((app) => selectedIds.includes(app.id)) && !allSelected;

    return (
        <div className="hidden md:block overflow-x-auto border border-white/10 rounded-xl bg-white/[0.02]">
            <table className="w-full">
                <thead className="bg-white/[0.05] border-b border-white/10">
                    <tr>
                        <th
                            className="px-4 py-3 text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <input
                                type="checkbox"
                                checked={allSelected}
                                ref={(el) => {
                                    if (el) el.indeterminate = someSelected;
                                }}
                                onChange={onSelectAll}
                                className="w-4 h-4 rounded border-white/30 bg-white/10 accent-blue-500 cursor-pointer"
                            />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">No</th>
                        <th
                            onClick={() => onSort('first_name')}
                            className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider cursor-pointer hover:text-white/80 transition-colors"
                        >
                            Name{renderSortIndicator('first_name')}
                        </th>
                        <th
                            onClick={() => onSort('email')}
                            className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider cursor-pointer hover:text-white/80 transition-colors"
                        >
                            Email{renderSortIndicator('email')}
                        </th>
                        <th
                            onClick={() => onSort('phone')}
                            className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider cursor-pointer hover:text-white/80 transition-colors"
                        >
                            Phone{renderSortIndicator('phone')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">About</th>
                        <th
                            onClick={() => onSort('created_at')}
                            className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider cursor-pointer hover:text-white/80 transition-colors"
                        >
                            Submitted{renderSortIndicator('created_at')}
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-white/60 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                    {applications.map((app, index) => (
                        <tr key={app.id} className="hover:bg-white/[0.03] transition-colors cursor-pointer ${selectedIds.includes(app.id) ? 'bg-blue-500/10' : ''}" onClick={() => onRowClick(app)}>

                            <td
                                className="px-4 py-4 text-center"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(app.id)}
                                    onChange={() => onSelectOne(app.id)}
                                    className="w-4 h-4 rounded border-white/30 bg-white/10 accent-blue-500 cursor-pointer"
                                />
                            </td>
                            <td className="px-6 py-4 text-sm text-white/70">{index + 1}</td>
                            <td className="px-6 py-4 text-sm font-medium">{app.first_name} {app.last_name}</td>
                            <td className="px-6 py-4 text-sm text-white/70">{app.email}</td>
                            <td className="px-6 py-4 text-sm text-white/70">{app.phone}</td>
                            <td className="px-6 py-4 text-sm text-white/70 max-w-xs truncate">{app.about}</td>
                            <td className="px-6 py-4 text-sm text-white/70">
                                {new Date(app.created_at).toLocaleDateString('id-ID')}
                            </td>
                            <td className="px-6 py-4 text-sm text-center" onClick={(e) => e.stopPropagation()}>
                                <div className="flex gap-2 justify-center">
                                    <button
                                        onClick={() => onViewResume(app)}
                                        className="px-3 py-1.5 bg-[#0572FF] hover:bg-blue-700 rounded text-xs font-medium transition-colors"
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() => onDelete(app.id)}
                                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-xs font-medium transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
