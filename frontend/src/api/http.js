const API_URL = import.meta.env.VITE_API_URL;

export async function api(path, options = {}) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}${path}`, {
        method: options.method || "GET",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: options.body ? JSON.stringify(options.body) : undefined
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Request failed");
    }

    return res.json();
}
