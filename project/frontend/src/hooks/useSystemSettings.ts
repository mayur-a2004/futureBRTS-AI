import { useEffect, useState } from 'react';

// This is a specialized hook for fetching system settings dynamically from the Frontend
export const useSystemSettings = (key: string) => {
    const [value, setValue] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchSetting = async () => {
            try {
                // Use native fetch to avoid axios dependency issues in some Vite setups
                const response = await fetch(`/api/landing/config/${key}`);
                const data = await response.json();

                if (isMounted && data?.value) {
                    setValue(data.value);
                }
            } catch (err) {
                // error fetching setting
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (key) fetchSetting();
        return () => { isMounted = false; };
    }, [key]);

    return { value, loading };
};
