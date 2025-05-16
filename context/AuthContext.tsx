// context/AuthContext.tsx
import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthContextType {
    isLoading: boolean;
    isAuthenticated: boolean;
    userToken: string | null;
    userId: string | null; // <<< DODANE: ID zalogowanego użytkownika
    signIn: (token: string, userId?: string) => Promise<void>; // <<< ZMODYFIKOWANE: signIn przyjmuje teraz opcjonalne userId
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null); // <<< DODANE: Stan dla userId

    useEffect(() => {
        const bootstrapAsync = async () => {
            let token: string | null = null;
            let id: string | null = null; // <<< DODANE: Zmienna lokalna dla userId
            try {
                token = await AsyncStorage.getItem("userToken");
                id = await AsyncStorage.getItem("userId"); // <<< DODANE: Odczytaj userId z AsyncStorage
            } catch (e) {
                console.error("AuthContext: Nie udało się odzyskać tokenu lub userId", e);
            }
            setUserToken(token);
            setUserId(id); // <<< DODANE: Ustaw odczytane userId
            setIsLoading(false);
            console.log(
                "AuthContext: Bootstrap zakończony. Token:",
                token ? "ZNALEZIONO" : "BRAK",
                "UserId:", id ? "ZNALEZIONO" : "BRAK", // <<< DODANE: Log dla userId
                "IsAuthenticated po bootstrap:",
                !!token,
            );
        };

        bootstrapAsync();
    }, []);

    const signIn = async (token: string, receivedUserId?: string) => { // <<< ZMODYFIKOWANE: Dodano parametr receivedUserId
        try {
            await AsyncStorage.setItem("userToken", token);
            setUserToken(token);
            if (receivedUserId) { // <<< DODANE: Jeśli userId zostało przekazane
                await AsyncStorage.setItem("userId", receivedUserId);
                setUserId(receivedUserId);
                console.log("AuthContext: signIn wykonane. Token i userId zapisane. IsAuthenticated teraz powinno być true.");
            } else {
                // Jeśli API logowania nie zwraca userId, możemy go tu usunąć lub zignorować
                // await AsyncStorage.removeItem("userId"); // Opcjonalnie, jeśli chcemy czyścić przy braku
                // setUserId(null);
                console.log("AuthContext: signIn wykonane. Token zapisany (userId nie przekazano). IsAuthenticated teraz powinno być true.");
            }
        } catch (e) {
            console.error("AuthContext: Błąd podczas signIn", e);
        }
    };

    const signOut = async () => {
        try {
            await AsyncStorage.removeItem("userToken");
            await AsyncStorage.removeItem("userId"); // <<< DODANE: Usuń userId przy wylogowaniu
            setUserToken(null);
            setUserId(null); // <<< DODANE: Zresetuj stan userId
            console.log(
                "AuthContext: signOut wykonane. userToken i userId ustawione na null. IsAuthenticated teraz powinno być false.",
            );
        } catch (e) {
            console.error("AuthContext: Błąd podczas signOut", e);
        }
    };

    const isAuthenticated = !!userToken;

    console.log(
        "AuthContext (Render): isLoading:",
        isLoading,
        "isAuthenticated:",
        isAuthenticated,
        "userToken:",
        userToken ? userToken.substring(0, 10) + "..." : null,
        "userId:", userId // <<< DODANE: Log dla userId
    );

    return (
        <AuthContext.Provider
            value={{
                isLoading,
                isAuthenticated,
                userToken,
                userId, // <<< DODANE: Udostępnij userId w kontekście
                signIn,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth musi być używany wewnątrz AuthProvider");
    }
    return context;
};
