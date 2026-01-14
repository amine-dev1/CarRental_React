export default function Card({ title, children }) {
    return (
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            {title && (
                <div className="mb-4 text-lg font-semibold text-text-primary">
                    {title}
                </div>
            )}
            <div className="text-text-secondary">
                {children}
            </div>
        </div>
    );
}
