import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    type ReactNode,
} from 'react';
import { mockHangouts } from '@/src/data/mock-data';
import type { Hangout, RSVPStatus } from '@/src/types';

interface HangoutsContextValue {
    hangouts: Hangout[];
    updateRSVP: (hangoutId: string, status: RSVPStatus) => void;
}

const HangoutsContext = createContext<HangoutsContextValue | undefined>(
    undefined,
);

export function HangoutsProvider({ children }: { children: ReactNode }) {
    const [hangouts, setHangouts] = useState<Hangout[]>(mockHangouts);

    const updateRSVP = useCallback((hangoutId: string, status: RSVPStatus) => {
        setHangouts((prev) =>
            prev.map((h) =>
                h.id === hangoutId ? { ...h, userStatus: status } : h,
            ),
        );
    }, []);

    return (
        <HangoutsContext.Provider value={{ hangouts, updateRSVP }}>
            {children}
        </HangoutsContext.Provider>
    );
}

export function useHangouts() {
    const ctx = useContext(HangoutsContext);
    if (!ctx) {
        throw new Error('useHangouts must be used within a HangoutsProvider');
    }
    return ctx;
}
