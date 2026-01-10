export default function StatCard({ label, value }) {
    return (
        <div className="rounded-2xl border border-deep-800 bg-deep-900/60 p-4">
            <div className="text-sm text-deep-300">{label}</div>
            <div className="mt-1 text-2xl font-bold">{value}</div>
        </div>
    );
}
