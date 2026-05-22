import { createContext, useContext, useEffect, useState } from "react";

type Theme = 'future' | 'blue' | 'light' | 'violet';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem('FutureBRTS_theme');
        return (saved as Theme) || 'future';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        // Remove all previous theme classes
        root.classList.remove('theme-blue', 'theme-light', 'theme-violet');

        // Add new theme class if not default (future)
        if (theme !== 'future') {
            root.classList.add(`theme-${theme}`);
        }

        localStorage.setItem('FutureBRTS_theme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
