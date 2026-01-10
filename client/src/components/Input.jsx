export default function Input({ label, ...props }) {
    return (
        <div className="space-y-1">
            {label && (
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</label>
            )}
            <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                {...props}
            />
        </div>
    );
}
