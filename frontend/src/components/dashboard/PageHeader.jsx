export default function PageHeader({ title, subtitle, children }) {
    return (
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-text-primary tracking-tight">{title}</h1>
                {subtitle && (
                    <p className="mt-1 text-text-secondary">{subtitle}</p>
                )}
            </div>
            {children && (
                <div className="flex items-center gap-3">
                    {children}
                </div>
            )}
        </div>
    );
}
