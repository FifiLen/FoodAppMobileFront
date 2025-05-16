// app/(tabs)/profile.tsx
import React, { useState } from 'react'; // Dodaj useState
import { View, Text, Button, StyleSheet } from 'react-native';
import {ConfirmLogoutModal} from "@/components/ConfirmLogoutModal";
import {useAuth} from "@/context/AuthContext";
import {COLORS} from "@/components/home-page/constants";


export default function EkranProfilu() {
    const { signOut } = useAuth();
    const [isModalVisible, setIsModalVisible] = useState(false); // Stan do zarządzania widocznością modala

    const promptLogout = () => {
        console.log("EkranProfilu: Wywołano promptLogout (otwieranie modala).");
        setIsModalVisible(true);
    };

    const handleConfirmLogout = async () => {
        console.log("EkranProfilu: Użytkownik potwierdził wylogowanie w modalu. Wywołuję signOut().");
        setIsModalVisible(false); // Zamknij modal
        try {
            await signOut();
            console.log("EkranProfilu: Funkcja signOut() z AuthContext została zakończona.");
        } catch (error) {
            console.error("EkranProfilu: Błąd podczas wywoływania signOut():", error);
        }
    };

    const handleCancelLogout = () => {
        console.log("EkranProfilu: Wylogowanie anulowane przez użytkownika w modalu.");
        setIsModalVisible(false);
    };

    // Logowanie stanu przy każdym renderowaniu komponentu profilu (możesz to później usunąć)
    // const { isAuthenticated, userToken } = useAuth();
    // console.log(`EkranProfilu: Renderowanie. IsAuthenticated: ${isAuthenticated}, Token: ${userToken ? userToken.substring(0,10)+"..." : null}`);


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Moje Konto</Text>
            <View style={styles.buttonContainer}>
                <Button title="Wyloguj się" onPress={promptLogout} color={COLORS.danger} />
            </View>

            <ConfirmLogoutModal
                visible={isModalVisible}
                onConfirm={handleConfirmLogout}
                onCancel={handleCancelLogout}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.background,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: COLORS.textPrimary,
    },
    buttonContainer: {
        marginTop: 30,
        width: '80%',
    }
});
