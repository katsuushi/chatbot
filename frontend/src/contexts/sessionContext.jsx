import { createContext, useState } from "react";

export const SessionContext = createContext();

export function SessionProvider({ children }) {
    const [loadFn, setLoadFn] = useState(null);

    return (
        <SessionContext.Provider value={{ loadFn, setLoadFn }}>
            {children}{" "}
        </SessionContext.Provider>
    );
}
