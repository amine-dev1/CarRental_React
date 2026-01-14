export default function StatCard({ label, value, trend }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-slate-500">{label}</div>
            <div className="mt-2 flex items-end justify-between">
                <span className="text-2xl font-bold text-slate-900">
                    {value}
                </span>
                {trend && (
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {trend}
                    </span>
                )}
            </div>
        </div>
    );
}
