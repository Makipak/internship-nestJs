import type { InternshipApplication } from '@/types/internship';

interface ApplicationsCardProps {
    applications: InternshipApplication[];
    onViewResume: (app: InternshipApplication) => void;
    onDelete: (id: number) => void;
    onRowClick: (app: InternshipApplication) => void;
    selectedIds: number[];
    onSelectOne: (id: number) => void;
}

export default function ApplicationsCard({
    applications,
    onViewResume,
    onDelete,
    onRowClick,
    selectedIds,
    onSelectOne,
}: ApplicationsCardProps) {
    return (
        <div className="md:hidden space-y-4">
            {applications.map((app, index) => (
                <div
                    key={app.id}
                    className="bg-white/[0.02] border border-white/10 rounded-lg p-4 cursor-pointer hover:bg-white/[0.03] transition-colors ${
                        selectedIds.includes(app.id)
                            ? 'bg-blue-500/10 border-blue-500/30'
                            : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.03]'
                    }"
                    onClick={() => onRowClick(app)}
                >
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                    checked={selectedIds.includes(app.id)}
                                    onChange={() => onSelectOne(app.id)}
                                    className="w-4 h-4 rounded border-white/30 bg-white/10 accent-blue-500 cursor-pointer"
                            />
                        </div>
                        <div>
                            <p className="font-medium text-sm">{app.first_name} {app.last_name}</p>
                            <p className="text-xs text-white/50">No: {index + 1}</p>
                        </div>
                        <span className="text-xs text-white/50">
                            {new Date(app.created_at).toLocaleDateString('id-ID')}
                        </span>
                    </div>
                    <div className="space-y-2 mb-4 text-sm text-white/70">
                        <p className="truncate">{app.email}</p>
                        <p className="truncate">{app.phone}</p>
                        <p className="line-clamp-2">{app.about}</p>
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => onViewResume(app)}
                            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium transition-colors"
                        >
                            View Resume
                        </button>
                        <button
                            onClick={() => onDelete(app.id)}
                            className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-xs font-medium transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
