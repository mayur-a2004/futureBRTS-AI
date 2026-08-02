// 👉 Global Auth Context for Future BRTS
// 👉 Isme user status, onboarding status aur primary intent management hai

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/auth.api';

export type BuilderMode = 'Student' | 'Project' | 'Career' | 'Business' | 'Exam';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    session_id: string;
}



interface AuthContextType {
    user: any;
    token: string | null;
    isAuthenticated: boolean;
    onboardingCompleted: boolean;
    initialIntent: string;
    login: (user: any, token: string) => void;
    logout: () => void;
    setIntent: (text: string) => void;
    setUser: (user: any) => void;
    completeOnboardingState: () => void;
    setTokenBalance: (balance: number) => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ⚡ Synchronous check at module load — zero delay for new & returning users
const _hasStoredToken = !!localStorage.getItem('fbrts_token');
const _getStoredUser = () => {
    try {
        const u = localStorage.getItem('fbrts_user');
        return u ? JSON.parse(u) : null;
    } catch { return null; }
};
const _storedUser = _getStoredUser();

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(_storedUser);
    const [token, setToken] = useState<string | null>(localStorage.getItem('fbrts_token'));
    const [isAuthenticated, setIsAuthenticated] = useState(_hasStoredToken);
    const [onboardingCompleted, setOnboardingCompleted] = useState(_storedUser?.onboardingCompleted ?? true);
    const [initialIntent, setInitialIntent] = useState(localStorage.getItem('fbrts_intent') || '');
    // ⚡ Instant 0ms load: if user is stored or no token → loading = false immediately!
    const [loading, setLoading] = useState(_hasStoredToken && !_storedUser);

    useEffect(() => {
        const initAuth = async () => {
            const tokenVal = localStorage.getItem('fbrts_token');
            if (tokenVal) {
                try {
                    const res = await authApi.getMe(tokenVal);
                    if (res.success) {
                        setUser(res.user);
                        setIsAuthenticated(true);
                        setOnboardingCompleted(res.user.onboardingCompleted);
                        setToken(tokenVal);
                        localStorage.setItem('fbrts_user', JSON.stringify(res.user));
                    } else {
                        localStorage.removeItem('fbrts_token');
                        localStorage.removeItem('fbrts_user');
                        setToken(null);
                        setUser(null);
                        setIsAuthenticated(false);
                    }
                } catch (err) {
                    console.error("Auth init background sync", err);
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = (userData: any, tokenVal: string) => {
        setUser(userData);
        setIsAuthenticated(true);
        setOnboardingCompleted(userData.onboardingCompleted);
        localStorage.setItem('fbrts_token', tokenVal);
        localStorage.setItem('fbrts_user', JSON.stringify(userData));
        setToken(tokenVal);
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('fbrts_token');
        localStorage.removeItem('fbrts_user');
        setToken(null);
    };

    const setIntent = (text: string) => {
        setInitialIntent(text);
        localStorage.setItem('fbrts_intent', text);
    };

    const completeOnboardingState = () => {
        setOnboardingCompleted(true);
    };

    const setTokenBalance = (balance: number) => {
        setUser((prev: any) => prev ? { ...prev, tokenBalance: balance } : prev);
    };



    return (
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated,
            onboardingCompleted,
            initialIntent,
            login,
            logout,
            setIntent,
            setUser,
            completeOnboardingState,
            setTokenBalance,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
