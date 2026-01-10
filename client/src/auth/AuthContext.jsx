import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/http";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    async function loadMe() {
        try {
            // ✅ Corrected: uses /api/auth/me matching backend route
            const res = await api("/api/auth/me");
            setUser(res.user);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    async function login(email, password) {
        // ✅ Corrected: uses /api/auth/login matching backend route
        const res = await api("/api/auth/login", {
            method: "POST",
            body: { email, password }
        });

        localStorage.setItem("token", res.token);
        // Note: login response already returns user object (res.user), could optimize by setting it directly
        // but loadMe() is safer to verify token immediately.
        setUser(res.user); // Opti: Set user directly from login response which includes it
        setLoading(false);
        // await loadMe(); // Removed extra call since login returns user
    }

    function logout() {
        localStorage.removeItem("token");
        setUser(null);
    }

    useEffect(() => {
        // Only load if token exists
        if (localStorage.getItem("token")) {
            loadMe();
        } else {
            setLoading(false);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
