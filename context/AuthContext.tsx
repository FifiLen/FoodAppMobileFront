import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {jwtDecode} from "jwt-decode";


/* ---------- typy ---------- */
interface DecodedToken {
    /** np. `"Admin"` albo `["Admin","User"]` (w zależności od back-endu) */
    role?: string | string[];
    /** inne claimy, które Cię interesują */
    sub?: string;          // user id
    name?: string;
    exp?: number;
}

interface AuthContextType {
    isLoading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;           //  <<< NOWE
    userToken: string | null;
    userId: string | null;
    signIn: (token: string) => Promise<void>;
    signOut: () => Promise<void>;
}

/* ---------- kontekst ---------- */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isLoading,       setIsLoading] = useState(true);
    const [userToken,       setUserToken] = useState<string | null>(null);
    const [userId,          setUserId]    = useState<string | null>(null);
    const [isAdmin,         setIsAdmin]   = useState(false);

    /* -- pomocnicze -- */
    const analyseToken = (token: string | null): { admin: boolean; id: string | null } => {
        try {
            if (!token) return { admin: false, id: null };
            const decoded = jwtDecode<DecodedToken>(token);
            const roles   = Array.isArray(decoded.role)
                ? decoded.role
                : decoded.role
                    ? [decoded.role]
                    : [];
            const admin   = roles.includes("Admin");
            return { admin, id: decoded.sub ?? null };
        } catch {
            return { admin: false, id: null };
        }
    };

    /* -- bootstrap -- */
    useEffect(() => {
        (async () => {
            const storedToken = await AsyncStorage.getItem("userToken");
            setUserToken(storedToken);
            const { admin, id } = analyseToken(storedToken);
            setIsAdmin(admin);
            setUserId(id);
            setIsLoading(false);
        })();
    }, []);

    /* -- api -- */
    const signIn = async (token: string) => {
        await AsyncStorage.setItem("userToken", token);
        setUserToken(token);
        const { admin, id } = analyseToken(token);
        setIsAdmin(admin);
        if (id) {
            await AsyncStorage.setItem("userId", id);
            setUserId(id);
        }
    };

    const signOut = async () => {
        await AsyncStorage.multiRemove(["userToken", "userId"]);
        setUserToken(null);
        setUserId(null);
        setIsAdmin(false);
    };

    const value: AuthContextType = {
        isLoading,
        isAuthenticated: !!userToken,
        isAdmin,
        userToken,
        userId,
        signIn,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth musi być użyty wewnątrz <AuthProvider>");
    return ctx;
};
