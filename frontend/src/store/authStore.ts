import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

interface User {
    id: string;
    email: string;
    role: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            login: async (email, password) => {
                const { data } = await axios.post(`${API_URL}/login`, { email, password });
                set({ user: data.user, accessToken: data.accessToken, isAuthenticated: true });
            },
            logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
        }),
        { name: 'auth-storage' }
    )
);