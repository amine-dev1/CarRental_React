export default function Card({ title, children }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            {title && (
                <div className="mb-4 text-lg font-semibold text-slate-800">
                    {title}
                </div>
            )}
            <div className="text-slate-600">
                {children}
            </div>
        </div>
    );
}
