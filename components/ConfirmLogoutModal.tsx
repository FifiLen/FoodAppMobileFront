// frontend/components/ConfirmLogoutModal.tsx
import React from 'react';
import { Modal, View, Text, Button, StyleSheet } from 'react-native';
import { COLORS } from './home-page/constants'; // Dostosuj ścieżkę

interface ConfirmLogoutModalProps {
    visible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmLogoutModal: React.FC<ConfirmLogoutModalProps> = ({
                                                                          visible,
                                                                          onConfirm,
                                                                          onCancel,
                                                                      }) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onCancel} // Dla przycisku wstecz na Androidzie
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>Czy na pewno chcesz się wylogować?</Text>
                    <View style={styles.buttonRow}>
                        <View style={styles.buttonWrapper}>
                            <Button title="Anuluj" onPress={onCancel} color={COLORS.textSecondary} />
                        </View>
                        <View style={styles.buttonWrapper}>
                            <Button title="Wyloguj" onPress={onConfirm} color={COLORS.danger} />
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Półprzezroczyste tło
    },
    modalView: {
        margin: 20,
        backgroundColor: COLORS.cardBackground,
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        marginBottom: 25,
        textAlign: 'center',
        fontSize: 18,
        color: COLORS.textPrimary,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    buttonWrapper: {
        marginHorizontal: 10, // Odstęp między przyciskami
        flex: 1, // Aby przyciski miały podobną szerokość
    },
});
