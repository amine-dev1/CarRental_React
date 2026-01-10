export default function Button({ children, variant = "primary", ...props }) {
    const base =
        "rounded-xl px-4 py-2 font-medium transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed";

    const styles = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200/50",
        secondary:
            "border border-slate-200 text-slate-600 hover:bg-slate-50",
        danger: "bg-red-600 text-white hover:bg-red-700",
    };

    return (
        <button className={`${base} ${styles[variant]}`} {...props}>
            {children}
        </button>
    );
}
