/* app/(tabs)/profile.tsx */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  Alert,
  Platform,
  Keyboard,
} from "react-native";
import { Stack, useRouter } from "expo-router"; // Added useRouter
import { useFocusEffect } from "@react-navigation/native"; // For fetching on screen focus
import {
  MapPin,
  Clock,
  Settings,
  ChevronDown,
  ChevronUp,
  LogOut,
  User,
  Mail,
  Edit3,
  Save, // For save button
  KeyRound, // For password icon
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useAuth } from "@/context/AuthContext";
import { ConfirmLogoutModal } from "@/components/ConfirmLogoutModal";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  BORDER_RADIUS,
  SHADOWS,
} from "@/components/home-page/constants"; // Assuming this path is correct
import { UserProfileDto, AddressDto, OrderDto, ProblemDetails, addressService, orderService, UpdateUserProfileDto } from "@/src/api/services";
import { userService } from "@/src/api/services/userService";


type SectionID = "addresses" | "orders" | "settings";

interface SectionDataState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export default function ProfileScreen() {
  const { signOut, userToken, isAuthenticated, isLoading: isLoadingAuth } = useAuth();
  const router = useRouter(); // For navigation if needed

  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  // --- Profile Header State ---
  const [profileData, setProfileData] = useState<UserProfileDto | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // --- Accordion Sections State ---
  const [expandedSections, setExpandedSections] = useState<
    Record<SectionID, boolean>
  >({
    addresses: false,
    orders: false,
    settings: false,
  });

  const [addressesState, setAddressesState] = useState<
    SectionDataState<AddressDto[]>
  >({ data: null, isLoading: false, error: null });
  const [ordersState, setOrdersState] = useState<SectionDataState<OrderDto[]>>(
    { data: null, isLoading: false, error: null },
  );
  // Settings section doesn't fetch separately, it uses profileData

  // --- Settings Form State ---
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [updateProfileSubmitting, setUpdateProfileSubmitting] = useState(false);
  const [updateProfileMessage, setUpdateProfileMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [changePasswordSubmitting, setChangePasswordSubmitting] =
    useState(false);
  const [changePasswordMessage, setChangePasswordMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // --- Data Fetching ---
  const fetchUserProfile = useCallback(async () => {
    if (!isAuthenticated || !userToken) {
      setProfileData(null);
      setIsProfileLoading(false);
      setProfileError("Użytkownik nie jest zalogowany.");
      return;
    }
    setIsProfileLoading(true);
    setProfileError(null);
    try {
      const data = await userService.getMyProfile(userToken);
      setProfileData(data);
      setNameInput(data.name);
      setEmailInput(data.email);
    } catch (e: any) {
      console.error("ProfileScreen: Błąd pobierania profilu:", e);
      const errorMsg =
        (e.response?.data as ProblemDetails)?.title ||
        e.message ||
        "Nie udało się załadować danych profilu.";
      setProfileError(errorMsg);
      setProfileData(null);
    } finally {
      setIsProfileLoading(false);
    }
  }, [isAuthenticated, userToken]);

  useFocusEffect(
    useCallback(() => {
      if (!isLoadingAuth) {
        fetchUserProfile();
        // Reset section states if needed when screen focuses
        setAddressesState({ data: null, isLoading: false, error: null });
        setOrdersState({ data: null, isLoading: false, error: null });
        setExpandedSections({ addresses: false, orders: false, settings: false });
      }
    }, [isLoadingAuth, fetchUserProfile]),
  );


  const loadSectionData = useCallback(
    async (sectionId: SectionID) => {
      if (!isAuthenticated || !userToken) return;

      switch (sectionId) {
        case "addresses":
          setAddressesState((s) => ({ ...s, isLoading: true, error: null }));
          try {
            const data = await addressService.getMyAddresses(userToken);
            setAddressesState({ data, isLoading: false, error: null });
          } catch (e: any) {
            setAddressesState({
              data: null,
              isLoading: false,
              error: "Błąd ładowania adresów.",
            });
          }
          break;
        case "orders":
          setOrdersState((s) => ({ ...s, isLoading: true, error: null }));
          try {
            const data = await orderService.getOrders(userToken);
            setOrdersState({ data, isLoading: false, error: null });
          } catch (e: any) {
            setOrdersState({
              data: null,
              isLoading: false,
              error: "Błąd ładowania zamówień.",
            });
          }
          break;
        case "settings":
          // Settings uses profileData, ensure inputs are synced
          if (profileData) {
            setNameInput(profileData.name);
            setEmailInput(profileData.email);
          }
          // Reset form states for settings when opening
          setIsEditingProfile(false);
          setUpdateProfileMessage(null);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmNewPassword("");
          setChangePasswordMessage(null);
          break;
      }
    },
    [isAuthenticated, userToken, profileData],
  );

  const toggleSection = (id: SectionID) => {
    const isCurrentlyExpanded = expandedSections[id];
    setExpandedSections((prev) => ({ ...prev, [id]: !isCurrentlyExpanded }));

    if (!isCurrentlyExpanded) {
      // If opening the section
      if (id === "addresses" && !addressesState.data) {
        loadSectionData(id);
      } else if (id === "orders" && !ordersState.data) {
        loadSectionData(id);
      } else if (id === "settings") {
        loadSectionData(id); // This will sync inputs and reset form states
      }
    }
  };

  // --- Event Handlers ---
  const handleUpdateProfile = async () => {
    if (!userToken || !profileData) return;
    Keyboard.dismiss();
    setUpdateProfileSubmitting(true);
    setUpdateProfileMessage(null);

    const dto: UpdateUserProfileDto = {};
    if (nameInput.trim() && nameInput.trim() !== profileData.name) dto.name = nameInput.trim();
    if (emailInput.trim() && emailInput.trim() !== profileData.email) dto.email = emailInput.trim();

    if (Object.keys(dto).length === 0) {
      setUpdateProfileMessage({ text: "Nie wprowadzono żadnych zmian.", type: "error" });
      setUpdateProfileSubmitting(false);
      return;
    }

    try {
      const updatedProfile = await userService.updateMyProfile(dto, userToken);
      setProfileData(updatedProfile); // Update header
      setNameInput(updatedProfile.name);
      setEmailInput(updatedProfile.email);
      setUpdateProfileMessage({ text: "Profil zaktualizowany!", type: "success" });
      setIsEditingProfile(false);
    } catch (e: any) {
      const errorDetail = (e.response?.data as ProblemDetails)?.errors;
      let msg = "Błąd aktualizacji profilu.";
      if (errorDetail) msg = Object.values(errorDetail).flat().join(" ");
      else if ((e.response?.data as ProblemDetails)?.title) msg = (e.response.data as ProblemDetails).title!;
      setUpdateProfileMessage({ text: msg, type: "error" });
    } finally {
      setUpdateProfileSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    if (!userToken) return;
    Keyboard.dismiss();
    setChangePasswordSubmitting(true);
    setChangePasswordMessage(null);

    if (newPassword !== confirmNewPassword) {
      setChangePasswordMessage({ text: "Nowe hasła nie są identyczne.", type: "error" });
      setChangePasswordSubmitting(false);
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setChangePasswordMessage({ text: "Nowe hasło musi mieć min. 6 znaków.", type: "error" });
      setChangePasswordSubmitting(false);
      return;
    }

    try {
      await userService.changeMyPassword(
        { currentPassword, newPassword, confirmNewPassword },
        userToken,
      );
      setChangePasswordMessage({ text: "Hasło zmienione!", type: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (e: any) {
      const errorDetail = (e.response?.data as ProblemDetails)?.errors;
      let msg = "Błąd zmiany hasła.";
      if (errorDetail) msg = Object.values(errorDetail).flat().join(" ");
      else if ((e.response?.data as ProblemDetails)?.title) msg = (e.response.data as ProblemDetails).title!;
      setChangePasswordMessage({ text: msg, type: "error" });
    } finally {
      setChangePasswordSubmitting(false);
    }
  };

  const promptLogout = () => setIsLogoutModalVisible(true);
  const handleConfirmLogout = async () => {
    setIsLogoutModalVisible(false);
    await signOut();
    // Navigate to a public screen if necessary, e.g., home or login
    // router.replace('/');
  };

  // --- Render Functions for Accordion Content ---
  const renderAddressesContent = () => {
    if (addressesState.isLoading) return <ActivityIndicator color={COLORS.primary} style={styles.sectionActivityIndicator}/>;
    if (addressesState.error) return <Text style={styles.sectionErrorText}>{addressesState.error}</Text>;
    if (!addressesState.data || addressesState.data.length === 0) return <Text style={styles.sectionEmptyText}>Brak zapisanych adresów.</Text>;
    return addressesState.data.map((addr) => (
      <View key={addr.id} style={styles.addressItem}>
        <Text style={styles.addressStreet}>{addr.street}{addr.apartment ? `, ${addr.apartment}` : ""}</Text>
        <Text style={styles.addressDetails}>{addr.postalCode} {addr.city}</Text>
        {addr.country && <Text style={styles.addressDetails}>{addr.country}</Text>}
      </View>
    ));
  };

  const renderOrdersContent = () => {
    if (ordersState.isLoading) return <ActivityIndicator color={COLORS.primary} style={styles.sectionActivityIndicator}/>;
    if (ordersState.error) return <Text style={styles.sectionErrorText}>{ordersState.error}</Text>;
    if (!ordersState.data || ordersState.data.length === 0) return <Text style={styles.sectionEmptyText}>Brak historii zamówień.</Text>;
    return ordersState.data.map((order) => (
       <View key={order.id} style={styles.orderItem}>
        <View style={styles.orderHeader}>
            <Text style={styles.orderId}>Zamówienie #{order.id}</Text>
            <Text style={styles.orderDate}>{new Date(order.orderDate).toLocaleDateString()}</Text>
        </View>
        <Text style={styles.orderDetails}>Status: {order.status}</Text>
        <Text style={styles.orderDetails}>Suma: {order.totalAmount.toFixed(2)} zł</Text>
      </View>
    ));
  };

  const renderSettingsContent = () => {
    if (!profileData) return <Text style={styles.sectionEmptyText}>Ładowanie danych profilu...</Text>;

    return (
      <View>
        {/* Profile Edit Form */}
        <View style={styles.settingsFormSection}>
          <View style={styles.settingsFormHeader}>
            <Text style={styles.settingsFormTitle}>Dane Profilowe</Text>
            <TouchableOpacity onPress={() => setIsEditingProfile(p => !p)}>
              <Edit3 size={20} color={isEditingProfile ? COLORS.primary : COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.inputLabel}>Imię i Nazwisko</Text>
          <TextInput
            style={isEditingProfile ? styles.textInput : styles.textInputDisabled}
            value={nameInput}
            onChangeText={setNameInput}
            editable={isEditingProfile}
            placeholder="Twoje imię i nazwisko"
          />
          <Text style={styles.inputLabel}>Adres Email</Text>
          <TextInput
            style={isEditingProfile ? styles.textInput : styles.textInputDisabled}
            value={emailInput}
            onChangeText={setEmailInput}
            editable={isEditingProfile}
            placeholder="twój@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {isEditingProfile && (
            <TouchableOpacity
              style={[styles.formButton, updateProfileSubmitting && styles.formButtonDisabled]}
              onPress={handleUpdateProfile}
              disabled={updateProfileSubmitting}
            >
              {updateProfileSubmitting ? (
                <ActivityIndicator color={COLORS.white} size="small"/>
              ) : (
                <Save size={18} color={COLORS.white} style={styles.buttonIcon} />
              )}
              <Text style={styles.formButtonText}>Zapisz Profil</Text>
            </TouchableOpacity>
          )}
          {updateProfileMessage && (
            <Text style={[styles.formMessage, updateProfileMessage.type === "error" ? styles.formMessageError : styles.formMessageSuccess]}>
              {updateProfileMessage.text}
            </Text>
          )}
        </View>

        {/* Change Password Form */}
        <View style={styles.settingsFormSection}>
          <Text style={styles.settingsFormTitle}>Zmień Hasło</Text>
           <Text style={styles.inputLabel}>Aktualne Hasło</Text>
          <TextInput
            style={styles.textInput}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            placeholder="••••••••"
          />
          <Text style={styles.inputLabel}>Nowe Hasło</Text>
          <TextInput
            style={styles.textInput}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholder="Min. 6 znaków"
          />
          <Text style={styles.inputLabel}>Potwierdź Nowe Hasło</Text>
          <TextInput
            style={styles.textInput}
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
            secureTextEntry
            placeholder="Powtórz nowe hasło"
          />
          <TouchableOpacity
            style={[styles.formButton, changePasswordSubmitting && styles.formButtonDisabled]}
            onPress={handleChangePassword}
            disabled={changePasswordSubmitting}
          >
            {changePasswordSubmitting ? (
                 <ActivityIndicator color={COLORS.white} size="small"/>
            ) : (
                <KeyRound size={18} color={COLORS.white} style={styles.buttonIcon} />
            )}
            <Text style={styles.formButtonText}>Zmień Hasło</Text>
          </TouchableOpacity>
           {changePasswordMessage && (
            <Text style={[styles.formMessage, changePasswordMessage.type === "error" ? styles.formMessageError : styles.formMessageSuccess]}>
              {changePasswordMessage.text}
            </Text>
          )}
        </View>
      </View>
    );
  };


  // --- Main Render ---
  if (isLoadingAuth || (isProfileLoading && !profileData && !profileError)) {
    return (
      <View style={styles.centeredMessageContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.centeredMessageText}>Ładowanie...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.centeredMessageContainer}>
        <Stack.Screen options={{ title: "Profil" }} />
        <User size={48} color={COLORS.textSecondary} />
        <Text style={styles.centeredMessageText}>Zaloguj się, aby zobaczyć swój profil.</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push("/login" as any)}>
          <Text style={styles.primaryButtonText}>Zaloguj się</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (profileError && !profileData) {
     return (
      <View style={styles.centeredMessageContainer}>
        <Stack.Screen options={{ title: "Profil" }} />
        <User size={48} color={COLORS.textSecondary} />
        <Text style={styles.centeredMessageErrorText}>{profileError}</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={fetchUserProfile}>
          <Text style={styles.primaryButtonText}>Spróbuj ponownie</Text>
        </TouchableOpacity>
      </View>
    );
  }


  return (
    <View style={styles.screenContainer}>
      <Stack.Screen options={{ title: "Mój Profil" }} />
      <ScrollView
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.profileHeaderContainer}>
          <Image
            source={{ uri: profileData?.avatarUrl || "https://cdn-icons-png.flaticon.com/512/147/147144.png" }}
            style={styles.avatarImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profileData?.name || "Użytkownik"}</Text>
            <View style={styles.emailContainer}>
              <Mail size={16} color={COLORS.textSecondary} style={styles.emailIcon}/>
              <Text style={styles.profileEmail}>{profileData?.email || "Brak emaila"}</Text>
            </View>
          </View>
        </View>

        {/* Accordion Sections */}
        {[
          { id: "addresses" as SectionID, label: "Moje Adresy", icon: MapPin, contentRenderer: renderAddressesContent },
          { id: "orders" as SectionID, label: "Historia Zamówień", icon: Clock, contentRenderer: renderOrdersContent },
          { id: "settings" as SectionID, label: "Ustawienia Konta", icon: Settings, contentRenderer: renderSettingsContent },
        ].map(({ id, label, icon: Icon, contentRenderer }) => (
          <View key={id} style={styles.accordionSection}>
            <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleSection(id)}>
              <Icon size={20} color={COLORS.primary} style={styles.accordionIcon} />
              <Text style={styles.accordionLabel}>{label}</Text>
              {expandedSections[id] ? <ChevronUp size={20} color={COLORS.textSecondary} /> : <ChevronDown size={20} color={COLORS.textSecondary} />}
            </TouchableOpacity>
            {expandedSections[id] && (
              <View style={styles.accordionContent}>
                {contentRenderer()}
              </View>
            )}
          </View>
        ))}

        {/* Banner */}
        <View style={styles.bannerContainer}>
          <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.bannerGradient}>
            <User size={24} color={COLORS.white} style={styles.bannerIcon} />
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>Kupon Powitalny!</Text>
              <Text style={styles.bannerSubtitle}>Kod: WELCOME30</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={promptLogout}>
          <LogOut size={18} color={COLORS.white} style={styles.buttonIcon} />
          <Text style={styles.logoutButtonText}>Wyloguj się</Text>
        </TouchableOpacity>
      </ScrollView>

      <ConfirmLogoutModal
        visible={isLogoutModalVisible}
        onConfirm={handleConfirmLogout}
        onCancel={() => setIsLogoutModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: COLORS.background },
  scrollContentContainer: { paddingBottom: SPACING.xl },
  centeredMessageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  centeredMessageText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  centeredMessageErrorText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.danger,
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  primaryButton: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: "600",
  },
  // Profile Header
  profileHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    backgroundColor: COLORS.cardBackground,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.small,
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: BORDER_RADIUS.round,
    marginRight: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  emailContainer: { flexDirection: "row", alignItems: "center" },
  emailIcon: { marginRight: SPACING.xs },
  profileEmail: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },

  // Accordion
  accordionSection: {
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
    overflow: "hidden", // Ensures content respects border radius
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
  },
  accordionIcon: { marginRight: SPACING.sm },
  accordionLabel: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  accordionContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  sectionActivityIndicator: { marginVertical: SPACING.md },
  sectionErrorText: {
    color: COLORS.danger,
    textAlign: "center",
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZE.sm,
  },
  sectionEmptyText: {
    color: COLORS.textSecondary,
    textAlign: "center",
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZE.sm,
  },
  // Address & Order Item Styles
  addressItem: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    // '&:last-child': { // This won't work in React Native styles
    //     borderBottomWidth: 0,
    // }
  },
  addressStreet: { fontSize: FONT_SIZE.md, color: COLORS.textPrimary, fontWeight: '500'},
  addressDetails: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginTop: SPACING.xs},

  orderItem: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  orderId: { fontSize: FONT_SIZE.md, color: COLORS.textPrimary, fontWeight: '500'},
  orderDate: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  orderDetails: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginTop: SPACING.xs},


  // Settings Form
  settingsFormSection: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    // '&:last-child': { // This won't work in React Native styles
    //     borderBottomWidth: 0,
    // }
  },
  settingsFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  settingsFormTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  inputLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  textInput: {
    backgroundColor: COLORS.backgroundSlightlyDarker, // Changed from inputBackground
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: Platform.OS === "ios" ? SPACING.sm : SPACING.sm -2, // Adjusted for Android
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  textInputDisabled: {
    backgroundColor: COLORS.border,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: Platform.OS === "ios" ? SPACING.sm : SPACING.sm -2,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  formButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md - 2,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: SPACING.md,
    ...SHADOWS.small,
  },
  formButtonDisabled: {
    backgroundColor: COLORS.primaryLight,
  },
  buttonIcon: {
    marginRight: SPACING.sm,
  },
  formButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: FONT_SIZE.md,
  },
  formMessage: {
    textAlign: "center",
    marginTop: SPACING.sm,
    fontSize: FONT_SIZE.sm,
  },
  formMessageError: { color: COLORS.danger },
  formMessageSuccess: { color: COLORS.success },

  // Banner
  bannerContainer: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.medium,
    overflow: 'hidden',
  },
  bannerGradient: {
    padding: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
  },
  bannerIcon: { marginRight: SPACING.md },
  bannerTextContainer: { flex: 1 },
  bannerTitle: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: FONT_SIZE.lg,
    marginBottom: SPACING.xs,
  },
  bannerSubtitle: { color: COLORS.white, fontSize: FONT_SIZE.md },

  // Logout Button
  logoutButton: {
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
    backgroundColor: COLORS.danger, // Changed from accent
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.small,
  },
  logoutButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: "600",
  },
});

