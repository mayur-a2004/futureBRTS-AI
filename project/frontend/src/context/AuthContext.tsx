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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('fbrts_token'));
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [onboardingCompleted, setOnboardingCompleted] = useState(false);
    const [initialIntent, setInitialIntent] = useState(localStorage.getItem('fbrts_intent') || '');

    const [loading, setLoading] = useState(true);

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
                    } else {
                        localStorage.removeItem('fbrts_token');
                        setToken(null);
                    }
                } catch (err) {
                    console.error("Auth init failed", err);
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
        setToken(tokenVal);
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('fbrts_token');
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
